import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ProblemCatalog } from './components/ProblemCatalog';
import { CodeEditorPane } from './components/CodeEditorPane';
import { GateModal } from './components/GateModal';
import { LockOverlay } from './components/LockOverlay';
import { ProctorDashboard } from './components/ProctorDashboard';
import { LeaderboardModal } from './components/LeaderboardModal';
import { TransactionsModal } from './components/TransactionsModal';
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
  const handlePurchaseProblem = async (problemId, bidAmount) => {
    if (!team?.name) return;
    const res = await purchaseProblem({
      teamName: team.name,
      memberId: currentMember?.memberId,
      problemId,
      bidAmount
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

  const handleRunCode = async ({ lang, code, stdin, memberId }) => {
    return await runCodeAsync({
      teamName: team.name,
      memberId: memberId || currentMember?.memberId,
      lang,
      code,
      stdin
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
        {/* Left Sidebar: Shared Team Active Workspace */}
        <aside style={{
          width: '260px',
          background: 'var(--bg2)',
          borderRight: '1px solid var(--bd)',
          overflowY: 'auto',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0
        }}>
          {/* Workspace Title */}
          <div style={{ marginBottom: '8px', borderBottom: '1px solid var(--bd)', paddingBottom: '8px' }}>
            <h3 style={{
              margin: '0 0 2px',
              fontSize: '12px',
              color: 'var(--teal)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Users size={14} color="var(--teal)" />
              {team?.name || 'TEAM'} — WORKSPACE
            </h3>
            <small style={{ color: 'var(--mut)', fontSize: '11px' }}>
              Shared across {team?.size || team?.members?.length || 1} team members
            </small>
          </div>

          {/* List of problems in shared workspace */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
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
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--teal)' : (isSolved ? 'var(--neon)' : 'var(--bd)'),
                    borderLeft: isSolved ? '4px solid var(--neon)' : (isActive ? '4px solid var(--teal)' : '1px solid var(--bd)'),
                    background: isActive ? 'var(--bg3)' : 'var(--bg4)',
                    boxShadow: isActive ? '0 0 10px #14d9c433' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <b style={{ fontSize: '13px', color: isActive ? 'var(--teal)' : 'var(--txt)' }}>
                      {id} — {prob?.title || id}
                    </b>
                    <span className={`badge ${prob?.diff || 'Easy'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                      {prob?.diff || 'Easy'}
                    </span>
                  </div>

                  {/* Real-time Status Badges */}
                  {isSolved ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--neon)',
                      fontSize: '11px',
                      fontWeight: 700,
                      marginTop: '4px'
                    }}>
                      <CheckCircle2 size={13} />
                      <span>SOLVED {statusInfo?.solvedBy ? `by ${statusInfo.solvedBy}` : ''}</span>
                    </div>
                  ) : statusInfo?.status === 'IN_PROGRESS' ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--amber)',
                      fontSize: '11px',
                      fontWeight: 700,
                      marginTop: '4px'
                    }}>
                      <AlertTriangle size={13} />
                      <span>IN PROGRESS ({statusInfo.workingBy})</span>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--mut)',
                      fontSize: '11px',
                      marginTop: '4px'
                    }}>
                      <Unlock size={12} color="var(--teal)" />
                      <span>UNLOCKED</span>
                    </div>
                  )}
                </div>
              );
            })}

            {(!team?.unlocked || team.unlocked.length === 0) && (
              <div style={{
                color: 'var(--mut)',
                fontSize: '12px',
                padding: '16px 8px',
                textAlign: 'center',
                background: 'var(--bg3)',
                borderRadius: '6px',
                border: '1px dashed var(--bd)'
              }}>
                No problems unlocked yet.
                <div style={{ fontSize: '11px', marginTop: '4px' }}>
                  Use the Auction Catalog to purchase problems using your ₹1,000 team budget.
                </div>
              </div>
            )}
          </div>

          {/* Button to switch back to catalog */}
          <button
            className={currentProblemId ? "" : "pri"}
            onClick={() => setCurrentProblemId(null)}
            style={{ width: '100%', marginTop: 'auto', padding: '10px', fontWeight: 700 }}
          >
            🔓 Problem Catalog ({problems.length})
          </button>
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
            onSelectProblem={handleSelectProblem}
            onPurchaseProblem={handlePurchaseProblem}
          />
        )}
      </main>

      {/* Mandatory Exam Entrance Gate (Team Registration & Member Selection) */}
      {!isExamStarted && (
        <GateModal onTeamSessionReady={handleTeamSessionReady} />
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
