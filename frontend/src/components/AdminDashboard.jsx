import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Trophy,
  Lock,
  Unlock,
  Lightbulb,
  Zap,
  LogOut,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Coins,
  Users,
  Eye,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Snowflake,
  ShieldAlert
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
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard' | 'problems' | 'hints' | 'sabotage'
  const [teams, setTeams] = useState([]);
  const [problems, setProblems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeamName, setSelectedTeamName] = useState('ALL');
  const [notification, setNotification] = useState(null);

  // Leaderboard filters & sorting
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [leaderboardSort, setLeaderboardSort] = useState('score'); // 'score' | 'solved' | 'balance' | 'name'

  // Problems tab filters
  const [problemSearch, setProblemSearch] = useState('');
  const [problemDiffFilter, setProblemDiffFilter] = useState('ALL');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminOverview();
      setTeams(data.teams || []);
      setProblems(data.problems || []);
      setTransactions(data.transactions || []);
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
    }, 4000);
  };

  // Selected Team Object (if specific team selected)
  const currentTeam = selectedTeamName !== 'ALL'
    ? teams.find(t => (t.name || '').toUpperCase() === selectedTeamName.toUpperCase()) || null
    : null;

  // --- ACTIONS: PROBLEM UNLOCK MANAGEMENT ---
  const handleToggleProblemUnlock = async (problemId, currentlyUnlocked) => {
    try {
      if (currentlyUnlocked) {
        await adminLockProblem({ teamName: selectedTeamName, problemId });
        showToast(`🔒 Problem ${problemId} locked for ${selectedTeamName === 'ALL' ? 'all teams' : selectedTeamName}.`);
      } else {
        await adminUnlockProblem({ teamName: selectedTeamName, problemId });
        showToast(`🔓 Problem ${problemId} unlocked for ${selectedTeamName === 'ALL' ? 'all teams' : selectedTeamName}!`);
      }
      loadData();
    } catch (err) {
      showToast(err.message || 'Action failed', false);
    }
  };

  const handleBulkProblemAction = async (shouldUnlock) => {
    const actionWord = shouldUnlock ? 'unlock' : 'lock';
    if (!window.confirm(`Are you sure you want to ${actionWord} ALL problems for ${selectedTeamName === 'ALL' ? 'ALL teams' : selectedTeamName}?`)) {
      return;
    }
    try {
      for (const prob of problems) {
        if (shouldUnlock) {
          await adminUnlockProblem({ teamName: selectedTeamName, problemId: prob.id });
        } else {
          await adminLockProblem({ teamName: selectedTeamName, problemId: prob.id });
        }
      }
      showToast(`Successfully ${shouldUnlock ? 'unlocked' : 'locked'} all problems for ${selectedTeamName}!`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Bulk update failed', false);
    }
  };

  // --- ACTIONS: HINT CARD MANAGEMENT ---
  const handleToggleHintCard = async (shouldUnlock) => {
    try {
      if (shouldUnlock) {
        await adminUnlockCard({ teamName: selectedTeamName, cardType: 'HINT' });
        showToast(`💡 Hint Pass Card unlocked for ${selectedTeamName === 'ALL' ? 'all teams' : selectedTeamName}!`);
      } else {
        await adminLockCard({ teamName: selectedTeamName, cardType: 'HINT' });
        showToast(`🔒 Hint Pass Card locked for ${selectedTeamName === 'ALL' ? 'all teams' : selectedTeamName}.`);
      }
      loadData();
    } catch (err) {
      showToast(err.message || 'Card update failed', false);
    }
  };

  const handleGrantHintPass = async (amount = 1) => {
    try {
      const targetTeam = selectedTeamName === 'ALL' ? (teams[0]?.name || 'Synora') : selectedTeamName;
      await adminGrantCardPass({ teamName: targetTeam, cardType: 'HINT', amount });
      showToast(`💡 Granted +${amount} Hint Pass(es) to team ${targetTeam}!`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to grant pass', false);
    }
  };

  const handleRevealProblemHint = async (problemId) => {
    try {
      const targetTeam = selectedTeamName === 'ALL' ? (teams[0]?.name || 'Synora') : selectedTeamName;
      await adminRevealProblemHint({ teamName: targetTeam, problemId });
      showToast(`💡 Revealed hint for problem ${problemId} to team ${targetTeam}!`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to reveal hint', false);
    }
  };

  // --- ACTIONS: SABOTAGE CARD MANAGEMENT ---
  const handleToggleSabotageCard = async (shouldUnlock) => {
    try {
      if (shouldUnlock) {
        await adminUnlockCard({ teamName: selectedTeamName, cardType: 'SABOTAGE' });
        showToast(`⚡ Sabotage Card unlocked for ${selectedTeamName === 'ALL' ? 'all teams' : selectedTeamName}!`);
      } else {
        await adminLockCard({ teamName: selectedTeamName, cardType: 'SABOTAGE' });
        showToast(`🔒 Sabotage Card locked for ${selectedTeamName === 'ALL' ? 'all teams' : selectedTeamName}.`);
      }
      loadData();
    } catch (err) {
      showToast(err.message || 'Card update failed', false);
    }
  };

  const handleGrantSabotageCard = async (amount = 1) => {
    try {
      const targetTeam = selectedTeamName === 'ALL' ? (teams[0]?.name || 'Synora') : selectedTeamName;
      await adminGrantCardPass({ teamName: targetTeam, cardType: 'SABOTAGE', amount });
      showToast(`⚡ Granted +${amount} Sabotage Card(s) to team ${targetTeam}!`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to grant sabotage card', false);
    }
  };

  const handleClearTeamFreeze = async (teamName) => {
    try {
      await adminClearFreeze({ teamName });
      showToast(`❄️ Sabotage freeze cleared for team ${teamName}!`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to clear freeze', false);
    }
  };

  // --- STATS COMPUTATION FOR TOP METRICS ---
  const totalTeamsCount = teams.length;
  const activeTeamsCount = teams.filter(t => !t.isLocked).length;

  // Problems unlocked count (across all teams or for selected team)
  let problemsUnlockedCount = 0;
  if (selectedTeamName === 'ALL') {
    const allUnlockedSet = new Set();
    teams.forEach(t => (t.unlocked || []).forEach(id => allUnlockedSet.add(id)));
    problemsUnlockedCount = allUnlockedSet.size;
  } else {
    problemsUnlockedCount = (currentTeam?.unlocked || []).length;
  }

  // Hints unlocked count
  const hintsUnlockedCount = teams.filter(
    t => (t.unlockedCards || []).includes('HINT') || t.hintUnlocked || (t.hintPassesCount || 0) > 0
  ).length;

  // Sabotages unlocked count
  const sabotagesUnlockedCount = teams.filter(
    t => (t.unlockedCards || []).includes('SABOTAGE') || t.sabotageUnlocked || (t.sabotageCardsCount || 0) > 0
  ).length;

  // Check if current target has hint/sabotage unlocked
  const isHintCardUnlockedForTarget = selectedTeamName === 'ALL'
    ? teams.length > 0 && teams.every(t => (t.unlockedCards || []).includes('HINT') || t.hintUnlocked)
    : Boolean((currentTeam?.unlockedCards || []).includes('HINT') || currentTeam?.hintUnlocked);

  const isSabotageCardUnlockedForTarget = selectedTeamName === 'ALL'
    ? teams.length > 0 && teams.every(t => (t.unlockedCards || []).includes('SABOTAGE') || t.sabotageUnlocked)
    : Boolean((currentTeam?.unlockedCards || []).includes('SABOTAGE') || currentTeam?.sabotageUnlocked);

  // Leaderboard sorting & filtering
  const filteredLeaderboard = [...teams]
    .filter(t => (t.name || '').toLowerCase().includes(leaderboardSearch.toLowerCase()))
    .sort((a, b) => {
      if (leaderboardSort === 'score') return (b.score || 0) - (a.score || 0);
      if (leaderboardSort === 'solved') return ((b.solved || []).length) - ((a.solved || []).length);
      if (leaderboardSort === 'balance') return (b.balance ?? 1000) - (a.balance ?? 1000);
      if (leaderboardSort === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

  // Problems tab filtering
  const filteredProblems = problems.filter(prob => {
    const matchesSearch =
      prob.id.toLowerCase().includes(problemSearch.toLowerCase()) ||
      prob.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
      (prob.cat || '').toLowerCase().includes(problemSearch.toLowerCase());

    let isUnlocked = false;
    if (selectedTeamName === 'ALL') {
      isUnlocked = teams.some(t => (t.unlocked || []).includes(prob.id));
    } else {
      isUnlocked = (currentTeam?.unlocked || []).includes(prob.id);
    }

    const matchesDiff =
      problemDiffFilter === 'ALL' ||
      prob.diff.toUpperCase() === problemDiffFilter ||
      (problemDiffFilter === 'UNLOCKED' && isUnlocked) ||
      (problemDiffFilter === 'LOCKED' && !isUnlocked);

    return matchesSearch && matchesDiff;
  });

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
        background: 'rgba(9, 13, 24, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 50,
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand & Admin Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
            background: 'rgba(88, 166, 255, 0.15)',
            border: '1px solid rgba(88, 166, 255, 0.35)',
            color: '#58a6ff',
            letterSpacing: '0.5px'
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

          {/* Switch to Team Workspace (if needed to preview) */}
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
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
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

        {/* 3. TOP SUMMARY CARDS (5 Cards per specification) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '24px'
        }}>
          {/* 1. Total Teams */}
          <div style={summaryCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={summaryLabelStyle}>Total Teams</span>
              <Users size={16} color="var(--txt-dim)" />
            </div>
            <div style={summaryValueStyle}>{totalTeamsCount}</div>
            <div style={summarySubtextStyle}>Registered contest participants</div>
          </div>

          {/* 2. Active Teams */}
          <div style={summaryCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={summaryLabelStyle}>Active Teams</span>
              <CheckCircle2 size={16} color="#3fb950" />
            </div>
            <div style={{ ...summaryValueStyle, color: '#3fb950' }}>{activeTeamsCount}</div>
            <div style={summarySubtextStyle}>Currently participating without lockout</div>
          </div>

          {/* 3. Problems Unlocked */}
          <div style={summaryCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={summaryLabelStyle}>Problems Unlocked</span>
              <Unlock size={16} color="#58a6ff" />
            </div>
            <div style={{ ...summaryValueStyle, color: '#58a6ff' }}>{problemsUnlockedCount}</div>
            <div style={summarySubtextStyle}>
              {selectedTeamName === 'ALL' ? 'Unique problems open across teams' : `Unlocked for ${selectedTeamName}`}
            </div>
          </div>

          {/* 4. Hints Unlocked */}
          <div style={summaryCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={summaryLabelStyle}>Hints Unlocked</span>
              <Lightbulb size={16} color="#d29922" />
            </div>
            <div style={{ ...summaryValueStyle, color: '#d29922' }}>{hintsUnlockedCount}</div>
            <div style={summarySubtextStyle}>Teams granted Hint Pass access</div>
          </div>

          {/* 5. Sabotages Unlocked */}
          <div style={summaryCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={summaryLabelStyle}>Sabotages Unlocked</span>
              <Zap size={16} color="#ff7b72" />
            </div>
            <div style={{ ...summaryValueStyle, color: '#ff7b72' }}>{sabotagesUnlockedCount}</div>
            <div style={summarySubtextStyle}>Teams granted Sabotage weapons</div>
          </div>
        </div>

        {/* 4. NAVIGATION TABS + TEAM SCOPE SELECTOR */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          {/* Main Navigation Tabs */}
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

          {/* Team Scope Selector (Applies to Problems, Hints, Sabotage) */}
          {activeTab !== 'leaderboard' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--txt-muted)', fontWeight: 600 }}>
                Target Scope:
              </span>
              <select
                value={selectedTeamName}
                onChange={(e) => setSelectedTeamName(e.target.value)}
                style={{
                  fontSize: '13px',
                  padding: '6px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontWeight: 600
                }}
              >
                <option value="ALL">🌐 All Teams (Global Contest)</option>
                {teams.map(t => (
                  <option key={t.name} value={t.name}>
                    👥 {t.name} (Score: {t.score || 0}, Solved: {(t.solved || []).length})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 5. TAB CONTENT PANELS */}

        {/* TAB 1: LEADERBOARD MONITORING */}
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
                    <th style={{ padding: '12px 16px' }}>Team Name / ID</th>
                    <th style={{ padding: '12px 16px' }}>Score</th>
                    <th style={{ padding: '12px 16px' }}>Solved</th>
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
                    const violationsCount = (team.violations || []).length;
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
                        <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: '#58a6ff', fontWeight: 600 }}>
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
                              <Lock size={12} /> Proctor Locked
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
                          {violationsCount > 0 && (
                            <span style={{ marginLeft: '6px', fontSize: '11px', color: '#ff7b72' }}>
                              ({violationsCount} flags)
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

        {/* TAB 2: PROBLEM UNLOCK MANAGEMENT */}
        {activeTab === 'problems' && (
          <div>
            {/* Context Notice */}
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: 'rgba(88, 166, 255, 0.08)',
              border: '1px solid rgba(88, 166, 255, 0.2)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <b style={{ color: '#58a6ff' }}>Admin Problem Unlock Control:</b>{' '}
                <span style={{ color: '#c9d1d9' }}>
                  Targeting <b>{selectedTeamName === 'ALL' ? 'ALL TEAMS' : selectedTeamName}</b>. Teams cannot unlock problems on their own. Only you decide when each problem is unlocked.
                </span>
              </div>

              {/* Bulk Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-primary"
                  onClick={() => handleBulkProblemAction(true)}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  <Unlock size={13} /> Unlock All
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => handleBulkProblemAction(false)}
                  style={{ fontSize: '12px', padding: '6px 12px', color: '#ff7b72', borderColor: 'rgba(248, 81, 73, 0.3)' }}
                >
                  <Lock size={13} /> Lock All
                </button>
              </div>
            </div>

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
                  placeholder="Filter problems by ID, title, topic..."
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
                  { id: 'EASY', label: 'Easy' },
                  { id: 'MEDIUM', label: 'Medium' },
                  { id: 'HARD', label: 'Hard' },
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
                        padding: '4px 10px',
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

            {/* Problem List with 1-Click Unlock / Lock Controls */}
            <div style={{
              background: 'rgba(13, 17, 28, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              {filteredProblems.map((prob) => {
                let isUnlocked = false;
                let unlockedTeamsCount = 0;

                if (selectedTeamName === 'ALL') {
                  const uTeams = teams.filter(t => (t.unlocked || []).includes(prob.id));
                  unlockedTeamsCount = uTeams.length;
                  isUnlocked = unlockedTeamsCount > 0;
                } else {
                  isUnlocked = (currentTeam?.unlocked || []).includes(prob.id);
                }

                const diffColor = prob.diff === 'Hard' ? '#ff7b72' : prob.diff === 'Medium' ? '#d29922' : '#3fb950';

                return (
                  <div
                    key={prob.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
                            {prob.id} &nbsp;{prob.title}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--txt-muted)', marginTop: '2px' }}>
                          <span style={{ color: diffColor, fontWeight: 600 }}>{prob.diff}</span>
                          <span>•</span>
                          <span>{prob.diff === 'Hard' ? 400 : prob.diff === 'Medium' ? 300 : 200} pts</span>
                          {selectedTeamName === 'ALL' && (
                            <>
                              <span>•</span>
                              <span style={{ color: isUnlocked ? '#58a6ff' : 'var(--txt-dim)' }}>
                                {unlockedTeamsCount} of {teams.length} teams unlocked
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Explicit Unlock / Lock Control */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: isUnlocked ? 'rgba(63, 185, 80, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${isUnlocked ? 'rgba(63, 185, 80, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                        color: isUnlocked ? '#3fb950' : 'var(--txt-dim)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {isUnlocked ? <><Unlock size={12} /> UNLOCKED</> : <><Lock size={12} /> LOCKED</>}
                      </span>

                      {isUnlocked ? (
                        <button
                          className="btn-ghost"
                          onClick={() => handleToggleProblemUnlock(prob.id, true)}
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
                          onClick={() => handleToggleProblemUnlock(prob.id, false)}
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
          </div>
        )}

        {/* TAB 3: HINT CARD MANAGEMENT */}
        {activeTab === 'hints' && (
          <div>
            {/* Card Status Hero Banner */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(30, 80, 180, 0.12) 0%, rgba(13, 17, 28, 0.85) 100%)',
              border: `1px solid ${isHintCardUnlockedForTarget ? 'rgba(56, 139, 253, 0.35)' : 'rgba(255, 255, 255, 0.1)'}`,
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
                  background: isHintCardUnlockedForTarget ? 'rgba(56, 139, 253, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${isHintCardUnlockedForTarget ? 'rgba(56, 139, 253, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isHintCardUnlockedForTarget ? '#58a6ff' : 'var(--txt-dim)'
                }}>
                  <Lightbulb size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                    Hint Pass Card Authority
                  </h3>
                  <div style={{ fontSize: '13px', color: 'var(--txt-muted)' }}>
                    Current State for <b>{selectedTeamName === 'ALL' ? 'All Teams' : selectedTeamName}</b>:{' '}
                    <span style={{ color: isHintCardUnlockedForTarget ? '#3fb950' : '#ff7b72', fontWeight: 700 }}>
                      {isHintCardUnlockedForTarget ? '🔓 UNLOCKED' : '🔒 LOCKED'}
                    </span>
                    {' · Teams have no password unlock workaround.'}
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

                {isHintCardUnlockedForTarget ? (
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

            {/* Problem-Specific Hint Revealing Section */}
            <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Problem Algorithmic Hints Dispatch
            </h4>

            <div style={{
              background: 'rgba(13, 17, 28, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              {problems.map((prob) => {
                const targetTeam = selectedTeamName === 'ALL' ? teams[0] : currentTeam;
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
                            ✓ Hint revealed to {targetTeam?.name || 'team'}
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
                          <Eye size={13} /> Reveal Hint to Team
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: SABOTAGE CARD MANAGEMENT */}
        {activeTab === 'sabotage' && (
          <div>
            {/* Sabotage Card Status Hero Banner */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(180, 25, 60, 0.12) 0%, rgba(20, 10, 16, 0.85) 100%)',
              border: `1px solid ${isSabotageCardUnlockedForTarget ? 'rgba(248, 81, 73, 0.35)' : 'rgba(255, 255, 255, 0.1)'}`,
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
                  background: isSabotageCardUnlockedForTarget ? 'rgba(248, 81, 73, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${isSabotageCardUnlockedForTarget ? 'rgba(248, 81, 73, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSabotageCardUnlockedForTarget ? '#ff7b72' : 'var(--txt-dim)'
                }}>
                  <Zap size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                    Sabotage Card Authority
                  </h3>
                  <div style={{ fontSize: '13px', color: 'var(--txt-muted)' }}>
                    Current State for <b>{selectedTeamName === 'ALL' ? 'All Teams' : selectedTeamName}</b>:{' '}
                    <span style={{ color: isSabotageCardUnlockedForTarget ? '#3fb950' : '#ff7b72', fontWeight: 700 }}>
                      {isSabotageCardUnlockedForTarget ? '🔓 UNLOCKED' : '🔒 LOCKED'}
                    </span>
                    {' · Teams cannot unlock without admin permission.'}
                  </div>
                </div>
              </div>

              {/* Master Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  className="btn-ghost"
                  onClick={() => handleGrantSabotageCard(1)}
                  title="Award 1 free sabotage weapon to team inventory"
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  + Grant 1 Sabotage Card
                </button>

                {isSabotageCardUnlockedForTarget ? (
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
            <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Active Sabotage Freezes & Emergency Unfreeze
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
                          Inventory: {t.sabotageCardsCount || 0} sabotage cards · {isFrozen ? (
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
                          <Snowflake size={13} /> Clear Freeze Now
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
    </div>
  );
}

// Styling helpers
const summaryCardStyle = {
  background: 'rgba(13, 17, 28, 0.75)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  padding: '16px 18px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
};

const summaryLabelStyle = {
  fontSize: '12px',
  color: 'var(--txt-muted)',
  fontWeight: 600,
  letterSpacing: '0.2px'
};

const summaryValueStyle = {
  fontSize: '24px',
  fontWeight: 800,
  fontFamily: 'var(--font-mono)',
  color: '#ffffff',
  lineHeight: 1.2,
  marginBottom: '4px'
};

const summarySubtextStyle = {
  fontSize: '11px',
  color: 'var(--txt-dim)',
  lineHeight: 1.3
};
