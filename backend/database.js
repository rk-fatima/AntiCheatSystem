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

const DEFAULT_PROBLEMS = [];

class Database {
  constructor() {
    this.state = {
      problems: [],
      teams: {},
      submissions: [],
      telemetry: [],
      config: {
        adminPin: "qubit",
        maxFlags: 3,
        executionTimeoutMs: 3000
      }
    };
    this.load();
    this.seedProblems();
  }

  load() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        this.state = JSON.parse(raw);
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
          for (const prob of DEFAULT_PROBLEMS) {
            if (!problemMap.has(prob.id)) {
              problemMap.set(prob.id, prob);
            }
          }
          this.state.problems = Array.from(problemMap.values());
          this.save();
          return;
        }
      }
    } catch (e) {
      console.error('Problem seed error:', e);
    }

    if (this.state.problems.length === 0) {
      this.state.problems = [...DEFAULT_PROBLEMS];
      this.save();
    }
  }

  // --- PROBLEM ACCESS (Strict Security: Hide hidden tests from clients) ---
  getPublicProblems() {
    if (!this.state.problems || this.state.problems.length < 20) {
      this.seedProblems();
    }
    return this.state.problems.map(p => ({
      id: p.id,
      title: p.title,
      diff: p.diff,
      pts: p.pts,
      cat: p.cat,
      desc: p.desc,
      con: p.con,
      si: p.si,
      so: p.so
      // NEVER return 'ht' (hidden tests), 'eo' (expected full output), or 'key' to participants!
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

  // --- TEAM & SESSION MANAGEMENT ---
  getOrCreateTeam(teamName) {
    const normalized = (teamName || '').trim();
    if (!normalized) return null;

    if (!this.state.teams[normalized]) {
      this.state.teams[normalized] = {
        name: normalized,
        balance: 1000,
        unlocked: [],
        solved: [],
        score: 0,
        wrong: 0,
        violations: [],
        isLocked: false,
        lockReason: "",
        attempts: [],
        createdAt: new Date().toISOString()
      };
      this.save();
    }
    return this.state.teams[normalized];
  }

  getTeam(teamName) {
    return this.state.teams[(teamName || '').trim()] || null;
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

  // --- TELEMETRY & AUDIT LOGS ---
  addTelemetry(teamName, event, details) {
    const team = this.getOrCreateTeam(teamName);
    const entry = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      teamName,
      event,
      details,
      timestamp: Date.now(),
      isoTime: new Date().toISOString()
    };

    this.state.telemetry.unshift(entry);
    // Keep max 2000 telemetry entries in memory
    if (this.state.telemetry.length > 2000) {
      this.state.telemetry.pop();
    }

    if (team) {
      team.violations.push(entry);
      // Auto lock if violations exceed max threshold
      if (team.violations.length >= this.state.config.maxFlags) {
        team.isLocked = true;
        team.lockReason = `Flag threshold exceeded (${team.violations.length} violations detected). Organiser review required.`;
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

    team.balance = 1000;
    team.unlocked = [];
    team.solved = [];
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
}

export const db = new Database();
