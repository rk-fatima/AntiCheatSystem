const API_BASE = '/api';

export async function fetchProblems() {
  const res = await fetch(`${API_BASE}/problems`);
  if (!res.ok) throw new Error('Failed to load problems');
  return res.json();
}

export async function fetchTeamsList() {
  const res = await fetch(`${API_BASE}/teams`);
  if (!res.ok) return { teams: [] };
  return res.json();
}

export async function registerTeam({ name, size, captainIdx, members }) {
  const res = await fetch(`${API_BASE}/team/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, size, captainIdx, members })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to register team');
  return data;
}

export async function loginTeam({ teamName, memberId }) {
  const res = await fetch(`${API_BASE}/team/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName, memberId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to login');
  return data;
}

export async function getTeamStatus(teamName) {
  const res = await fetch(`${API_BASE}/team/${encodeURIComponent(teamName)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Team not found in registration database.');
  return data;
}

export async function syncTeamsFromSheet(payload) {
  const res = await fetch(`${API_BASE}/teams/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to sync teams');
  return data;
}

export async function purchaseProblem({ teamName, memberId, problemId, bidAmount }) {
  const res = await fetch(`${API_BASE}/problems/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName, memberId, problemId, bidAmount })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to purchase problem');
  return data;
}

export async function notifyMemberWorking({ teamName, memberId, problemId }) {
  try {
    const res = await fetch(`${API_BASE}/problems/working`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName, memberId, problemId })
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function unlockProblemKey(teamName, key, memberId, bidAmount) {
  const res = await fetch(`${API_BASE}/problems/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName, key, memberId, bidAmount })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to unlock problem');
  return data;
}

export async function sendTelemetry(teamName, memberId, event, details) {
  try {
    const res = await fetch(`${API_BASE}/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName, memberId, event, details })
    });
    return res.json();
  } catch (e) {
    console.error('Telemetry send error:', e);
    return null;
  }
}

export async function pollJobStatus(jobId, timeoutMs = 25000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const res = await fetch(`${API_BASE}/submissions/status/${jobId}`);
    if (res.ok) {
      const job = await res.json();
      if (job.status === 'COMPLETED' || job.status === 'FAILED') {
        return job;
      }
    }
    await new Promise(r => setTimeout(r, 400));
  }
  throw new Error('Execution timed out waiting for server queue.');
}

export async function runCodeAsync({ teamName, memberId, lang, code, stdin }) {
  const res = await fetch(`${API_BASE}/submissions/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName, memberId, lang, code, stdin })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Run request failed');

  return await pollJobStatus(data.jobId);
}

export async function submitCodeAsync({ teamName, memberId, problemId, lang, code }) {
  const res = await fetch(`${API_BASE}/submissions/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName, memberId, problemId, lang, code })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Submission request failed');

  return await pollJobStatus(data.jobId);
}

export async function fetchLeaderboard() {
  const res = await fetch(`${API_BASE}/leaderboard`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function fetchProctorTeams() {
  const res = await fetch(`${API_BASE}/proctor/teams`);
  if (!res.ok) throw new Error('Failed to fetch proctor data');
  return res.json();
}

export async function proctorUnlockTeam(teamName, pin) {
  const res = await fetch(`${API_BASE}/proctor/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName, pin })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to unlock');
  return data;
}

export async function proctorResetTeam(teamName) {
  const res = await fetch(`${API_BASE}/proctor/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset');
  return data;
}

export async function proctorResetAll(pin) {
  const res = await fetch(`${API_BASE}/proctor/reset-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset all');
  return data;
}

// Organizer Dynamic Pricing APIs
export async function updateProblemPrice({ problemId, price, pin }) {
  const res = await fetch(`${API_BASE}/admin/problems/price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemId, price, pin })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update price');
  return data;
}

export async function batchSetProblemPrices({ easyPrice, mediumPrice, hardPrice, pin }) {
  const res = await fetch(`${API_BASE}/admin/problems/batch-prices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ easyPrice, mediumPrice, hardPrice, pin })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to set batch prices');
  return data;
}

export async function fetchProblemPrices() {
  const res = await fetch(`${API_BASE}/admin/problems/prices`);
  if (!res.ok) return { prices: {} };
  return res.json();
}

export async function fetchTransactions() {
  const res = await fetch(`${API_BASE}/admin/transactions`);
  if (!res.ok) return { transactions: [] };
  return res.json();
}

// --- POWER CARDS API (HINT PASS & SABOTAGE CARD - 40 ByteCoins) ---
export async function purchaseHintPass({ teamName, memberId, problemId }) {
  const res = await fetch(`${API_BASE}/cards/hint/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName, memberId, problemId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to purchase Hint Pass');
  return data;
}

export async function useHintPass({ teamName, memberId, problemId }) {
  const res = await fetch(`${API_BASE}/cards/hint/use`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName, memberId, problemId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to use Hint Pass');
  return data;
}

export async function purchaseSabotageCard({ teamName, memberId }) {
  const res = await fetch(`${API_BASE}/cards/sabotage/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName, memberId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to purchase Sabotage Card');
  return data;
}

export async function useSabotageCard({ teamName, memberId, targetTeamName }) {
  const res = await fetch(`${API_BASE}/cards/sabotage/use`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName, memberId, targetTeamName })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to use Sabotage Card');
  return data;
}

export async function fetchSabotageTargets(excludeTeam = '') {
  const res = await fetch(`${API_BASE}/cards/targets?excludeTeam=${encodeURIComponent(excludeTeam)}`);
  if (!res.ok) return { targets: [] };
  return res.json();
}
