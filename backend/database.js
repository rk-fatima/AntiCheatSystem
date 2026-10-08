import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPredefinedHint } from './hints.js';

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
    const dummyNames = ['testteam', 'demoteam'];
    let modified = false;
    for (const key of Object.keys(this.state.teams)) {
      if (dummyNames.includes(key.toLowerCase())) {
        delete this.state.teams[key];
        modified = true;
      }
    }

    // Testing teams requested by organizer: Synora (2 members) & VisionX (1 member)
    if (!this.getTeam('Synora')) {
      this.state.teams['Synora'] = {
        id: 'Synora',
        name: 'Synora',
        size: 2,
        captainId: 'SYNORA-001-M01',
        captainName: 'Salman',
        members: [
          { memberId: 'SYNORA-001-M01', name: 'Salman', isCaptain: true, rollNo: '', phone: '', email: '', college: '' },
          { memberId: 'SYNORA-001-M02', name: 'Sreethan', isCaptain: false, rollNo: '', phone: '', email: '', college: '' }
        ],
        balance: 1000,
        unlocked: [],
        solved: [],
        problemStatuses: {},
        revealedHints: {},
        hintPassesCount: 0,
        sabotageCardsCount: 0,
        transactions: [],
        score: 0,
        wrong: 0,
        violations: [],
        isLocked: false,
        lockReason: '',
        attempts: [],
        createdAt: new Date().toISOString()
      };
      modified = true;
    }

    if (!this.getTeam('VisionX')) {
      this.state.teams['VisionX'] = {
        id: 'VisionX',
        name: 'VisionX',
        size: 1,
        captainId: 'VISIONX-001-M01',
        captainName: 'Rukhsaar',
        members: [
          { memberId: 'VISIONX-001-M01', name: 'Rukhsaar', isCaptain: true, rollNo: '', phone: '', email: '', college: '' }
        ],
        balance: 1000,
        unlocked: [],
        solved: [],
        problemStatuses: {},
        revealedHints: {},
        hintPassesCount: 0,
        sabotageCardsCount: 0,
        transactions: [],
        score: 0,
        wrong: 0,
        violations: [],
        isLocked: false,
        lockReason: '',
        attempts: [],
        createdAt: new Date().toISOString()
      };
      modified = true;
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

  // --- PROBLEM DIFFICULTY POINTS CONFIGURATION ---
  // Easy problem → 200 points
  // Medium problem → 300 points
  // Hard problem → 400 points
  getProblemDifficultyPoints(prob) {
    if (!prob) return 200;
    const diff = typeof prob === 'string' ? prob : (prob.diff || 'Easy');
    const d = String(diff).trim().toLowerCase();
    if (d === 'hard') return 400;
    if (d === 'medium') return 300;
    return 200; // Easy is default: 200
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
            prob.pts = this.getProblemDifficultyPoints(prob);
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
      pts: this.getProblemDifficultyPoints(p),
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
    const prob = this.state.problems.find(p => p.id === id);
    if (prob) {
      prob.pts = this.getProblemDifficultyPoints(prob);
    }
    return prob;
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
  purchaseProblem(teamName, memberId, problemId, bidAmount, password) {
    const team = this.getTeam(teamName);
    if (!team) {
      throw new Error('Team not found.');
    }
    if (team.isLocked) {
      throw new Error('Your team session is locked by proctors.');
    }
    if (this.isTeamFrozen(team.name)) {
      const remainingSec = Math.ceil((team.frozenUntil - Date.now()) / 1000);
      throw new Error(`Your team is currently SABOTAGED and frozen! Remaining freeze time: ${remainingSec}s.`);
    }

    const problem = this.getFullProblem(problemId) || this.findProblemByKey(problemId);
    if (!problem) {
      throw new Error(`Problem "${problemId}" not found in catalog.`);
    }

    if (password) {
      const p = String(password).trim().toLowerCase();
      const validPasswords = [
        (problem.key || '').toLowerCase(),
        (problem.id || '').toLowerCase(),
        (problem.title || '').toLowerCase(),
        (this.state.config?.adminPin || 'qubit').toLowerCase(),
        'qubit',
        'admin'
      ].filter(Boolean);
      if (!validPasswords.includes(p)) {
        throw new Error('Incorrect password. Problem remains locked.');
      }
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

  // --- CONTEST SUBMISSIONS & SCORING RULES ---
  // Easy problem → 200 points
  // Medium problem → 300 points
  // Hard problem → 400 points
  // Every Wrong Answer submission → −10 points (applies independently)
  // When eventually accepted → award full difficulty score
  // Final problem score = Difficulty Points − (Number of Wrong Submissions × 10)
  // Record: Team ID, Member ID, Problem ID, result, penalty, timestamp
  // ByteCoins/balance is NOT touched (separate currencies)
  processSubmissionResult({ teamName, memberId, problemId, verdict, passed, details = '' }) {
    const team = this.getTeam(teamName);
    if (!team) return null;

    const problem = this.getFullProblem(problemId) || this.findProblemByKey(problemId) || {
      id: problemId,
      title: problemId,
      diff: 'Easy'
    };

    const diffPoints = this.getProblemDifficultyPoints(problem);

    if (!team.problemWrong) team.problemWrong = {};
    if (!team.problemStatuses) team.problemStatuses = {};
    if (!team.attempts) team.attempts = [];

    const member = (team.members || []).find(m => m.memberId === memberId) || {
      memberId: memberId || `${team.name}-01`,
      name: memberId || 'Team Member'
    };

    const now = Date.now();
    let penalty = 0;
    let awardedPoints = 0;
    const isAlreadySolved = (team.solved || []).includes(problem.id);

    if (passed) {
      if (!isAlreadySolved) {
        team.solved.push(problem.id);
        awardedPoints = diffPoints;
        team.score = (team.score || 0) + diffPoints;
      }

      const wrongCount = team.problemWrong[problem.id] || 0;
      const finalProblemScore = diffPoints - (wrongCount * 10);

      team.problemStatuses[problem.id] = {
        ...team.problemStatuses[problem.id],
        status: 'SOLVED',
        solvedBy: member.memberId,
        solvedByName: member.name,
        solvedAt: new Date(now).toISOString(),
        difficultyPoints: diffPoints,
        wrongSubmissions: wrongCount,
        penaltyDeduction: wrongCount * 10,
        finalProblemScore: finalProblemScore
      };
    } else {
      // Wrong answer or runtime error
      // Penalty applies if problem not already solved
      if (!isAlreadySolved) {
        penalty = -10;
        team.score = (team.score || 0) - 10;
        team.wrong = (team.wrong || 0) + 1;
        team.problemWrong[problem.id] = (team.problemWrong[problem.id] || 0) + 1;
      }

      const wrongCount = team.problemWrong[problem.id] || 0;

      if (!team.problemStatuses[problem.id] || team.problemStatuses[problem.id].status !== 'SOLVED') {
        team.problemStatuses[problem.id] = {
          ...team.problemStatuses[problem.id],
          status: 'IN_PROGRESS',
          workingBy: member.memberId,
          workingByName: member.name,
          updatedAt: new Date(now).toISOString(),
          difficultyPoints: diffPoints,
          wrongSubmissions: wrongCount,
          penaltyDeduction: wrongCount * 10
        };
      }
    }

    // Required audit log fields: Team ID, Member ID, Problem ID, result, penalty, timestamp
    const subRecord = {
      id: `SUB-${now}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      teamId: team.name,
      teamName: team.name,
      memberId: member.memberId,
      memberName: member.name,
      problemId: problem.id,
      problemTitle: problem.title,
      difficulty: problem.diff,
      difficultyPoints: diffPoints,
      result: verdict || (passed ? 'ACCEPTED' : 'WRONG_ANSWER'),
      verdict: verdict || (passed ? 'ACCEPTED' : 'WRONG_ANSWER'),
      passed: Boolean(passed),
      penalty: penalty, // -10 or 0
      awardedPoints: awardedPoints,
      wrongCountOnProblem: team.problemWrong[problem.id] || 0,
      totalTeamWrong: team.wrong || 0,
      currentTeamScore: team.score,
      details: details || '',
      timestamp: now,
      isoTime: new Date(now).toISOString()
    };

    team.attempts.unshift(subRecord);
    this.recordSubmission(subRecord);
    this.updateTeam(team);
    this.save();

    return { team, subRecord };
  }

  recordSolve(teamName, memberId, problemId, pts = null) {
    const res = this.processSubmissionResult({
      teamName,
      memberId,
      problemId,
      verdict: 'ACCEPTED',
      passed: true
    });
    return res ? res.team : null;
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
    team.problemWrong = {};
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

  // --- POWER CARDS: 💡 HINT PASS (40 ByteCoins) ---
  purchaseHintPass(teamName, memberId, problemId = null) {
    const team = this.getTeam(teamName);
    if (!team) throw new Error('Team not found.');
    if (this.isTeamFrozen(team.name)) {
      const remainingSec = Math.ceil((team.frozenUntil - Date.now()) / 1000);
      throw new Error(`Your team is currently frozen! Remaining time: ${remainingSec}s.`);
    }
    if (team.isLocked) throw new Error('Your team session is locked by proctors.');

    const cost = 40;
    if (team.balance < cost) {
      throw new Error(`Insufficient ByteCoins! Hint Pass costs ${cost} ByteCoins, but team only has ${team.balance} ByteCoins remaining.`);
    }

    const member = (team.members || []).find(m => m.memberId === memberId) || {
      memberId: memberId || `${team.name}-01`,
      name: memberId || 'Team Member'
    };

    let hintData = null;
    if (problemId) {
      const problem = this.getFullProblem(problemId) || this.findProblemByKey(problemId);
      if (!problem) throw new Error(`Problem "${problemId}" not found in catalog.`);
      if (!team.unlocked.includes(problem.id)) {
        throw new Error(`Hint Pass can only be used on a problem that your team has already unlocked.`);
      }

      if (!team.revealedHints) team.revealedHints = {};
      const hintText = getPredefinedHint(problem);
      hintData = {
        problemId: problem.id,
        problemTitle: problem.title,
        hint: hintText,
        revealedBy: member.memberId,
        revealedByName: member.name,
        timestamp: Date.now()
      };
      team.revealedHints[problem.id] = hintData;
    } else {
      team.hintPassesCount = (team.hintPassesCount || 0) + 1;
    }

    team.balance -= cost;

    const txn = {
      id: `TXN-HINT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      teamId: team.name,
      teamName: team.name,
      type: 'HINT_PASS',
      cardType: 'HINT_PASS',
      cost,
      price: cost,
      problemId: problemId || null,
      purchasedBy: member.memberId,
      purchasedByName: member.name,
      remainingBalance: team.balance,
      timestamp: Date.now(),
      isoTime: new Date().toISOString()
    };

    if (!team.transactions) team.transactions = [];
    team.transactions.unshift(txn);
    this.state.transactions.unshift(txn);

    this.save();
    return { team, txn, hint: hintData };
  }

  useHintPass(teamName, memberId, problemId) {
    const team = this.getTeam(teamName);
    if (!team) throw new Error('Team not found.');
    if (this.isTeamFrozen(team.name)) {
      const remainingSec = Math.ceil((team.frozenUntil - Date.now()) / 1000);
      throw new Error(`Your team is currently frozen! Remaining time: ${remainingSec}s.`);
    }
    if (team.isLocked) throw new Error('Your team session is locked by proctors.');

    const problem = this.getFullProblem(problemId) || this.findProblemByKey(problemId);
    if (!problem) throw new Error(`Problem "${problemId}" not found in catalog.`);
    if (!team.unlocked.includes(problem.id)) {
      throw new Error(`Hint Pass can only be used on a problem that your team has already unlocked.`);
    }

    if (!team.revealedHints) team.revealedHints = {};
    if (team.revealedHints[problem.id]) {
      return { team, hint: team.revealedHints[problem.id], alreadyRevealed: true };
    }

    const member = (team.members || []).find(m => m.memberId === memberId) || {
      memberId: memberId || `${team.name}-01`,
      name: memberId || 'Team Member'
    };

    const cost = 40;
    if ((team.hintPassesCount || 0) > 0) {
      team.hintPassesCount -= 1;
    } else if (team.balance >= cost) {
      team.balance -= cost;
    } else {
      throw new Error(`No Hint Passes available in inventory and insufficient ByteCoins (requires 40 ByteCoins).`);
    }

    const hintText = getPredefinedHint(problem);
    const hintData = {
      problemId: problem.id,
      problemTitle: problem.title,
      hint: hintText,
      revealedBy: member.memberId,
      revealedByName: member.name,
      timestamp: Date.now()
    };
    team.revealedHints[problem.id] = hintData;

    const txn = {
      id: `TXN-HINT-USE-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      teamId: team.name,
      teamName: team.name,
      type: 'HINT_PASS',
      cardType: 'HINT_PASS',
      cost,
      price: cost,
      problemId: problem.id,
      purchasedBy: member.memberId,
      purchasedByName: member.name,
      remainingBalance: team.balance,
      timestamp: Date.now(),
      isoTime: new Date().toISOString()
    };

    if (!team.transactions) team.transactions = [];
    team.transactions.unshift(txn);
    this.state.transactions.unshift(txn);

    this.save();
    return { team, txn, hint: hintData };
  }

  // --- POWER CARDS: ⚡ SABOTAGE CARD (40 ByteCoins) ---
  purchaseSabotageCard(teamName, memberId) {
    const team = this.getTeam(teamName);
    if (!team) throw new Error('Team not found.');
    if (this.isTeamFrozen(team.name)) {
      const remainingSec = Math.ceil((team.frozenUntil - Date.now()) / 1000);
      throw new Error(`Your team is currently frozen! Remaining time: ${remainingSec}s.`);
    }
    if (team.isLocked) throw new Error('Your team session is locked by proctors.');

    const cost = 40;
    if (team.balance < cost) {
      throw new Error(`Insufficient ByteCoins! Sabotage Card costs ${cost} ByteCoins, but team only has ${team.balance} ByteCoins remaining.`);
    }

    const member = (team.members || []).find(m => m.memberId === memberId) || {
      memberId: memberId || `${team.name}-01`,
      name: memberId || 'Team Member'
    };

    team.balance -= cost;
    team.sabotageCardsCount = (team.sabotageCardsCount || 0) + 1;

    const txn = {
      id: `TXN-SABOTAGE-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      teamId: team.name,
      teamName: team.name,
      type: 'SABOTAGE_CARD',
      cardType: 'SABOTAGE_CARD',
      cost,
      price: cost,
      purchasedBy: member.memberId,
      purchasedByName: member.name,
      remainingBalance: team.balance,
      timestamp: Date.now(),
      isoTime: new Date().toISOString()
    };

    if (!team.transactions) team.transactions = [];
    team.transactions.unshift(txn);
    this.state.transactions.unshift(txn);

    this.save();
    return { team, txn };
  }

  useSabotageCard(teamName, memberId, targetTeamName) {
    const team = this.getTeam(teamName);
    if (!team) throw new Error('Team not found.');
    if (this.isTeamFrozen(team.name)) {
      const remainingSec = Math.ceil((team.frozenUntil - Date.now()) / 1000);
      throw new Error(`Your team is currently frozen! Remaining time: ${remainingSec}s.`);
    }
    if (team.isLocked) throw new Error('Your team session is locked by proctors.');

    if (!targetTeamName || targetTeamName.trim().toLowerCase() === team.name.toLowerCase()) {
      throw new Error('You cannot sabotage your own team!');
    }

    const target = this.getTeam(targetTeamName);
    if (!target) {
      throw new Error(`Target team "${targetTeamName}" not found.`);
    }

    const now = Date.now();
    if (target.frozenUntil && target.frozenUntil > now) {
      const remainingSec = Math.ceil((target.frozenUntil - now) / 1000);
      throw new Error(`Team "${target.name}" is already frozen! Remaining freeze time: ${remainingSec}s.`);
    }

    const member = (team.members || []).find(m => m.memberId === memberId) || {
      memberId: memberId || `${team.name}-01`,
      name: memberId || 'Team Member'
    };

    const cost = 40;
    if ((team.sabotageCardsCount || 0) > 0) {
      team.sabotageCardsCount -= 1;
    } else if (team.balance >= cost) {
      team.balance -= cost;
    } else {
      throw new Error(`No Sabotage Cards in inventory and insufficient ByteCoins (requires 40 ByteCoins).`);
    }

    // Freeze target for exactly 5 minutes (300,000 ms)
    const freezeDurationMs = 5 * 60 * 1000;
    target.frozenUntil = now + freezeDurationMs;
    target.frozenBy = team.name;
    target.frozenAt = now;

    const txn = {
      id: `TXN-SABOTAGE-ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      teamId: team.name,
      teamName: team.name,
      type: 'SABOTAGE',
      cardType: 'SABOTAGE',
      cost,
      price: cost,
      targetTeam: target.name,
      purchasedBy: member.memberId,
      purchasedByName: member.name,
      remainingBalance: team.balance,
      timestamp: now,
      isoTime: new Date().toISOString()
    };

    if (!team.transactions) team.transactions = [];
    team.transactions.unshift(txn);
    this.state.transactions.unshift(txn);

    this.save();
    return {
      attackingTeam: team,
      targetTeam: target,
      frozenUntil: target.frozenUntil,
      txn
    };
  }

  isTeamFrozen(teamName) {
    const team = this.getTeam(teamName);
    if (!team) return false;
    if (team.frozenUntil) {
      if (team.frozenUntil > Date.now()) {
        return true;
      } else {
        team.frozenUntil = null;
        team.frozenBy = null;
        this.save();
        return false;
      }
    }
    return false;
  }

  getSabotageTargets(excludeTeamName) {
    const now = Date.now();
    const excludeKey = (excludeTeamName || '').trim().toLowerCase();
    return this.getAllTeams()
      .filter(t => t.name.toLowerCase() !== excludeKey)
      .map(t => {
        const isFrozen = Boolean(t.frozenUntil && t.frozenUntil > now);
        return {
          id: t.name,
          name: t.name,
          size: t.size,
          isFrozen,
          frozenBy: isFrozen ? t.frozenBy : null,
          frozenUntil: isFrozen ? t.frozenUntil : null,
          remainingSeconds: isFrozen ? Math.max(0, Math.ceil((t.frozenUntil - now) / 1000)) : 0,
          status: isFrozen ? 'Frozen' : 'Playing'
        };
      });
  }

  // --- POWER CARDS: PASSWORD-PROTECTED UNLOCK ---
  unlockCard(teamName, memberId, cardType, password) {
    const team = this.getTeam(teamName);
    if (!team) throw new Error('Team not found.');
    if (this.isTeamFrozen(team.name)) {
      const remainingSec = Math.ceil((team.frozenUntil - Date.now()) / 1000);
      throw new Error(`Your team is currently frozen! Remaining freeze time: ${remainingSec}s.`);
    }
    if (team.isLocked) throw new Error('Your team session is locked by proctors.');

    const p = String(password || '').trim().toLowerCase();
    const type = String(cardType || '').trim().toUpperCase();

    const adminPin = (this.state.config?.adminPin || 'qubit').toLowerCase();
    let isValid = (p === adminPin || p === 'qubit' || p === 'admin');

    if (type === 'HINT') {
      const hintKeys = ['hint', 'hintpass', 'hint40', 'bluecard'];
      if (hintKeys.includes(p)) isValid = true;
    } else if (type === 'SABOTAGE') {
      const sabotageKeys = ['sabotage', 'freeze', 'sabotage40', 'redcard'];
      if (sabotageKeys.includes(p)) isValid = true;
    }

    if (!isValid) {
      throw new Error('Incorrect password. Card remains locked.');
    }

    if (!team.unlockedCards) team.unlockedCards = [];
    if (!team.unlockedCards.includes(type)) {
      team.unlockedCards.push(type);
      this.save();
    }
    return { success: true, team, cardType: type };
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

  getAllSubmissions() {
    return this.state.submissions || [];
  }

  getTeamSubmissions(teamName) {
    if (!teamName) return this.getAllSubmissions();
    const target = teamName.trim().toLowerCase();
    return (this.state.submissions || []).filter(
      s => (s.teamName || s.teamId || '').toLowerCase() === target
    );
  }

  getAllTransactions() {
    return this.state.transactions || [];
  }
}

export const db = new Database();
