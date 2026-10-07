import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Database {
  constructor() {
    this.state = {
      problems: [],
      problemPrices: {}, // problemId -> number (dynamically set by organizer)
      teams: {},         // Clean start: populated ONLY via actual registration
      transactions: [],  // Immutable audit log of problem purchases
      submissions: [],
      telemetry: [],
      config: {
        adminPin: "qubit",
        maxFlags: 3,
        executionTimeoutMs: 3000,
        initialTeamBalance: 1000
      }
    };
    this.load();
    this.seedProblems();
    // Ensure clean state: remove dummy/test data
    this.cleanDummyData();
  }

  load() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        this.state = {
          ...this.state,
          ...parsed,
          problemPrices: parsed.problemPrices || {},
          transactions: parsed.transactions || [],
          teams: parsed.teams || {},
          submissions: parsed.submissions || [],
          telemetry: parsed.telemetry || []
        };
      }
    } catch (err) {
      console.error('Failed to load store, using fresh state:', err);
    }
  }

  save() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist store:', err);
    }
  }

  cleanDummyData() {
    // Explicit requirement: "Do not create any default users, teams, or dummy data during initial setup.
    // The system must start with an empty database."
    // Clear out any old test teams, telemetry, and submissions
    let modified = false;
    if (Object.keys(this.state.teams).length > 0) {
      // Check if all existing teams are dummy/test teams
      const dummyNames = ['testteam', 'qubit', 'abcd', 'demoteam', 'abcde', 'testunlock', 'qwerty', 'abcdef', 'visionx', 'synora'];
      const teamKeys = Object.keys(this.state.teams);
      const isAllDummy = teamKeys.every(k => dummyNames.includes(k.toLowerCase()));
      if (isAllDummy) {
        this.state.teams = {};
        this.state.transactions = [];
        this.state.telemetry = [];
        this.state.submissions = [];
        modified = true;
      }
    }
    if (modified) {
      this.save();
    }
  }

  resetAllData() {
    this.state.teams = {};
    this.state.transactions = [];
    this.state.telemetry = [];
    this.state.submissions = [];
    this.save();
  }

  seedProblems() {
    try {
      const dataProblemPath = path.join(__dirname, 'data', 'qubit-problems.json');
      const parentProblemPath = path.join(__dirname, '..', 'qubit-problems.json');
      const targetPath = fs.existsSync(dataProblemPath) ? dataProblemPath : (fs.existsSync(parentProblemPath) ? parentProblemPath : null);

      if (targetPath) {
        const fileContent = fs.readFileSync(targetPath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.problems && Array.isArray(parsed.problems)) {
          const problemMap = new Map();
          for (const prob of parsed.problems) {
            problemMap.set(prob.id, prob);
          }
          this.state.problems = Array.from(problemMap.values());
          this.save();
          return;
        }
      }
    } catch (e) {
      console.error('Problem seed error:', e);
    }
  }

  // --- PROBLEM ACCESS & DYNAMIC PRICING ---
  getPublicProblems() {
    if (!this.state.problems || this.state.problems.length < 20) {
      this.seedProblems();
    }
    return this.state.problems.map(p => ({
      id: p.id,
      title: p.title,
      diff: p.diff,
      cat: p.cat,
      desc: p.desc,
      con: p.con,
      si: p.si,
      so: p.so,
      // Dynamic price configured by organizer:
      price: this.getProblemPrice(p.id)
    }));
  }

  getFullProblem(id) {
    return this.state.problems.find(p => p.id === id);
  }

  findProblemByKey(key) {
    const k = (key || '').trim().toLowerCase();
    return this.state.problems.find(p => 
      (p.id || '').toLowerCase() === k ||
      (p.key || '').toLowerCase() === k ||
      (p.origId || '').toLowerCase() === k ||
      (p.origId || '').toLowerCase().replace('lc', '') === k ||
      (p.title || '').toLowerCase() === k
    );
  }

  // Dynamic organizer pricing
  getProblemPrice(problemId) {
    if (!this.state.problemPrices) this.state.problemPrices = {};
    const price = this.state.problemPrices[problemId];
    if (price !== undefined && price !== null) {
      return Number(price);
    }
    return null; // Not set yet by organizer
  }

  setProblemPrice(problemId, price) {
    if (!this.state.problemPrices) this.state.problemPrices = {};
    const numPrice = Math.max(0, parseInt(price, 10) || 0);
    this.state.problemPrices[problemId] = numPrice;
    this.save();
    return numPrice;
  }

  batchSetTierPrices(easyPrice = 100, mediumPrice = 150, hardPrice = 200) {
    if (!this.state.problemPrices) this.state.problemPrices = {};
    for (const prob of this.state.problems) {
      if (prob.diff === 'Hard') {
        this.state.problemPrices[prob.id] = Number(hardPrice);
      } else if (prob.diff === 'Medium') {
        this.state.problemPrices[prob.id] = Number(mediumPrice);
      } else {
        this.state.problemPrices[prob.id] = Number(easyPrice);
      }
    }
    this.save();
    return this.state.problemPrices;
  }

  getAllPrices() {
    return this.state.problemPrices || {};
  }

  // --- TEAM REGISTRATION & SESSION MANAGEMENT ---
  registerTeam({ name, size, captainIdx = 0, members = [] }) {
    const normalized = (name || '').trim();
    if (!normalized) {
      throw new Error('Team name cannot be blank.');
    }

    // Check if team already exists
    const existing = Object.keys(this.state.teams).find(
      k => k.toLowerCase() === normalized.toLowerCase()
    );
    if (existing) {
      throw new Error(`Team "${normalized}" is already registered. Please choose a different name or log in.`);
    }

    const teamSize = Math.max(1, Math.min(3, parseInt(size, 10) || 1));
    if (members.length < teamSize) {
      throw new Error(`Please provide information for all ${teamSize} team members.`);
    }

    const formattedMembers = [];
    for (let i = 0; i < teamSize; i++) {
      const m = members[i] || {};
      const memberIndexStr = String(i + 1).padStart(2, '0');
      const memberId = (m.memberId || `${normalized}-001-M${memberIndexStr}`).trim();
      const isCaptain = (i === parseInt(captainIdx, 10));

      if (!m.name || !m.name.trim()) {
        throw new Error(`Member ${i + 1} name is required.`);
      }

      formattedMembers.push({
        memberId,
        name: m.name.trim(),
        rollNo: (m.rollNo || '').trim(),
        phone: (m.phone || '').trim(),
        email: (m.email || '').trim(),
        college: (m.college || '').trim(),
        isCaptain
      });
    }

    const captain = formattedMembers.find(m => m.isCaptain) || formattedMembers[0];

    const newTeam = {
      id: normalized,
      name: normalized,
      size: teamSize,
      captainId: captain.memberId,
      captainName: captain.name,
      members: formattedMembers,
      balance: this.state.config.initialTeamBalance || 1000,
      unlocked: [],
      solved: [],
      problemStatuses: {}, // problemId -> { status, workingBy, solvedBy, ... }
      transactions: [],
      score: 0,
      wrong: 0,
      violations: [],
      isLocked: false,
      lockReason: "",
      attempts: [],
      createdAt: new Date().toISOString()
    };

    this.state.teams[normalized] = newTeam;
    this.save();
    return newTeam;
  }

  getTeam(teamName) {
    const k = (teamName || '').trim();
    return this.state.teams[k] || Object.values(this.state.teams).find(t => t.name.toLowerCase() === k.toLowerCase()) || null;
  }

  loginOrInitTeam(teamName, memberId) {
    const normalized = (teamName || '').trim();
    if (!normalized) {
      throw new Error('Team name cannot be blank.');
    }

    let team = this.getTeam(normalized);
    if (!team) {
      throw new Error(`Team "${normalized}" was not found in the registration database. Please verify your team name.`);
    }

    // Determine the active member
    let member = null;
    const targetId = (memberId || '').trim().toLowerCase();
    if (targetId && team.members) {
      member = team.members.find(m => m.memberId.toLowerCase() === targetId);
      if (!member) {
        member = team.members.find(m => m.memberId.toLowerCase().endsWith(targetId));
      }
      if (!member) {
        member = team.members.find(m => m.name.toLowerCase() === targetId);
      }
    }
    if (!member) {
      throw new Error(`Selected member identity was not found for team "${team.name}".`);
    }

    return { team, member };
  }

  syncTeams(teamsList) {
    if (!Array.isArray(teamsList)) {
      throw new Error('teamsList must be an array');
    }
    let count = 0;
    for (const item of teamsList) {
      if (!item || !item.name) continue;
      const normalized = item.name.trim();
      const existing = this.getTeam(normalized);
      const teamSize = Math.max(1, Math.min(3, parseInt(item.size, 10) || (item.members ? item.members.length : 1)));
      const rawMembers = Array.isArray(item.members) ? item.members : [];
      const formattedMembers = [];

      for (let i = 0; i < teamSize; i++) {
        const m = rawMembers[i] || {};
        const memberIndexStr = String(i + 1).padStart(2, '0');
        const defaultMemberId = `${normalized}-001-M${memberIndexStr}`;
        formattedMembers.push({
          memberId: (m.memberId || defaultMemberId).trim(),
          name: (m.name || `Member ${i + 1}`).trim(),
          rollNo: (m.rollNo || '').trim(),
          phone: (m.phone || '').trim(),
          email: (m.email || '').trim(),
          college: (m.college || '').trim(),
          isCaptain: m.isCaptain !== undefined ? Boolean(m.isCaptain) : (i === 0)
        });
      }

      const captain = formattedMembers.find(m => m.isCaptain) || formattedMembers[0];

      if (existing) {
        existing.members = formattedMembers;
        existing.size = formattedMembers.length;
        existing.captainId = captain.memberId;
        existing.captainName = captain.name;
        this.state.teams[existing.name] = existing;
      } else {
        const newTeam = {
          id: normalized,
          name: normalized,
          size: formattedMembers.length,
          captainId: captain.memberId,
          captainName: captain.name,
          members: formattedMembers,
          balance: this.state.config.initialTeamBalance || 1000,
          unlocked: [],
          solved: [],
          problemStatuses: {},
          transactions: [],
          score: 0,
          wrong: 0,
          violations: [],
          isLocked: false,
          lockReason: "",
          attempts: [],
          createdAt: new Date().toISOString()
        };
        this.state.teams[normalized] = newTeam;
      }
      count++;
    }
    this.save();
    return { count, teams: this.getAllTeams() };
  }

  getOrCreateTeam(teamName) {
    return this.loginOrInitTeam(teamName).team;
  }

  getAllTeams() {
    return Object.values(this.state.teams);
  }

  updateTeam(team) {
    if (team && team.name) {
      this.state.teams[team.name] = team;
      this.save();
    }
  }

  // --- OFFLINE BIDDING: TEAM-LEVEL PROBLEM UNLOCK & BID AMOUNT DEDUCTION ---
  purchaseProblem(teamName, memberId, problemId, bidAmount) {
    const team = this.getTeam(teamName);
    if (!team) {
      throw new Error('Team not found.');
    }
    if (team.isLocked) {
      throw new Error('Your team session is locked by proctors.');
    }

    const problem = this.getFullProblem(problemId) || this.findProblemByKey(problemId);
    if (!problem) {
      throw new Error(`Problem "${problemId}" not found in catalog.`);
    }

    if (team.unlocked.includes(problem.id)) {
      throw new Error(`Problem "${problem.id} — ${problem.title}" is already unlocked for your team!`);
    }

    // Determine bid amount: use entered winning bid amount or configured price
    let finalBidAmount;
    if (bidAmount !== undefined && bidAmount !== null && String(bidAmount).trim() !== '' && !isNaN(Number(bidAmount))) {
      finalBidAmount = Math.max(0, parseInt(bidAmount, 10));
    } else {
      const configuredPrice = this.getProblemPrice(problem.id);
      if (configuredPrice !== null && configuredPrice !== undefined) {
        finalBidAmount = configuredPrice;
      } else {
        throw new Error('Please enter the winning bid amount agreed in the offline auction.');
      }
    }

    if (team.balance < finalBidAmount) {
      throw new Error(`Insufficient budget! Your winning bid is ₹${finalBidAmount}, but team only has ₹${team.balance} remaining.`);
    }

    const member = (team.members || []).find(m => m.memberId === memberId) || {
      memberId: memberId || `${team.name}-01`,
      name: memberId || 'Team Member'
    };

    // Deduct bid amount at the TEAM level
    team.balance -= finalBidAmount;
    team.unlocked.push(problem.id);

    // Initialize problem status in shared workspace
    if (!team.problemStatuses) team.problemStatuses = {};
    team.problemStatuses[problem.id] = {
      status: 'UNLOCKED',
      unlockedBy: member.memberId,
      unlockedByName: member.name,
      bidAmount: finalBidAmount,
      unlockedAt: new Date().toISOString()
    };

    // Maintain immutable transaction record
    const now = new Date();
    const txn = {
      id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      teamId: team.name,
      teamName: team.name,
      problemId: problem.id,
      problemTitle: problem.title,
      bidAmount: finalBidAmount,
      price: finalBidAmount, // compatibility alias
      purchasedBy: member.memberId,
      purchasedByName: member.name,
      remainingBalance: team.balance,
      purchaseTime: now.toISOString(),
      displayTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };

    if (!team.transactions) team.transactions = [];
    team.transactions.unshift(txn);
    this.state.transactions.unshift(txn);

    this.updateTeam(team);
    this.save();

    return { team, txn, problem };
  }

  // --- SHARED WORKSPACE ACTIVITY TRACKING ---
  setMemberWorking(teamName, memberId, problemId) {
    const team = this.getTeam(teamName);
    if (!team) return null;
    if (!team.problemStatuses) team.problemStatuses = {};

    const member = (team.members || []).find(m => m.memberId === memberId) || {
      memberId: memberId,
      name: memberId
    };

    // Don't overwrite if problem is already solved
    if (team.problemStatuses[problemId]?.status === 'SOLVED') {
      return team;
    }

    team.problemStatuses[problemId] = {
      status: 'IN_PROGRESS',
      workingBy: member.memberId,
      workingByName: member.name,
      updatedAt: new Date().toISOString()
    };

    this.updateTeam(team);
    return team;
  }

  recordSolve(teamName, memberId, problemId, pts = 100) {
    const team = this.getTeam(teamName);
    if (!team) return null;
    if (!team.problemStatuses) team.problemStatuses = {};

    const member = (team.members || []).find(m => m.memberId === memberId) || {
      memberId: memberId,
      name: memberId
    };

    if (!team.solved.includes(problemId)) {
      team.solved.push(problemId);
      team.score += Number(pts) || 0;
    }

    team.problemStatuses[problemId] = {
      status: 'SOLVED',
      solvedBy: member.memberId,
      solvedByName: member.name,
      solvedAt: new Date().toISOString()
    };

    this.updateTeam(team);
    return team;
  }

  // --- TELEMETRY & AUDIT LOGS ---
  addTelemetry(teamName, memberId, event, details) {
    const team = this.getTeam(teamName);
    const entry = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      teamName,
      memberId: memberId || 'UNKNOWN',
      event,
      details,
      timestamp: Date.now(),
      isoTime: new Date().toISOString()
    };

    this.state.telemetry.unshift(entry);
    if (this.state.telemetry.length > 2000) {
      this.state.telemetry.pop();
    }

    if (team) {
      if (!team.violations) team.violations = [];
      team.violations.push(entry);
      if (team.violations.length >= this.state.config.maxFlags) {
        team.isLocked = true;
        team.lockReason = `Flag threshold exceeded (${team.violations.length} violations detected; latest by ${entry.memberId}). Organiser review required.`;
      }
      this.updateTeam(team);
    }

    this.save();
    return { entry, team };
  }

  unlockTeam(teamName, pin) {
    if (pin !== this.state.config.adminPin) {
      return { success: false, message: 'Invalid Organiser PIN' };
    }
    const team = this.getTeam(teamName);
    if (!team) return { success: false, message: 'Team not found' };

    team.isLocked = false;
    team.lockReason = '';
    this.updateTeam(team);
    return { success: true, team };
  }

  resetTeamProgress(teamName) {
    const team = this.getTeam(teamName);
    if (!team) return { success: false, message: 'Team not found' };

    team.balance = this.state.config.initialTeamBalance || 1000;
    team.unlocked = [];
    team.solved = [];
    team.problemStatuses = {};
    team.transactions = [];
    team.score = 0;
    team.wrong = 0;
    team.violations = [];
    team.isLocked = false;
    team.lockReason = "";
    team.attempts = [];
    this.updateTeam(team);
    return { success: true, team };
  }

  // --- SUBMISSIONS ---
  recordSubmission(sub) {
    this.state.submissions.unshift(sub);
    if (this.state.submissions.length > 3000) {
      this.state.submissions.pop();
    }
    this.save();
  }

  getSubmission(id) {
    return this.state.submissions.find(s => s.id === id);
  }

  getAllTransactions() {
    return this.state.transactions || [];
  }
}

export const db = new Database();
