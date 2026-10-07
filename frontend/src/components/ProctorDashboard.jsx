import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, RefreshCw, Unlock, Search, X, AlertTriangle } from 'lucide-react';
import { fetchProctorTeams, proctorUnlockTeam, proctorResetTeam } from '../services/api';

export function ProctorDashboard({ onClose }) {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTeamLogs, setSelectedTeamLogs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState('qubit');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProctorTeams();
      setTeams(data.teams || []);
    } catch (err) {
      console.error('Failed to load proctor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh proctor view every 3 seconds
    const interval = setInterval(loadData, 3000);
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

  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalLocked = teams.filter(t => t.isLocked).length;

  return (
    <div className="ov" style={{ zIndex: 900 }}>
      <div className="box" style={{ maxWidth: '1000px', width: '95%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={24} color="var(--teal)" />
            <h2 style={{ margin: 0, color: 'var(--teal)', fontSize: '20px' }}>
              Organiser & Proctor Live Monitor
            </h2>
          </div>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        {/* Stats summary row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={badgeCardStyle}>
            <b style={{ fontSize: '18px', color: 'var(--txt)' }}>{teams.length}</b>
            <small style={labelStyle}>Total Contestants</small>
          </div>
          <div style={badgeCardStyle}>
            <b style={{ fontSize: '18px', color: 'var(--neon)' }}>{teams.length - totalLocked}</b>
            <small style={labelStyle}>Active Sessions</small>
          </div>
          <div style={{ ...badgeCardStyle, borderColor: totalLocked > 0 ? 'var(--red)' : 'var(--bd)' }}>
            <b style={{ fontSize: '18px', color: totalLocked > 0 ? 'var(--red)' : 'var(--mut)' }}>{totalLocked}</b>
            <small style={labelStyle}>Locked Sessions</small>
          </div>
          <button onClick={loadData} disabled={loading} style={{ marginLeft: 'auto' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
          <Search size={18} color="var(--mut)" />
          <input
            placeholder="Search teams by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '350px' }}
          />
        </div>

        {/* Table of Contestants */}
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
          border: '1px solid var(--bd)',
          borderRadius: '8px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--bd)', color: 'var(--mut)' }}>
                <th style={{ padding: '10px 14px' }}>Team Name</th>
                <th style={{ padding: '10px 14px' }}>Score</th>
                <th style={{ padding: '10px 14px' }}>Solved</th>
                <th style={{ padding: '10px 14px' }}>Flags</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((t) => {
                const flags = t.violations?.length || 0;
                return (
                  <tr key={t.name} style={{ borderBottom: '1px solid var(--bd)', background: t.isLocked ? '#2e121e' : 'transparent' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{t.name}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--neon)', fontWeight: 700 }}>{t.score || 0} pts</td>
                    <td style={{ padding: '10px 14px' }}>{t.solved?.length || 0}</td>
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
                        <button onClick={() => setSelectedTeamLogs(t)} title="Inspect violation logs">
                          Audit Log
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
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--mut)' }}>
                    No teams matched your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Audit Log Modal */}
        {selectedTeamLogs && (
          <div className="ov" style={{ zIndex: 1100 }}>
            <div className="box" style={{ maxWidth: '600px' }}>
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
                        <b style={{ color: 'var(--red)' }}>{v.event}</b>
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
