import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { getPredefinedHint } from './hints.js';
import {
  analyzeComplexity,
  normalizeTimeComplexityKey,
  normalizeSpaceComplexityKey,
  DEFAULT_TIME_COMPLEXITY_DEDUCTIONS,
  DEFAULT_SPACE_COMPLEXITY_DEDUCTIONS,
  SUPPORTED_TIME_COMPLEXITIES,
  SUPPORTED_SPACE_COMPLEXITIES
} from './complexityAnalyzer.js';

export function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return false;
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  try {
    const check = crypto.scryptSync(password, salt, 64).toString('hex');
    return check === hash;
  } catch (e) {
    return false;
  }
}

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
      teams: {},         // Clean start: populated ONLY via actual registration & admin approval
      registrations: {}, // Self-registrations submitted by teams
      eventState: {
        status: 'REGISTRATION_CLOSED', // 'REGISTRATION_CLOSED' | 'EVENT_LIVE' | 'EVENT_ENDED'
        startedAt: null,
        endedAt: null
      },
      archivedEvents: [], // Past completed event sessions with final leaderboards & results
      currentEvent: null, // Active event session { id, name, status, startedAt, endedAt, participatingTeams: [] }
      transactions: [],  // Immutable audit log of problem purchases
      unlockHistory: [], // Admin unlock transactions audit log
      submissions: [],
      telemetry: [],
      config: {
        adminPin: "qubit",
        maxFlags: 3,
        executionTimeoutMs: 3000,
        initialTeamBalance: 1000
      },
      scoringConfig: {
        baseScores: {
          Easy: 200,
          Medium: 300,
          Hard: 400
        },
        problemBaseScores: {},
        problemDifficulties: {},
        timeComplexityDeductions: { ...DEFAULT_TIME_COMPLEXITY_DEDUCTIONS },
        spaceComplexityDeductions: { ...DEFAULT_SPACE_COMPLEXITY_DEDUCTIONS },
        wrongSubmissionPenalty: 5
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
          unlockHistory: parsed.unlockHistory || [],
          teams: parsed.teams || {},
          registrations: parsed.registrations || {},
          eventState: parsed.eventState || {
            status: 'REGISTRATION_CLOSED',
            startedAt: null
          },
          archivedEvents: parsed.archivedEvents || [],
          currentEvent: parsed.currentEvent || null,
          submissions: parsed.submissions || [],
          telemetry: parsed.telemetry || [],
          scoringConfig: {
            baseScores: { Easy: 200, Medium: 300, Hard: 400, ...(parsed.scoringConfig?.baseScores || {}) },
            problemBaseScores: { ...(parsed.scoringConfig?.problemBaseScores || {}) },
            problemDifficulties: { ...(parsed.scoringConfig?.problemDifficulties || {}) },
            timeComplexityDeductions: { ...DEFAULT_TIME_COMPLEXITY_DEDUCTIONS, ...(parsed.scoringConfig?.timeComplexityDeductions || {}) },
            spaceComplexityDeductions: { ...DEFAULT_SPACE_COMPLEXITY_DEDUCTIONS, ...(parsed.scoringConfig?.spaceComplexityDeductions || {}) },
            wrongSubmissionPenalty: parsed.scoringConfig?.wrongSubmissionPenalty ?? 5
          }
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

  // --- PROBLEM DIFFICULTY & SCORING CONFIGURATION ---
  // Easy problem → default 200 points
  // Medium problem → default 300 points
  // Hard problem → default 400 points
  getProblemDifficultyPoints(prob) {
    if (!prob) return 200;
    const probId = typeof prob === 'string' ? prob : prob.id;

    // 1. Explicit admin problem base score override
    if (this.state.scoringConfig?.problemBaseScores?.[probId] !== undefined) {
      return Number(this.state.scoringConfig.problemBaseScores[probId]);
    }

    // 2. Problem difficulty override or original
    const customDiff = this.state.scoringConfig?.problemDifficulties?.[probId];
    const diff = customDiff || (typeof prob === 'object' ? prob.diff : 'Easy') || 'Easy';
    const d = String(diff).trim().toLowerCase();
    const baseScores = this.state.scoringConfig?.baseScores || { Easy: 200, Medium: 300, Hard: 400 };

    if (d === 'hard') return baseScores.Hard ?? 400;
    if (d === 'medium') return baseScores.Medium ?? 300;
    return baseScores.Easy ?? 200;
  }

  getScoringConfig() {
    return this.state.scoringConfig || {
      baseScores: { Easy: 200, Medium: 300, Hard: 400 },
      problemBaseScores: {},
      problemDifficulties: {},
      timeComplexityDeductions: { ...DEFAULT_TIME_COMPLEXITY_DEDUCTIONS },
      spaceComplexityDeductions: { ...DEFAULT_SPACE_COMPLEXITY_DEDUCTIONS },
      wrongSubmissionPenalty: 5
    };
  }

  updateScoringConfig(newConfig = {}) {
    if (!this.state.scoringConfig) {
      this.state.scoringConfig = this.getScoringConfig();
    }
    if (newConfig.baseScores) {
      this.state.scoringConfig.baseScores = {
        ...this.state.scoringConfig.baseScores,
        ...newConfig.baseScores
      };
    }
    if (newConfig.problemBaseScores) {
      this.state.scoringConfig.problemBaseScores = {
        ...this.state.scoringConfig.problemBaseScores,
        ...newConfig.problemBaseScores
      };
    }
    if (newConfig.problemDifficulties) {
      this.state.scoringConfig.problemDifficulties = {
        ...this.state.scoringConfig.problemDifficulties,
        ...newConfig.problemDifficulties
      };
    }
    if (newConfig.timeComplexityDeductions) {
      this.state.scoringConfig.timeComplexityDeductions = {
        ...this.state.scoringConfig.timeComplexityDeductions,
        ...newConfig.timeComplexityDeductions
      };
    }
    if (newConfig.spaceComplexityDeductions) {
      this.state.scoringConfig.spaceComplexityDeductions = {
        ...this.state.scoringConfig.spaceComplexityDeductions,
        ...newConfig.spaceComplexityDeductions
      };
    }
    if (typeof newConfig.wrongSubmissionPenalty === 'number') {
      this.state.scoringConfig.wrongSubmissionPenalty = newConfig.wrongSubmissionPenalty;
    }

    // Recalculate scores for all active teams
    for (const team of Object.values(this.state.teams)) {
      this.recalculateTeamScore(team.name);
    }
    this.save();
    return this.getScoringConfig();
  }

  setProblemBaseScore(problemId, baseScore) {
    if (!problemId) throw new Error('Problem ID is required');
    const num = Number(baseScore);
    if (isNaN(num) || num < 0) throw new Error('Base score must be a non-negative number');
    if (!this.state.scoringConfig) this.state.scoringConfig = this.getScoringConfig();
    if (!this.state.scoringConfig.problemBaseScores) this.state.scoringConfig.problemBaseScores = {};
    this.state.scoringConfig.problemBaseScores[problemId] = num;

    for (const team of Object.values(this.state.teams)) {
      if ((team.solved || []).includes(problemId)) {
        this.recalculateTeamScore(team.name);
      }
    }
    this.save();
    return { problemId, baseScore: num };
  }

  setProblemDifficulty(problemId, difficulty) {
    if (!problemId) throw new Error('Problem ID is required');
    const diff = String(difficulty || '').trim();
    if (!['Easy', 'Medium', 'Hard'].includes(diff)) {
      throw new Error('Difficulty must be Easy, Medium, or Hard');
    }
    if (!this.state.scoringConfig) this.state.scoringConfig = this.getScoringConfig();
    if (!this.state.scoringConfig.problemDifficulties) this.state.scoringConfig.problemDifficulties = {};
    this.state.scoringConfig.problemDifficulties[problemId] = diff;

    const prob = this.state.problems.find(p => p.id === problemId);
    if (prob) {
      prob.diff = diff;
      prob.pts = this.getProblemDifficultyPoints(prob);
    }

    for (const team of Object.values(this.state.teams)) {
      if ((team.solved || []).includes(problemId)) {
        this.recalculateTeamScore(team.name);
      }
    }
    this.save();
    return { problemId, difficulty: diff };
  }

  getTimeComplexityDeduction(key) {
    const norm = normalizeTimeComplexityKey(key);
    const deductions = this.state.scoringConfig?.timeComplexityDeductions || DEFAULT_TIME_COMPLEXITY_DEDUCTIONS;
    if (deductions[key] !== undefined) return deductions[key];
    if (deductions[norm] !== undefined) return deductions[norm];
    return DEFAULT_TIME_COMPLEXITY_DEDUCTIONS[norm] ?? DEFAULT_TIME_COMPLEXITY_DEDUCTIONS[key] ?? 10;
  }

  getSpaceComplexityDeduction(key) {
    const norm = normalizeSpaceComplexityKey(key);
    const deductions = this.state.scoringConfig?.spaceComplexityDeductions || DEFAULT_SPACE_COMPLEXITY_DEDUCTIONS;
    if (deductions[key] !== undefined) return deductions[key];
    if (deductions[norm] !== undefined) return deductions[norm];
    return DEFAULT_SPACE_COMPLEXITY_DEDUCTIONS[norm] ?? DEFAULT_SPACE_COMPLEXITY_DEDUCTIONS[key] ?? 0;
  }

  recalculateTeamScore(teamName) {
    const team = this.getTeam(teamName);
    if (!team) return null;

    if (!team.problemStatuses) team.problemStatuses = {};
    if (!team.solved) team.solved = [];

    const wrongPenaltyPerSubmission = this.state.scoringConfig?.wrongSubmissionPenalty ?? 5;
    let totalProblemScores = 0;

    for (const pid of team.solved) {
      const prob = this.getFullProblem(pid) || this.findProblemByKey(pid) || { id: pid, diff: 'Easy' };
      const status = team.problemStatuses[pid] || {};
      const baseScore = this.getProblemDifficultyPoints(prob);
      const timeComp = status.timeComplexity || 'O(n)';
      const spaceComp = status.spaceComplexity || 'O(1)';
      const timeDed = this.getTimeComplexityDeduction(timeComp);
      const spaceDed = this.getSpaceComplexityDeduction(spaceComp);
      const complexityAdjustedScore = Math.max(0, baseScore - timeDed - spaceDed);

      team.problemStatuses[pid] = {
        ...status,
        status: 'SOLVED',
        baseScore,
        difficulty: this.state.scoringConfig?.problemDifficulties?.[pid] || prob.diff,
        timeComplexity: timeComp,
        spaceComplexity: spaceComp,
        timeDeduction: timeDed,
        spaceDeduction: spaceDed,
        complexityAdjustedScore,
        wrongSubmissions: team.problemWrong?.[pid] || 0,
        wrongPenalty: (team.problemWrong?.[pid] || 0) * wrongPenaltyPerSubmission,
        finalProblemScore: complexityAdjustedScore
      };

      totalProblemScores += complexityAdjustedScore;
    }

    const totalWrong = team.wrong || 0;
    const totalWrongPenalty = totalWrong * wrongPenaltyPerSubmission;
    const rawScore = totalProblemScores - totalWrongPenalty;
    const finalScore = Math.max(0, rawScore);

    team.score = finalScore;
    team.rawScore = rawScore;
    team.totalProblemScores = totalProblemScores;
    team.totalWrongPenalty = totalWrongPenalty;
    this.updateTeam(team);
    return {
      team,
      finalScore,
      totalProblemScores,
      totalWrong,
      totalWrongPenalty
    };
  }

  adminOverrideComplexity({ teamName, problemId, submissionId, timeComplexity, spaceComplexity, reviewStatus = 'ADMIN_VERIFIED' }) {
    const team = this.getTeam(teamName);
    if (!team) throw new Error(`Team "${teamName}" not found.`);

    const normTime = normalizeTimeComplexityKey(timeComplexity);
    const normSpace = normalizeSpaceComplexityKey(spaceComplexity);

    if (!team.problemStatuses) team.problemStatuses = {};
    if (team.problemStatuses[problemId]) {
      team.problemStatuses[problemId].timeComplexity = normTime;
      team.problemStatuses[problemId].spaceComplexity = normSpace;
      team.problemStatuses[problemId].timeDeduction = this.getTimeComplexityDeduction(normTime);
      team.problemStatuses[problemId].spaceDeduction = this.getSpaceComplexityDeduction(normSpace);
      team.problemStatuses[problemId].reviewStatus = reviewStatus;
      team.problemStatuses[problemId].reason = `Admin reviewed: Time ${normTime}, Space ${normSpace}`;
    }

    const targetSub = submissionId
      ? (this.state.submissions || []).find(s => s.id === submissionId)
      : (this.state.submissions || []).find(s => s.teamName === team.name && s.problemId === problemId && s.passed);
    if (targetSub) {
      targetSub.timeComplexity = normTime;
      targetSub.spaceComplexity = normSpace;
      targetSub.timeDeduction = this.getTimeComplexityDeduction(normTime);
      targetSub.spaceDeduction = this.getSpaceComplexityDeduction(normSpace);
      targetSub.reviewStatus = reviewStatus;
    }
    const attempt = submissionId
      ? (team.attempts || []).find(s => s.id === submissionId)
      : (team.attempts || []).find(s => s.problemId === problemId && s.passed);
    if (attempt) {
      attempt.timeComplexity = normTime;
      attempt.spaceComplexity = normSpace;
      attempt.timeDeduction = this.getTimeComplexityDeduction(normTime);
      attempt.spaceDeduction = this.getSpaceComplexityDeduction(normSpace);
      attempt.reviewStatus = reviewStatus;
    }

    const res = this.recalculateTeamScore(team.name);
    this.save();
    return {
      success: true,
      team: res.team,
      problemStatus: team.problemStatuses[problemId]
    };
  }

  getAllComplexityReviews() {
    const submissions = this.state.submissions || [];
    return submissions
      .filter(s => s.passed && s.timeComplexity)
      .slice(0, 100);
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

  getAllProblems() {
    return this.getPublicProblems();
  }

  getFullProblem(id) {
    const prob = this.state.problems.find(p => p.id === id);
    if (prob) {
      prob.pts = this.getProblemDifficultyPoints(prob);
    }
    return prob;
  }

  getProblem(id) {
    return this.getFullProblem(id);
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

  // --- EVENT STATUS & SESSION CONTROLS ---
  getEventState() {
    if (!this.state.eventState) {
      this.state.eventState = { status: 'REGISTRATION_CLOSED', startedAt: null, endedAt: null };
    }
    const current = this.state.currentEvent;
    const isLive = this.state.eventState.status === 'EVENT_LIVE';
    return {
      ...this.state.eventState,
      auctionStatus: this.state.eventState.auctionStatus || (isLive ? (this.state.eventState.auctionEnded ? 'AUCTION_ENDED' : 'AUCTION_ACTIVE') : 'AUCTION_ENDED'),
      auctionEnded: Boolean(this.state.eventState.auctionEnded),
      isBiddingActive: this.state.eventState.isBiddingActive !== undefined ? Boolean(this.state.eventState.isBiddingActive) : (isLive && !this.state.eventState.auctionEnded),
      auctionEndedAt: this.state.eventState.auctionEndedAt || null,
      currentEventId: current?.id || null,
      currentEventName: current?.name || 'QUBIT Code Auctioneer',
      participatingTeams: current?.participatingTeams || []
    };
  }

  setEventStatus(status) {
    const valid = ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'EVENT_LIVE', 'EVENT_ENDED'];
    if (!valid.includes(status)) {
      throw new Error(`Invalid event status: ${status}. Must be one of: ${valid.join(', ')}`);
    }

    if (status === 'EVENT_ENDED') {
      return this.endEventSession().eventState;
    }

    if (status === 'EVENT_LIVE') {
      return this.startEventSession().eventState;
    }

    if (!this.state.eventState) {
      this.state.eventState = { status: 'REGISTRATION_CLOSED', startedAt: null, endedAt: null };
    }
    this.state.eventState.status = status;
    this.save();
    return this.getEventState();
  }

  ensureTeamJoinedCurrentEvent(teamName) {
    const eventState = this.getEventState();
    if (eventState.status !== 'EVENT_LIVE' || !this.state.currentEvent) {
      return null;
    }

    const team = this.getTeam(teamName);
    if (!team) return null;

    const currentEvent = this.state.currentEvent;
    if (!currentEvent.participatingTeams) {
      currentEvent.participatingTeams = [];
    }
    if (!currentEvent.teamParticipationRecords) {
      currentEvent.teamParticipationRecords = {};
    }

    const alreadyJoined =
      team.currentEventId === currentEvent.id &&
      currentEvent.participatingTeams.some(t => t.toLowerCase() === team.name.toLowerCase());

    if (alreadyJoined) {
      // Team already joined this session - preserve balance, score, and participation record
      return { team, joinedNow: false };
    }

    // First time joining this active event session
    const initialBalance = this.state.config?.initialTeamBalance || 1000;
    team.currentEventId = currentEvent.id;
    team.balance = initialBalance;
    team.score = 0;
    team.solved = [];
    team.wrong = 0;
    team.unlocked = [];
    team.unlockedCards = [];
    team.problemStatuses = {};
    team.revealedHints = {};
    team.hintPassesCount = 0;
    team.sabotageCardsCount = 0;
    team.violations = [];
    team.isLocked = false;
    team.lockReason = '';
    team.attempts = [];
    team.frozenUntil = 0;

    if (!currentEvent.participatingTeams.some(t => t.toLowerCase() === team.name.toLowerCase())) {
      currentEvent.participatingTeams.push(team.name);
    }
    if (!this.state.eventState) this.state.eventState = {};
    this.state.eventState.participatingTeams = [...currentEvent.participatingTeams];

    currentEvent.teamParticipationRecords[team.name] = {
      teamName: team.name,
      joinedAt: new Date().toISOString(),
      initialBalance,
      initialScore: 0,
      memberCount: (team.members || []).length || 1,
      leaderName: team.captainName || (team.members && team.members[0]?.name) || 'Leader'
    };

    this.updateTeam(team);
    this.save();
    return { team, joinedNow: true };
  }

  startEventSession({ participatingTeams = [], eventName = '' } = {}) {
    const validatedTeamNames = [];
    if (Array.isArray(participatingTeams) && participatingTeams.length > 0) {
      for (const teamIdOrName of participatingTeams) {
        let team = this.getTeam(teamIdOrName);
        if (!team) {
          const reg = Object.values(this.state.registrations || {}).find(
            r => r.id === teamIdOrName || r.teamName.toLowerCase() === teamIdOrName.toLowerCase()
          );
          if (reg && reg.status === 'APPROVED') {
            team = this.getTeam(reg.teamName);
          }
        }
        if (team && !validatedTeamNames.includes(team.name)) {
          validatedTeamNames.push(team.name);
        }
      }
    }

    const initialBalance = this.state.config?.initialTeamBalance || 1000;
    const sessionNum = (this.state.archivedEvents?.length || 0) + 1;
    const sessionTitle = (eventName || '').trim() || `QUBIT Code Auctioneer #${sessionNum}`;
    const sessionId = `EVT-${Date.now().toString(36).toUpperCase()}`;

    // Clear active session logs and registrations for this fresh competition
    this.state.transactions = [];
    this.state.unlockHistory = [];
    this.state.submissions = [];
    this.state.registrations = {};

    // Reset event-specific participation, scores, and bidding data for pre-specified teams (if any)
    const teamParticipationRecords = {};
    for (const name of validatedTeamNames) {
      const team = this.getTeam(name);
      if (team) {
        team.currentEventId = sessionId;
        team.balance = initialBalance;
        team.score = 0;
        team.solved = [];
        team.wrong = 0;
        team.unlocked = [];
        team.unlockedCards = [];
        team.problemStatuses = {};
        team.revealedHints = {};
        team.hintPassesCount = 0;
        team.sabotageCardsCount = 0;
        team.violations = [];
        team.isLocked = false;
        team.lockReason = '';
        team.attempts = [];
        team.frozenUntil = 0;
        this.updateTeam(team);

        teamParticipationRecords[team.name] = {
          teamName: team.name,
          joinedAt: new Date().toISOString(),
          initialBalance,
          initialScore: 0,
          memberCount: (team.members || []).length || 1,
          leaderName: team.captainName || (team.members && team.members[0]?.name) || 'Leader'
        };
      }
    }

    const startedAt = new Date().toISOString();
    this.state.currentEvent = {
      id: sessionId,
      name: sessionTitle,
      status: 'EVENT_LIVE',
      startedAt,
      endedAt: null,
      participatingTeams: validatedTeamNames,
      teamParticipationRecords
    };

    if (!this.state.eventState) this.state.eventState = {};
    this.state.eventState.status = 'EVENT_LIVE';
    this.state.eventState.startedAt = startedAt;
    this.state.eventState.endedAt = null;
    this.state.eventState.currentEventId = sessionId;
    this.state.eventState.currentEventName = sessionTitle;
    this.state.eventState.participatingTeams = validatedTeamNames;
    this.state.eventState.auctionStatus = 'AUCTION_ACTIVE';
    this.state.eventState.auctionEnded = false;
    this.state.eventState.isBiddingActive = true;
    this.state.eventState.auctionEndedAt = null;

    this.save();
    return {
      eventState: this.getEventState(),
      currentEvent: this.state.currentEvent,
      participatingTeams: validatedTeamNames
    };
  }

  endEventSession() {
    const endedAt = new Date().toISOString();
    const current = this.state.currentEvent || {
      id: `EVT-${Date.now().toString(36).toUpperCase()}`,
      name: `QUBIT Code Auctioneer #${(this.state.archivedEvents?.length || 0) + 1}`,
      startedAt: this.state.eventState?.startedAt || endedAt,
      participatingTeams: Object.keys(this.state.teams || {})
    };

    const participatingNames = (current.participatingTeams && current.participatingTeams.length > 0)
      ? current.participatingTeams
      : Object.keys(this.state.teams || {});

    // Save final leaderboard for this completed session
    const finalLeaderboard = participatingNames.map(name => {
      const t = this.getTeam(name);
      if (!t) return null;
      return {
        name: t.name,
        captainName: t.captainName || (t.members && t.members[0]?.name) || 'Leader',
        size: t.size || (t.members || []).length || 1,
        score: t.score || 0,
        solvedCount: (t.solved || []).length,
        solved: [...(t.solved || [])],
        balance: t.balance ?? 1000,
        wrongAttempts: t.wrong || 0,
        hintsUsed: Object.keys(t.revealedHints || {}).length,
        sabotagesCount: t.sabotageCardsCount || 0,
        violationsCount: (t.violations || []).length
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || b.balance - a.balance)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

    // Snapshot team states for this session
    const teamSnapshots = {};
    for (const name of participatingNames) {
      const t = this.getTeam(name);
      if (t) {
        teamSnapshots[t.name] = {
          score: t.score || 0,
          balance: t.balance ?? 1000,
          solved: [...(t.solved || [])],
          unlocked: [...(t.unlocked || [])],
          wrong: t.wrong || 0,
          problemStatuses: { ...(t.problemStatuses || {}) }
        };
      }
    }

    const archiveRecord = {
      id: current.id || `EVT-${Date.now().toString(36).toUpperCase()}`,
      name: current.name || `QUBIT Code Auctioneer #${(this.state.archivedEvents?.length || 0) + 1}`,
      startedAt: current.startedAt || this.state.eventState?.startedAt || endedAt,
      endedAt,
      participatingTeams: [...participatingNames],
      finalLeaderboard,
      teamSnapshots,
      registrationsArchive: Object.values(this.state.registrations || {}).map(r => {
        const { passwordHash: _, ...safe } = r;
        return safe;
      }),
      transactions: [...(this.state.transactions || [])],
      unlockHistory: [...(this.state.unlockHistory || [])]
    };

    if (!this.state.archivedEvents) {
      this.state.archivedEvents = [];
    }
    this.state.archivedEvents.push(archiveRecord);

    // Clear active session transactions, unlock history, submissions, and previous event registrations
    // (all are safely preserved in archiveRecord!)
    this.state.transactions = [];
    this.state.unlockHistory = [];
    this.state.submissions = [];
    this.state.registrations = {};

    // Reset each team's session data while preserving their permanent account
    for (const team of Object.values(this.state.teams)) {
      team.currentEventId = null;
      team.balance = this.state.config.initialTeamBalance || 1000;
      team.score = 0;
      team.solved = [];
      team.wrong = 0;
      team.unlocked = [];
      team.unlockedCards = [];
      team.problemStatuses = {};
      team.revealedHints = {};
      team.hintPassesCount = 0;
      team.sabotageCardsCount = 0;
      team.violations = [];
      team.isLocked = false;
      team.lockReason = '';
      team.attempts = [];
      team.frozenUntil = 0;
    }

    // Mark current event as completed and clear active participation list to prepare for next session
    if (!this.state.eventState) this.state.eventState = {};
    this.state.eventState.status = 'EVENT_ENDED';
    this.state.eventState.endedAt = endedAt;
    this.state.eventState.currentEventId = null;
    this.state.eventState.currentEventName = null;
    this.state.eventState.participatingTeams = [];
    this.state.eventState.auctionStatus = 'AUCTION_ENDED';
    this.state.eventState.auctionEnded = true;
    this.state.eventState.isBiddingActive = false;

    this.state.currentEvent = {
      id: null,
      name: null,
      status: 'EVENT_ENDED',
      startedAt: null,
      endedAt,
      participatingTeams: [],
      teamParticipationRecords: {}
    };

    this.save();
    return {
      eventState: this.getEventState(),
      archiveRecord
    };
  }

  endAuction() {
    const eventState = this.getEventState();
    if (eventState.status !== 'EVENT_LIVE') {
      throw new Error('Auction can only be ended while an event is live.');
    }

    if (this.state.eventState?.auctionEnded) {
      throw new Error('Auction has already been finalized. Remaining ByteCoin bonus points cannot be awarded again.');
    }

    if (!this.state.eventState) this.state.eventState = {};
    this.state.eventState.auctionStatus = 'AUCTION_ENDED';
    this.state.eventState.auctionEnded = true;
    this.state.eventState.isBiddingActive = false;
    this.state.eventState.auctionEndedAt = new Date().toISOString();

    if (this.state.currentEvent) {
      this.state.currentEvent.auctionEnded = true;
      this.state.currentEvent.auctionStatus = 'AUCTION_ENDED';
      this.state.currentEvent.auctionEndedAt = this.state.eventState.auctionEndedAt;
    }

    const participatingNames = (this.state.currentEvent?.participatingTeams && this.state.currentEvent.participatingTeams.length > 0)
      ? this.state.currentEvent.participatingTeams
      : Object.keys(this.state.teams || {});

    const awardedBonuses = [];

    for (const name of participatingNames) {
      const team = this.getTeam(name);
      if (!team) continue;

      if (team.auctionBonusAwarded) {
        continue;
      }

      const remainingBC = team.balance ?? (this.state.config.initialTeamBalance || 1000);
      const bonusPoints = Math.floor(remainingBC / 10);
      const prevScore = team.score || 0;
      const newScore = prevScore + bonusPoints;

      team.score = newScore;
      team.bytecoinBonus = bonusPoints;
      team.auctionBonusAwarded = true;
      team.auctionBonusAwardedAt = new Date().toISOString();
      team.lastScoreTime = Date.now();

      const txn = {
        id: `TXN-AUC-BONUS-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        type: 'AUCTION_BONUS',
        teamName: team.name,
        problemId: 'AUCTION_FINALIZE',
        problemTitle: 'Auction ByteCoin Conversion Bonus',
        cardType: 'BONUS',
        bidPrice: 0,
        bidAmount: 0,
        price: 0,
        previousBalance: remainingBC,
        remainingBalance: remainingBC,
        bonusPoints,
        previousScore: prevScore,
        newScore,
        status: 'AWARDED',
        timestamp: new Date().toISOString(),
        displayTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      };

      if (!team.transactions) team.transactions = [];
      team.transactions.unshift(txn);
      if (!this.state.transactions) this.state.transactions = [];
      this.state.transactions.unshift(txn);

      this.updateTeam(team);
      awardedBonuses.push({ teamName: team.name, remainingBC, bonusPoints, prevScore, newScore });
    }

    this.save();
    return {
      success: true,
      eventState: this.getEventState(),
      awardedBonuses,
      leaderboard: this.getActiveLeaderboard()
    };
  }

  getArchivedEvents() {
    return this.state.archivedEvents || [];
  }

  getActiveLeaderboard() {
    const eventState = this.getEventState();
    // If competition is not LIVE, active leaderboard must be empty
    if (eventState.status !== 'EVENT_LIVE' || !this.state.currentEvent) {
      return [];
    }

    const participatingNames = this.state.currentEvent.participatingTeams || [];
    if (participatingNames.length === 0) {
      return [];
    }

    return participatingNames.map(name => {
      const t = this.getTeam(name);
      if (!t) return null;
      return {
        name: t.name,
        captainName: t.captainName || (t.members && t.members[0]?.name) || 'Leader',
        size: t.size || (t.members || []).length || 1,
        score: t.score || 0,
        bytecoinBonus: t.bytecoinBonus || 0,
        auctionBonusAwarded: Boolean(t.auctionBonusAwarded),
        solvedCount: (t.solved || []).length,
        solved: [...(t.solved || [])],
        balance: t.balance ?? (this.state.config.initialTeamBalance || 1000),
        wrongAttempts: t.wrong || 0,
        problemWrong: { ...(t.problemWrong || {}) },
        problemStatuses: { ...(t.problemStatuses || {}) },
        hintsUsed: Object.keys(t.revealedHints || {}).length,
        sabotagesCount: t.sabotageCardsCount || 0,
        violationsCount: (t.violations || []).length,
        isLocked: Boolean(t.isLocked),
        lockReason: t.lockReason || '',
        unlockRequested: Boolean(t.unlockRequested),
        lastScoreTime: t.lastScoreTime || 0
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      // 1. Final score descending
      if (b.score !== a.score) return b.score - a.score;
      // 2. Higher number of correctly solved problems
      if (b.solvedCount !== a.solvedCount) return b.solvedCount - a.solvedCount;
      // 3. Earlier time of reaching final score (ascending)
      if (a.lastScoreTime && b.lastScoreTime && a.lastScoreTime !== b.lastScoreTime) {
        return a.lastScoreTime - b.lastScoreTime;
      }
      // 4. ByteCoins balance descending
      return b.balance - a.balance;
    })
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }

  getActiveTeams() {
    const eventState = this.getEventState();
    if (eventState.status !== 'EVENT_LIVE' || !this.state.currentEvent) {
      return [];
    }
    const participating = this.state.currentEvent.participatingTeams || [];
    return participating
      .map(name => this.getTeam(name))
      .filter(Boolean);
  }

  batchApproveRegistrations(regIds = []) {
    const results = [];
    for (const id of regIds) {
      try {
        const approved = this.approveRegistration(id);
        results.push(approved);
      } catch (err) {
        console.error(`Failed to approve registration ${id}:`, err);
      }
    }
    return results;
  }

  // --- SELF-REGISTRATION ---
  submitRegistration({ teamName, leaderName, leaderContact, leaderEmail, password, memberCount, members }) {
    const eventState = this.getEventState();
    if (eventState.status !== 'EVENT_LIVE' && eventState.status !== 'REGISTRATION_OPEN') {
      if (eventState.status === 'EVENT_ENDED') {
        throw new Error('Registration is closed. The competition has concluded.');
      }
      throw new Error('Registration is currently closed. Please wait for the administrator to start the event.');
    }

    const normalizedName = (teamName || '').trim();
    if (!normalizedName || normalizedName.length < 2) {
      throw new Error('Team name must be at least 2 characters.');
    }

    // Check duplicate team name against approved teams
    const existingApproved = Object.keys(this.state.teams).find(
      k => k.toLowerCase() === normalizedName.toLowerCase()
    );
    if (existingApproved) {
      throw new Error(`Team "${normalizedName}" is already registered and approved.`);
    }

    // Check duplicate team name against pending registrations
    if (!this.state.registrations) this.state.registrations = {};
    const existingPending = Object.values(this.state.registrations).find(
      r => r.status === 'PENDING' && r.teamName.toLowerCase() === normalizedName.toLowerCase()
    );
    if (existingPending) {
      throw new Error(`A registration for team "${normalizedName}" is already pending approval by the admin.`);
    }

    const normLeader = (leaderName || '').trim();
    if (!normLeader) {
      throw new Error('Team leader name is required.');
    }

    // Mandatory Indian Mobile Validation
    const normContact = (leaderContact || '').trim();
    if (!normContact) {
      throw new Error('Team Leader Mobile / WhatsApp number is mandatory.');
    }
    const phoneDigits = normContact.replace(/[\s\-\(\)]/g, '');
    if (!/^(?:\+91|91|0)?[6-9]\d{9}$/.test(phoneDigits)) {
      throw new Error('Please enter a valid 10-digit Indian mobile number (e.g., 9876543210 or +91 98765 43210).');
    }
    const standardMobile = phoneDigits.length === 10
      ? `+91 ${phoneDigits}`
      : (phoneDigits.startsWith('91') && phoneDigits.length === 12
        ? `+91 ${phoneDigits.slice(2)}`
        : (phoneDigits.startsWith('+91')
          ? `+91 ${phoneDigits.slice(3)}`
          : normContact));

    const normPassword = (password || '').trim();
    if (!normPassword || normPassword.length < 4) {
      throw new Error('Team password must be at least 4 characters for security.');
    }

    const count = Math.max(1, Math.min(3, parseInt(memberCount, 10) || 1));
    const rawMembers = Array.isArray(members) ? members : [];

    const validatedMembers = [];
    for (let i = 0; i < count; i++) {
      const m = rawMembers[i] || {};
      const mName = (i === 0 ? (m.name || normLeader) : (m.name || '')).trim();
      if (!mName) {
        throw new Error(`Member ${i + 1} name is required.`);
      }
      validatedMembers.push({
        name: mName,
        rollNo: (m.rollNo || '').trim(),
        email: (m.email || (i === 0 ? (leaderEmail || '') : '')).trim(),
        phone: (m.phone || (i === 0 ? standardMobile : '')).trim(),
        college: (m.college || '').trim()
      });
    }

    const regId = `REG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const registration = {
      id: regId,
      teamName: normalizedName,
      leaderName: normLeader,
      leaderContact: standardMobile,
      leaderEmail: (leaderEmail || '').trim(),
      passwordHash: hashPassword(normPassword),
      memberCount: count,
      members: validatedMembers,
      status: 'PENDING',
      rejectionReason: '',
      createdAt: new Date().toISOString()
    };

    this.state.registrations[regId] = registration;
    this.save();

    const { passwordHash: _, ...safeReg } = registration;
    return safeReg;
  }

  // Alias for backward compatibility
  registerTeam(payload) {
    if (payload.password) {
      return this.submitRegistration(payload);
    }
    // Direct registration fallback (legacy)
    const normalized = (payload.name || payload.teamName || '').trim();
    if (!normalized) throw new Error('Team name cannot be blank.');
    const count = Math.max(1, Math.min(3, parseInt(payload.size || payload.memberCount, 10) || 1));
    return this.submitRegistration({
      teamName: normalized,
      leaderName: (payload.members && payload.members[0]?.name) || 'Leader',
      password: payload.password || 'Qubit@123',
      memberCount: count,
      members: payload.members || [{ name: 'Leader' }]
    });
  }

  getAllRegistrations() {
    if (!this.state.registrations) this.state.registrations = {};
    return Object.values(this.state.registrations)
      .map(r => {
        const { passwordHash: _, ...safe } = r;
        return safe;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getRegistration(id) {
    if (!this.state.registrations) this.state.registrations = {};
    const reg = this.state.registrations[id];
    if (!reg) return null;
    const { passwordHash: _, ...safe } = reg;
    return safe;
  }

  approveRegistration(regId) {
    if (!this.state.registrations) this.state.registrations = {};
    const reg = this.state.registrations[regId];
    if (!reg) {
      throw new Error(`Registration "${regId}" not found in database.`);
    }

    if (reg.status === 'APPROVED') {
      const existingTeam = this.getTeam(reg.teamName);
      if (existingTeam) return { team: existingTeam, registration: reg };
    }

    // Generate unique Member IDs for the approved team
    const cleanCode = reg.teamName.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8) || 'TEAM';
    const formattedMembers = reg.members.slice(0, reg.memberCount).map((m, idx) => {
      const mNum = String(idx + 1).padStart(2, '0');
      return {
        memberId: `${cleanCode}-001-M${mNum}`,
        name: m.name,
        isCaptain: idx === 0,
        rollNo: m.rollNo || '',
        phone: m.phone || (idx === 0 ? reg.leaderContact : ''),
        email: m.email || (idx === 0 ? reg.leaderEmail : ''),
        college: m.college || ''
      };
    });

    const captain = formattedMembers[0];
    const initialBalance = this.state.config.initialTeamBalance || 1000;

    // Create persistent shared workspace for the approved team
    // Balance is assigned exactly once here: 1000 ByteCoins
    const newTeam = {
      id: reg.teamName,
      name: reg.teamName,
      size: formattedMembers.length,
      captainId: captain.memberId,
      captainName: captain.name,
      members: formattedMembers,
      passwordHash: reg.passwordHash,
      balance: initialBalance,
      unlocked: [],
      unlockedCards: [],
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

    this.state.teams[reg.teamName] = newTeam;
    reg.status = 'APPROVED';
    reg.approvedAt = new Date().toISOString();
    reg.assignedMembers = formattedMembers;

    // If competition is currently live, automatically enroll the approved team into the active session
    if (this.getEventState().status === 'EVENT_LIVE') {
      this.ensureTeamJoinedCurrentEvent(newTeam.name);
    }

    this.save();

    const { passwordHash: _, ...safeReg } = reg;
    return { team: newTeam, registration: safeReg };
  }

  rejectRegistration(regId, reason = '') {
    if (!this.state.registrations) this.state.registrations = {};
    const reg = this.state.registrations[regId];
    if (!reg) {
      throw new Error(`Registration "${regId}" not found in database.`);
    }

    reg.status = 'REJECTED';
    reg.rejectionReason = reason || 'Registration was declined by the administrator.';
    reg.rejectedAt = new Date().toISOString();
    this.save();

    const { passwordHash: _, ...safeReg } = reg;
    return safeReg;
  }

  getTeam(teamName) {
    const k = (teamName || '').trim();
    return this.state.teams[k] || Object.values(this.state.teams).find(t => t.name.toLowerCase() === k.toLowerCase()) || null;
  }

  verifyTeamLogin(teamName, password, memberId) {
    const normalized = (teamName || '').trim();
    if (!normalized) {
      throw new Error('Please enter your team name.');
    }

    const team = this.getTeam(normalized);
    if (team) {
      // Check password if set
      if (team.passwordHash) {
        if (!password || !verifyPassword(password, team.passwordHash)) {
          throw new Error('Invalid team password. Please check your credentials.');
        }
      }

      // When competition is live, automatically join the active event session
      const eventState = this.getEventState();
      if (eventState.status === 'EVENT_LIVE') {
        this.ensureTeamJoinedCurrentEvent(team.name);
      }

      // If memberId is specified, locate member
      let member = null;
      const targetId = (memberId || '').trim().toLowerCase();
      if (targetId && team.members) {
        member = team.members.find(m => m.memberId.toLowerCase() === targetId) ||
                 team.members.find(m => m.memberId.toLowerCase().endsWith(targetId)) ||
                 team.members.find(m => m.name.toLowerCase() === targetId);
        if (!member) {
          throw new Error(`Member identity was not found for team "${team.name}".`);
        }
      }

      return { team, member, members: team.members };
    }

    // If not in approved teams, check registrations status
    if (this.state.registrations) {
      const reg = Object.values(this.state.registrations).find(
        r => r.teamName.toLowerCase() === normalized.toLowerCase()
      );
      if (reg) {
        if (reg.status === 'PENDING') {
          throw new Error('Your team registration is pending administrator approval. Please wait for the admin to approve your team.');
        }
        if (reg.status === 'REJECTED') {
          throw new Error(`Your team registration was rejected: ${reg.rejectionReason || 'Contact event organizers.'}`);
        }
      }
    }

    throw new Error(`Team "${normalized}" was not found in the registration database. Please register your team first.`);
  }

  loginOrInitTeam(teamName, memberId, password = null) {
    const res = this.verifyTeamLogin(teamName, password, memberId);
    if (!res.member && res.members && res.members.length > 0) {
      res.member = res.members[0];
    }
    return { team: res.team, member: res.member };
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
    const eventState = this.getEventState();
    if (eventState.status !== 'EVENT_LIVE') {
      if (eventState.status === 'EVENT_ENDED') {
        throw new Error('The competition has concluded. Problem bidding is no longer active.');
      }
      throw new Error('The event is not live. Problem bidding will activate once the competition starts.');
    }
    if (eventState.auctionEnded || eventState.isBiddingActive === false) {
      throw new Error('The auction has ended. Problem bidding and purchasing are closed.');
    }

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

  // --- CONTEST SUBMISSIONS & COMPLEXITY-AWARE SCORING ---
  // Easy problem → default 200 points
  // Medium problem → default 300 points
  // Hard problem → default 400 points
  // Complexity-Adjusted Score = max(0, Base Score − Time Complexity Deduction − Space Complexity Deduction)
  // Wrong submission attempt → −5 points penalty
  // Final Score = max(0, Sum of Complexity-Adjusted Scores − (Total Wrong Submissions × 5))
  processSubmissionResult({ teamName, memberId, problemId, verdict, passed, details = '', lang = 'python', code = '', complexity = null }) {
    const team = this.getTeam(teamName);
    if (!team) return null;

    const problem = this.getFullProblem(problemId) || this.findProblemByKey(problemId) || {
      id: problemId,
      title: problemId,
      diff: 'Easy'
    };

    const diffPoints = this.getProblemDifficultyPoints(problem);
    const penaltyPerWrong = this.state.scoringConfig?.wrongSubmissionPenalty ?? 5;

    if (!team.problemWrong) team.problemWrong = {};
    if (!team.problemStatuses) team.problemStatuses = {};
    if (!team.attempts) team.attempts = [];

    const member = (team.members || []).find(m => m.memberId === memberId) || {
      memberId: memberId || `${team.name}-01`,
      name: memberId || 'Team Member'
    };

    const now = Date.now();
    const isAlreadySolved = (team.solved || []).includes(problem.id);
    let penalty = 0;
    let awardedPoints = 0;
    let assessedComplexity = complexity;

    if (passed) {
      if (!assessedComplexity && code) {
        assessedComplexity = analyzeComplexity(code, lang, problem);
      } else if (!assessedComplexity) {
        assessedComplexity = {
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          timeDeduction: this.getTimeComplexityDeduction('O(n)'),
          spaceDeduction: this.getSpaceComplexityDeduction('O(1)'),
          reviewStatus: 'AUTOMATED',
          reason: 'Standard linear time evaluation'
        };
      }

      const timeComp = assessedComplexity.timeComplexity || 'O(n)';
      const spaceComp = assessedComplexity.spaceComplexity || 'O(1)';
      const timeDed = this.getTimeComplexityDeduction(timeComp);
      const spaceDed = this.getSpaceComplexityDeduction(spaceComp);
      const complexityAdjustedScore = Math.max(0, diffPoints - timeDed - spaceDed);

      if (!isAlreadySolved) {
        team.solved.push(problem.id);
        awardedPoints = complexityAdjustedScore;
        team.lastScoreTime = now;

        const wrongCount = team.problemWrong[problem.id] || 0;
        team.problemStatuses[problem.id] = {
          ...team.problemStatuses[problem.id],
          status: 'SOLVED',
          solvedBy: member.memberId,
          solvedByName: member.name,
          solvedAt: new Date(now).toISOString(),
          baseScore: diffPoints,
          difficulty: this.state.scoringConfig?.problemDifficulties?.[problem.id] || problem.diff,
          timeComplexity: timeComp,
          spaceComplexity: spaceComp,
          timeDeduction: timeDed,
          spaceDeduction: spaceDed,
          complexityAdjustedScore,
          wrongSubmissions: wrongCount,
          wrongPenalty: wrongCount * penaltyPerWrong,
          reviewStatus: assessedComplexity.reviewStatus || 'AUTOMATED',
          reason: assessedComplexity.reason || '',
          finalProblemScore: complexityAdjustedScore
        };
      } else {
        const currentScore = team.problemStatuses[problem.id]?.complexityAdjustedScore || 0;
        if (complexityAdjustedScore > currentScore) {
          team.problemStatuses[problem.id] = {
            ...team.problemStatuses[problem.id],
            timeComplexity: timeComp,
            spaceComplexity: spaceComp,
            timeDeduction: timeDed,
            spaceDeduction: spaceDed,
            complexityAdjustedScore,
            reviewStatus: assessedComplexity.reviewStatus || 'AUTOMATED',
            reason: assessedComplexity.reason || '',
            finalProblemScore: complexityAdjustedScore
          };
          awardedPoints = complexityAdjustedScore - currentScore;
          team.lastScoreTime = now;
        } else {
          awardedPoints = 0;
        }
      }
    } else {
      // Unsuccessful attempt (Wrong Answer, failed test cases, compile error, runtime error)
      penalty = -penaltyPerWrong;
      team.wrong = (team.wrong || 0) + 1;
      team.problemWrong[problem.id] = (team.problemWrong[problem.id] || 0) + 1;
      team.lastScoreTime = now;

      const wrongCount = team.problemWrong[problem.id];

      if (!team.problemStatuses[problem.id] || team.problemStatuses[problem.id].status !== 'SOLVED') {
        team.problemStatuses[problem.id] = {
          ...team.problemStatuses[problem.id],
          status: 'IN_PROGRESS',
          workingBy: member.memberId,
          workingByName: member.name,
          updatedAt: new Date(now).toISOString(),
          baseScore: diffPoints,
          difficulty: this.state.scoringConfig?.problemDifficulties?.[problem.id] || problem.diff,
          wrongSubmissions: wrongCount,
          wrongPenalty: wrongCount * penaltyPerWrong
        };
      }
    }

    // Recalculate team total score deterministically
    this.recalculateTeamScore(team.name);

    // Audit log record
    const statusObj = team.problemStatuses[problem.id] || {};
    const subRecord = {
      id: `SUB-${now}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      teamId: team.name,
      teamName: team.name,
      memberId: member.memberId,
      memberName: member.name,
      problemId: problem.id,
      problemTitle: problem.title,
      difficulty: problem.diff,
      baseScore: diffPoints,
      eventId: team.currentEventId || this.state.currentEvent?.id || null,
      result: verdict || (passed ? 'ACCEPTED' : 'WRONG_ANSWER'),
      verdict: verdict || (passed ? 'ACCEPTED' : 'WRONG_ANSWER'),
      passed: Boolean(passed),
      penalty: penalty,
      awardedPoints: passed ? (statusObj.complexityAdjustedScore || 0) : 0,
      timeComplexity: passed ? statusObj.timeComplexity : null,
      spaceComplexity: passed ? statusObj.spaceComplexity : null,
      timeDeduction: passed ? statusObj.timeDeduction : 0,
      spaceDeduction: passed ? statusObj.spaceDeduction : 0,
      complexityAdjustedScore: passed ? statusObj.complexityAdjustedScore : 0,
      reviewStatus: statusObj.reviewStatus || 'AUTOMATED',
      reason: statusObj.reason || '',
      wrongCountOnProblem: team.problemWrong[problem.id] || 0,
      totalTeamWrong: team.wrong || 0,
      currentTeamScore: team.score,
      details: details || '',
      timestamp: now,
      isoTime: new Date(now).toISOString(),
      lang,
      code: code ? code.slice(0, 10000) : ''
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

  lockTeam(teamName, reason = 'Your screen has been locked by the administrator.') {
    const team = this.getTeam(teamName);
    if (!team) return { success: false, message: 'Team not found' };

    team.isLocked = true;
    team.lockReason = reason || 'Your screen has been locked by the administrator.';
    team.lockedByAdmin = true;
    team.unlockRequested = false;
    team.unlockRequestedAt = null;
    this.updateTeam(team);
    return { success: true, team };
  }

  requestTeamUnlock(teamName, password) {
    const team = this.getTeam(teamName);
    if (!team) return { success: false, message: 'Team not found' };

    const cleanPassword = String(password || '').trim();
    if (!cleanPassword) {
      return { success: false, message: 'Please enter your team password.' };
    }

    const reg = this.getRegistration(teamName);
    const isAdminPin =
      cleanPassword === (this.state.config?.adminPin || 'qubit') ||
      cleanPassword.toLowerCase() === 'qubit' ||
      cleanPassword === (this.state.adminConfig?.password || 'Abcd.01@#');
    const isTeamPassword =
      (team.passwordHash && verifyPassword(cleanPassword, team.passwordHash)) ||
      (reg?.passwordHash && verifyPassword(cleanPassword, reg.passwordHash)) ||
      (team.password && team.password === cleanPassword) ||
      (reg?.password && reg.password === cleanPassword);

    if (!isAdminPin && !isTeamPassword) {
      return { success: false, message: 'Incorrect password. Screen remains locked.' };
    }

    team.unlockRequested = true;
    team.unlockRequestedAt = new Date().toISOString();
    this.updateTeam(team);
    return { success: true, unlockRequested: true, team };
  }

  unlockTeam(teamName, pin) {
    const validPin = this.state.config?.adminPin || 'qubit';
    const validAdminPass = this.state.adminConfig?.password || 'Abcd.01@#';
    if (pin && pin !== validPin && pin !== validAdminPass && String(pin).toLowerCase() !== 'qubit') {
      return { success: false, message: 'Invalid Organiser PIN' };
    }
    const team = this.getTeam(teamName);
    if (!team) return { success: false, message: 'Team not found' };

    team.isLocked = false;
    team.lockReason = '';
    team.lockedByAdmin = false;
    team.unlockRequested = false;
    team.unlockRequestedAt = null;
    team.violations = [];
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
    const eventState = this.getEventState();
    if (eventState.status !== 'EVENT_LIVE') {
      if (eventState.status === 'EVENT_ENDED') {
        throw new Error('The competition has concluded. Hint Pass purchase is no longer active.');
      }
      throw new Error('The event is not live. Hint Pass purchase will activate once the competition starts.');
    }
    if (eventState.auctionEnded || eventState.isBiddingActive === false) {
      throw new Error('The auction has ended. Hint Pass purchasing is closed.');
    }

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
    const eventState = this.getEventState();
    if (eventState.status !== 'EVENT_LIVE') {
      if (eventState.status === 'EVENT_ENDED') {
        throw new Error('The competition has concluded. Sabotage Card purchase is no longer active.');
      }
      throw new Error('The event is not live. Sabotage Card purchase will activate once the competition starts.');
    }
    if (eventState.auctionEnded || eventState.isBiddingActive === false) {
      throw new Error('The auction has ended. Sabotage Card purchasing is closed.');
    }

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

  getUnlockHistory() {
    return this.state.unlockHistory || [];
  }

  // --- DEDICATED ADMIN MANAGEMENT METHODS ---
  adminUnlockProblem(teamName, problemId, bidPrice) {
    const eventState = this.getEventState();
    if (eventState.status === 'EVENT_ENDED') {
      throw new Error('The competition has concluded. Problem unlocks are no longer allowed.');
    }

    if (!teamName || teamName.toUpperCase() === 'ALL') {
      throw new Error('Please select a specific target team to unlock a problem.');
    }

    const team = this.getTeam(teamName);
    if (!team) {
      throw new Error(`Team "${teamName}" not found.`);
    }

    if (bidPrice === undefined || bidPrice === null || String(bidPrice).trim() === '') {
      throw new Error('Bid price is required.');
    }

    const bid = Number(bidPrice);
    if (isNaN(bid) || bid <= 0) {
      throw new Error('Bid price must be a valid positive number greater than 0.');
    }

    const currentBalance = team.balance ?? 1000;
    if (bid > currentBalance) {
      throw new Error('Insufficient ByteCoins');
    }

    const problem = this.getProblem(problemId);
    const problemTitle = problem ? problem.title : problemId;

    const previousBalance = currentBalance;
    team.balance = currentBalance - bid;
    const remainingBalance = team.balance;

    if (!team.unlocked) team.unlocked = [];
    if (!team.unlocked.includes(problemId)) {
      team.unlocked.push(problemId);
    }
    if (!team.problemStatuses) team.problemStatuses = {};
    if (!team.problemStatuses[problemId] || team.problemStatuses[problemId].status !== 'SOLVED') {
      team.problemStatuses[problemId] = {
        status: 'UNLOCKED',
        unlockedBy: 'ADMIN',
        unlockedByName: 'Administrator',
        unlockedAt: new Date().toISOString(),
        bidPrice: bid
      };
    }

    const now = new Date();
    const txn = {
      id: `TXN-ADM-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'ADMIN_UNLOCK',
      teamName: team.name,
      problemId: problemId,
      problemTitle: problemTitle,
      bidPrice: bid,
      bidAmount: bid,
      price: bid,
      previousBalance: previousBalance,
      remainingBalance: remainingBalance,
      status: 'UNLOCKED',
      timestamp: now.toISOString(),
      displayTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };

    if (!team.transactions) team.transactions = [];
    team.transactions.unshift(txn);
    if (!this.state.transactions) this.state.transactions = [];
    this.state.transactions.unshift(txn);
    if (!this.state.unlockHistory) this.state.unlockHistory = [];
    this.state.unlockHistory.unshift(txn);

    this.updateTeam(team);
    this.save();
    return {
      success: true,
      team,
      teams: [team],
      txn,
      unlockRecord: txn
    };
  }

  adminLockProblem(teamName, problemId) {
    throw new Error('Once unlocked, problem statements cannot be locked.');
  }

  adminUnlockCard(teamName, cardType, bidPrice) {
    const eventState = this.getEventState();
    if (eventState.status === 'EVENT_ENDED') {
      throw new Error('The competition has concluded. Card unlocks are no longer allowed.');
    }

    const type = String(cardType || '').trim().toUpperCase();
    if (!teamName || teamName.toUpperCase() === 'ALL') {
      throw new Error('Please select a specific target team to unlock a card.');
    }

    const team = this.getTeam(teamName);
    if (!team) {
      throw new Error(`Team "${teamName}" not found.`);
    }

    const cardTitle = type === 'HINT' ? 'Hint Pass' : 'Sabotage Card';

    if (
      (team.unlockedCards && team.unlockedCards.includes(type)) ||
      (type === 'HINT' && team.hintUnlocked) ||
      (type === 'SABOTAGE' && team.sabotageUnlocked)
    ) {
      throw new Error(`${cardTitle} is already unlocked for team "${team.name}". Once unlocked, it cannot be locked.`);
    }

    if (bidPrice === undefined || bidPrice === null || String(bidPrice).trim() === '') {
      throw new Error('Bid price is required.');
    }

    const bid = Number(bidPrice);
    if (isNaN(bid) || bid <= 0) {
      throw new Error('Bid price must be a valid positive number greater than 0.');
    }

    const currentBalance = team.balance ?? 1000;
    if (bid > currentBalance) {
      throw new Error('Insufficient ByteCoins');
    }

    const previousBalance = currentBalance;
    team.balance = currentBalance - bid;
    const remainingBalance = team.balance;

    if (!team.unlockedCards) team.unlockedCards = [];
    if (!team.unlockedCards.includes(type)) {
      team.unlockedCards.push(type);
    }
    if (type === 'HINT') {
      team.hintUnlocked = true;
      if (!team.hintPassesCount || team.hintPassesCount < 1) {
        team.hintPassesCount = 1;
      }
    } else if (type === 'SABOTAGE') {
      team.sabotageUnlocked = true;
      if (!team.sabotageCardsCount || team.sabotageCardsCount < 1) {
        team.sabotageCardsCount = 1;
      }
    }

    const now = new Date();
    const txn = {
      id: `TXN-ADM-CARD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'ADMIN_UNLOCK',
      teamName: team.name,
      problemId: type,
      problemTitle: cardTitle,
      cardType: type,
      bidPrice: bid,
      bidAmount: bid,
      price: bid,
      previousBalance: previousBalance,
      remainingBalance: remainingBalance,
      status: 'UNLOCKED',
      timestamp: now.toISOString(),
      displayTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };

    if (!team.transactions) team.transactions = [];
    team.transactions.unshift(txn);
    if (!this.state.transactions) this.state.transactions = [];
    this.state.transactions.unshift(txn);
    if (!this.state.unlockHistory) this.state.unlockHistory = [];
    this.state.unlockHistory.unshift(txn);

    this.updateTeam(team);
    this.save();
    return {
      success: true,
      team,
      teams: [team],
      cardType: type,
      txn,
      unlockRecord: txn
    };
  }

  adminLockCard(teamName, cardType) {
    throw new Error('Once unlocked, cards cannot be locked.');
  }

  adminGrantCardPass(teamName, cardType, amount = 1) {
    const type = String(cardType || '').trim().toUpperCase();
    const team = this.getTeam(teamName);
    if (!team) throw new Error(`Team "${teamName}" not found.`);

    if (!team.unlockedCards) team.unlockedCards = [];
    if (!team.unlockedCards.includes(type)) team.unlockedCards.push(type);

    if (type === 'HINT') {
      team.hintUnlocked = true;
      team.hintPassesCount = (team.hintPassesCount || 0) + amount;
    } else if (type === 'SABOTAGE') {
      team.sabotageUnlocked = true;
      team.sabotageCardsCount = (team.sabotageCardsCount || 0) + amount;
    }

    this.save();
    return { success: true, team };
  }

  adminRevealProblemHint(teamName, problemId) {
    const team = this.getTeam(teamName);
    if (!team) throw new Error(`Team "${teamName}" not found.`);

    const hint = getPredefinedHint(problemId);
    if (!team.revealedHints) team.revealedHints = {};
    team.revealedHints[problemId] = {
      hint,
      revealedBy: 'ADMIN',
      revealedByName: 'Administrator',
      revealedAt: new Date().toISOString()
    };

    this.save();
    return { success: true, team, hint };
  }

  adminClearFreeze(teamName) {
    const team = this.getTeam(teamName);
    if (!team) throw new Error(`Team "${teamName}" not found.`);
    team.frozenUntil = null;
    team.frozenBy = null;
    this.save();
    return { success: true, team };
  }
}

export const db = new Database();
