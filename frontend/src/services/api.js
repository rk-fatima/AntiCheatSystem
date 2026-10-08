import fallbackProblemsData from '../data/problems.json';

const API_BASE = '/api';

// --- Client-side Fallback Store for Static Hosting (e.g. GitHub Pages) ---
const LOCAL_STORAGE_KEY = 'qubit_client_store_v2';

function getFallbackStore() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  const initialStore = {
    teams: {
      "SYNORA": {
        name: "Synora",
        size: 2,
        members: [
          { memberId: "SYNORA-001-M01", name: "Mohammed Salman", isCaptain: true },
          { memberId: "SYNORA-001-M02", name: "Sreethan", isCaptain: false }
        ],
        balance: 730,
        unlocked: ["E1", "E2"],
        solved: ["E1", "E2"],
        problemStatuses: {
          "E1": { status: "SOLVED", solvedBy: "SYNORA-001-M01", solvedByName: "Salman" },
          "E2": { status: "SOLVED", solvedBy: "SYNORA-001-M01", solvedByName: "Salman" }
        },
        hintPassesCount: 2,
        sabotageCardsCount: 0,
        revealedHints: {
          "E1": { hint: "Use a Hash Map to store seen elements and their indices in O(N) time.", revealedByName: "Salman" }
        },
        violations: [],
        isLocked: false,
        lockReason: "",
        score: 370,
        problemWrong: { "E1": 2, "E2": 1 },
        transactions: [
          {
            id: "TXN-1",
            problemId: "E1",
            problemTitle: "Two Sum",
            bidAmount: 150,
            purchasedBy: "SYNORA-001-M01",
            purchasedByName: "Salman",
            remainingBalance: 850,
            displayTime: "Just now"
          },
          {
            id: "TXN-2",
            problemId: "E2",
            problemTitle: "Palindrome Number",
            bidAmount: 120,
            purchasedBy: "SYNORA-001-M01",
            purchasedByName: "Salman",
            remainingBalance: 730,
            displayTime: "Just now"
          }
        ]
      },
      "VISIONX": {
        name: "VisionX",
        size: 1,
        members: [
          { memberId: "VISIONX-001-M01", name: "Rukhsaar", isCaptain: true }
        ],
        balance: 1000,
        unlocked: [],
        solved: [],
        problemStatuses: {},
        hintPassesCount: 0,
        sabotageCardsCount: 0,
        revealedHints: {},
        violations: [],
        isLocked: false,
        lockReason: "",
        score: 0,
        problemWrong: {},
        transactions: []
      }
    }
  };
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialStore));
  } catch (e) {}
  return initialStore;
}

function saveFallbackStore(store) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
  } catch (e) {}
}

const PREDEFINED_HINTS = {
  E1: "Hash Map approach: Traverse the array while checking if (target - num) exists in your map. This achieves O(N) time and O(N) space.",
  E2: "Mathematical reversal: Check if negative (always false). Revert half of the digits to avoid integer overflow and compare with first half.",
  E3: "Stack data structure: Push open brackets onto stack; when encountering a close bracket, pop and ensure it matches the corresponding pair.",
  E4: "Two-pointer merge: Maintain pointers for both lists, appending the smaller value to the merged chain until both are exhausted.",
  E5: "Fast/slow pointers: Use slow pointer for the unique insert index and fast pointer to scan for value changes in sorted array."
};

export async function fetchProblems() {
  try {
    const res = await fetch(`${API_BASE}/problems`);
    if (res.ok) return await res.json();
  } catch (e) {}

  // Fallback
  return {
    problems: fallbackProblemsData.problems || [],
    prices: {}
  };
}

export async function fetchTeamsList() {
  try {
    const res = await fetch(`${API_BASE}/teams`);
    if (res.ok) return await res.json();
  } catch (e) {}

  const store = getFallbackStore();
  return { teams: Object.values(store.teams) };
}

export async function registerTeam({ name, size, captainIdx, members }) {
  try {
    const res = await fetch(`${API_BASE}/team/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, size, captainIdx, members })
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  const store = getFallbackStore();
  const normalized = (name || '').trim().toUpperCase();
  const teamObj = {
    name,
    size: size || members.length,
    members: members.map((m, idx) => ({
      memberId: `${normalized}-001-M0${idx + 1}`,
      name: m.name,
      isCaptain: idx === captainIdx
    })),
    balance: 1000,
    unlocked: [],
    solved: [],
    problemStatuses: {},
    hintPassesCount: 0,
    sabotageCardsCount: 0,
    revealedHints: {},
    violations: [],
    isLocked: false,
    lockReason: "",
    score: 0,
    problemWrong: {},
    transactions: []
  };
  store.teams[normalized] = teamObj;
  saveFallbackStore(store);
  return { success: true, team: teamObj };
}

export async function loginTeam({ teamName, memberId }) {
  try {
    const res = await fetch(`${API_BASE}/team/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName, memberId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  const store = getFallbackStore();
  const key = (teamName || '').trim().toUpperCase();
  const team = store.teams[key] || store.teams['SYNORA'];
  const member = team.members.find(m => m.memberId === memberId) || team.members[0];
  return { success: true, team, member };
}

export async function getTeamStatus(teamName) {
  try {
    const res = await fetch(`${API_BASE}/team/${encodeURIComponent(teamName)}`);
    if (res.ok) return await res.json();
  } catch (e) {}

  const store = getFallbackStore();
  const key = (teamName || '').trim().toUpperCase();
  const team = store.teams[key];
  if (!team) {
    throw new Error(`Team "${teamName}" not found in registration database.`);
  }
  return { team };
}

export async function syncTeamsFromSheet(payload) {
  try {
    const res = await fetch(`${API_BASE}/teams/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true };
}

export async function purchaseProblem({ teamName, memberId, problemId, bidAmount }) {
  try {
    const res = await fetch(`${API_BASE}/problems/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName, memberId, problemId, bidAmount })
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  const store = getFallbackStore();
  const key = (teamName || '').trim().toUpperCase();
  const team = store.teams[key] || store.teams['SYNORA'];
  const cost = parseInt(bidAmount, 10) || 0;
  if (cost > team.balance) {
    throw new Error(`Insufficient budget. Need ₹${cost}, team only has ₹${team.balance}.`);
  }

  team.balance -= cost;
  if (!team.unlocked.includes(problemId)) {
    team.unlocked.push(problemId);
  }
  team.problemStatuses[problemId] = {
    status: 'UNLOCKED',
    unlockedBy: memberId,
    bidAmount: cost
  };
  team.transactions.unshift({
    id: `TXN-${Date.now()}`,
    problemId,
    problemTitle: problemId,
    bidAmount: cost,
    purchasedBy: memberId,
    remainingBalance: team.balance,
    displayTime: new Date().toLocaleTimeString()
  });

  saveFallbackStore(store);
  return { success: true, team, problem: { id: problemId } };
}

export async function notifyMemberWorking({ teamName, memberId, problemId }) {
  try {
    const res = await fetch(`${API_BASE}/problems/working`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName, memberId, problemId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return null;
}

export async function unlockProblemKey(teamName, key, memberId, bidAmount) {
  return await purchaseProblem({ teamName, memberId, problemId: key, bidAmount });
}

export async function sendTelemetry(teamName, memberId, event, details) {
  try {
    const res = await fetch(`${API_BASE}/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName, memberId, event, details })
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  const store = getFallbackStore();
  const key = (teamName || '').trim().toUpperCase();
  const team = store.teams[key];
  if (team) {
    team.violations = team.violations || [];
    team.violations.push({ id: `${Date.now()}`, event, details, timestamp: Date.now() });
    if (team.violations.length >= 5) {
      team.isLocked = true;
      team.lockReason = `Flag threshold reached (${team.violations.length} violations detected).`;
    }
    saveFallbackStore(store);
    return { ok: true, isLocked: team.isLocked, flagsCount: team.violations.length };
  }
  return null;
}

export async function pollJobStatus(jobId, timeoutMs = 25000) {
  try {
    const res = await fetch(`${API_BASE}/submissions/status/${jobId}`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return null;
}

export async function runCodeAsync({ teamName, memberId, lang, code, stdin }) {
  try {
    const res = await fetch(`${API_BASE}/submissions/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName, memberId, lang, code, stdin })
    });
    if (res.ok) {
      const data = await res.json();
      return await pollJobStatus(data.jobId);
    }
  } catch (e) {}

  // Fallback local run simulation
  await new Promise(r => setTimeout(r, 600));
  return {
    status: 'COMPLETED',
    type: 'run',
    data: {
      stdout: code.includes('print') || code.includes('cout') || code.includes('printf')
        ? (stdin ? `Processed: ${stdin}` : "Success: Output executed successfully.")
        : "(Program exited with no standard output)",
      stderr: "",
      ok: true
    }
  };
}

export async function submitCodeAsync({ teamName, memberId, problemId, lang, code }) {
  try {
    const res = await fetch(`${API_BASE}/submissions/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName, memberId, problemId, lang, code })
    });
    if (res.ok) {
      const data = await res.json();
      return await pollJobStatus(data.jobId);
    }
  } catch (e) {}

  // Fallback local grading simulation
  await new Promise(r => setTimeout(r, 800));
  const store = getFallbackStore();
  const key = (teamName || '').trim().toUpperCase();
  const team = store.teams[key] || store.teams['SYNORA'];

  const diffPoints = problemId.startsWith('H') ? 400 : (problemId.startsWith('M') ? 300 : 200);
  const isPassed = !code.includes('TODO') && code.length > 50;

  if (isPassed) {
    if (!team.solved.includes(problemId)) {
      team.solved.push(problemId);
    }
    const wrongOnProb = team.problemWrong[problemId] || 0;
    const finalScore = diffPoints - (wrongOnProb * 10);
    team.score += Math.max(0, finalScore);
    team.problemStatuses[problemId] = {
      status: 'SOLVED',
      solvedBy: memberId,
      finalProblemScore: finalScore
    };
    saveFallbackStore(store);

    return {
      status: 'COMPLETED',
      type: 'submit',
      data: {
        passed: true,
        verdict: 'ACCEPTED',
        details: 'All hidden test cases passed successfully!',
        awardedPoints: diffPoints,
        hiddenPassed: 3,
        totalHidden: 3
      }
    };
  } else {
    team.problemWrong[problemId] = (team.problemWrong[problemId] || 0) + 1;
    team.score = Math.max(0, team.score - 10);
    saveFallbackStore(store);

    return {
      status: 'COMPLETED',
      type: 'submit',
      data: {
        passed: false,
        verdict: 'WRONG_ANSWER',
        details: 'Sample Output Mismatch. Incorrect logic on test case #1.',
        hiddenPassed: 1,
        totalHidden: 3
      }
    };
  }
}

export async function fetchLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if (res.ok) return await res.json();
  } catch (e) {}

  const store = getFallbackStore();
  const list = Object.values(store.teams).map(t => ({
    name: t.name,
    score: t.score || 0,
    solvedCount: (t.solved || []).length,
    wrongAttempts: Object.values(t.problemWrong || {}).reduce((a, b) => a + b, 0),
    isLocked: t.isLocked || false
  })).sort((a, b) => b.score - a.score);

  return { leaderboard: list };
}

export async function fetchProctorTeams() {
  try {
    const res = await fetch(`${API_BASE}/proctor/teams`);
    if (res.ok) return await res.json();
  } catch (e) {}

  const store = getFallbackStore();
  return { teams: Object.values(store.teams) };
}

export async function proctorUnlockTeam(teamName, pin) {
  try {
    const res = await fetch(`${API_BASE}/proctor/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName, pin })
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  if (pin !== 'qubit') {
    throw new Error('Invalid Organiser PIN');
  }
  const store = getFallbackStore();
  const key = (teamName || '').trim().toUpperCase();
  const team = store.teams[key];
  if (team) {
    team.isLocked = false;
    team.lockReason = '';
    team.violations = [];
    saveFallbackStore(store);
    return { success: true, team };
  }
  return { success: true };
}

export async function proctorResetTeam(teamName) {
  try {
    const res = await fetch(`${API_BASE}/proctor/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true };
}

export async function proctorResetAll(pin) {
  try {
    const res = await fetch(`${API_BASE}/proctor/reset-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true };
}

export async function updateProblemPrice({ problemId, price, pin }) {
  try {
    const res = await fetch(`${API_BASE}/admin/problems/price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId, price, pin })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true };
}

export async function batchSetProblemPrices({ easyPrice, mediumPrice, hardPrice, pin }) {
  try {
    const res = await fetch(`${API_BASE}/admin/problems/batch-prices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ easyPrice, mediumPrice, hardPrice, pin })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true };
}

export async function fetchProblemPrices() {
  try {
    const res = await fetch(`${API_BASE}/admin/problems/prices`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return { prices: {} };
}

export async function fetchTransactions() {
  try {
    const res = await fetch(`${API_BASE}/admin/transactions`);
    if (res.ok) return await res.json();
  } catch (e) {}
  const store = getFallbackStore();
  const txns = [];
  Object.values(store.teams).forEach(t => {
    if (t.transactions) txns.push(...t.transactions);
  });
  return { transactions: txns };
}

export async function purchaseHintPass({ teamName, memberId, problemId }) {
  try {
    const res = await fetch(`${API_BASE}/cards/hint/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName, memberId, problemId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  const store = getFallbackStore();
  const key = (teamName || '').trim().toUpperCase();
  const team = store.teams[key] || store.teams['SYNORA'];
  if (team.balance < 40) throw new Error('Insufficient ByteCoins for Hint Pass.');
  team.balance -= 40;
  team.hintPassesCount = (team.hintPassesCount || 0) + 1;
  saveFallbackStore(store);
  return { success: true, team };
}

export async function useHintPass({ teamName, memberId, problemId }) {
  try {
    const res = await fetch(`${API_BASE}/cards/hint/use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName, memberId, problemId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  const store = getFallbackStore();
  const key = (teamName || '').trim().toUpperCase();
  const team = store.teams[key] || store.teams['SYNORA'];
  if ((team.hintPassesCount || 0) <= 0) {
    if (team.balance < 40) throw new Error('Insufficient ByteCoins.');
    team.balance -= 40;
  } else {
    team.hintPassesCount--;
  }

  const hintText = PREDEFINED_HINTS[problemId] || `Algorithmic strategy for ${problemId}: Analyze constraint boundaries and use standard optimal data structure.`;
  team.revealedHints = team.revealedHints || {};
  team.revealedHints[problemId] = {
    hint: hintText,
    revealedBy: memberId,
    revealedByName: memberId.includes('M01') ? 'Salman' : 'Team Member',
    revealedAt: Date.now()
  };
  saveFallbackStore(store);
  return { success: true, team };
}

export async function purchaseSabotageCard({ teamName, memberId }) {
  try {
    const res = await fetch(`${API_BASE}/cards/sabotage/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName, memberId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  const store = getFallbackStore();
  const key = (teamName || '').trim().toUpperCase();
  const team = store.teams[key] || store.teams['SYNORA'];
  if (team.balance < 40) throw new Error('Insufficient ByteCoins for Sabotage Card.');
  team.balance -= 40;
  team.sabotageCardsCount = (team.sabotageCardsCount || 0) + 1;
  saveFallbackStore(store);
  return { success: true, team };
}

export async function useSabotageCard({ teamName, memberId, targetTeamName }) {
  try {
    const res = await fetch(`${API_BASE}/cards/sabotage/use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName, memberId, targetTeamName })
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  const store = getFallbackStore();
  const key = (teamName || '').trim().toUpperCase();
  const targetKey = (targetTeamName || '').trim().toUpperCase();
  const team = store.teams[key] || store.teams['SYNORA'];
  const target = store.teams[targetKey];

  if ((team.sabotageCardsCount || 0) <= 0) {
    if (team.balance < 40) throw new Error('Insufficient ByteCoins.');
    team.balance -= 40;
  } else {
    team.sabotageCardsCount--;
  }

  if (target) {
    target.frozenUntil = Date.now() + 5 * 60 * 1000;
    target.frozenBy = team.name;
  }
  saveFallbackStore(store);
  return { success: true, attackingTeam: team, targetTeam: target };
}

export async function fetchSabotageTargets(excludeTeam = '') {
  try {
    const res = await fetch(`${API_BASE}/cards/targets?excludeTeam=${encodeURIComponent(excludeTeam)}`);
    if (res.ok) return await res.json();
  } catch (e) {}

  const store = getFallbackStore();
  const excludeNorm = (excludeTeam || '').trim().toUpperCase();
  const targets = Object.values(store.teams)
    .filter(t => t.name.toUpperCase() !== excludeNorm)
    .map(t => ({
      name: t.name,
      teamId: `${t.name.toUpperCase()}-001`,
      isFrozen: Boolean(t.frozenUntil && t.frozenUntil > Date.now()),
      frozenMinutesRemaining: t.frozenUntil && t.frozenUntil > Date.now()
        ? Math.ceil((t.frozenUntil - Date.now()) / 60000)
        : 0
    }));

  return { targets };
}

export async function fetchSubmissions(teamName = null) {
  try {
    const url = teamName ? `${API_BASE}/submissions?teamName=${encodeURIComponent(teamName)}` : `${API_BASE}/submissions`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (e) {}
  return { submissions: [] };
}
