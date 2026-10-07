import React, { useState } from 'react';
import { ShieldCheck, Maximize2, Users, Crown, ArrowRight } from 'lucide-react';
import { loginTeam } from '../services/api';

export function GateModal({ onTeamSessionReady }) {
  const [teamName, setTeamName] = useState('');
  const [memberSuffix, setMemberSuffix] = useState('01');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEnter = async () => {
    const trimmed = teamName.trim().toUpperCase();
    if (!trimmed) {
      setError('Please enter your Team Name (as submitted in Google Forms).');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const targetMemberId = `${trimmed}-${memberSuffix}`;
      const res = await loginTeam({
        teamName: trimmed,
        memberId: targetMemberId
      });

      onTeamSessionReady(res.team, res.member);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your team name.');
    } finally {
      setLoading(false);
    }
  };

  const previewMemberId = `${teamName.trim().toUpperCase() || 'TEAM'}-${memberSuffix}`;

  return (
    <div className="ov" style={{ zIndex: 999 }}>
      <div className="box" style={{ maxWidth: '440px', width: '92%', padding: '24px', background: 'var(--bg2)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={28} color="var(--teal)" />
            <h2 style={{ color: 'var(--teal)', margin: 0, fontSize: '20px' }}>
              Qubit — Team Exam Entrance
            </h2>
          </div>
          <span style={{
            fontSize: '11px',
            background: 'var(--bg4)',
            color: 'var(--neon)',
            border: '1px solid var(--neon)',
            padding: '3px 8px',
            borderRadius: '4px',
            fontWeight: 700
          }}>
            ₹1,000 Budget
          </span>
        </div>

        <p style={{ color: 'var(--txt)', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
          Enter the <b>Team Name</b> registered in your Google Form and pick your <b>Member ID</b> to access your shared workspace.
        </p>

        {/* Error notification */}
        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '6px',
            background: 'var(--red-dim)',
            border: '1px solid var(--red)',
            color: 'var(--red)',
            fontSize: '12px',
            marginBottom: '14px',
            fontWeight: 600
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Team Name Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>
            Team Name
          </label>
          <input
            placeholder="e.g. SYNORA"
            value={teamName}
            onChange={(e) => {
              setTeamName(e.target.value.toUpperCase());
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
            autoFocus
            style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '0.5px' }}
          />
        </div>

        {/* Member Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>
            Select Your Member Identity
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {['01', '02', '03'].map((suffix) => {
              const isSelected = memberSuffix === suffix;
              const memberId = `${teamName.trim().toUpperCase() || 'TEAM'}-${suffix}`;

              return (
                <button
                  key={suffix}
                  type="button"
                  onClick={() => setMemberSuffix(suffix)}
                  style={{
                    padding: '10px 6px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--teal)' : 'var(--bd)',
                    background: isSelected ? 'var(--teal)' : 'var(--bg3)',
                    color: isSelected ? '#000' : 'var(--txt)',
                    fontWeight: 700,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '14px' }}>Member {parseInt(suffix, 10)}</div>
                  <small style={{
                    display: 'block',
                    fontSize: '10px',
                    marginTop: '2px',
                    opacity: isSelected ? 0.9 : 0.6
                  }}>
                    {memberId}
                  </small>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--mut)', textAlign: 'center' }}>
            Logging in as: <b style={{ color: 'var(--teal)' }}>{previewMemberId}</b>
          </div>
        </div>

        {/* Fullscreen Rules Reminder */}
        <div style={{
          background: 'var(--bg3)',
          border: '1px solid var(--bd)',
          borderRadius: '6px',
          padding: '10px 12px',
          fontSize: '11px',
          color: 'var(--mut)',
          marginBottom: '18px',
          lineHeight: 1.5
        }}>
          🔒 Fullscreen is mandatory. Tab switches or exits trigger anti-cheat integrity flags.
        </div>

        {/* Enter Button */}
        <button
          className="pri"
          onClick={handleEnter}
          disabled={loading}
          style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 700 }}
        >
          <Maximize2 size={18} /> {loading ? 'Entering...' : 'Enter Shared Workspace in Fullscreen'}
        </button>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  color: 'var(--teal)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  fontWeight: 700,
  letterSpacing: '0.5px'
};
