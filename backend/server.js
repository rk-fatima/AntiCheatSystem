import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { db } from './database.js';
import { executionQueue } from './queue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');

const app = express();
const PORT = process.env.PORT || 8765;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Track connected sockets:
// Proctors: Set<WebSocket>
const proctorClients = new Set();
// Teams: Map<teamNameLower, Set<WebSocket>>
const teamClients = new Map();

function getTeamSocketSet(teamName) {
  const key = (teamName || '').trim().toLowerCase();
  if (!teamClients.has(key)) {
    teamClients.set(key, new Set());
  }
  return teamClients.get(key);
}

wss.on('connection', (ws, req) => {
  const url = req.url || '';
  let joinedTeamKey = null;

  if (url.includes('/proctor')) {
    proctorClients.add(ws);
    // Send initial snapshot
    ws.send(JSON.stringify({
      type: 'INIT_PROCTOR',
      teams: db.getAllTeams(),
      prices: db.getAllPrices(),
      transactions: db.getAllTransactions().slice(0, 50),
      telemetry: db.state.telemetry.slice(0, 50)
    }));
  }

  ws.on('message', (msgRaw) => {
    try {
      const data = JSON.parse(msgRaw.toString());
      if (data.type === 'JOIN_TEAM') {
        const teamKey = (data.teamName || '').trim().toLowerCase();
        joinedTeamKey = teamKey;
        const set = getTeamSocketSet(teamKey);
        set.add(ws);

        const currentTeam = db.getTeam(data.teamName);
        if (currentTeam) {
          ws.send(JSON.stringify({
            type: 'TEAM_WORKSPACE_UPDATED',
            team: currentTeam
          }));
        }
      } else if (data.type === 'MEMBER_WORKING') {
        const { teamName, memberId, problemId } = data;
        const updatedTeam = db.setMemberWorking(teamName, memberId, problemId);
        if (updatedTeam) {
          broadcastToTeam(teamName, {
            type: 'TEAM_WORKSPACE_UPDATED',
            team: updatedTeam
          });
          broadcastToProctors({
            type: 'TEAM_UPDATED',
            team: updatedTeam
          });
        }
      }
    } catch (e) {
      console.error('WS message error:', e);
    }
  });

  ws.on('close', () => {
    proctorClients.delete(ws);
    if (joinedTeamKey && teamClients.has(joinedTeamKey)) {
      teamClients.get(joinedTeamKey).delete(ws);
    }
  });
});

function broadcastToProctors(payload) {
  const msg = JSON.stringify(payload);
  for (const client of proctorClients) {
    if (client.readyState === WebSocket.OPEN) {
      try { client.send(msg); } catch (e) {}
    }
  }
}

function broadcastToTeam(teamName, payload) {
  const key = (teamName || '').trim().toLowerCase();
  const set = teamClients.get(key);
  if (!set) return;
  const msg = JSON.stringify(payload);
  for (const client of set) {
    if (client.readyState === WebSocket.OPEN) {
      try { client.send(msg); } catch (e) {}
    }
  }
}

function broadcastToAll(payload) {
  const msg = JSON.stringify(payload);
  // Send to all team clients and proctor clients
  for (const set of teamClients.values()) {
    for (const client of set) {
      if (client.readyState === WebSocket.OPEN) {
        try { client.send(msg); } catch (e) {}
      }
    }
  }
  for (const client of proctorClients) {
    if (client.readyState === WebSocket.OPEN) {
      try { client.send(msg); } catch (e) {}
    }
  }
}

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: Date.now() });
});

// --- PROBLEMS & DYNAMIC PRICING API ---
app.get('/api/problems', (req, res) => {
  // STRICT SECURITY: Hidden tests and expected outputs are never exposed!
  res.json({
    problems: db.getPublicProblems(),
    prices: db.getAllPrices()
  });
});

// Dynamic Problem Purchase (Team-level purchase with password verification & winning bid deduction)
app.post('/api/problems/purchase', (req, res) => {
  const { teamName, memberId, problemId, bidAmount, password } = req.body;
  if (!teamName || !problemId) {
    return res.status(400).json({ error: 'Team name and problem ID are required.' });
  }

  try {
    const { team, txn, problem } = db.purchaseProblem(teamName, memberId, problemId, bidAmount, password);

    // Real-time broadcast to all members of this team
    broadcastToTeam(teamName, {
      type: 'TEAM_WORKSPACE_UPDATED',
      team,
      transaction: txn
    });

    // Real-time broadcast to proctors
    broadcastToProctors({
      type: 'TEAM_UPDATED',
      team
    });
    broadcastToProctors({
      type: 'TRANSACTION_LOGGED',
      transaction: txn
    });

    res.json({
      success: true,
      team,
      transaction: txn,
      problem
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Notify that a member is actively working on a problem
app.post('/api/problems/working', (req, res) => {
  const { teamName, memberId, problemId } = req.body;
  if (!teamName || !problemId) {
    return res.status(400).json({ error: 'Missing teamName or problemId' });
  }

  const updatedTeam = db.setMemberWorking(teamName, memberId, problemId);
  if (!updatedTeam) {
    return res.status(404).json({ error: 'Team not found' });
  }

  broadcastToTeam(teamName, {
    type: 'TEAM_WORKSPACE_UPDATED',
    team: updatedTeam
  });
  broadcastToProctors({
    type: 'TEAM_UPDATED',
    team: updatedTeam
  });

  res.json({ success: true, team: updatedTeam });
});

// Legacy key/direct unlock fallback (maps to purchase)
app.post('/api/problems/unlock', (req, res) => {
  const { teamName, key, memberId, bidAmount } = req.body;
  if (!teamName || !key) {
    return res.status(400).json({ error: 'Team name and unlock key are required.' });
  }

  const problem = db.findProblemByKey(key);
  if (!problem) {
    db.addTelemetry(teamName, memberId || 'UNKNOWN', 'INVALID_KEY_ATTEMPT', `Attempted invalid key: ${String(key).slice(0, 30)}`);
    broadcastToProctors({ type: 'TEAM_UPDATED', team: db.getTeam(teamName) });
    return res.status(400).json({ error: 'Invalid problem key or ID.' });
  }

  try {
    const { team, txn } = db.purchaseProblem(teamName, memberId, problem.id, bidAmount);
    broadcastToTeam(teamName, { type: 'TEAM_WORKSPACE_UPDATED', team, transaction: txn });
    broadcastToProctors({ type: 'TEAM_UPDATED', team });
    broadcastToProctors({ type: 'TRANSACTION_LOGGED', transaction: txn });

    res.json({
      success: true,
      unlockedId: problem.id,
      title: problem.title,
      costDeducted: txn.price,
      balance: team.balance,
      unlocked: team.unlocked
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// --- ADMIN / ORGANIZER PRICING CONFIGURATION ---
app.post('/api/admin/problems/price', (req, res) => {
  const { problemId, price, pin } = req.body;
  if (pin !== db.state.config.adminPin) {
    return res.status(403).json({ error: 'Unauthorized: Invalid Organiser PIN' });
  }
  if (!problemId) {
    return res.status(400).json({ error: 'Problem ID is required' });
  }

  const setPrice = db.setProblemPrice(problemId, price);

  // Broadcast price change to ALL connected contestants and proctors in real time
  broadcastToAll({
    type: 'PRICE_UPDATED',
    problemId,
    price: setPrice
  });

  res.json({ success: true, problemId, price: setPrice });
});

app.post('/api/admin/problems/batch-prices', (req, res) => {
  const { easyPrice, mediumPrice, hardPrice, pin } = req.body;
  if (pin !== db.state.config.adminPin) {
    return res.status(403).json({ error: 'Unauthorized: Invalid Organiser PIN' });
  }

  const allPrices = db.batchSetTierPrices(easyPrice, mediumPrice, hardPrice);

  broadcastToAll({
    type: 'PRICES_UPDATED',
    prices: allPrices
  });

  res.json({ success: true, prices: allPrices });
});

app.get('/api/admin/problems/prices', (req, res) => {
  res.json({ prices: db.getAllPrices() });
});

// --- POWER CARDS API: 💡 HINT PASS & ⚡ SABOTAGE CARD (40 ByteCoins) ---
app.post('/api/cards/hint/purchase', (req, res) => {
  const { teamName, memberId, problemId } = req.body;
  try {
    const result = db.purchaseHintPass(teamName, memberId, problemId);
    broadcastToTeam(teamName, { type: 'TEAM_WORKSPACE_UPDATED', team: result.team });
    broadcastToProctors({ type: 'TEAM_UPDATED', team: result.team });
    if (result.txn) broadcastToProctors({ type: 'TRANSACTION_LOGGED', transaction: result.txn });
    res.json({ success: true, team: result.team, hint: result.hint, txn: result.txn });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/cards/hint/use', (req, res) => {
  const { teamName, memberId, problemId } = req.body;
  try {
    const result = db.useHintPass(teamName, memberId, problemId);
    broadcastToTeam(teamName, { type: 'TEAM_WORKSPACE_UPDATED', team: result.team });
    broadcastToProctors({ type: 'TEAM_UPDATED', team: result.team });
    if (result.txn) broadcastToProctors({ type: 'TRANSACTION_LOGGED', transaction: result.txn });
    res.json({ success: true, team: result.team, hint: result.hint, alreadyRevealed: result.alreadyRevealed });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/cards/sabotage/purchase', (req, res) => {
  const { teamName, memberId } = req.body;
  try {
    const result = db.purchaseSabotageCard(teamName, memberId);
    broadcastToTeam(teamName, { type: 'TEAM_WORKSPACE_UPDATED', team: result.team });
    broadcastToProctors({ type: 'TEAM_UPDATED', team: result.team });
    if (result.txn) broadcastToProctors({ type: 'TRANSACTION_LOGGED', transaction: result.txn });
    res.json({ success: true, team: result.team, txn: result.txn });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/cards/sabotage/use', (req, res) => {
  const { teamName, memberId, targetTeamName } = req.body;
  try {
    const result = db.useSabotageCard(teamName, memberId, targetTeamName);
    // Real-time WebSocket: freeze the target team immediately!
    broadcastToTeam(result.targetTeam.name, {
      type: 'TEAM_SABOTAGED',
      team: result.targetTeam,
      frozenUntil: result.frozenUntil,
      frozenBy: teamName
    });
    // Update attacking team workspace
    broadcastToTeam(teamName, {
      type: 'TEAM_WORKSPACE_UPDATED',
      team: result.attackingTeam
    });
    // Update proctors
    broadcastToProctors({ type: 'TEAM_UPDATED', team: result.targetTeam });
    broadcastToProctors({ type: 'TEAM_UPDATED', team: result.attackingTeam });
    if (result.txn) broadcastToProctors({ type: 'TRANSACTION_LOGGED', transaction: result.txn });

    res.json({
      success: true,
      attackingTeam: result.attackingTeam,
      targetTeam: result.targetTeam.name,
      frozenUntil: result.frozenUntil
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/cards/targets', (req, res) => {
  const excludeTeam = req.query.excludeTeam || '';
  const targets = db.getSabotageTargets(excludeTeam);
  res.json({ targets });
});

// Password-protected Power Card Unlock
app.post('/api/cards/unlock', (req, res) => {
  const { teamName, memberId, cardType, password } = req.body;
  if (!teamName || !cardType || !password) {
    return res.status(400).json({ error: 'Team name, card type, and password are required.' });
  }

  try {
    const result = db.unlockCard(teamName, memberId, cardType, password);
    broadcastToTeam(teamName, {
      type: 'TEAM_WORKSPACE_UPDATED',
      team: result.team
    });
    broadcastToProctors({
      type: 'TEAM_UPDATED',
      team: result.team
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- TEAM REGISTRATION & SESSION MANAGEMENT ---
app.post('/api/team/register', (req, res) => {
  const { name, size, captainIdx, members } = req.body;
  try {
    const team = db.registerTeam({ name, size, captainIdx, members });
    broadcastToProctors({ type: 'TEAM_REGISTERED', team });
    res.json({ success: true, team });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/team/login', (req, res) => {
  const { teamName, memberId } = req.body;
  if (!teamName || !teamName.trim()) {
    return res.status(400).json({ error: 'Team name cannot be blank.' });
  }

  try {
    const { team, member } = db.loginOrInitTeam(teamName, memberId);
    broadcastToProctors({ type: 'TEAM_UPDATED', team });
    res.json({ team, member });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/team/:name', (req, res) => {
  const team = db.getTeam(req.params.name);
  if (!team) return res.status(404).json({ error: `Team "${req.params.name}" not found in registration database.` });
  db.isTeamFrozen(team.name);
  res.json({
    team: {
      ...team,
      isFrozen: db.isTeamFrozen(team.name),
      members: (team.members || []).map(m => ({
        memberId: m.memberId,
        name: m.name,
        isCaptain: Boolean(m.isCaptain),
        rollNo: m.rollNo,
        email: m.email,
        college: m.college
      }))
    }
  });
});

app.post('/api/teams/sync', (req, res) => {
  try {
    const { teams, rows, csv } = req.body;
    let teamsList = [];
    if (Array.isArray(teams)) {
      teamsList = teams;
    } else if (Array.isArray(rows)) {
      teamsList = parseSheetRows(rows);
    } else if (typeof csv === 'string') {
      teamsList = parseCsvToTeams(csv);
    }

    if (!teamsList.length) {
      return res.status(400).json({ error: 'No valid team records found in sync payload.' });
    }

    const result = db.syncTeams(teamsList);
    broadcastToProctors({ type: 'TEAMS_SYNCED', count: result.count });
    res.json({ success: true, count: result.count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

function parseSheetRows(rows) {
  return rows.map(r => {
    const teamName = r['Team Name'] || r['teamName'] || r['Team'] || r['team'] || '';
    if (!teamName) return null;
    const members = [];
    const m1Name = r['Member 1 Name'] || r['Leader Name'] || r['Captain Name'] || r['member1'] || r['leader'] || r['captain'] || '';
    if (m1Name) members.push({ name: m1Name, isCaptain: true, rollNo: r['Member 1 Roll No'] || '', email: r['Member 1 Email'] || '' });
    const m2Name = r['Member 2 Name'] || r['member2'] || '';
    if (m2Name) members.push({ name: m2Name, isCaptain: false, rollNo: r['Member 2 Roll No'] || '', email: r['Member 2 Email'] || '' });
    const m3Name = r['Member 3 Name'] || r['member3'] || '';
    if (m3Name) members.push({ name: m3Name, isCaptain: false, rollNo: r['Member 3 Roll No'] || '', email: r['Member 3 Email'] || '' });
    return { name: teamName, size: members.length, members };
  }).filter(Boolean);
}

function parseCsvToTeams(csvText) {
  const lines = csvText.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = values[idx] || ''; });
    rows.push(obj);
  }
  return parseSheetRows(rows);
}

app.get('/api/teams', (req, res) => {
  const teams = db.getAllTeams().map(t => ({
    name: t.name,
    size: t.size,
    members: t.members,
    captainId: t.captainId,
    captainName: t.captainName
  }));
  res.json({ teams });
});

// --- TELEMETRY & ANTI-CHEAT API ---
app.post('/api/telemetry', (req, res) => {
  const { teamName, memberId, event, details } = req.body;
  if (!teamName || !event) {
    return res.status(400).json({ error: 'Missing teamName or event' });
  }

  const { entry, team } = db.addTelemetry(teamName, memberId, event, details);

  // Real-time broadcast to proctors and team members
  broadcastToProctors({
    type: 'TELEMETRY_EVENT',
    entry,
    team
  });

  if (team && team.isLocked) {
    broadcastToTeam(teamName, {
      type: 'TEAM_LOCKED',
      team
    });
  }

  res.json({
    success: true,
    isLocked: team?.isLocked || false,
    violationsCount: team?.violations?.length || 0,
    lockReason: team?.lockReason || ''
  });
});

// --- SUBMISSIONS & RUNNER QUEUE ---
app.post('/api/submissions/run', (req, res) => {
  const { teamName, memberId, lang, code, stdin } = req.body;
  if (!lang || !code) {
    return res.status(400).json({ error: 'Language and code are required.' });
  }

  const team = db.getTeam(teamName);
  if (team && team.isLocked) {
    return res.status(403).json({ error: 'Session is currently locked due to integrity flags.' });
  }
  if (team && db.isTeamFrozen(team.name)) {
    const remainingSec = Math.ceil((team.frozenUntil - Date.now()) / 1000);
    return res.status(403).json({ error: `⚡ Your team is currently SABOTAGED and frozen! Code execution is locked for another ${remainingSec}s.` });
  }

  const jobId = executionQueue.enqueue({
    type: 'run',
    teamName,
    memberId: memberId || 'UNKNOWN',
    problemId: null,
    lang,
    code,
    stdin: stdin || ''
  });

  res.json({ jobId, status: 'QUEUED' });
});

app.post('/api/submissions/submit', (req, res) => {
  const { teamName, memberId, problemId, lang, code } = req.body;
  if (!teamName || !problemId || !lang || !code) {
    return res.status(400).json({ error: 'Missing submission parameters.' });
  }

  const team = db.getTeam(teamName);
  if (team && team.isLocked) {
    return res.status(403).json({ error: 'Session is locked by proctors.' });
  }
  if (team && db.isTeamFrozen(team.name)) {
    const remainingSec = Math.ceil((team.frozenUntil - Date.now()) / 1000);
    return res.status(403).json({ error: `⚡ Your team is currently SABOTAGED and frozen! Submissions are locked for another ${remainingSec}s.` });
  }

  const jobId = executionQueue.enqueue({
    type: 'submit',
    teamName,
    memberId: memberId || 'UNKNOWN',
    problemId,
    lang,
    code
  });

  // When job completes, broadcast update to team workspace and proctors
  executionQueue.subscribe(jobId, (job) => {
    if (job.status === 'COMPLETED') {
      const updatedTeam = db.getTeam(teamName);
      if (updatedTeam) {
        broadcastToTeam(teamName, {
          type: 'TEAM_WORKSPACE_UPDATED',
          team: updatedTeam
        });
        broadcastToProctors({
          type: 'TEAM_UPDATED',
          team: updatedTeam
        });
        if (job.submission) {
          broadcastToProctors({
            type: 'SUBMISSION_RECORDED',
            submission: job.submission
          });
        }
        broadcastToAll({
          type: 'LEADERBOARD_UPDATED'
        });
      }
    }
  });

  res.json({ jobId, status: 'QUEUED' });
});

app.get('/api/submissions/status/:id', (req, res) => {
  const job = executionQueue.getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({
    id: job.id,
    type: job.type,
    status: job.status,
    result: job.result,
    submission: job.submission || null,
    error: job.error,
    createdAt: job.createdAt,
    completedAt: job.completedAt
  });
});

app.get('/api/submissions', (req, res) => {
  const { teamName } = req.query;
  const submissions = teamName ? db.getTeamSubmissions(teamName) : db.getAllSubmissions();
  res.json({ submissions });
});

app.get('/api/submissions/team/:name', (req, res) => {
  res.json({ submissions: db.getTeamSubmissions(req.params.name) });
});

// --- PROCTOR & ADMIN APIS ---
app.get('/api/proctor/teams', (req, res) => {
  const teams = db.getAllTeams();
  res.json({
    teams,
    totalTeams: teams.length,
    activeTeams: teams.filter(t => !t.isLocked).length,
    lockedTeams: teams.filter(t => t.isLocked).length
  });
});

app.post('/api/proctor/unlock', (req, res) => {
  const { teamName, pin } = req.body;
  const result = db.unlockTeam(teamName, pin || db.state.config.adminPin);
  if (result.success) {
    broadcastToTeam(teamName, { type: 'TEAM_WORKSPACE_UPDATED', team: result.team });
    broadcastToProctors({ type: 'TEAM_UPDATED', team: result.team });
    return res.json({ success: true, team: result.team });
  }
  res.status(400).json({ error: result.message });
});

app.post('/api/proctor/reset', (req, res) => {
  const { teamName } = req.body;
  const result = db.resetTeamProgress(teamName);
  if (result.success) {
    broadcastToTeam(teamName, { type: 'TEAM_WORKSPACE_UPDATED', team: result.team });
    broadcastToProctors({ type: 'TEAM_UPDATED', team: result.team });
    return res.json({ success: true, team: result.team });
  }
  res.status(400).json({ error: result.message });
});

app.post('/api/proctor/reset-all', (req, res) => {
  const { pin } = req.body;
  if (pin !== db.state.config.adminPin) {
    return res.status(403).json({ error: 'Invalid Organiser PIN' });
  }
  db.resetAllData();
  broadcastToAll({ type: 'RESET_ALL' });
  res.json({ success: true, message: 'All teams, submissions, and telemetry reset.' });
});

// --- LEADERBOARD ---
app.get('/api/leaderboard', (req, res) => {
  const teams = db.getAllTeams()
    .map(t => ({
      name: t.name,
      captainName: t.captainName,
      size: t.size,
      score: t.score || 0,
      solvedCount: (t.solved || []).length,
      wrongAttempts: t.wrong || 0,
      problemWrong: t.problemWrong || {},
      violationsCount: (t.violations || []).length,
      isLocked: Boolean(t.isLocked)
    }))
    .sort((a, b) => b.score - a.score || a.wrongAttempts - b.wrongAttempts);

  res.json({ leaderboard: teams });
});

// SPA Fallback
if (fs.existsSync(FRONTEND_DIST)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Qubit AntiCheat Server running on port ${PORT}`);
});
