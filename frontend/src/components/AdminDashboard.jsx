import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
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
  History,
  QrCode,
  UserCheck,
  UserX,
  Play,
  Pause,
  Copy,
  Clock,
  ShieldCheck,
  ArrowRight,
  Square,
  FileDown,
  Image,
  CheckSquare
} from 'lucide-react';
import {
  fetchAdminOverview,
  adminUnlockProblem,
  adminUnlockCard,
  adminGrantCardPass,
  adminRevealProblemHint,
  adminClearFreeze,
  adminLogout,
  fetchEventStatus,
  updateEventStatus,
  fetchAdminRegistrations,
  approveTeamRegistration,
  rejectTeamRegistration,
  startEventSession,
  endEventSession,
  fetchArchivedEvents,
  batchAcceptRegistrations
} from '../services/api';
import {
  exportLeaderboardToPDF,
  exportLeaderboardToPNG
} from '../utils/leaderboardExport';

export function AdminDashboard({ onLogout, onSwitchToWorkspace }) {
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard' | 'problems' | 'hints' | 'sabotage' | 'registrations'
  const [teams, setTeams] = useState([]);
  const [problems, setProblems] = useState([]);
  const [unlockHistory, setUnlockHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeamName, setSelectedTeamName] = useState('');
  const [notification, setNotification] = useState(null);

  // Event controls & registrations
  const [eventState, setEventState] = useState({ status: 'REGISTRATION_OPEN', startedAt: null });
  const [registrations, setRegistrations] = useState([]);
  const [regFilter, setRegFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [regSearch, setRegSearch] = useState('');
  const [rejectModal, setRejectModal] = useState(null); // { reg, reason: '' }
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [eventConfirmModal, setEventConfirmModal] = useState(null);
  const [eventActionLoading, setEventActionLoading] = useState(false);

  // Start Event Session Modal state
  const [showStartEventModal, setShowStartEventModal] = useState(false);
  const [selectedParticipatingTeams, setSelectedParticipatingTeams] = useState(new Set());
  const [startEventSearch, setStartEventSearch] = useState('');
  const [startEventStatusFilter, setStartEventStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [startEventConfirmModal, setStartEventConfirmModal] = useState(false);
  const [eventNameInput, setEventNameInput] = useState('QUBIT Code Auctioneer');
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Leaderboard filters
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [leaderboardSort, setLeaderboardSort] = useState('score'); // 'score' | 'solved' | 'balance' | 'name'

  // Problems tab filters
  const [problemSearch, setProblemSearch] = useState('');
  const [problemDiffFilter, setProblemDiffFilter] = useState('ALL');

  // Unified Bid Price Unlock Modal
  // unlockModal: { type: 'PROBLEM' | 'HINT' | 'SABOTAGE', id, title, team, bidPrice }
  const [unlockModal, setUnlockModal] = useState(null);
  const [unlockSubmitting, setUnlockSubmitting] = useState(false);

  const regUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#register`
    : '';

  useEffect(() => {
    if (regUrl && showQrModal) {
      QRCode.toDataURL(regUrl, {
        width: 320,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' }
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('QR code error:', err));
    }
  }, [regUrl, showQrModal]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminOverview();
      const loadedTeams = data.teams || [];
      setTeams(loadedTeams);
      setProblems(data.problems || []);
      setUnlockHistory(data.unlockHistory || []);
      if (data.eventState) setEventState(data.eventState);
      if (data.registrations) setRegistrations(data.registrations);

      // If no team is selected yet, default to the first team
      setSelectedTeamName(prev => {
        if (prev && loadedTeams.some(t => t.name === prev)) return prev;
        return loadedTeams[0]?.name || '';
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

  // --- MODAL TRIGGERS ---
  const handleOpenProblemUnlockModal = (problem) => {
    if (!targetTeam) {
      showToast('Please select a target team first.', false);
      return;
    }
    setUnlockModal({
      type: 'PROBLEM',
      id: problem.id,
      title: `${problem.id} ${problem.title}`,
      team: targetTeam,
      bidPrice: '100'
    });
  };

  const handleOpenCardUnlockModal = (cardType) => {
    if (!targetTeam) {
      showToast('Please select a target team first.', false);
      return;
    }
    const isHint = cardType === 'HINT';
    setUnlockModal({
      type: isHint ? 'HINT' : 'SABOTAGE',
      id: cardType,
      title: isHint ? 'Hint Pass' : 'Sabotage Card',
      team: targetTeam,
      bidPrice: '40'
    });
  };

  // --- CONFIRM UNLOCK (DEDUCTION & AUDIT LOG) ---
  const handleConfirmUnlock = async () => {
    if (!unlockModal) return;
    const { type, id, title, team, bidPrice } = unlockModal;

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
      if (type === 'PROBLEM') {
        await adminUnlockProblem({
          teamName: team.name,
          problemId: id,
          bidPrice: bidNum
        });
        showToast(`🔓 Unlocked problem ${id} for ${team.name}! Deducted ${bidNum} ByteCoins.`);
      } else if (type === 'HINT') {
        await adminUnlockCard({
          teamName: team.name,
          cardType: 'HINT',
          bidPrice: bidNum
        });
        showToast(`💡 Hint Pass unlocked for ${team.name}! Deducted ${bidNum} ByteCoins.`);
      } else if (type === 'SABOTAGE') {
        await adminUnlockCard({
          teamName: team.name,
          cardType: 'SABOTAGE',
          bidPrice: bidNum
        });
        showToast(`⚡ Sabotage Card unlocked for ${team.name}! Deducted ${bidNum} ByteCoins.`);
      }

      setUnlockModal(null);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to unlock', false);
    } finally {
      setUnlockSubmitting(false);
    }
  };

  // --- PASS / CARD INVENTORY ACTIONS ---
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

  // Event state change confirmation triggers
  const promptCloseRegistration = () => {
    setEventConfirmModal({
      targetStatus: 'REGISTRATION_CLOSED',
      title: 'Close Public Registration?',
      description: 'Stop accepting new public registrations. Existing registrations and pending approvals will be preserved for review.',
      confirmText: 'Close Registration',
      confirmColor: '#d29922'
    });
  };

  const promptStartEvent = () => {
    setShowStartEventModal(true);
  };

  const promptEndEvent = () => {
    setEventConfirmModal({
      actionType: 'END_EVENT',
      targetStatus: 'EVENT_ENDED',
      title: 'End Event & Conclude Competition?',
      description: 'Are you sure you want to end the current event? Active bidding and problem unlocking will be halted. The final leaderboard, team scores, ByteCoins balances, and auction history will be safely archived. All registered team accounts and credentials will be preserved for the next event, and a fresh 1,000 ByteCoins balance will be assigned when the next event begins.',
      confirmText: 'End Event',
      confirmColor: '#da3633'
    });
  };

  const promptReopenRegistration = () => {
    setEventConfirmModal({
      targetStatus: 'REGISTRATION_OPEN',
      title: 'Reopen Registration?',
      description: 'Allow new teams to submit registrations again before the event starts.',
      confirmText: 'Reopen Registration',
      confirmColor: '#38bdf8'
    });
  };

  const handleConfirmEventAction = async () => {
    if (!eventConfirmModal) return;
    setEventActionLoading(true);
    try {
      if (eventConfirmModal.targetStatus === 'EVENT_ENDED' || eventConfirmModal.actionType === 'END_EVENT') {
        const result = await endEventSession();
        setEventState(result.eventState || { status: 'EVENT_ENDED' });
        showToast('🏁 Event concluded! Final leaderboard and results archived safely.', true);
      } else {
        const updated = await updateEventStatus(eventConfirmModal.targetStatus);
        setEventState(updated);
        showToast(`Event status updated: ${eventConfirmModal.targetStatus.replace(/_/g, ' ')}`, true);
      }
      setEventConfirmModal(null);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update event status', false);
    } finally {
      setEventActionLoading(false);
    }
  };

  const handleApproveRegistration = async (reg) => {
    setActionLoadingId(reg.id);
    try {
      await approveTeamRegistration(reg.id);
      showToast(`Team "${reg.teamName}" approved! Initialized with ₹1,000 ByteCoins.`, true);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to approve team registration', false);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModal?.reg) return;
    const { reg, reason } = rejectModal;
    setActionLoadingId(reg.id);
    try {
      await rejectTeamRegistration(reg.id, reason);
      showToast(`Registration for "${reg.teamName}" declined.`, true);
      setRejectModal(null);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to reject registration', false);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCopyRegLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(regUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const pendingRegistrationsCount = registrations.filter(r => r.status === 'PENDING').length;

  // Pre-select approved teams when Start Event Modal opens
  useEffect(() => {
    if (showStartEventModal) {
      const approvedNames = (teams || []).map(t => t.name);
      setSelectedParticipatingTeams(new Set(approvedNames));
      setStartEventSearch('');
      setStartEventStatusFilter('ALL');
    }
  }, [showStartEventModal, teams]);

  // Unified list of all registered teams for Start Event selection modal
  const allRegisteredTeams = React.useMemo(() => {
    const map = new Map();
    // 1. All submitted registrations
    (registrations || []).forEach(reg => {
      map.set(reg.teamName.toLowerCase(), {
        id: reg.id,
        teamName: reg.teamName,
        leaderName: reg.leaderName || (reg.members && reg.members[0]?.name) || 'Leader',
        leaderContact: reg.leaderContact || '',
        memberCount: reg.memberCount || (reg.members || []).length || 1,
        members: reg.members || [],
        status: reg.status || 'PENDING',
        rejectionReason: reg.rejectionReason || '',
        createdAt: reg.createdAt,
        registration: reg,
        isApproved: reg.status === 'APPROVED'
      });
    });
    // 2. Approved teams
    (teams || []).forEach(t => {
      const key = t.name.toLowerCase();
      if (map.has(key)) {
        const item = map.get(key);
        item.status = 'APPROVED';
        item.isApproved = true;
        item.balance = t.balance;
        item.score = t.score;
      } else {
        map.set(key, {
          id: `TEAM-${t.name}`,
          teamName: t.name,
          leaderName: t.captainName || (t.members && t.members[0]?.name) || 'Leader',
          leaderContact: (t.members && t.members[0]?.phone) || '',
          memberCount: t.size || (t.members || []).length || 1,
          members: t.members || [],
          status: 'APPROVED',
          rejectionReason: '',
          createdAt: t.createdAt || new Date().toISOString(),
          isApproved: true,
          balance: t.balance,
          score: t.score
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      const order = { PENDING: 0, APPROVED: 1, REJECTED: 2 };
      const diff = (order[a.status] ?? 3) - (order[b.status] ?? 3);
      if (diff !== 0) return diff;
      return a.teamName.localeCompare(b.teamName);
    });
  }, [registrations, teams]);

  const filteredRegisteredTeams = React.useMemo(() => {
    return allRegisteredTeams.filter(t => {
      const matchesFilter =
        startEventStatusFilter === 'ALL' ||
        t.status === startEventStatusFilter;
      const q = startEventSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.teamName.toLowerCase().includes(q) ||
        t.leaderName.toLowerCase().includes(q) ||
        t.leaderContact.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [allRegisteredTeams, startEventStatusFilter, startEventSearch]);

  const selectedAcceptedCount = React.useMemo(() => {
    return allRegisteredTeams.filter(t =>
      selectedParticipatingTeams.has(t.teamName) && t.status === 'APPROVED'
    ).length;
  }, [allRegisteredTeams, selectedParticipatingTeams]);

  const selectedPendingCount = React.useMemo(() => {
    return allRegisteredTeams.filter(t =>
      selectedParticipatingTeams.has(t.teamName) && t.status === 'PENDING'
    ).length;
  }, [allRegisteredTeams, selectedParticipatingTeams]);

  const handleToggleTeam = (teamName) => {
    setSelectedParticipatingTeams(prev => {
      const next = new Set(prev);
      if (next.has(teamName)) {
        next.delete(teamName);
      } else {
        next.add(teamName);
      }
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    setSelectedParticipatingTeams(prev => {
      const next = new Set(prev);
      filteredRegisteredTeams.forEach(t => next.add(t.teamName));
      return next;
    });
  };

  const handleDeselectAllVisible = () => {
    setSelectedParticipatingTeams(prev => {
      const next = new Set(prev);
      filteredRegisteredTeams.forEach(t => next.delete(t.teamName));
      return next;
    });
  };

  const handleAcceptSelectedTeams = async () => {
    const pendingSelected = allRegisteredTeams.filter(t =>
      selectedParticipatingTeams.has(t.teamName) && t.status === 'PENDING' && t.registration?.id
    );

    if (pendingSelected.length === 0) {
      showToast('No pending teams selected to accept.', false);
      return;
    }

    setBatchActionLoading(true);
    try {
      const regIds = pendingSelected.map(t => t.registration.id);
      await batchAcceptRegistrations(regIds);
      showToast(`Successfully accepted ${pendingSelected.length} team(s)!`, true);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to accept selected teams', false);
    } finally {
      setBatchActionLoading(false);
    }
  };

  const handleInlineAcceptTeam = async (item) => {
    if (!item.registration?.id) return;
    setActionLoadingId(item.id);
    try {
      await approveTeamRegistration(item.registration.id);
      showToast(`Team "${item.teamName}" accepted and approved!`, true);
      setSelectedParticipatingTeams(prev => new Set([...prev, item.teamName]));
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to approve team', false);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePromptStartEventModal = () => {
    const selectedAccepted = allRegisteredTeams.filter(t =>
      selectedParticipatingTeams.has(t.teamName) && t.status === 'APPROVED'
    );
    const selectedPending = allRegisteredTeams.filter(t =>
      selectedParticipatingTeams.has(t.teamName) && t.status === 'PENDING'
    );

    if (selectedPending.length > 0) {
      showToast(`Please accept or deselect the ${selectedPending.length} pending team(s) before starting the event.`, false);
      return;
    }

    if (selectedAccepted.length === 0) {
      showToast('Cannot start event: At least 1 accepted team must be selected.', false);
      return;
    }

    setStartEventConfirmModal(true);
  };

  const handleConfirmStartEventSession = async () => {
    const selectedAcceptedNames = allRegisteredTeams
      .filter(t => selectedParticipatingTeams.has(t.teamName) && t.status === 'APPROVED')
      .map(t => t.teamName);

    if (selectedAcceptedNames.length === 0) {
      showToast('At least 1 accepted team must be selected to start the event.', false);
      return;
    }

    setEventActionLoading(true);
    try {
      const res = await startEventSession({
        participatingTeams: selectedAcceptedNames,
        eventName: eventNameInput || 'QUBIT Code Auctioneer'
      });
      setEventState(res.eventState || { status: 'EVENT_LIVE' });
      showToast(`🚀 Event live! ${selectedAcceptedNames.length} team(s) participating with fresh ₹1,000 ByteCoins.`, true);
      setStartEventConfirmModal(false);
      setShowStartEventModal(false);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to start event', false);
    } finally {
      setEventActionLoading(false);
    }
  };

  // Admin Leaderboard Download Handlers
  const handleAdminDownloadPDF = () => {
    if (filteredLeaderboard.length === 0) {
      showToast('No leaderboard data to export.', false);
      return;
    }
    setExportLoading(true);
    try {
      exportLeaderboardToPDF({
        leaderboard: filteredLeaderboard,
        eventName: 'QUBIT Code Auctioneer'
      });
      showToast('Leaderboard PDF downloaded successfully!', true);
    } catch (err) {
      showToast(err.message || 'Failed to export PDF', false);
    } finally {
      setExportLoading(false);
    }
  };

  const handleAdminDownloadPNG = async () => {
    if (filteredLeaderboard.length === 0) {
      showToast('No leaderboard data to export.', false);
      return;
    }
    setExportLoading(true);
    try {
      await exportLeaderboardToPNG({
        leaderboard: filteredLeaderboard,
        eventName: 'QUBIT Code Auctioneer'
      });
      showToast('Leaderboard PNG downloaded successfully!', true);
    } catch (err) {
      showToast(err.message || 'Failed to export PNG', false);
    } finally {
      setExportLoading(false);
    }
  };

  // Filter registrations
  const filteredRegistrations = registrations
    .filter(r => {
      const matchesFilter =
        regFilter === 'ALL' ||
        r.status === regFilter;
      const q = regSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.teamName.toLowerCase().includes(q) ||
        (r.leaderName && r.leaderName.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

        {/* EVENT CONTROL & REGISTRATION BANNER */}
        <div style={{
          background: 'rgba(13, 17, 28, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Status info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: eventState.status === 'EVENT_ENDED'
                ? 'rgba(148, 163, 184, 0.15)'
                : eventState.status === 'EVENT_LIVE'
                ? 'rgba(188, 140, 255, 0.15)'
                : eventState.status === 'REGISTRATION_CLOSED'
                ? 'rgba(210, 153, 34, 0.15)'
                : 'rgba(56, 189, 248, 0.15)',
              border: `1px solid ${
                eventState.status === 'EVENT_ENDED'
                  ? 'rgba(148, 163, 184, 0.35)'
                  : eventState.status === 'EVENT_LIVE'
                  ? 'rgba(188, 140, 255, 0.35)'
                  : eventState.status === 'REGISTRATION_CLOSED'
                  ? 'rgba(210, 153, 34, 0.35)'
                  : 'rgba(56, 189, 248, 0.35)'
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: eventState.status === 'EVENT_ENDED'
                ? '#94a3b8'
                : eventState.status === 'EVENT_LIVE'
                ? '#bc8cff'
                : eventState.status === 'REGISTRATION_CLOSED'
                ? '#d29922'
                : '#38bdf8'
            }}>
              {eventState.status === 'EVENT_ENDED' ? (
                <Square size={18} />
              ) : eventState.status === 'EVENT_LIVE' ? (
                <Play size={20} />
              ) : eventState.status === 'REGISTRATION_CLOSED' ? (
                <Pause size={20} />
              ) : (
                <ShieldCheck size={20} />
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--txt-muted)', textTransform: 'uppercase' }}>
                  EVENT STATUS:
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  letterSpacing: '0.4px',
                  background: eventState.status === 'EVENT_ENDED'
                    ? 'rgba(148, 163, 184, 0.18)'
                    : eventState.status === 'EVENT_LIVE'
                    ? 'rgba(188, 140, 255, 0.18)'
                    : eventState.status === 'REGISTRATION_CLOSED'
                    ? 'rgba(210, 153, 34, 0.18)'
                    : 'rgba(56, 189, 248, 0.18)',
                  color: eventState.status === 'EVENT_ENDED'
                    ? '#94a3b8'
                    : eventState.status === 'EVENT_LIVE'
                    ? '#bc8cff'
                    : eventState.status === 'REGISTRATION_CLOSED'
                    ? '#d29922'
                    : '#38bdf8',
                  border: `1px solid ${
                    eventState.status === 'EVENT_ENDED'
                      ? 'rgba(148, 163, 184, 0.4)'
                      : eventState.status === 'EVENT_LIVE'
                      ? 'rgba(188, 140, 255, 0.4)'
                      : eventState.status === 'REGISTRATION_CLOSED'
                      ? 'rgba(210, 153, 34, 0.4)'
                      : 'rgba(56, 189, 248, 0.4)'
                  }`
                }}>
                  {eventState.status === 'EVENT_ENDED'
                    ? 'EVENT ENDED'
                    : eventState.status === 'EVENT_LIVE'
                    ? 'EVENT LIVE'
                    : eventState.status === 'REGISTRATION_CLOSED'
                    ? 'REGISTRATION CLOSED'
                    : 'REGISTRATION OPEN'}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#c9d1d9' }}>
                {eventState.status === 'EVENT_ENDED'
                  ? 'The competition has ended. Results and leaderboard are available.'
                  : eventState.status === 'EVENT_LIVE'
                  ? 'The competition is live. Teams can participate in the auction.'
                  : eventState.status === 'REGISTRATION_CLOSED'
                  ? 'Public registration is closed. Review and approve pending teams before starting the event.'
                  : 'Public registration is open. Teams can register.'}
              </div>
            </div>
          </div>

          {/* Action buttons: Start/End Event Toggle & Separate Registration Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Separate Registration Controls */}
            {eventState.status === 'REGISTRATION_OPEN' && (
              <button
                type="button"
                onClick={promptCloseRegistration}
                disabled={eventActionLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: 'rgba(210, 153, 34, 0.16)',
                  border: '1px solid rgba(210, 153, 34, 0.45)',
                  borderRadius: '6px',
                  color: '#d29922',
                  cursor: eventActionLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                <Pause size={13} />
                <span>Close Registration</span>
              </button>
            )}

            {eventState.status === 'REGISTRATION_CLOSED' && (
              <button
                type="button"
                className="btn-ghost"
                onClick={promptReopenRegistration}
                disabled={eventActionLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  padding: '8px 14px',
                  color: '#38bdf8',
                  borderColor: 'rgba(56, 189, 248, 0.3)',
                  background: 'rgba(56, 189, 248, 0.08)',
                  borderRadius: '6px',
                  cursor: eventActionLoading ? 'not-allowed' : 'pointer'
                }}
              >
                <RefreshCw size={13} />
                <span>Reopen Registration</span>
              </button>
            )}

            {/* Primary Start / End Event Toggle */}
            {eventState.status === 'EVENT_LIVE' ? (
              /* Event Live -> Red ■ End Event button */
              <button
                type="button"
                onClick={promptEndEvent}
                disabled={eventActionLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #cf222e 0%, #da3633 100%)',
                  border: '1px solid rgba(218, 54, 51, 0.5)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  cursor: eventActionLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(207, 34, 46, 0.35)'
                }}
              >
                <Square size={12} fill="#ffffff" />
                <span>End Event</span>
              </button>
            ) : (
              /* Event Not Live (REGISTRATION_OPEN, REGISTRATION_CLOSED, EVENT_ENDED) -> Green ▶ Start Event button */
              <button
                type="button"
                onClick={promptStartEvent}
                disabled={eventActionLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
                  border: '1px solid rgba(46, 160, 67, 0.5)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  cursor: eventActionLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(46, 160, 67, 0.35)'
                }}
              >
                <Play size={13} fill="#ffffff" />
                <span>Start Event</span>
              </button>
            )}
          </div>
        </div>

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
          {/* Main 5 Tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              { id: 'problems', label: 'Problems', icon: Lock },
              { id: 'hints', label: 'Hints', icon: Lightbulb },
              { id: 'sabotage', label: 'Sabotage', icon: Zap },
              {
                id: 'registrations',
                label: 'Registrations',
                icon: UserCheck,
                badge: pendingRegistrationsCount > 0 ? pendingRegistrationsCount : null
              }
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
                  {tab.badge && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '10px',
                      background: 'rgba(210, 153, 34, 0.25)',
                      border: '1px solid rgba(210, 153, 34, 0.4)',
                      color: '#d29922'
                    }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Target Team Selector (for Problems, Hints, Sabotage) */}
          {activeTab !== 'leaderboard' && activeTab !== 'registrations' && (
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

              {/* Sort selector and Export buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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

                {/* Leaderboard Export Buttons */}
                <button
                  type="button"
                  onClick={handleAdminDownloadPDF}
                  disabled={exportLoading || filteredLeaderboard.length === 0}
                  className="btn-ghost"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    padding: '6px 12px',
                    color: '#58a6ff',
                    borderColor: 'rgba(88, 166, 255, 0.3)',
                    background: 'rgba(88, 166, 255, 0.08)',
                    borderRadius: '6px',
                    cursor: (exportLoading || filteredLeaderboard.length === 0) ? 'not-allowed' : 'pointer'
                  }}
                  title="Download Leaderboard as PDF"
                >
                  <FileDown size={13} />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleAdminDownloadPNG}
                  disabled={exportLoading || filteredLeaderboard.length === 0}
                  className="btn-ghost"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    padding: '6px 12px',
                    color: '#bc8cff',
                    borderColor: 'rgba(188, 140, 255, 0.3)',
                    background: 'rgba(188, 140, 255, 0.08)',
                    borderRadius: '6px',
                    cursor: (exportLoading || filteredLeaderboard.length === 0) ? 'not-allowed' : 'pointer'
                  }}
                  title="Download Leaderboard as PNG"
                >
                  <Image size={13} />
                  <span>Download PNG</span>
                </button>
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
                            {team.captainName ? ` · Leader: ${team.captainName}` : ''}
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

            {/* Problem List (Permanent Unlocks, No Re-locking) */}
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
                        background: isUnlocked ? 'rgba(63, 185, 80, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${isUnlocked ? 'rgba(63, 185, 80, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isUnlocked ? '#3fb950' : 'var(--txt-dim)',
                        flexShrink: 0
                      }}>
                        {isUnlocked ? <Check size={16} /> : <Lock size={15} />}
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

                    {/* Right: Permanent Unlocks (Once Unlocked, Cannot Be Locked) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {isUnlocked ? (
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '6px 14px',
                          borderRadius: '6px',
                          background: 'rgba(63, 185, 80, 0.14)',
                          border: '1px solid rgba(63, 185, 80, 0.35)',
                          color: '#3fb950',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <Check size={13} /> Unlocked
                        </span>
                      ) : (
                        <>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: 'var(--txt-dim)',
                            letterSpacing: '0.4px'
                          }}>
                            LOCKED
                          </span>
                          <button
                            className="btn-primary"
                            onClick={() => handleOpenProblemUnlockModal(prob)}
                            style={{
                              fontSize: '12px',
                              padding: '6px 16px',
                              borderRadius: '6px'
                            }}
                          >
                            <Unlock size={13} /> Unlock Problem
                          </button>
                        </>
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
                      <th style={{ padding: '10px 14px' }}>Item / Problem</th>
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
                        style={{ borderBottom: '1px solid rgba(255, 255, 0, 0.03)' }}
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
            <div
              onClick={() => {
                if (!isHintCardUnlocked) handleOpenCardUnlockModal('HINT');
              }}
              style={{
                background: 'linear-gradient(180deg, rgba(30, 80, 180, 0.12) 0%, rgba(13, 17, 28, 0.85) 100%)',
                border: `1px solid ${isHintCardUnlocked ? 'rgba(63, 185, 80, 0.35)' : 'rgba(56, 139, 253, 0.3)'}`,
                borderRadius: '12px',
                padding: '22px 24px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                cursor: !isHintCardUnlocked ? 'pointer' : 'default',
                transition: 'border-color 0.2s ease, transform 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  background: isHintCardUnlocked ? 'rgba(63, 185, 80, 0.16)' : 'rgba(56, 139, 253, 0.15)',
                  border: `1px solid ${isHintCardUnlocked ? 'rgba(63, 185, 80, 0.35)' : 'rgba(56, 139, 253, 0.35)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isHintCardUnlocked ? '#3fb950' : '#58a6ff'
                }}>
                  {isHintCardUnlocked ? <Check size={24} /> : <Lightbulb size={24} />}
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

              {/* Master Actions (Once Unlocked, Cannot Be Locked) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  className="btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGrantHintPass(1);
                  }}
                  title="Award 1 free hint pass to team inventory"
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  + Grant 1 Hint Pass
                </button>

                {isHintCardUnlocked ? (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(63, 185, 80, 0.14)',
                    border: '1px solid rgba(63, 185, 80, 0.35)',
                    color: '#3fb950',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Check size={14} /> Unlocked
                  </span>
                ) : (
                  <button
                    className="btn-blue"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCardUnlockModal('HINT');
                    }}
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
            <div
              onClick={() => {
                if (!isSabotageCardUnlocked) handleOpenCardUnlockModal('SABOTAGE');
              }}
              style={{
                background: 'linear-gradient(180deg, rgba(180, 25, 60, 0.12) 0%, rgba(20, 10, 16, 0.85) 100%)',
                border: `1px solid ${isSabotageCardUnlocked ? 'rgba(63, 185, 80, 0.35)' : 'rgba(248, 81, 73, 0.3)'}`,
                borderRadius: '12px',
                padding: '22px 24px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                cursor: !isSabotageCardUnlocked ? 'pointer' : 'default',
                transition: 'border-color 0.2s ease, transform 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  background: isSabotageCardUnlocked ? 'rgba(63, 185, 80, 0.16)' : 'rgba(248, 81, 73, 0.15)',
                  border: `1px solid ${isSabotageCardUnlocked ? 'rgba(63, 185, 80, 0.35)' : 'rgba(248, 81, 73, 0.35)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSabotageCardUnlocked ? '#3fb950' : '#ff7b72'
                }}>
                  {isSabotageCardUnlocked ? <Check size={24} /> : <Zap size={24} />}
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

              {/* Master Actions (Once Unlocked, Cannot Be Locked) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  className="btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGrantSabotageCard(1);
                  }}
                  title="Award 1 free sabotage card to team inventory"
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  + Grant 1 Sabotage Card
                </button>

                {isSabotageCardUnlocked ? (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(63, 185, 80, 0.14)',
                    border: '1px solid rgba(63, 185, 80, 0.35)',
                    color: '#3fb950',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Check size={14} /> Unlocked
                  </span>
                ) : (
                  <button
                    className="btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCardUnlockModal('SABOTAGE');
                    }}
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

        {/* ============================================================ */}
        {/* TAB 5: SELF-REGISTRATIONS APPROVAL STATION                  */}
        {/* ============================================================ */}
        {activeTab === 'registrations' && (
          <div>
            {/* Header row with search and filters */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '14px'
            }}>
              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: `All (${registrations.length})` },
                  { id: 'PENDING', label: `Pending (${pendingRegistrationsCount})`, isAlert: pendingRegistrationsCount > 0 },
                  { id: 'APPROVED', label: `Approved (${registrations.filter(r => r.status === 'APPROVED').length})` },
                  { id: 'REJECTED', label: `Rejected (${registrations.filter(r => r.status === 'REJECTED').length})` }
                ].map(f => {
                  const isActive = regFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setRegFilter(f.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: isActive ? 700 : 500,
                        border: '1px solid',
                        borderColor: isActive
                          ? '#58a6ff'
                          : f.isAlert
                          ? 'rgba(210, 153, 34, 0.4)'
                          : 'rgba(255, 255, 255, 0.1)',
                        background: isActive
                          ? 'rgba(88, 166, 255, 0.15)'
                          : f.isAlert
                          ? 'rgba(210, 153, 34, 0.1)'
                          : 'rgba(255, 255, 255, 0.03)',
                        color: isActive
                          ? '#58a6ff'
                          : f.isAlert
                          ? '#d29922'
                          : 'var(--txt-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div style={{
                position: 'relative',
                width: '260px'
              }}>
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--txt-dim)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Search team or leader..."
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '7px 12px 7px 32px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '12px'
                  }}
                />
              </div>
            </div>

            {/* Registration Cards List */}
            {filteredRegistrations.length === 0 ? (
              <div style={{
                background: 'rgba(13, 17, 28, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '48px 24px',
                textAlign: 'center',
                color: 'var(--txt-muted)'
              }}>
                <UserCheck size={36} color="var(--txt-dim)" style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                  No Registrations Found
                </div>
                <div style={{ fontSize: '12px', maxWidth: '360px', margin: '0 auto' }}>
                  {regSearch
                    ? 'No teams match your search keyword. Try clearing the filter.'
                    : 'Share the public registration QR code with students to start receiving team submissions.'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredRegistrations.map((reg) => {
                  const isPending = reg.status === 'PENDING';
                  const isApproved = reg.status === 'APPROVED';
                  const isRejected = reg.status === 'REJECTED';
                  const isLoading = actionLoadingId === reg.id;

                  const cleanCode = reg.teamName.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8) || 'TEAM';

                  return (
                    <div
                      key={reg.id}
                      style={{
                        background: 'rgba(13, 17, 28, 0.85)',
                        border: `1px solid ${
                          isPending
                            ? 'rgba(210, 153, 34, 0.35)'
                            : isApproved
                            ? 'rgba(46, 160, 67, 0.25)'
                            : 'rgba(248, 81, 73, 0.25)'
                        }`,
                        borderRadius: '12px',
                        padding: '20px 22px',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
                      }}
                    >
                      {/* Top Row: Team Name, Status, Reg ID */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '14px',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                            {reg.teamName}
                          </span>

                          <span style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '10px',
                            letterSpacing: '0.4px',
                            background: isPending
                              ? 'rgba(210, 153, 34, 0.15)'
                              : isApproved
                              ? 'rgba(46, 160, 67, 0.15)'
                              : 'rgba(248, 81, 73, 0.15)',
                            color: isPending
                              ? '#d29922'
                              : isApproved
                              ? '#3fb950'
                              : '#ff7b72',
                            border: `1px solid ${
                              isPending
                                ? 'rgba(210, 153, 34, 0.4)'
                                : isApproved
                                ? 'rgba(46, 160, 67, 0.4)'
                                : 'rgba(248, 81, 73, 0.4)'
                            }`
                          }}>
                            {isPending
                              ? '⏳ PENDING APPROVAL'
                              : isApproved
                              ? '✓ APPROVED'
                              : '✕ DECLINED'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: 'var(--txt-muted)' }}>
                          <span style={{ fontFamily: 'monospace', color: '#bc8cff' }}>
                            {reg.id}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(reg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                            {new Date(reg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Middle Grid: Leader Contact & Member Breakdown */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '14px',
                        marginBottom: '16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '12px 16px'
                      }}>
                        {/* Leader Info */}
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--txt-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
                            Team Leader Information
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                            {reg.leaderName}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>
                            {reg.leaderContact && <span>📞 {reg.leaderContact} </span>}
                            {reg.leaderEmail && <span>✉️ {reg.leaderEmail}</span>}
                            {!reg.leaderContact && !reg.leaderEmail && <span>No contact provided</span>}
                          </div>
                        </div>

                        {/* Roster Overview */}
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--txt-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
                            Team Size & Allocation
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#58a6ff', marginBottom: '4px' }}>
                            {reg.memberCount} {reg.memberCount === 1 ? 'Solo Participant' : 'Members'}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>
                            Workspace Budget: <b style={{ color: '#3fb950' }}>₹1,000 ByteCoins</b> on approval
                          </div>
                        </div>
                      </div>

                      {/* Member Cards Breakdown */}
                      <div style={{ marginBottom: '18px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--txt-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Registered Team Members & Generated IDs:
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                          {(reg.members || []).slice(0, reg.memberCount).map((m, idx) => {
                            const memberId = `${cleanCode}-001-M${String(idx + 1).padStart(2, '0')}`;
                            return (
                              <div
                                key={idx}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  border: '1px solid rgba(255, 255, 255, 0.07)',
                                  borderRadius: '6px',
                                  padding: '8px 12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '8px'
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                                    {m.name || `Member ${idx + 1}`}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--txt-dim)', marginTop: '2px' }}>
                                    {m.college || m.rollNo || (idx === 0 ? 'Leader' : `Member ${idx + 1}`)}
                                  </div>
                                </div>

                                <div style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  fontFamily: 'monospace',
                                  color: '#58a6ff',
                                  background: 'rgba(88, 166, 255, 0.1)',
                                  padding: '3px 6px',
                                  borderRadius: '4px'
                                }}>
                                  {memberId}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        paddingTop: '14px',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        {isPending ? (
                          <>
                            <div style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>
                              Approving will initialize the team with ₹1,000 ByteCoins and create their shared workspace.
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => setRejectModal({ reg, reason: '' })}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '8px 16px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: '#ff7b72',
                                  background: 'rgba(248, 81, 73, 0.08)',
                                  border: '1px solid rgba(248, 81, 73, 0.25)',
                                  borderRadius: '6px',
                                  cursor: isLoading ? 'not-allowed' : 'pointer'
                                }}
                              >
                                <UserX size={14} />
                                <span>Reject</span>
                              </button>

                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleApproveRegistration(reg)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '8px 18px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: '#ffffff',
                                  background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: isLoading ? 'not-allowed' : 'pointer',
                                  boxShadow: '0 4px 12px rgba(46, 160, 67, 0.35)'
                                }}
                              >
                                {isLoading ? (
                                  <RefreshCw size={14} className="spin" />
                                ) : (
                                  <UserCheck size={14} />
                                )}
                                <span>Approve & Initialize (1000 BC)</span>
                              </button>
                            </div>
                          </>
                        ) : isApproved ? (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#3fb950', fontWeight: 600 }}>
                              <CheckCircle2 size={15} />
                              <span>Team is active on leaderboard and has full workspace access.</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTeamName(reg.teamName);
                                setActiveTab('problems');
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#58a6ff',
                                background: 'rgba(88, 166, 255, 0.08)',
                                border: '1px solid rgba(88, 166, 255, 0.25)',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              <span>Manage Problems</span>
                              <ArrowRight size={13} />
                            </button>
                          </>
                        ) : (
                          /* REJECTED */
                          <>
                            <div style={{ fontSize: '12px', color: '#ff7b72' }}>
                              <b>Reason:</b> {reg.rejectionReason || 'Declined by event administrator.'}
                            </div>

                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleApproveRegistration(reg)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#ffffff',
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '6px',
                                cursor: isLoading ? 'not-allowed' : 'pointer'
                              }}
                            >
                              <RefreshCw size={13} />
                              <span>Re-Approve Team</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* BID PRICE UNLOCK MODAL (FOR PROBLEMS, HINT & SABOTAGE CARDS) */}
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
                  {unlockModal.type === 'PROBLEM' ? 'Unlock Problem' : `Unlock ${unlockModal.title}`}
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
                <span style={{ color: 'var(--txt-muted)' }}>
                  {unlockModal.type === 'PROBLEM' ? 'Problem:' : 'Card:'}
                </span>
                <span style={{ fontWeight: 700, color: '#ffffff' }}>
                  {unlockModal.title}
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
                        placeholder="e.g. 50"
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
                      {unlockSubmitting
                        ? 'Unlocking...'
                        : (unlockModal.type === 'PROBLEM' ? 'Unlock Problem' : `Unlock ${unlockModal.title}`)}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* REJECT REGISTRATION MODAL */}
      {rejectModal && (
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
            if (e.target === e.currentTarget && !actionLoadingId) {
              setRejectModal(null);
            }
          }}
        >
          <div style={{
            background: '#0d111c',
            border: '1px solid rgba(248, 81, 73, 0.3)',
            borderRadius: '14px',
            maxWidth: '440px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(248, 81, 73, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff7b72'
              }}>
                <UserX size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                  Decline Registration
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>
                  Team: <b>{rejectModal.reg?.teamName}</b> ({rejectModal.reg?.id})
                </div>
              </div>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--txt-muted)', lineHeight: 1.5 }}>
              Are you sure you want to decline this registration? Provide an optional reason to display to the team.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#c9d1d9', marginBottom: '6px' }}>
                Decline Reason (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Duplicate team name / Incomplete members"
                value={rejectModal.reason || ''}
                onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setRejectModal(null)}
                disabled={Boolean(actionLoadingId)}
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={Boolean(actionLoadingId)}
                style={{
                  padding: '8px 18px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: '#da3633',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  cursor: actionLoadingId ? 'not-allowed' : 'pointer'
                }}
              >
                {actionLoadingId ? 'Declining...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIENCE PROJECTION QR CODE MODAL */}
      {showQrModal && (
        <div
          className="ov"
          style={{
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            position: 'fixed',
            inset: 0,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowQrModal(false);
          }}
        >
          <div style={{
            background: '#0d111c',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            maxWidth: '420px',
            width: '100%',
            padding: '30px',
            textAlign: 'center',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>QUBIT</span>
                <span style={{ color: '#bc8cff', fontWeight: 600 }}>//</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#58a6ff', textTransform: 'uppercase' }}>
                  REGISTRATION QR
                </span>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--txt-muted)', cursor: 'pointer', padding: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--txt-muted)' }}>
              Project this QR code on the auditorium screen for contestant self-registration.
            </p>

            <div style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '12px',
              display: 'inline-block',
              marginBottom: '16px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)'
            }}>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Registration QR"
                  style={{ width: '240px', height: '240px', display: 'block' }}
                />
              ) : (
                <div style={{ width: '240px', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                  Generating QR...
                </div>
              )}
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '11px',
              color: 'var(--txt-muted)',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              marginBottom: '20px'
            }}>
              {regUrl}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleCopyRegLink}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 14px',
                  background: 'rgba(88, 166, 255, 0.1)',
                  border: '1px solid rgba(88, 166, 255, 0.3)',
                  borderRadius: '6px',
                  color: '#58a6ff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copied Link' : 'Copy URL'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.open(regUrl, '_blank')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <ExternalLink size={14} />
                <span>Open Page</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVENT STATE CONFIRMATION MODAL */}
      {eventConfirmModal && (
        <div
          className="ov"
          style={{
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            position: 'fixed',
            inset: 0,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !eventActionLoading) setEventConfirmModal(null);
          }}
        >
          <div style={{
            background: '#0d111c',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `${eventConfirmModal.confirmColor}1f`,
                  border: `1px solid ${eventConfirmModal.confirmColor}55`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: eventConfirmModal.confirmColor
                }}>
                  <AlertTriangle size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                  {eventConfirmModal.title}
                </h3>
              </div>
              <button
                onClick={() => !eventActionLoading && setEventConfirmModal(null)}
                disabled={eventActionLoading}
                style={{ background: 'none', border: 'none', color: 'var(--txt-muted)', cursor: 'pointer', padding: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--txt-muted)', lineHeight: 1.5 }}>
              {eventConfirmModal.description}
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '20px',
              fontSize: '12px',
              color: 'var(--txt-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Target State:</span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: eventConfirmModal.confirmColor,
                fontSize: '11px',
                letterSpacing: '0.5px'
              }}>
                {eventConfirmModal.targetStatus}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setEventConfirmModal(null)}
                disabled={eventActionLoading}
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEventAction}
                disabled={eventActionLoading}
                style={{
                  padding: '8px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: eventConfirmModal.confirmColor,
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  cursor: eventActionLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {eventActionLoading ? 'Applying...' : eventConfirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* START EVENT — SELECT & ACCEPT TEAMS MODAL                     */}
      {/* ============================================================ */}
      {showStartEventModal && (
        <div
          className="ov"
          style={{
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            position: 'fixed',
            inset: 0,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !eventActionLoading) {
              setShowStartEventModal(false);
            }
          }}
        >
          <div style={{
            background: '#0d111c',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            maxWidth: '880px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.9)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(46, 160, 67, 0.15)',
                  border: '1px solid rgba(46, 160, 67, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2ea043'
                }}>
                  <Play size={20} fill="#2ea043" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                    Start Event — Select & Accept Teams
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--txt-muted)' }}>
                    Review registered teams, accept pending entries, and select participating teams for this competition session.
                  </p>
                </div>
              </div>
              <button
                onClick={() => !eventActionLoading && setShowStartEventModal(false)}
                disabled={eventActionLoading}
                style={{ background: 'none', border: 'none', color: 'var(--txt-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Event Name Input & Info */}
            <div style={{
              padding: '14px 24px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--txt-dim)', whiteSpace: 'nowrap' }}>
                  Event Session Name:
                </span>
                <input
                  type="text"
                  value={eventNameInput}
                  onChange={(e) => setEventNameInput(e.target.value)}
                  placeholder="e.g., QUBIT Code Auctioneer 2026"
                  style={{
                    flex: 1,
                    fontSize: '13px',
                    padding: '7px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff'
                  }}
                />
              </div>

              <div style={{
                fontSize: '11px',
                color: '#58a6ff',
                background: 'rgba(88, 166, 255, 0.1)',
                border: '1px solid rgba(88, 166, 255, 0.25)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: 600
              }}>
                Starting Balance: ₹1,000 ByteCoins / Team
              </div>
            </div>

            {/* Search, Filter & Batch Action Toolbar */}
            <div style={{
              padding: '14px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={14} color="var(--txt-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search team name, leader, mobile..."
                  value={startEventSearch}
                  onChange={(e) => setStartEventSearch(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '32px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#ffffff'
                  }}
                />
              </div>

              {/* Status filter pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => {
                  const count = f === 'ALL'
                    ? allRegisteredTeams.length
                    : allRegisteredTeams.filter(t => t.status === f).length;
                  const isActive = startEventStatusFilter === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setStartEventStatusFilter(f)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: '1px solid',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        background: isActive ? 'rgba(88, 166, 255, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                        borderColor: isActive ? 'rgba(88, 166, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)',
                        color: isActive ? '#58a6ff' : 'var(--txt-muted)'
                      }}
                    >
                      {f} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Batch Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={handleSelectAllVisible}
                  style={{ fontSize: '11px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <CheckSquare size={13} />
                  <span>Select All</span>
                </button>

                <button
                  type="button"
                  className="btn-ghost"
                  onClick={handleDeselectAllVisible}
                  style={{ fontSize: '11px', padding: '5px 10px' }}
                >
                  <span>Deselect All</span>
                </button>

                {selectedPendingCount > 0 && (
                  <button
                    type="button"
                    onClick={handleAcceptSelectedTeams}
                    disabled={batchActionLoading}
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '5px 12px',
                      borderRadius: '6px',
                      background: 'rgba(46, 160, 67, 0.2)',
                      border: '1px solid rgba(46, 160, 67, 0.5)',
                      color: '#3fb950',
                      cursor: batchActionLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <UserCheck size={13} />
                    <span>Accept Selected ({selectedPendingCount})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Teams Selection Table */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'var(--txt-muted)',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    position: 'sticky',
                    top: 0,
                    background: '#0d111c',
                    zIndex: 2
                  }}>
                    <th style={{ padding: '12px 10px', width: '36px' }}>
                      <input
                        type="checkbox"
                        checked={filteredRegisteredTeams.length > 0 && filteredRegisteredTeams.every(t => selectedParticipatingTeams.has(t.teamName))}
                        onChange={(e) => {
                          if (e.target.checked) handleSelectAllVisible();
                          else handleDeselectAllVisible();
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ padding: '12px 10px' }}>Team Name</th>
                    <th style={{ padding: '12px 10px' }}>Team Leader & Contact</th>
                    <th style={{ padding: '12px 10px' }}>Members</th>
                    <th style={{ padding: '12px 10px' }}>Status</th>
                    <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegisteredTeams.map(item => {
                    const isSelected = selectedParticipatingTeams.has(item.teamName);
                    const isPending = item.status === 'PENDING';
                    const isApproved = item.status === 'APPROVED';
                    const isRejected = item.status === 'REJECTED';

                    return (
                      <tr
                        key={item.teamName}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          background: isSelected ? 'rgba(88, 166, 255, 0.05)' : 'transparent',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: '12px 10px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleTeam(item.teamName)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>

                        {/* Team Name */}
                        <td style={{ padding: '12px 10px' }}>
                          <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '13px' }}>
                            {item.teamName}
                          </div>
                          {item.balance !== undefined && (
                            <div style={{ fontSize: '11px', color: '#3fb950', fontFamily: 'monospace' }}>
                              ₹{item.balance} ByteCoins
                            </div>
                          )}
                        </td>

                        {/* Leader & Contact */}
                        <td style={{ padding: '12px 10px' }}>
                          <div style={{ color: '#c9d1d9', fontWeight: 600 }}>{item.leaderName}</div>
                          {item.leaderContact && (
                            <div style={{ fontSize: '11px', color: 'var(--txt-dim)' }}>
                              📞 {item.leaderContact}
                            </div>
                          )}
                        </td>

                        {/* Members */}
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--txt-muted)'
                          }}>
                            {item.memberCount} Member{item.memberCount !== 1 ? 's' : ''}
                          </span>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            letterSpacing: '0.4px',
                            background: isApproved
                              ? 'rgba(46, 160, 67, 0.18)'
                              : isPending
                              ? 'rgba(210, 153, 34, 0.18)'
                              : 'rgba(248, 81, 73, 0.18)',
                            color: isApproved
                              ? '#3fb950'
                              : isPending
                              ? '#d29922'
                              : '#f85149',
                            border: `1px solid ${
                              isApproved
                                ? 'rgba(46, 160, 67, 0.4)'
                                : isPending
                                ? 'rgba(210, 153, 34, 0.4)'
                                : 'rgba(248, 81, 73, 0.4)'
                            }`
                          }}>
                            {item.status}
                          </span>
                        </td>

                        {/* Inline Actions */}
                        <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                          {isPending && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleInlineAcceptTeam(item)}
                                disabled={actionLoadingId === item.id}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  borderRadius: '5px',
                                  background: 'rgba(46, 160, 67, 0.2)',
                                  border: '1px solid rgba(46, 160, 67, 0.5)',
                                  color: '#3fb950',
                                  cursor: actionLoadingId === item.id ? 'not-allowed' : 'pointer'
                                }}
                                title="Accept this team"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() => item.registration && setRejectModal({ reg: item.registration, reason: '' })}
                                disabled={actionLoadingId === item.id}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  borderRadius: '5px',
                                  background: 'rgba(248, 81, 73, 0.15)',
                                  border: '1px solid rgba(248, 81, 73, 0.4)',
                                  color: '#ff7b72',
                                  cursor: actionLoadingId === item.id ? 'not-allowed' : 'pointer'
                                }}
                                title="Reject this registration"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {isApproved && (
                            <span style={{ fontSize: '11px', color: '#3fb950', fontWeight: 600 }}>
                              Accepted ✓
                            </span>
                          )}

                          {isRejected && (
                            <span style={{ fontSize: '11px', color: '#ff7b72' }}>
                              Declined
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredRegisteredTeams.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: 'var(--txt-dim)' }}>
                        No teams found matching the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              {/* Status indicators */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                  <span style={{ color: selectedAcceptedCount > 0 ? '#3fb950' : 'var(--txt-muted)' }}>
                    {selectedAcceptedCount} Accepted Team{selectedAcceptedCount !== 1 ? 's' : ''} Selected
                  </span>
                </div>
                {selectedPendingCount > 0 && (
                  <div style={{ fontSize: '11px', color: '#d29922', marginTop: '2px' }}>
                    ⚠️ {selectedPendingCount} pending team(s) selected. Click "Accept Selected" before starting.
                  </div>
                )}
                {selectedAcceptedCount === 0 && selectedPendingCount === 0 && (
                  <div style={{ fontSize: '11px', color: '#f85149', marginTop: '2px' }}>
                    ⚠️ At least 1 accepted team must be selected to start the event.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowStartEventModal(false)}
                  disabled={eventActionLoading}
                  style={{ padding: '8px 18px', fontSize: '12px' }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handlePromptStartEventModal}
                  disabled={selectedAcceptedCount === 0 || selectedPendingCount > 0 || eventActionLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 22px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: (selectedAcceptedCount === 0 || selectedPendingCount > 0)
                      ? 'rgba(46, 160, 67, 0.25)'
                      : 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
                    border: '1px solid rgba(46, 160, 67, 0.5)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    cursor: (selectedAcceptedCount === 0 || selectedPendingCount > 0 || eventActionLoading) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(46, 160, 67, 0.35)',
                    opacity: (selectedAcceptedCount === 0 || selectedPendingCount > 0) ? 0.6 : 1
                  }}
                >
                  <Play size={13} fill="#ffffff" />
                  <span>Start Event ({selectedAcceptedCount})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CONFIRM START EVENT DIALOG                                   */}
      {/* ============================================================ */}
      {startEventConfirmModal && (
        <div
          className="ov"
          style={{
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            position: 'fixed',
            inset: 0,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !eventActionLoading) setStartEventConfirmModal(false);
          }}
        >
          <div style={{
            background: '#0d111c',
            border: '1px solid rgba(46, 160, 67, 0.4)',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.9)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(46, 160, 67, 0.18)',
                border: '1px solid rgba(46, 160, 67, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2ea043'
              }}>
                <Play size={20} fill="#2ea043" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                  Are you sure you want to start the event?
                </h3>
                <div style={{ fontSize: '12px', color: '#58a6ff', marginTop: '2px' }}>
                  {eventNameInput || 'QUBIT Code Auctioneer'}
                </div>
              </div>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--txt-muted)', lineHeight: 1.5 }}>
              Launching the event will transition status to <b>EVENT LIVE</b>:
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '12px',
              color: '#c9d1d9',
              lineHeight: 1.6
            }}>
              <div>• <b>{selectedAcceptedCount} accepted team(s)</b> will participate in the live auction.</div>
              <div>• Each participating team receives a fresh balance of <b>₹1,000 ByteCoins</b>.</div>
              <div>• Only accepted teams will be allowed to log in and submit code.</div>
              <div>• Unapproved or unaccepted teams cannot access the active session.</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setStartEventConfirmModal(false)}
                disabled={eventActionLoading}
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                Back to Selection
              </button>

              <button
                type="button"
                onClick={handleConfirmStartEventSession}
                disabled={eventActionLoading}
                style={{
                  padding: '8px 22px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  cursor: eventActionLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Play size={13} fill="#ffffff" />
                <span>{eventActionLoading ? 'Starting Event...' : 'Confirm & Start Event'}</span>
              </button>
            </div>
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
