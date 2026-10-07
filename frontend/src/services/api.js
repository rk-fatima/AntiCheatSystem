const API_BASE = '/api';

export async function fetchProblems() {
  const res = await fetch(`${API_BASE}/problems`);
  if (!res.ok) throw new Error('Failed to load problems');
  return res.json();
}

export async function loginTeam(teamName) {
  const res = await fetch(`${API_BASE}/team/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to login team');
  }
  return res.json();
}

export async function getTeamStatus(teamName) {
  const res = await fetch(`${API_BASE}/team/${encodeURIComponent(teamName)}`);
  if (!res.ok) throw new Error('Failed to fetch team state');
  return res.json();
}

export async function unlockProblemKey(teamName, key) {
  const res = await fetch(`${API_BASE}/problems/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName, key })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to unlock problem');
  return data;
}

export async function sendTelemetry(teamName, event, details) {
  try {
    const res = await fetch(`${API_BASE}/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName, event, details })
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
    await new Promise(r => setTimeout(r, 400)); // Poll every 400ms
  }
  throw new Error('Execution timed out waiting for server queue.');
}

export async function runCodeAsync({ teamName, lang, code, stdin }) {
  const res = await fetch(`${API_BASE}/submissions/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName, lang, code, stdin })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Run request failed');

  return await pollJobStatus(data.jobId);
}

export async function submitCodeAsync({ teamName, problemId, lang, code }) {
  const res = await fetch(`${API_BASE}/submissions/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName, problemId, lang, code })
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
