import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ProblemCatalog } from './components/ProblemCatalog';
import { CodeEditorPane } from './components/CodeEditorPane';
import { GateModal } from './components/GateModal';
import { LockOverlay } from './components/LockOverlay';
import { ProctorDashboard } from './components/ProctorDashboard';
import { LeaderboardModal } from './components/LeaderboardModal';
import { TransactionsModal } from './components/TransactionsModal';
import { SabotageFreezeOverlay } from './components/SabotageFreezeOverlay';
import { useAntiCheat } from './hooks/useAntiCheat';
import {
  fetchProblems,
  getTeamStatus,
  purchaseProblem,
  notifyMemberWorking,
  runCodeAsync,
  submitCodeAsync
} from './services/api';
import { CheckCircle2, AlertTriangle, Unlock, Lock, Users, Sparkles } from 'lucide-react';

const DEFAULT_TEMPLATES = {
  python: `import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    # TODO: parse input, solve, print output\n    print()\n\nif __name__ == "__main__":\n    main()\n`,
  c: `#include <stdio.h>\n\nint main() {\n    // TODO: read input with scanf, solve, print with printf\n    return 0;\n}\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(null);\n    // TODO: read input with cin, solve, print with cout\n    return 0;\n}\n`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // TODO: read input, solve, print output\n    }\n}\n`
};

export function App() {
  const [team, setTeam] = useState(null);
  const [currentMember, setCurrentMember] = useState(null);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [problems, setProblems] = useState([]);
  const [problemPrices, setProblemPrices] = useState({});
  const [currentProblemId, setCurrentProblemId] = useState(null);
  const [lang, setLang] = useState('python');
  const [codeMap, setCodeMap] = useState({});
  const [showProctor, setShowProctor] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);

  const socketRef = useRef(null);

  // 1. Initial problem & pricing fetch
  const loadProblemsAndPrices = useCallback(async () => {
    try {
      const data = await fetchProblems();
      setProblems(data.problems || []);
      setProblemPrices(data.prices || {});
    } catch (err) {
      console.error('Error fetching problems:', err);
    }
  }, []);

  useEffect(() => {
    loadProblemsAndPrices();
  }, [loadProblemsAndPrices]);

  // 2. Real-Time WebSocket Connection
  useEffect(() => {
    if (!team?.name || !isExamStarted) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    let ws;
    try {
      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        // Announce team membership to receive real-time workspace broadcasts
        ws.send(JSON.stringify({
          type: 'JOIN_TEAM',
          teamName: team.name,
          memberId: currentMember?.memberId
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'TEAM_WORKSPACE_UPDATED') {
            if (msg.team) {
              setTeam(msg.team);
            }
          } else if (msg.type === 'TEAM_SABOTAGED') {
            if (msg.team) {
              setTeam(msg.team);
            }
          } else if (msg.type === 'PRICE_UPDATED') {
            setProblemPrices(prev => ({
              ...prev,
              [msg.problemId]: msg.price
            }));
          } else if (msg.type === 'PRICES_UPDATED') {
            setProblemPrices(msg.prices || {});
          } else if (msg.type === 'TEAM_LOCKED') {
            if (msg.team) {
              setTeam(msg.team);
            }
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
    }

    return () => {
      if (ws) {
        try { ws.close(); } catch (e) {}
      }
    };
  }, [team?.name, currentMember?.memberId, isExamStarted]);

  // 3. Periodic fallback polling of team and prices
  useEffect(() => {
    if (!team?.name || !isExamStarted) return;
    const interval = setInterval(async () => {
      try {
        const [teamData, probData] = await Promise.all([
          getTeamStatus(team.name),
          fetchProblems()
        ]);
        if (teamData.team) {
          setTeam(teamData.team);
        }
        if (probData.prices) {
          setProblemPrices(probData.prices);
        }
      } catch (e) {}
    }, 4000);
    return () => clearInterval(interval);
  }, [team?.name, isExamStarted]);

  // 4. Anti-Cheat Integration with Member-Level Attribution
  const handleLockStatusChange = useCallback((locked, reason) => {
    setTeam(prev => prev ? { ...prev, isLocked: locked, lockReason: reason || prev.lockReason } : prev);
  }, []);

  const handleViolationLogged = useCallback((entry) => {
    setTeam(prev => prev ? { ...prev, violations: [entry, ...(prev.violations || [])] } : prev);
  }, []);

  const { reportViolation, enterFullscreen, internalClipboardRef } = useAntiCheat({
    teamName: team?.name,
    memberId: currentMember?.memberId,
    isStarted: isExamStarted,
    isLocked: team?.isLocked || false,
    onLockStatusChange: handleLockStatusChange,
    onViolationLogged: handleViolationLogged
  });

  // 5. Team Session Ready (from GateModal registration or login)
  const handleTeamSessionReady = async (readyTeam, readyMember) => {
    setTeam(readyTeam);
    setCurrentMember(readyMember);
    setIsExamStarted(true);
    await enterFullscreen();
  };

  // 6. Dynamic Team-Level Problem Purchase
  const handlePurchaseProblem = async (problemId, bidAmount, password) => {
    if (!team?.name) return;
    const res = await purchaseProblem({
      teamName: team.name,
      memberId: currentMember?.memberId,
      problemId,
      bidAmount,
      password
    });

    if (res.team) {
      setTeam(res.team);
    }
    // Refresh prices and problems
    loadProblemsAndPrices();
    return res;
  };

  // 7. Select Problem & notify teammates in shared workspace
  const handleSelectProblem = (id) => {
    setCurrentProblemId(id);
    if (team?.name && currentMember?.memberId && id) {
      notifyMemberWorking({
        teamName: team.name,
        memberId: currentMember.memberId,
        problemId: id
      });
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'MEMBER_WORKING',
          teamName: team.name,
          memberId: currentMember.memberId,
          problemId: id
        }));
      }
    }
  };

  // 8. Code State per Member Session
  const currentKey = `${currentProblemId}|${lang}`;
  const currentCode = codeMap[currentKey] ?? DEFAULT_TEMPLATES[lang] ?? '';

  const handleCodeChange = (newCode) => {
    setCodeMap(prev => ({ ...prev, [currentKey]: newCode }));
  };

  const handleRunCode = async ({ lang, code, stdin, memberId, problemId }) => {
    return await runCodeAsync({
      teamName: team?.name,
      memberId: memberId || currentMember?.memberId,
      lang,
      code,
      stdin,
      problemId: problemId || currentProblemId
    });
  };

  const handleSubmitCode = async ({ problemId, lang, code, memberId }) => {
    const res = await submitCodeAsync({
      teamName: team.name,
      memberId: memberId || currentMember?.memberId,
      problemId,
      lang,
      code
    });
    // Immediately refresh team state after submission
    const refreshed = await getTeamStatus(team.name);
    if (refreshed.team) {
      setTeam(refreshed.team);
    }
    return res;
  };

  const activeProblem = problems.find(p => p.id === currentProblemId);
  const activeProblemStatus = activeProblem ? (team?.problemStatuses?.[activeProblem.id] || null) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Top Navigation Header */}
      <Header
        team={team}
        currentMember={currentMember}
        onOpenProctor={() => setShowProctor(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenTransactions={() => setShowTransactions(true)}
        onToggleFullscreen={enterFullscreen}
      />

      {/* Main Workspace Layout */}
      <main style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Left Sidebar: IDE Project Navigator */}
        <aside style={{
          width: '236px',
          background: 'rgba(8, 12, 22, 0.95)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          userSelect: 'none'
        }}>
          {/* Sidebar Header: Team Identity */}
          <div style={{
            padding: '16px 14px 12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '0.4px',
              marginBottom: '2px'
            }}>
              {team?.name || 'TEAM WORKSPACE'}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: 'var(--txt-muted)'
            }}>
              <span>Shared Workspace</span>
              <span style={{
                fontSize: '11px',
                color: 'var(--txt-dim)',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                {(team?.members?.length || team?.size || 1)} Member{(team?.members?.length || team?.size || 1) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Problem Tree List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}>
            {/* Section: UNLOCKED */}
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              color: 'var(--txt-dim)',
              padding: '6px 8px 4px',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>UNLOCKED</span>
              <span style={{ fontSize: '10px' }}>{(team?.unlocked || []).length}</span>
            </div>

            {(team?.unlocked || []).map((id) => {
              const prob = problems.find(p => p.id === id);
              const isSolved = (team?.solved || []).includes(id);
              const isActive = currentProblemId === id;
              const statusInfo = team?.problemStatuses?.[id];

              return (
                <div
                  key={id}
                  onClick={() => handleSelectProblem(id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: isActive ? '#58a6ff' : (isSolved ? '#e6edf3' : 'var(--txt)'),
                    background: isActive ? 'rgba(56, 139, 253, 0.12)' : 'transparent',
                    borderLeft: isActive ? '2px solid #58a6ff' : '2px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.12s ease',
                    minWidth: 0
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                  title={`${id} — ${prob?.title || id}`}
                >
                  <span style={{
                    fontSize: '12px',
                    color: isSolved ? '#3fb950' : '#58a6ff',
                    flexShrink: 0
                  }}>
                    {isSolved ? '✓' : '●'}
                  </span>
                  <span style={{
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}>
                    {id} &nbsp;{prob?.title || id}
                  </span>
                </div>
              );
            })}

            {(!team?.unlocked || team.unlocked.length === 0) && (
              <div style={{
                fontSize: '12px',
                color: 'var(--txt-dim)',
                padding: '8px 10px',
                fontStyle: 'italic'
              }}>
                No unlocked problems yet.
              </div>
            )}
          </div>

          {/* Bottom Catalog Action */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <button
              className={!currentProblemId ? "btn-primary" : "btn-ghost"}
              onClick={() => setCurrentProblemId(null)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 600,
                justifyContent: 'center'
              }}
            >
              Problem Catalog ({problems.length})
            </button>
          </div>
        </aside>

        {/* Center / Right Content: Editor OR Problem Catalog */}
        {currentProblemId && activeProblem ? (
          <CodeEditorPane
            problem={activeProblem}
            lang={lang}
            onLangChange={setLang}
            code={currentCode}
            onCodeChange={handleCodeChange}
            onRunCode={handleRunCode}
            onSubmitCode={handleSubmitCode}
            currentMember={currentMember}
            team={team}
            onTeamUpdated={setTeam}
            problemStatus={activeProblemStatus}
            reportViolation={reportViolation}
            internalClipboardRef={internalClipboardRef}
          />
        ) : (
          <ProblemCatalog
            problems={problems}
            problemPrices={problemPrices}
            unlockedIds={team?.unlocked || []}
            solvedIds={team?.solved || []}
            problemStatuses={team?.problemStatuses || {}}
            teamBalance={team?.balance ?? 1000}
            currentMember={currentMember}
            team={team}
            onTeamUpdated={setTeam}
            onSelectProblem={handleSelectProblem}
            onPurchaseProblem={handlePurchaseProblem}
          />
        )}
      </main>

      {/* Mandatory Exam Entrance Gate (Team Registration & Member Selection) */}
      {!isExamStarted && (
        <GateModal onTeamSessionReady={handleTeamSessionReady} />
      )}

      {/* Sabotage Freeze Overlay (5-minute full screen lockout with real-time countdown) */}
      {isExamStarted && team?.frozenUntil && team.frozenUntil > Date.now() && (
        <SabotageFreezeOverlay
          team={team}
          onFreezeExpired={() => {
            setTeam(prev => prev ? { ...prev, frozenUntil: null, frozenBy: null } : prev);
          }}
        />
      )}

      {/* Lock Overlay (Anti-cheat lockout screen with Organiser PIN) */}
      {isExamStarted && team?.isLocked && (
        <LockOverlay
          teamName={team.name}
          reason={team.lockReason}
          onUnlocked={(unlockedTeam) => setTeam(unlockedTeam)}
        />
      )}

      {/* Proctor / Judge Live Control Console */}
      {showProctor && (
        <ProctorDashboard onClose={() => setShowProctor(false)} />
      )}

      {/* Live Ranked Scoreboard */}
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {/* Team Purchases & Invoices Modal */}
      {showTransactions && (
        <TransactionsModal
          team={team}
          onClose={() => setShowTransactions(false)}
        />
      )}
    </div>
  );
}
