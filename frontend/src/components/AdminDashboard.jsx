import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  Lock,
  Unlock,
  Lightbulb,
  Zap,
  LogOut,
  RefreshCw,
  Search,
  CheckCircle2,
  Coins,
  Users,
  Check,
  X,
  ExternalLink,
  Eye,
  Snowflake,
  AlertTriangle,
  History
} from 'lucide-react';
import {
  fetchAdminOverview,
  adminUnlockProblem,
  adminLockProblem,
  adminUnlockCard,
  adminLockCard,
  adminGrantCardPass,
  adminRevealProblemHint,
  adminClearFreeze,
  adminLogout
} from '../services/api';

export function AdminDashboard({ onLogout, onSwitchToWorkspace }) {
  const [activeTab, setActiveTab] = useState('problems'); // 'leaderboard' | 'problems' | 'hints' | 'sabotage'
  const [teams, setTeams] = useState([]);
  const [problems, setProblems] = useState([]);
  const [unlockHistory, setUnlockHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeamName, setSelectedTeamName] = useState('');
  const [notification, setNotification] = useState(null);

  // Leaderboard filters
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [leaderboardSort, setLeaderboardSort] = useState('score'); // 'score' | 'solved' | 'balance' | 'name'

  // Problems tab filters
  const [problemSearch, setProblemSearch] = useState('');
  const [problemDiffFilter, setProblemDiffFilter] = useState('ALL');

  // Bid Price Unlock Modal
  // unlockModal: { problem, team, bidPrice }
  const [unlockModal, setUnlockModal] = useState(null);
  const [unlockSubmitting, setUnlockSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminOverview();
      const loadedTeams = data.teams || [];
      setTeams(loadedTeams);
      setProblems(data.problems || []);
      setUnlockHistory(data.unlockHistory || []);

      // If no team is selected yet, default to the first team
      setSelectedTeamName(prev => {
        if (prev && loadedTeams.some(t => t.name === prev)) return prev;
        return loadedTeams[0]?.name || 'Synora';
      });
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3500);
    return () => clearInterval(interval);
  }, [loadData]);

  const showToast = (message, isSuccess = true) => {
    setNotification({ text: message, success: isSuccess });
    setTimeout(() => {
      setNotification(prev => (prev?.text === message ? null : prev));
    }, 4500);
  };

  // Target team object
  const targetTeam = teams.find(
    t => (t.name || '').toUpperCase() === (selectedTeamName || '').toUpperCase()
  ) || teams[0] || null;

  // --- STATS COMPUTATION FOR TOP 4 COMPACT CARDS ---
  const totalTeamsCount = teams.length;
  const activeTeamsCount = teams.filter(t => !t.isLocked).length;
  const totalByteCoins = teams.reduce((acc, t) => acc + (t.balance ?? 1000), 0);

  // Problems unlocked for current selected team
  const targetTeamUnlockedCount = (targetTeam?.unlocked || []).length;

  // --- PROBLEM UNLOCK (BID MODAL TRIGGER) ---
  const handleOpenUnlockModal = (problem) => {
    if (!targetTeam) {
      showToast('Please select a target team first.', false);
      return;
    }
    setUnlockModal({
      problem,
      team: targetTeam,
      bidPrice: '100' // Suggested default
    });
  };

  const handleConfirmUnlock = async () => {
    if (!unlockModal) return;
    const { problem, team, bidPrice } = unlockModal;

    const bidNum = Number(bidPrice);
    if (!bidPrice || isNaN(bidNum) || bidNum <= 0) {
      showToast('Please enter a valid positive bid price.', false);
      return;
    }

    const currentBalance = team.balance ?? 1000;
    if (bidNum > currentBalance) {
      showToast('Insufficient ByteCoins: Bid exceeds team balance.', false);
      return;
    }

    setUnlockSubmitting(true);
    try {
      const res = await adminUnlockProblem({
        teamName: team.name,
        problemId: problem.id,
        bidPrice: bidNum
      });

      showToast(`🔓 Unlocked ${problem.id} for ${team.name}! Deducted ${bidNum} ByteCoins.`);
      setUnlockModal(null);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to unlock problem', false);
    } finally {
      setUnlockSubmitting(false);
    }
  };

  const handleLockProblem = async (problemId) => {
    if (!targetTeam) return;
    try {
      await adminLockProblem({ teamName: targetTeam.name, problemId });
      showToast(`🔒 Problem ${problemId} locked for ${targetTeam.name}.`);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to lock problem', false);
    }
  };

  // --- CARD UNLOCK/LOCK ACTIONS ---
  const handleToggleHintCard = async (shouldUnlock) => {
    if (!targetTeam) return;
    try {
      if (shouldUnlock) {
        await adminUnlockCard({ teamName: targetTeam.name, cardType: 'HINT' });
        showToast(`💡 Hint Pass unlocked for ${targetTeam.name}!`);
      } else {
        await adminLockCard({ teamName: targetTeam.name, cardType: 'HINT' });
        showToast(`🔒 Hint Pass locked for ${targetTeam.name}.`);
      }
      loadData();
    } catch (err) {
      showToast(err.message || 'Card update failed', false);
    }
  };

  const handleGrantHintPass = async (amount = 1) => {
    if (!targetTeam) return;
    try {
      await adminGrantCardPass({ teamName: targetTeam.name, cardType: 'HINT', amount });
      showToast(`💡 Granted +${amount} Hint Pass to ${targetTeam.name}!`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to grant pass', false);
    }
  };

  const handleRevealProblemHint = async (problemId) => {
    if (!targetTeam) return;
    try {
      await adminRevealProblemHint({ teamName: targetTeam.name, problemId });
      showToast(`💡 Revealed hint for ${problemId} to ${targetTeam.name}!`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to reveal hint', false);
    }
  };

  const handleToggleSabotageCard = async (shouldUnlock) => {
    if (!targetTeam) return;
    try {
      if (shouldUnlock) {
        await adminUnlockCard({ teamName: targetTeam.name, cardType: 'SABOTAGE' });
        showToast(`⚡ Sabotage Card unlocked for ${targetTeam.name}!`);
      } else {
        await adminLockCard({ teamName: targetTeam.name, cardType: 'SABOTAGE' });
        showToast(`🔒 Sabotage Card locked for ${targetTeam.name}.`);
      }
      loadData();
    } catch (err) {
      showToast(err.message || 'Card update failed', false);
    }
  };

  const handleGrantSabotageCard = async (amount = 1) => {
    if (!targetTeam) return;
    try {
      await adminGrantCardPass({ teamName: targetTeam.name, cardType: 'SABOTAGE', amount });
      showToast(`⚡ Granted +${amount} Sabotage Card to ${targetTeam.name}!`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to grant sabotage card', false);
    }
  };

  const handleClearTeamFreeze = async (teamName) => {
    try {
      await adminClearFreeze({ teamName });
      showToast(`❄️ Sabotage freeze cleared for ${teamName}!`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to clear freeze', false);
    }
  };

  // Filter & sort leaderboard
  const filteredLeaderboard = [...teams]
    .filter(t => (t.name || '').toLowerCase().includes(leaderboardSearch.toLowerCase()))
    .sort((a, b) => {
      if (leaderboardSort === 'score') return (b.score || 0) - (a.score || 0);
      if (leaderboardSort === 'solved') return ((b.solved || []).length) - ((a.solved || []).length);
      if (leaderboardSort === 'balance') return (b.balance ?? 1000) - (a.balance ?? 1000);
      if (leaderboardSort === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

  // Filter problems for Problems tab
  const filteredProblems = problems.filter(prob => {
    const matchesSearch =
      prob.id.toLowerCase().includes(problemSearch.toLowerCase()) ||
      prob.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
      (prob.cat || '').toLowerCase().includes(problemSearch.toLowerCase());

    const isUnlocked = Boolean(targetTeam?.unlocked && targetTeam.unlocked.includes(prob.id));

    const matchesDiff =
      problemDiffFilter === 'ALL' ||
      prob.diff.toUpperCase() === problemDiffFilter ||
      (problemDiffFilter === 'UNLOCKED' && isUnlocked) ||
      (problemDiffFilter === 'LOCKED' && !isUnlocked);

    return matchesSearch && matchesDiff;
  });

  const isHintCardUnlocked = Boolean(
    (targetTeam?.unlockedCards || []).includes('HINT') || targetTeam?.hintUnlocked
  );

  const isSabotageCardUnlocked = Boolean(
    (targetTeam?.unlockedCards || []).includes('SABOTAGE') || targetTeam?.sabotageUnlocked
  );

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(ellipse at 50% 10%, rgba(30, 42, 80, 0.25) 0%, #060913 70%)',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 1. TOP ADMIN BAR */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 28px',
        background: 'rgba(9, 13, 24, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 50,
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.6px', color: '#ffffff' }}>
              QUBIT
            </span>
            <span style={{ color: '#bc8cff', fontWeight: 600, fontSize: '15px' }}>//</span>
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1.2px',
              color: '#58a6ff',
              textTransform: 'uppercase'
            }}>
              ADMIN DASHBOARD
            </span>
          </div>

          <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.1)' }} />

          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'rgba(88, 166, 255, 0.12)',
            border: '1px solid rgba(88, 166, 255, 0.3)',
            color: '#58a6ff',
            letterSpacing: '0.4px'
          }}>
            EXCLUSIVE UNLOCK AUTHORITY
          </span>
        </div>

        {/* Global Controls & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Refresh Button */}
          <button
            className="btn-ghost"
            onClick={loadData}
            title="Sync with live database"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Sync</span>
          </button>

          {/* Switch to Team Workspace */}
          {onSwitchToWorkspace && (
            <button
              className="btn-ghost"
              onClick={onSwitchToWorkspace}
              title="View student workspace"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              <ExternalLink size={13} />
              <span>Workspace View</span>
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={() => {
              adminLogout();
              if (onLogout) onLogout();
            }}
            className="btn-ghost"
            style={{
              fontSize: '12px',
              padding: '6px 14px',
              color: '#ff7b72',
              borderColor: 'rgba(248, 81, 73, 0.25)',
              background: 'rgba(248, 81, 73, 0.06)'
            }}
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 28px',
        maxWidth: '1240px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Toast Alert */}
        {notification && (
          <div style={{
            padding: '12px 18px',
            borderRadius: '8px',
            marginBottom: '20px',
            background: notification.success ? 'rgba(63, 185, 80, 0.12)' : 'rgba(248, 81, 73, 0.12)',
            border: `1px solid ${notification.success ? 'rgba(63, 185, 80, 0.35)' : 'rgba(248, 81, 73, 0.35)'}`,
            color: notification.success ? '#3fb950' : '#f85149',
            fontWeight: 500,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}>
            <span>{notification.text}</span>
            <button
              onClick={() => setNotification(null)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* 3. TOP SUMMARY CARDS (Compact 4 Cards) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
          marginBottom: '22px'
        }}>
          {/* 1. Teams */}
          <div style={compactCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={compactLabelStyle}>TEAMS</span>
              <Users size={15} color="var(--txt-dim)" />
            </div>
            <div style={compactValueStyle}>{totalTeamsCount}</div>
            <div style={compactSubtextStyle}>Registered contest teams</div>
          </div>

          {/* 2. Active Teams */}
          <div style={compactCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={compactLabelStyle}>ACTIVE TEAMS</span>
              <CheckCircle2 size={15} color="#3fb950" />
            </div>
            <div style={{ ...compactValueStyle, color: '#3fb950' }}>{activeTeamsCount}</div>
            <div style={compactSubtextStyle}>Competing without lockout</div>
          </div>

          {/* 3. ByteCoins in Circulation */}
          <div style={compactCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={compactLabelStyle}>BYTECOINS IN CIRCULATION</span>
              <Coins size={15} color="#58a6ff" />
            </div>
            <div style={{ ...compactValueStyle, color: '#58a6ff' }}>{totalByteCoins} BC</div>
            <div style={compactSubtextStyle}>Total liquidity held by teams</div>
          </div>

          {/* 4. Problems Unlocked */}
          <div style={compactCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={compactLabelStyle}>PROBLEMS UNLOCKED</span>
              <Unlock size={15} color="#bc8cff" />
            </div>
            <div style={{ ...compactValueStyle, color: '#bc8cff' }}>
              {targetTeam ? `${targetTeamUnlockedCount} / ${problems.length}` : '—'}
            </div>
            <div style={compactSubtextStyle}>
              {targetTeam ? `Unlocked for ${targetTeam.name}` : 'Select a team'}
            </div>
          </div>
        </div>

        {/* 4. NAVIGATION TABS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          {/* Main 4 Tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              { id: 'problems', label: 'Problems', icon: Lock },
              { id: 'hints', label: 'Hints', icon: Lightbulb },
              { id: 'sabotage', label: 'Sabotage', icon: Zap }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#ffffff' : 'var(--txt-muted)',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #58a6ff' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={15} color={isActive ? '#58a6ff' : 'var(--txt-dim)'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Target Team Selector (for Problems, Hints, Sabotage) */}
          {activeTab !== 'leaderboard' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--txt-muted)', fontWeight: 600 }}>
                Target Team:
              </span>
              <select
                value={selectedTeamName}
                onChange={(e) => setSelectedTeamName(e.target.value)}
                style={{
                  fontSize: '13px',
                  padding: '6px 14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontWeight: 600
                }}
              >
                {teams.map(t => (
                  <option key={t.name} value={t.name}>
                    👥 {t.name} ({t.balance ?? 1000} BC · {t.score || 0} pts)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 5. TAB PANELS */}

        {/* ============================================================ */}
        {/* TAB 1: LEADERBOARD MONITORING                                */}
        {/* ============================================================ */}
        {activeTab === 'leaderboard' && (
          <div>
            {/* Filter & Search Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                <Search size={14} color="var(--txt-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  placeholder="Search team name..."
                  value={leaderboardSearch}
                  onChange={(e) => setLeaderboardSearch(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '36px',
                    paddingRight: '12px',
                    paddingTop: '7px',
                    paddingBottom: '7px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                />
              </div>

              {/* Sort selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>Sort by:</span>
                <select
                  value={leaderboardSort}
                  onChange={(e) => setLeaderboardSort(e.target.value)}
                  style={{
                    fontSize: '12px',
                    padding: '6px 10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px'
                  }}
                >
                  <option value="score">Points (Highest First)</option>
                  <option value="solved">Problems Solved</option>
                  <option value="balance">ByteCoin Balance</option>
                  <option value="name">Team Name</option>
                </select>
              </div>
            </div>

            {/* Leaderboard Monitoring Table */}
            <div style={{
              background: 'rgba(13, 17, 28, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    color: 'var(--txt-muted)',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px'
                  }}>
                    <th style={{ padding: '12px 16px', width: '60px' }}>Rank</th>
                    <th style={{ padding: '12px 16px' }}>Team Name</th>
                    <th style={{ padding: '12px 16px' }}>Score</th>
                    <th style={{ padding: '12px 16px' }}>Problems Solved</th>
                    <th style={{ padding: '12px 16px' }}>ByteCoins</th>
                    <th style={{ padding: '12px 16px' }}>Hints Used</th>
                    <th style={{ padding: '12px 16px' }}>Sabotages</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.map((team, idx) => {
                    const rank = idx + 1;
                    const solvedCount = (team.solved || []).length;
                    const hintsRevealedCount = Object.keys(team.revealedHints || {}).length;
                    const isFrozen = Boolean(team.frozenUntil && team.frozenUntil > Date.now());

                    return (
                      <tr
                        key={team.name}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* Rank */}
                        <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                          {rank === 1 ? (
                            <span style={{ color: '#f0b72f', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              🥇 1
                            </span>
                          ) : rank === 2 ? (
                            <span style={{ color: '#c0c0c0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              🥈 2
                            </span>
                          ) : rank === 3 ? (
                            <span style={{ color: '#cd7f32', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              🥉 3
                            </span>
                          ) : (
                            <span style={{ color: 'var(--txt-muted)' }}>#{rank}</span>
                          )}
                        </td>

                        {/* Team Name */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#ffffff' }}>{team.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--txt-dim)' }}>
                            {(team.members || []).length || team.size || 1} Member{((team.members || []).length || team.size || 1) !== 1 ? 's' : ''}
                            {team.captainName ? ` · Lead: ${team.captainName}` : ''}
                          </div>
                        </td>

                        {/* Score */}
                        <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#bc8cff', fontSize: '14px' }}>
                          {team.score || 0} pts
                        </td>

                        {/* Solved */}
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: solvedCount > 0 ? 'rgba(63, 185, 80, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                            border: `1px solid ${solvedCount > 0 ? 'rgba(63, 185, 80, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                            color: solvedCount > 0 ? '#3fb950' : 'var(--txt-muted)',
                            fontSize: '12px',
                            fontWeight: 600
                          }}>
                            {solvedCount} Solved
                          </span>
                        </td>

                        {/* ByteCoins */}
                        <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: '#58a6ff', fontWeight: 700, fontSize: '13px' }}>
                          {team.balance ?? 1000} BC
                        </td>

                        {/* Hints Used */}
                        <td style={{ padding: '12px 16px', color: hintsRevealedCount > 0 ? '#d29922' : 'var(--txt-dim)' }}>
                          {hintsRevealedCount} Revealed
                        </td>

                        {/* Sabotages */}
                        <td style={{ padding: '12px 16px', color: team.sabotageCardsCount > 0 ? '#ff7b72' : 'var(--txt-dim)' }}>
                          {team.sabotageCardsCount || 0} In Inv
                        </td>

                        {/* Status */}
                        <td style={{ padding: '12px 16px' }}>
                          {team.isLocked ? (
                            <span style={{ color: '#ff7b72', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                              <Lock size={12} /> Locked
                            </span>
                          ) : isFrozen ? (
                            <span style={{ color: '#58a6ff', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                              <Snowflake size={12} /> Sabotaged
                            </span>
                          ) : (
                            <span style={{ color: '#3fb950', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500 }}>
                              <CheckCircle2 size={12} /> Active
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredLeaderboard.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--txt-dim)' }}>
                        No teams match query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: PROBLEM UNLOCK MANAGEMENT                             */}
        {/* ============================================================ */}
        {activeTab === 'problems' && (
          <div>
            {/* Target Team Banner */}
            {targetTeam && (
              <div style={{
                background: 'rgba(88, 166, 255, 0.07)',
                border: '1px solid rgba(88, 166, 255, 0.22)',
                borderRadius: '10px',
                padding: '16px 20px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#58a6ff', fontWeight: 700 }}>
                    Selected Target Team
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                    {targetTeam.name}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--txt-dim)' }}>Available Balance</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#58a6ff', fontFamily: 'var(--font-mono)' }}>
                      {targetTeam.balance ?? 1000} ByteCoins
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--txt-dim)' }}>Score</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#bc8cff', fontFamily: 'var(--font-mono)' }}>
                      {targetTeam.score || 0} pts
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--txt-dim)' }}>Unlocked</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#3fb950', fontFamily: 'var(--font-mono)' }}>
                      {targetTeamUnlockedCount} / {problems.length}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filter controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                <Search size={14} color="var(--txt-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  placeholder="Filter problems by ID, title..."
                  value={problemSearch}
                  onChange={(e) => setProblemSearch(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '36px',
                    paddingRight: '12px',
                    paddingTop: '7px',
                    paddingBottom: '7px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                />
              </div>

              {/* Segmented Filter */}
              <div style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                gap: '2px'
              }}>
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'UNLOCKED', label: 'Unlocked' },
                  { id: 'LOCKED', label: 'Locked' }
                ].map(tab => {
                  const isActive = problemDiffFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setProblemDiffFilter(tab.id)}
                      style={{
                        background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        color: isActive ? '#ffffff' : 'var(--txt-muted)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: isActive ? 600 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Problem List (Cleaner Problem List) */}
            <div style={{
              background: 'rgba(13, 17, 28, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              overflow: 'hidden',
              marginBottom: '32px'
            }}>
              {filteredProblems.map((prob) => {
                const isUnlocked = Boolean(targetTeam?.unlocked && targetTeam.unlocked.includes(prob.id));
                const diffColor = prob.diff === 'Hard' ? '#ff7b72' : prob.diff === 'Medium' ? '#d29922' : '#3fb950';
                const pts = prob.diff === 'Hard' ? 400 : prob.diff === 'Medium' ? 300 : 200;

                return (
                  <div
                    key={prob.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 20px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      gap: '16px',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* Left: ID & Title & Metadata */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: isUnlocked ? 'rgba(88, 166, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${isUnlocked ? 'rgba(88, 166, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isUnlocked ? '#58a6ff' : 'var(--txt-dim)',
                        flexShrink: 0
                      }}>
                        {isUnlocked ? <Unlock size={16} /> : <Lock size={15} />}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
                          {prob.id} &nbsp;{prob.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--txt-muted)', marginTop: '2px' }}>
                          <span style={{ color: diffColor, fontWeight: 600 }}>{prob.diff}</span>
                          <span>•</span>
                          <span>{pts} pts</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Tag + Clean Action */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: isUnlocked ? 'rgba(63, 185, 80, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${isUnlocked ? 'rgba(63, 185, 80, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                        color: isUnlocked ? '#3fb950' : 'var(--txt-dim)',
                        letterSpacing: '0.4px'
                      }}>
                        {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                      </span>

                      {isUnlocked ? (
                        <button
                          className="btn-ghost"
                          onClick={() => handleLockProblem(prob.id)}
                          style={{
                            fontSize: '12px',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            color: '#ff7b72',
                            borderColor: 'rgba(248, 81, 73, 0.3)'
                          }}
                        >
                          <Lock size={13} /> Lock Problem
                        </button>
                      ) : (
                        <button
                          className="btn-primary"
                          onClick={() => handleOpenUnlockModal(prob)}
                          style={{
                            fontSize: '12px',
                            padding: '6px 14px',
                            borderRadius: '6px'
                          }}
                        >
                          <Unlock size={13} /> Unlock Problem
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredProblems.length === 0 && (
                <div style={{ padding: '36px', textAlign: 'center', color: 'var(--txt-dim)', fontSize: '13px' }}>
                  No problems match filter.
                </div>
              )}
            </div>

            {/* UNLOCK HISTORY SECTION */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <History size={16} color="#58a6ff" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                  Unlock Transaction History
                </h3>
              </div>

              <div style={{
                background: 'rgba(13, 17, 28, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      color: 'var(--txt-muted)',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      <th style={{ padding: '10px 14px' }}>Time</th>
                      <th style={{ padding: '10px 14px' }}>Team</th>
                      <th style={{ padding: '10px 14px' }}>Problem</th>
                      <th style={{ padding: '10px 14px' }}>Bid Price</th>
                      <th style={{ padding: '10px 14px' }}>Prev Balance</th>
                      <th style={{ padding: '10px 14px' }}>New Balance</th>
                      <th style={{ padding: '10px 14px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unlockHistory.map((rec) => (
                      <tr
                        key={rec.id}
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}
                      >
                        <td style={{ padding: '10px 14px', color: 'var(--txt-dim)' }}>
                          {rec.displayTime || new Date(rec.timestamp).toLocaleTimeString()}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: '#ffffff' }}>
                          {rec.teamName}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ color: '#58a6ff', fontWeight: 600 }}>{rec.problemId}</span>
                          {rec.problemTitle ? ` · ${rec.problemTitle}` : ''}
                        </td>
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: '#ff7b72', fontWeight: 700 }}>
                          -{rec.bidPrice || rec.bidAmount || rec.price} BC
                        </td>
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--txt-muted)' }}>
                          {rec.previousBalance ?? '—'} BC
                        </td>
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: '#3fb950', fontWeight: 700 }}>
                          {rec.remainingBalance} BC
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            fontSize: '11px',
                            color: '#3fb950',
                            background: 'rgba(63, 185, 80, 0.1)',
                            border: '1px solid rgba(63, 185, 80, 0.25)',
                            padding: '2px 8px',
                            borderRadius: '10px'
                          }}>
                            {rec.status || 'UNLOCKED'}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {unlockHistory.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--txt-dim)' }}>
                          No unlock transactions recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: HINT CARD MANAGEMENT                                  */}
        {/* ============================================================ */}
        {activeTab === 'hints' && (
          <div>
            {/* Hint Hero Banner */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(30, 80, 180, 0.12) 0%, rgba(13, 17, 28, 0.85) 100%)',
              border: `1px solid ${isHintCardUnlocked ? 'rgba(56, 139, 253, 0.35)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '12px',
              padding: '22px 24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  background: isHintCardUnlocked ? 'rgba(56, 139, 253, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${isHintCardUnlocked ? 'rgba(56, 139, 253, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isHintCardUnlocked ? '#58a6ff' : 'var(--txt-dim)'
                }}>
                  <Lightbulb size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                    Hint Pass Card Authority
                  </h3>
                  <div style={{ fontSize: '13px', color: 'var(--txt-muted)' }}>
                    Current State for <b>{targetTeam?.name || 'Selected Team'}</b>:{' '}
                    <span style={{ color: isHintCardUnlocked ? '#3fb950' : '#ff7b72', fontWeight: 700 }}>
                      {isHintCardUnlocked ? '🔓 UNLOCKED' : '🔒 LOCKED'}
                    </span>
                    {' · Inventory: '}
                    <b style={{ color: '#ffffff' }}>{targetTeam?.hintPassesCount || 0} Available</b>
                  </div>
                </div>
              </div>

              {/* Master Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  className="btn-ghost"
                  onClick={() => handleGrantHintPass(1)}
                  title="Award 1 free hint pass to team inventory"
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  + Grant 1 Hint Pass
                </button>

                {isHintCardUnlocked ? (
                  <button
                    className="btn-ghost"
                    onClick={() => handleToggleHintCard(false)}
                    style={{
                      fontSize: '13px',
                      padding: '8px 16px',
                      color: '#ff7b72',
                      borderColor: 'rgba(248, 81, 73, 0.3)'
                    }}
                  >
                    <Lock size={14} /> Lock Hint Card
                  </button>
                ) : (
                  <button
                    className="btn-blue"
                    onClick={() => handleToggleHintCard(true)}
                    style={{ fontSize: '13px', padding: '8px 18px', fontWeight: 600 }}
                  >
                    <Unlock size={14} /> Unlock Hint Card
                  </button>
                )}
              </div>
            </div>

            {/* Problem Hints Dispatch */}
            <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Problem Hints Dispatch for {targetTeam?.name}
            </h4>

            <div style={{
              background: 'rgba(13, 17, 28, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              {problems.map((prob) => {
                const isRevealed = Boolean(targetTeam?.revealedHints?.[prob.id]);

                return (
                  <div
                    key={prob.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 18px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      gap: '14px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
                        {prob.id} &nbsp;{prob.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--txt-muted)', marginTop: '2px' }}>
                        {isRevealed ? (
                          <span style={{ color: '#3fb950', fontWeight: 500 }}>
                            ✓ Hint revealed to {targetTeam?.name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--txt-dim)' }}>Hint concealed from team</span>
                        )}
                      </div>
                    </div>

                    <div>
                      {isRevealed ? (
                        <span style={{
                          fontSize: '12px',
                          color: '#3fb950',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'rgba(63, 185, 80, 0.1)',
                          border: '1px solid rgba(63, 185, 80, 0.25)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Check size={12} /> Revealed
                        </span>
                      ) : (
                        <button
                          className="btn-ghost"
                          onClick={() => handleRevealProblemHint(prob.id)}
                          style={{ fontSize: '12px', padding: '5px 12px', color: '#58a6ff' }}
                        >
                          <Eye size={13} /> Reveal Hint
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: SABOTAGE CARD MANAGEMENT                              */}
        {/* ============================================================ */}
        {activeTab === 'sabotage' && (
          <div>
            {/* Sabotage Hero Banner */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(180, 25, 60, 0.12) 0%, rgba(20, 10, 16, 0.85) 100%)',
              border: `1px solid ${isSabotageCardUnlocked ? 'rgba(248, 81, 73, 0.35)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '12px',
              padding: '22px 24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  background: isSabotageCardUnlocked ? 'rgba(248, 81, 73, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${isSabotageCardUnlocked ? 'rgba(248, 81, 73, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSabotageCardUnlocked ? '#ff7b72' : 'var(--txt-dim)'
                }}>
                  <Zap size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                    Sabotage Card Authority
                  </h3>
                  <div style={{ fontSize: '13px', color: 'var(--txt-muted)' }}>
                    Current State for <b>{targetTeam?.name || 'Selected Team'}</b>:{' '}
                    <span style={{ color: isSabotageCardUnlocked ? '#3fb950' : '#ff7b72', fontWeight: 700 }}>
                      {isSabotageCardUnlocked ? '🔓 UNLOCKED' : '🔒 LOCKED'}
                    </span>
                    {' · Inventory: '}
                    <b style={{ color: '#ffffff' }}>{targetTeam?.sabotageCardsCount || 0} Available</b>
                  </div>
                </div>
              </div>

              {/* Master Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  className="btn-ghost"
                  onClick={() => handleGrantSabotageCard(1)}
                  title="Award 1 free sabotage card to team inventory"
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  + Grant 1 Sabotage Card
                </button>

                {isSabotageCardUnlocked ? (
                  <button
                    className="btn-ghost"
                    onClick={() => handleToggleSabotageCard(false)}
                    style={{
                      fontSize: '13px',
                      padding: '8px 16px',
                      color: '#ff7b72',
                      borderColor: 'rgba(248, 81, 73, 0.3)'
                    }}
                  >
                    <Lock size={14} /> Lock Sabotage Card
                  </button>
                ) : (
                  <button
                    className="btn-danger"
                    onClick={() => handleToggleSabotageCard(true)}
                    style={{ fontSize: '13px', padding: '8px 18px', fontWeight: 600 }}
                  >
                    <Unlock size={14} /> Unlock Sabotage Card
                  </button>
                )}
              </div>
            </div>

            {/* Active Freeze Monitoring & Admin Override */}
            <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Active Sabotage Freezes
            </h4>

            <div style={{
              background: 'rgba(13, 17, 28, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              {teams.map((t) => {
                const isFrozen = Boolean(t.frozenUntil && t.frozenUntil > Date.now());
                const remainingSecs = isFrozen ? Math.max(0, Math.ceil((t.frozenUntil - Date.now()) / 1000)) : 0;
                const remainingMins = Math.ceil(remainingSecs / 60);

                return (
                  <div
                    key={t.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      gap: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: isFrozen ? 'rgba(88, 166, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isFrozen ? 'rgba(88, 166, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isFrozen ? '#58a6ff' : 'var(--txt-dim)'
                      }}>
                        {isFrozen ? <Snowflake size={16} /> : <Zap size={15} />}
                      </div>

                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--txt-muted)', marginTop: '2px' }}>
                          {isFrozen ? (
                            <span style={{ color: '#58a6ff', fontWeight: 600 }}>
                              ❄️ Frozen by {t.frozenBy || 'Rival Team'} ({remainingMins}m / {remainingSecs}s remaining)
                            </span>
                          ) : (
                            <span style={{ color: 'var(--txt-dim)' }}>Workspace operating normally</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isFrozen ? (
                        <button
                          className="btn-primary"
                          onClick={() => handleClearTeamFreeze(t.name)}
                          style={{
                            fontSize: '12px',
                            padding: '6px 14px',
                            background: '#58a6ff',
                            borderColor: '#58a6ff',
                            color: '#000000',
                            fontWeight: 700
                          }}
                        >
                          <Snowflake size={13} /> Clear Freeze
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--txt-dim)' }}>
                          No freeze active
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* BID PRICE UNLOCK MODAL                                       */}
      {/* ============================================================ */}
      {unlockModal && (
        <div
          className="ov"
          style={{
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            position: 'fixed',
            inset: 0,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !unlockSubmitting) {
              setUnlockModal(null);
            }
          }}
        >
          <div
            className="box"
            style={{
              maxWidth: '440px',
              width: '100%',
              background: '#0d111c',
              border: '1px solid rgba(88, 166, 255, 0.3)',
              borderRadius: '14px',
              padding: '26px 28px',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(88, 166, 255, 0.15)',
                  border: '1px solid rgba(88, 166, 255, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#58a6ff'
                }}>
                  <Unlock size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                  Unlock Problem
                </h3>
              </div>
              <button
                onClick={() => !unlockSubmitting && setUnlockModal(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--txt-dim)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Context Info */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '14px 16px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '13px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--txt-muted)' }}>Problem:</span>
                <span style={{ fontWeight: 700, color: '#ffffff' }}>
                  {unlockModal.problem.id} {unlockModal.problem.title}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--txt-muted)' }}>Team:</span>
                <span style={{ fontWeight: 700, color: '#58a6ff' }}>
                  {unlockModal.team.name}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--txt-muted)' }}>Team ByteCoins:</span>
                <span style={{ fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  {unlockModal.team.balance ?? 1000} ByteCoins
                </span>
              </div>
            </div>

            {/* Bid Input */}
            {(() => {
              const currentBalance = unlockModal.team.balance ?? 1000;
              const rawBid = unlockModal.bidPrice;
              const bidNum = Number(rawBid);
              const isNumeric = rawBid !== '' && !isNaN(bidNum);
              const isPositive = isNumeric && bidNum > 0;
              const isOverBalance = isNumeric && bidNum > currentBalance;
              const remainingBalance = isNumeric ? currentBalance - bidNum : currentBalance;
              const isValid = isPositive && !isOverBalance;

              return (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--txt-muted)', marginBottom: '8px' }}>
                      Enter Bid Price
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="1"
                        max={currentBalance}
                        placeholder="e.g. 100"
                        value={unlockModal.bidPrice}
                        onChange={(e) => setUnlockModal({ ...unlockModal, bidPrice: e.target.value })}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '10px 90px 10px 14px',
                          fontSize: '15px',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${isOverBalance ? '#ff7b72' : 'rgba(88, 166, 255, 0.4)'}`,
                          color: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        right: '14px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#58a6ff'
                      }}>
                        ByteCoins
                      </span>
                    </div>

                    {/* Validation Alerts */}
                    {isOverBalance && (
                      <div style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#ff7b72',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <AlertTriangle size={14} />
                        <span>Insufficient ByteCoins</span>
                      </div>
                    )}

                    {rawBid !== '' && !isPositive && (
                      <div style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#ff7b72'
                      }}>
                        Bid price must be greater than 0.
                      </div>
                    )}
                  </div>

                  {/* Remaining Balance Display */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '22px',
                    fontSize: '13px'
                  }}>
                    <span style={{ color: 'var(--txt-muted)' }}>Remaining Balance:</span>
                    <span style={{
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      color: isOverBalance ? '#ff7b72' : '#3fb950',
                      fontSize: '14px'
                    }}>
                      {isOverBalance ? '0' : remainingBalance} ByteCoins
                    </span>
                  </div>

                  {/* Modal Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setUnlockModal(null)}
                      disabled={unlockSubmitting}
                      style={{ padding: '9px 18px', fontSize: '13px', borderRadius: '8px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleConfirmUnlock}
                      disabled={!isValid || unlockSubmitting}
                      style={{
                        padding: '9px 20px',
                        fontSize: '13px',
                        borderRadius: '8px',
                        opacity: isValid && !unlockSubmitting ? 1 : 0.45,
                        cursor: isValid && !unlockSubmitting ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {unlockSubmitting ? 'Unlocking...' : 'Unlock Problem'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact card styling
const compactCardStyle = {
  background: 'rgba(13, 17, 28, 0.75)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '10px',
  padding: '14px 16px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
};

const compactLabelStyle = {
  fontSize: '11px',
  color: 'var(--txt-muted)',
  fontWeight: 700,
  letterSpacing: '0.5px'
};

const compactValueStyle = {
  fontSize: '20px',
  fontWeight: 800,
  fontFamily: 'var(--font-mono)',
  color: '#ffffff',
  lineHeight: 1.2,
  marginBottom: '3px'
};

const compactSubtextStyle = {
  fontSize: '11px',
  color: 'var(--txt-dim)',
  lineHeight: 1.3
};
