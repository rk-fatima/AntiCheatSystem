import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ProblemCatalog } from './components/ProblemCatalog';
import { CodeEditorPane } from './components/CodeEditorPane';
import { GateModal } from './components/GateModal';
import { LockOverlay } from './components/LockOverlay';
import { ProctorDashboard } from './components/ProctorDashboard';
import { LeaderboardModal } from './components/LeaderboardModal';
import { useAntiCheat } from './hooks/useAntiCheat';
import {
  fetchProblems,
  loginTeam,
  getTeamStatus,
  unlockProblemKey,
  runCodeAsync,
  submitCodeAsync
} from './services/api';

const DEFAULT_TEMPLATES = {
  python: `import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    # TODO: parse input, solve, print output\n    print()\n\nif __name__ == "__main__":\n    main()\n`,
  c: `#include <stdio.h>\n\nint main() {\n    // TODO: read input with scanf, solve, print with printf\n    return 0;\n}\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(null);\n    // TODO: read input with cin, solve, print with cout\n    return 0;\n}\n`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // TODO: read input, solve, print output\n    }\n}\n`
};

export function App() {
  const [team, setTeam] = useState(null);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [problems, setProblems] = useState([]);
  const [currentProblemId, setCurrentProblemId] = useState(null);
  const [lang, setLang] = useState('python');
  const [codeMap, setCodeMap] = useState({});
  const [showProctor, setShowProctor] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Load problem catalog
  useEffect(() => {
    fetchProblems()
      .then(data => setProblems(data.problems || []))
      .catch(err => console.error('Error fetching problems:', err));
  }, []);

  // Periodic poll of team state to catch remote proctor unlocks/updates
  useEffect(() => {
    if (!team?.name || !isExamStarted) return;
    const interval = setInterval(async () => {
      try {
        const data = await getTeamStatus(team.name);
        if (data.team) {
          setTeam(data.team);
        }
      } catch (e) {}
    }, 4000);
    return () => clearInterval(interval);
  }, [team?.name, isExamStarted]);

  // Anti-Cheat Integration
  const handleLockStatusChange = useCallback((locked, reason) => {
    setTeam(prev => prev ? { ...prev, isLocked: locked, lockReason: reason || prev.lockReason } : prev);
  }, []);

  const handleViolationLogged = useCallback((entry) => {
    setTeam(prev => prev ? { ...prev, violations: [entry, ...(prev.violations || [])] } : prev);
  }, []);

  const { reportViolation, enterFullscreen, internalClipboardRef } = useAntiCheat({
    teamName: team?.name,
    isStarted: isExamStarted,
    isLocked: team?.isLocked || false,
    onLockStatusChange: handleLockStatusChange,
    onViolationLogged: handleViolationLogged
  });

  const handleStartExam = async (teamName) => {
    try {
      const data = await loginTeam(teamName);
      setTeam(data.team);
      setIsExamStarted(true);
      await enterFullscreen();
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  };

  const handleUnlockKey = async (key) => {
    if (!team?.name) return;
    const res = await unlockProblemKey(team.name, key);
    setTeam(prev => ({
      ...prev,
      balance: res.balance !== undefined ? res.balance : prev.balance,
      unlocked: res.unlocked
    }));
    // Ensure problem catalog is up to date
    fetchProblems().then(data => setProblems(data.problems || []));
    return res;
  };

  // Current problem code getter/setter
  const currentKey = `${currentProblemId}|${lang}`;
  const currentCode = codeMap[currentKey] ?? DEFAULT_TEMPLATES[lang] ?? '';

  const handleCodeChange = (newCode) => {
    setCodeMap(prev => ({ ...prev, [currentKey]: newCode }));
  };

  const handleRunCode = async ({ lang, code, stdin }) => {
    return await runCodeAsync({ teamName: team.name, lang, code, stdin });
  };

  const handleSubmitCode = async ({ problemId, lang, code }) => {
    const res = await submitCodeAsync({ teamName: team.name, problemId, lang, code });
    // Refresh team status after submission
    const refreshed = await getTeamStatus(team.name);
    if (refreshed.team) {
      setTeam(refreshed.team);
    }
    return res;
  };

  const activeProblem = problems.find(p => p.id === currentProblemId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Top Header */}
      <Header
        team={team}
        onOpenProctor={() => setShowProctor(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onToggleFullscreen={enterFullscreen}
      />

      {/* Main Workspace Layout */}
      <main style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Left Sidebar: Problem navigation */}
        <aside style={{
          width: '220px',
          background: 'var(--bg2)',
          borderRight: '1px solid var(--bd)',
          overflowY: 'auto',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0
        }}>
          <h3 style={{
            margin: '4px 0 8px',
            fontSize: '11px',
            color: 'var(--mut)',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Active Workspace
          </h3>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(team?.unlocked || []).map((id) => {
              const prob = problems.find(p => p.id === id);
              const isSolved = (team?.solved || []).includes(id);
              const isActive = currentProblemId === id;

              return (
                <div
                  key={id}
                  onClick={() => setCurrentProblemId(id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--teal)' : 'var(--bd)',
                    borderLeft: isSolved ? '4px solid var(--neon)' : undefined,
                    background: isActive ? 'var(--bg3)' : 'var(--bg4)',
                    boxShadow: isActive ? '0 0 8px #14d9c433' : 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isActive ? 'var(--teal)' : 'var(--txt)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {id} · {prob?.title || id}
                </div>
              );
            })}

            {(!team?.unlocked || team.unlocked.length === 0) && (
              <div style={{ color: 'var(--mut)', fontSize: '12px', padding: '8px 0' }}>
                No problems unlocked yet.
              </div>
            )}
          </div>

          <button
            onClick={() => setCurrentProblemId(null)}
            style={{ width: '100%', marginTop: 'auto' }}
          >
            🔓 Unlock / Catalog
          </button>
        </aside>

        {/* Center / Right Content */}
        {currentProblemId && activeProblem ? (
          <CodeEditorPane
            problem={activeProblem}
            lang={lang}
            onLangChange={setLang}
            code={currentCode}
            onCodeChange={handleCodeChange}
            onRunCode={handleRunCode}
            onSubmitCode={handleSubmitCode}
            reportViolation={reportViolation}
            internalClipboardRef={internalClipboardRef}
          />
        ) : (
          <ProblemCatalog
            problems={problems}
            unlockedIds={team?.unlocked || []}
            solvedIds={team?.solved || []}
            teamBalance={team?.balance ?? 1000}
            currentProblemId={currentProblemId}
            onSelectProblem={(id) => setCurrentProblemId(id)}
            onUnlockKey={handleUnlockKey}
          />
        )}
      </main>

      {/* Exam Mode Gate Modal */}
      {!isExamStarted && (
        <GateModal
          initialTeamName={team?.name}
          onStartExam={handleStartExam}
        />
      )}

      {/* Lock Overlay (Anti-cheat lockout) */}
      {isExamStarted && team?.isLocked && (
        <LockOverlay
          teamName={team.name}
          reason={team.lockReason}
          onUnlocked={(unlockedTeam) => setTeam(unlockedTeam)}
        />
      )}

      {/* Proctor / Judge Console */}
      {showProctor && (
        <ProctorDashboard onClose={() => setShowProctor(false)} />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
}
