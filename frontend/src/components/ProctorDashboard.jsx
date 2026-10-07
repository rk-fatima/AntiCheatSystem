import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, RefreshCw, Unlock, Search, X, AlertTriangle, Coins, Receipt, Users, Crown, Sparkles, Check } from 'lucide-react';
import {
  fetchProctorTeams,
  proctorUnlockTeam,
  proctorResetTeam,
  updateProblemPrice,
  batchSetProblemPrices,
  fetchProblemPrices,
  fetchTransactions,
  fetchProblems,
  syncTeamsFromSheet
} from '../services/api';

export function ProctorDashboard({ onClose }) {
  const [activeTab, setActiveTab] = useState('teams'); // 'teams' | 'pricing' | 'transactions'
  const [teams, setTeams] = useState([]);
  const [problems, setProblems] = useState([]);
  const [prices, setPrices] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTeamLogs, setSelectedTeamLogs] = useState(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState('qubit');

  // Google Sheet sync state
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncInput, setSyncInput] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  // Dynamic pricing state
  const [editingPrices, setEditingPrices] = useState({});
  const [priceUpdateSuccess, setPriceUpdateSuccess] = useState({});
  const [batchEasy, setBatchEasy] = useState(100);
  const [batchMedium, setBatchMedium] = useState(150);
  const [batchHard, setBatchHard] = useState(200);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teamsRes, problemsRes, pricesRes, txnsRes] = await Promise.all([
        fetchProctorTeams(),
        fetchProblems(),
        fetchProblemPrices(),
        fetchTransactions()
      ]);
      setTeams(teamsRes.teams || []);
      setProblems(problemsRes.problems || []);
      setPrices(pricesRes.prices || {});
      setTransactions(txnsRes.transactions || []);

      // Initialize editing price fields
      const currentMap = { ...(pricesRes.prices || {}) };
      setEditingPrices(prev => ({ ...currentMap, ...prev }));
    } catch (err) {
      console.error('Failed to load proctor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRemoteUnlock = async (teamName) => {
    try {
      const res = await proctorUnlockTeam(teamName, pin);
      if (res.success) {
        setTeams(prev => prev.map(t => t.name === teamName ? { ...t, isLocked: false, lockReason: '' } : t));
      }
    } catch (e) {
      alert('Unlock failed: ' + e.message);
    }
  };

  const handleRemoteReset = async (teamName) => {
    if (window.confirm(`Are you sure you want to reset all progress for team "${teamName}"?`)) {
      try {
        await proctorResetTeam(teamName);
        loadData();
      } catch (e) {
        alert('Reset failed: ' + e.message);
      }
    }
  };

  const handleUpdatePrice = async (problemId) => {
    const newPrice = editingPrices[problemId];
    if (newPrice === undefined || newPrice === '') return;

    try {
      await updateProblemPrice({ problemId, price: Number(newPrice), pin });
      setPrices(prev => ({ ...prev, [problemId]: Number(newPrice) }));
      setPriceUpdateSuccess(prev => ({ ...prev, [problemId]: true }));
      setTimeout(() => {
        setPriceUpdateSuccess(prev => ({ ...prev, [problemId]: false }));
      }, 2000);
    } catch (err) {
      alert('Failed to update price: ' + err.message);
    }
  };

  const handleBatchPublish = async () => {
    if (window.confirm(`Publish batch prices (Easy: ₹${batchEasy}, Medium: ₹${batchMedium}, Hard: ₹${batchHard}) across all 93 problems?`)) {
      try {
        const res = await batchSetProblemPrices({
          easyPrice: batchEasy,
          mediumPrice: batchMedium,
          hardPrice: batchHard,
          pin
        });
        setPrices(res.prices || {});
        setEditingPrices(res.prices || {});
        alert('Batch prices published successfully!');
      } catch (e) {
        alert('Batch update failed: ' + e.message);
      }
    }
  };

  const handleSyncSubmit = async () => {
    if (!syncInput.trim()) return;
    setSyncLoading(true);
    setSyncMessage(null);
    try {
      let payload;
      const trimmed = syncInput.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        payload = Array.isArray(parsed) ? { teams: parsed } : parsed;
      } else {
        payload = { csv: trimmed };
      }
      const res = await syncTeamsFromSheet(payload);
      setSyncMessage({ type: 'success', text: `Successfully synced ${res.count} team(s)!` });
      loadData();
      setTimeout(() => {
        setShowSyncModal(false);
        setSyncInput('');
        setSyncMessage(null);
      }, 1500);
    } catch (err) {
      setSyncMessage({ type: 'error', text: err.message || 'Sync failed.' });
    } finally {
      setSyncLoading(false);
    }
  };

  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProblems = problems.filter(p =>
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.diff.toLowerCase().includes(search.toLowerCase())
  );

  const totalLocked = teams.filter(t => t.isLocked).length;

  return (
    <div className="ov" style={{ zIndex: 900 }}>
      <div className="box" style={{ maxWidth: '1060px', width: '96%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={24} color="var(--teal)" />
            <h2 style={{ margin: 0, color: 'var(--teal)', fontSize: '20px' }}>
              Organiser & Proctor Control Station
            </h2>
          </div>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        {/* Tab switchers */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--bd)', paddingBottom: '10px', flexShrink: 0 }}>
          <button
            onClick={() => { setActiveTab('teams'); setSearch(''); }}
            style={{
              background: activeTab === 'teams' ? 'var(--teal)' : 'var(--bg3)',
              color: activeTab === 'teams' ? '#000' : 'var(--txt)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Users size={16} /> Live Team Monitor ({teams.length})
          </button>

          <button
            onClick={() => { setActiveTab('pricing'); setSearch(''); }}
            style={{
              background: activeTab === 'pricing' ? 'var(--neon)' : 'var(--bg3)',
              color: activeTab === 'pricing' ? '#000' : 'var(--txt)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Coins size={16} /> Dynamic Problem Pricing
          </button>

          <button
            onClick={() => { setActiveTab('transactions'); setSearch(''); }}
            style={{
              background: activeTab === 'transactions' ? 'var(--amber)' : 'var(--bg3)',
              color: activeTab === 'transactions' ? '#000' : 'var(--txt)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Receipt size={16} /> Purchase Audit Logs ({transactions.length})
          </button>

          <button onClick={loadData} disabled={loading} style={{ marginLeft: 'auto' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* TAB 1: TEAMS MONITOR */}
        {activeTab === 'teams' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {/* Stats summary row */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap', flexShrink: 0 }}>
              <div style={badgeCardStyle}>
                <b style={{ fontSize: '18px', color: 'var(--txt)' }}>{teams.length}</b>
                <small style={labelStyle}>Registered Teams</small>
              </div>
              <div style={badgeCardStyle}>
                <b style={{ fontSize: '18px', color: 'var(--neon)' }}>{teams.length - totalLocked}</b>
                <small style={labelStyle}>Active Sessions</small>
              </div>
              <div style={{ ...badgeCardStyle, borderColor: totalLocked > 0 ? 'var(--red)' : 'var(--bd)' }}>
                <b style={{ fontSize: '18px', color: totalLocked > 0 ? 'var(--red)' : 'var(--mut)' }}>{totalLocked}</b>
                <small style={labelStyle}>Locked Teams</small>
              </div>
            </div>

            {/* Search & Actions */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Search size={16} color="var(--mut)" />
                <input
                  placeholder="Search teams by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ maxWidth: '300px' }}
                />
              </div>

              <button
                type="button"
                onClick={() => setShowSyncModal(true)}
                className="pri"
                style={{ fontSize: '12px', padding: '6px 14px', gap: '6px' }}
              >
                <Sparkles size={14} /> Sync / Import Teams from Google Sheets
              </button>
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--bd)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--bd)', color: 'var(--mut)', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '10px 14px' }}>Team Name & Size</th>
                    <th style={{ padding: '10px 14px' }}>Captain</th>
                    <th style={{ padding: '10px 14px' }}>Balance</th>
                    <th style={{ padding: '10px 14px' }}>Score / Solved</th>
                    <th style={{ padding: '10px 14px' }}>Violations</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((t) => {
                    const flags = t.violations?.length || 0;
                    return (
                      <tr key={t.name} style={{ borderBottom: '1px solid var(--bd)', background: t.isLocked ? '#2e121e' : 'transparent' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                          <div>{t.name}</div>
                          <small style={{ color: 'var(--mut)', fontSize: '11px' }}>{t.size || t.members?.length} Members</small>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ color: 'var(--neon)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                            <Crown size={12} /> {t.captainName || t.captainId || 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--teal)', fontWeight: 700 }}>
                          ₹{t.balance ?? 1000}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <b style={{ color: 'var(--neon)' }}>{t.score || 0} pts</b> ({t.solved?.length || 0} solved)
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            background: flags >= 3 ? 'var(--red-dim)' : flags > 0 ? 'rgba(255,196,61,0.2)' : 'transparent',
                            color: flags >= 3 ? 'var(--red)' : flags > 0 ? 'var(--amber)' : 'var(--mut)',
                            border: flags > 0 ? '1px solid currentColor' : 'none'
                          }}>
                            {flags} flags
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {t.isLocked ? (
                            <span style={{ color: 'var(--red)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ShieldAlert size={14} /> LOCKED
                            </span>
                          ) : (
                            <span style={{ color: 'var(--neon)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ShieldCheck size={14} /> Active
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button onClick={() => setSelectedTeamMembers(t)} title="View Team Member Details">
                              Members
                            </button>
                            <button onClick={() => setSelectedTeamLogs(t)} title="Inspect violation logs">
                              Audit
                            </button>
                            {t.isLocked && (
                              <button className="pri" onClick={() => handleRemoteUnlock(t.name)}>
                                <Unlock size={14} /> Unlock
                              </button>
                            )}
                            <button className="dng" onClick={() => handleRemoteReset(t.name)}>
                              Reset
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTeams.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--mut)' }}>
                        No registered teams found. Teams will appear here upon registration.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DYNAMIC PROBLEM PRICING */}
        {activeTab === 'pricing' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {/* Quick Batch Tools Banner */}
            <div style={{
              background: 'var(--bg3)',
              border: '1px solid var(--bd)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              flexShrink: 0
            }}>
              <div>
                <b style={{ color: 'var(--neon)', fontSize: '14px' }}>⚡ Batch Set Starting Tier Baseline</b>
                <div style={{ color: 'var(--mut)', fontSize: '12px', marginTop: '2px' }}>
                  Quickly set prices across all 93 problems, then customize individual problem prices below.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--mut)' }}>Easy:</span>
                <input
                  type="number"
                  value={batchEasy}
                  onChange={(e) => setBatchEasy(Number(e.target.value))}
                  style={{ width: '65px', padding: '4px 6px' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--mut)' }}>Med:</span>
                <input
                  type="number"
                  value={batchMedium}
                  onChange={(e) => setBatchMedium(Number(e.target.value))}
                  style={{ width: '65px', padding: '4px 6px' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--mut)' }}>Hard:</span>
                <input
                  type="number"
                  value={batchHard}
                  onChange={(e) => setBatchHard(Number(e.target.value))}
                  style={{ width: '65px', padding: '4px 6px' }}
                />
                <button className="pri" onClick={handleBatchPublish} style={{ padding: '6px 12px' }}>
                  Publish Baseline
                </button>
              </div>
            </div>

            {/* Search */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
              <Search size={16} color="var(--mut)" />
              <input
                placeholder="Search problem to configure price..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: '320px' }}
              />
            </div>

            {/* Problem Price Configuration List */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--bd)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--bd)', color: 'var(--mut)', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '10px 14px' }}>Problem ID & Title</th>
                    <th style={{ padding: '10px 14px' }}>Tier</th>
                    <th style={{ padding: '10px 14px' }}>Current Live Price</th>
                    <th style={{ padding: '10px 14px' }}>Configure Price (₹)</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map((prob) => {
                    const currentLive = prices[prob.id];
                    const editVal = editingPrices[prob.id] ?? (currentLive !== undefined ? currentLive : '');
                    const isSuccess = priceUpdateSuccess[prob.id];

                    return (
                      <tr key={prob.id} style={{ borderBottom: '1px solid var(--bd)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                          {prob.id} — {prob.title}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span className={`badge ${prob.diff}`}>{prob.diff}</span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {currentLive !== undefined && currentLive !== null ? (
                            <b style={{ color: 'var(--neon)', fontSize: '14px' }}>₹{currentLive}</b>
                          ) : (
                            <span style={{ color: 'var(--mut)', fontStyle: 'italic', fontSize: '12px' }}>Not Set</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: 'var(--mut)' }}>₹</span>
                            <input
                              type="number"
                              placeholder="Price"
                              value={editVal}
                              onChange={(e) => setEditingPrices({ ...editingPrices, [prob.id]: e.target.value })}
                              style={{ width: '90px', padding: '4px 8px' }}
                            />
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <button
                            className={isSuccess ? "ok" : "pri"}
                            onClick={() => handleUpdatePrice(prob.id)}
                            style={{ padding: '5px 12px' }}
                          >
                            {isSuccess ? '✓ Published!' : 'Publish / Update Price'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PURCHASE AUDIT LOGS */}
        {activeTab === 'transactions' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <p style={{ color: 'var(--mut)', fontSize: '13px', margin: '0 0 12px', flexShrink: 0 }}>
              Immutable audit record of all problems purchased by teams. Changing a problem's price later does not alter historical transactions.
            </p>

            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--bd)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--bd)', color: 'var(--mut)', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '10px 14px' }}>Txn ID</th>
                    <th style={{ padding: '10px 14px' }}>Team ID</th>
                    <th style={{ padding: '10px 14px' }}>Problem</th>
                    <th style={{ padding: '10px 14px' }}>Winning Bid</th>
                    <th style={{ padding: '10px 14px' }}>Bidder (Member ID)</th>
                    <th style={{ padding: '10px 14px' }}>Remaining Balance</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} style={{ borderBottom: '1px solid var(--bd)' }}>
                      <td style={{ padding: '10px 14px', color: 'var(--mut)', fontSize: '11px', fontFamily: 'monospace' }}>
                        {txn.id}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--teal)' }}>
                        {txn.teamId || txn.teamName}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <b>{txn.problemId}</b> — {txn.problemTitle}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--neon)', fontWeight: 800 }}>
                        ₹{txn.bidAmount || txn.price}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ color: 'var(--txt)', fontWeight: 600 }}>{txn.purchasedBy}</span>
                        {txn.purchasedByName && (
                          <small style={{ color: 'var(--mut)', marginLeft: '6px' }}>({txn.purchasedByName})</small>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--txt)' }}>
                        ₹{txn.remainingBalance !== undefined ? txn.remainingBalance : '-'}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--mut)', fontSize: '12px' }}>
                        {txn.displayTime || new Date(txn.purchaseTime).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--mut)' }}>
                        No transactions recorded yet. When teams purchase problems, transaction records will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Team Member Information Inspection */}
        {selectedTeamMembers && (
          <div className="ov" style={{ zIndex: 1100 }}>
            <div className="box" style={{ maxWidth: '640px', width: '95%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, color: 'var(--teal)' }}>
                  Team Roster: {selectedTeamMembers.name}
                </h3>
                <button onClick={() => setSelectedTeamMembers(null)}><X size={16} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(selectedTeamMembers.members || []).map((m) => (
                  <div
                    key={m.memberId}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: 'var(--bg3)',
                      border: '1px solid',
                      borderColor: m.isCaptain ? 'var(--neon)' : 'var(--bd)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <b style={{ color: 'var(--teal)', fontSize: '14px' }}>{m.memberId}</b>
                        <span style={{ color: 'var(--txt)', fontWeight: 600 }}>{m.name}</span>
                      </div>
                      {m.isCaptain && (
                        <span style={{ color: 'var(--neon)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                          <Crown size={13} /> Team Captain
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', color: 'var(--mut)' }}>
                      <div>Roll No: <b style={{ color: 'var(--txt)' }}>{m.rollNo || 'N/A'}</b></div>
                      <div>College: <b style={{ color: 'var(--txt)' }}>{m.college || 'N/A'}</b></div>
                      <div>Mobile: <b style={{ color: 'var(--txt)' }}>{m.phone || 'N/A'}</b></div>
                      <div>Email: <b style={{ color: 'var(--txt)' }}>{m.email || 'N/A'}</b></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Team Violations Audit Log */}
        {selectedTeamLogs && (
          <div className="ov" style={{ zIndex: 1100 }}>
            <div className="box" style={{ maxWidth: '620px', width: '95%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: 'var(--teal)' }}>
                  Integrity Audit Log: {selectedTeamLogs.name}
                </h3>
                <button onClick={() => setSelectedTeamLogs(null)}><X size={16} /></button>
              </div>

              {selectedTeamLogs.violations && selectedTeamLogs.violations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
                  {selectedTeamLogs.violations.map((v, i) => (
                    <div key={i} style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'var(--bg3)',
                      border: '1px solid var(--bd)',
                      fontSize: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--mut)', marginBottom: '4px' }}>
                        <div>
                          <b style={{ color: 'var(--red)', marginRight: '8px' }}>{v.event}</b>
                          {v.memberId && (
                            <span style={{ color: 'var(--teal)', fontSize: '11px' }}>Member: {v.memberId}</span>
                          )}
                        </div>
                        <span>{new Date(v.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div style={{ color: 'var(--txt)' }}>{v.details}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--neon)' }}>
                  ✅ No integrity violations or suspicious behavior logged for this team.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Google Sheet Sync Modal */}
        {showSyncModal && (
          <div className="ov" style={{ zIndex: 1000 }}>
            <div className="box" style={{ maxWidth: '600px', width: '92%', padding: '20px', background: 'var(--bg2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="var(--teal)" />
                  <h3 style={{ margin: 0, color: 'var(--teal)', fontSize: '16px' }}>
                    Google Sheets & Form Team Roster Sync
                  </h3>
                </div>
                <button onClick={() => setShowSyncModal(false)} style={{ padding: '4px' }}>
                  <X size={16} />
                </button>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--txt)', lineHeight: 1.5, marginBottom: '12px' }}>
                Paste CSV or JSON rows exported from your Google Forms Responses Sheet. Each team gets an initial <b>₹1,000</b> budget and unique Member IDs.
              </p>

              {syncMessage && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: syncMessage.type === 'success' ? 'rgba(57, 255, 20, 0.1)' : 'var(--red-dim)',
                  border: `1px solid ${syncMessage.type === 'success' ? 'var(--neon)' : 'var(--red)'}`,
                  color: syncMessage.type === 'success' ? 'var(--neon)' : 'var(--red)',
                  fontSize: '12px',
                  marginBottom: '12px'
                }}>
                  {syncMessage.text}
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Paste CSV or JSON Data</label>
                <textarea
                  rows={8}
                  placeholder={`Team Name,Team Size,Captain Name,Member 2 Name,Member 3 Name\nSYNORA,3,Mohammed Salman,Abdul Rahman,Ahmed\nNEXUS,2,Sara Khan,Zayd Ali`}
                  value={syncInput}
                  onChange={(e) => setSyncInput(e.target.value)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    lineHeight: 1.4,
                    padding: '8px',
                    background: 'var(--bg4)',
                    color: 'var(--txt)'
                  }}
                />
              </div>

              <div style={{
                background: 'var(--bg3)',
                border: '1px solid var(--bd)',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '11px',
                color: 'var(--mut)',
                marginBottom: '14px'
              }}>
                💡 <b>Live Google Form Webhook:</b> In Google Sheets, you can also use Apps Script to POST automatically to <code>/api/teams/sync</code> on form submit.
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowSyncModal(false)} disabled={syncLoading}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="pri"
                  onClick={handleSyncSubmit}
                  disabled={syncLoading || !syncInput.trim()}
                >
                  {syncLoading ? 'Syncing Teams...' : 'Sync & Update Roster'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const badgeCardStyle = {
  background: 'var(--bg3)',
  border: '1px solid var(--bd)',
  borderRadius: '8px',
  padding: '8px 16px',
  minWidth: '120px'
};

const labelStyle = {
  display: 'block',
  color: 'var(--mut)',
  fontSize: '11px',
  textTransform: 'uppercase',
  marginTop: '2px'
};
