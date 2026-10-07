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
app.use(express.json({ limit: '1mb' }));

if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Track connected proctor / judge websockets
const proctorClients = new Set();

wss.on('connection', (ws, req) => {
  const url = req.url || '';
  if (url.includes('/proctor')) {
    proctorClients.add(ws);
    // Send initial snapshot
    ws.send(JSON.stringify({
      type: 'INIT',
      teams: db.getAllTeams(),
      telemetry: db.state.telemetry.slice(0, 50)
    }));
  }

  ws.on('close', () => {
    proctorClients.delete(ws);
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

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: Date.now() });
});

// --- PROBLEMS API ---
app.get('/api/problems', (req, res) => {
  // STRICT SECURITY: Hidden tests and expected outputs are never exposed!
  res.json({ problems: db.getPublicProblems() });
});

app.post('/api/problems/unlock', (req, res) => {
  const { teamName, key } = req.body;
  if (!teamName || !key) {
    return res.status(400).json({ error: 'Team name and unlock key are required.' });
  }

  const team = db.getOrCreateTeam(teamName);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  const problem = db.findProblemByKey(key);
  if (!problem) {
    db.addTelemetry(teamName, 'INVALID_KEY_ATTEMPT', `Attempted invalid key: ${String(key).slice(0, 30)}`);
    broadcastToProctors({ type: 'TEAM_UPDATED', team: db.getTeam(teamName) });
    return res.status(400).json({ error: 'Invalid unlock key' });
  }

  if (team.unlocked.includes(problem.id)) {
    return res.status(400).json({ error: `Problem "${problem.id} — ${problem.title}" is already unlocked!` });
  }

  const cost = Number(problem.pts) || (problem.diff === 'Hard' ? 200 : (problem.diff === 'Medium' ? 150 : 100));

  if (team.balance < cost) {
    return res.status(400).json({
      error: `Insufficient balance! "${problem.title}" costs ${cost} pts, but you only have ${team.balance} pts remaining.`
    });
  }

  // Deduct cost from team balance
  team.balance -= cost;
  team.unlocked.push(problem.id);
  db.updateTeam(team);
  broadcastToProctors({ type: 'TEAM_UPDATED', team });

  res.json({
    success: true,
    unlockedId: problem.id,
    title: problem.title,
    costDeducted: cost,
    balance: team.balance,
    unlocked: team.unlocked
  });
});

// --- TEAM SESSIONS ---
app.post('/api/team/login', (req, res) => {
  const { teamName } = req.body;
  if (!teamName || !teamName.trim()) {
    return res.status(400).json({ error: 'Team name cannot be blank.' });
  }
  const team = db.getOrCreateTeam(teamName);
  res.json({ team });
});

app.get('/api/team/:name', (req, res) => {
  const team = db.getTeam(req.params.name);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  res.json({ team });
});

// --- TELEMETRY & ANTI-CHEAT API ---
app.post('/api/telemetry', (req, res) => {
  const { teamName, event, details } = req.body;
  if (!teamName || !event) {
    return res.status(400).json({ error: 'Missing teamName or event' });
  }

  const { entry, team } = db.addTelemetry(teamName, event, details);

  // Real-time broadcast to proctors
  broadcastToProctors({
    type: 'TELEMETRY_EVENT',
    entry,
    team
  });

  res.json({
    success: true,
    isLocked: team.isLocked,
    violationsCount: team.violations.length,
    lockReason: team.lockReason
  });
});

// --- SUBMISSIONS & RUNNER QUEUE ---
app.post('/api/submissions/run', (req, res) => {
  const { teamName, lang, code, stdin } = req.body;
  if (!lang || !code) {
    return res.status(400).json({ error: 'Language and code are required.' });
  }

  const team = db.getTeam(teamName);
  if (team && team.isLocked) {
    return res.status(403).json({ error: 'Session is currently locked due to integrity flags.' });
  }

  const jobId = executionQueue.enqueue({
    type: 'run',
    teamName,
    problemId: null,
    lang,
    code,
    stdin: stdin || ''
  });

  res.json({ jobId, status: 'QUEUED' });
});

app.post('/api/submissions/submit', (req, res) => {
  const { teamName, problemId, lang, code } = req.body;
  if (!teamName || !problemId || !lang || !code) {
    return res.status(400).json({ error: 'Missing submission parameters.' });
  }

  const team = db.getTeam(teamName);
  if (team && team.isLocked) {
    return res.status(403).json({ error: 'Session is locked by proctors.' });
  }

  const jobId = executionQueue.enqueue({
    type: 'submit',
    teamName,
    problemId,
    lang,
    code
  });

  // When job completes, broadcast update to proctors
  executionQueue.subscribe(jobId, (job) => {
    if (job.status === 'COMPLETED') {
      const updatedTeam = db.getTeam(teamName);
      broadcastToProctors({ type: 'TEAM_UPDATED', team: updatedTeam });
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
    error: job.error,
    createdAt: job.createdAt,
    completedAt: job.completedAt
  });
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
    broadcastToProctors({ type: 'TEAM_UPDATED', team: result.team });
    return res.json({ success: true, team: result.team });
  }
  res.status(400).json({ error: result.message });
});

app.post('/api/proctor/reset', (req, res) => {
  const { teamName } = req.body;
  const result = db.resetTeamProgress(teamName);
  if (result.success) {
    broadcastToProctors({ type: 'TEAM_UPDATED', team: result.team });
    return res.json({ success: true, team: result.team });
  }
  res.status(400).json({ error: result.message });
});

// --- LEADERBOARD ---
app.get('/api/leaderboard', (req, res) => {
  const teams = db.getAllTeams()
    .map(t => ({
      name: t.name,
      score: t.score,
      solvedCount: t.solved.length,
      wrongAttempts: t.wrong,
      violationsCount: t.violations.length,
      isLocked: t.isLocked
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
