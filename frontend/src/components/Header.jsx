import React from 'react';
import { Trophy, ShieldAlert, CheckCircle2, XCircle, Coins, Settings, BarChart2, Maximize, Crown, Users, Receipt } from 'lucide-react';

export function Header({ team, currentMember, onOpenProctor, onOpenLeaderboard, onOpenTransactions, onToggleFullscreen }) {
  const flagsCount = team?.violations?.length || 0;
  const isHighRisk = flagsCount >= 3;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 16px',
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--bd)',
      flexWrap: 'wrap'
    }}>
      <h1 style={{
        fontSize: '17px',
        margin: 0,
        color: 'var(--teal)',
        letterSpacing: '1px',
        textShadow: '0 0 8px #14d9c455',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        QUBIT <span style={{ color: 'var(--neon)' }}>//</span> TEAM WORKSPACE
      </h1>

      {/* Team Badge */}
      <div style={{
        background: 'var(--bg4)',
        border: '1px solid var(--bd)',
        borderRadius: '6px',
        padding: '4px 10px',
        fontSize: '13px',
        color: 'var(--txt)',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <Users size={14} color="var(--teal)" />
        Team: <span style={{ color: 'var(--teal)', fontWeight: 700 }}>{team?.name || 'Guest'}</span>
        {team?.size && <small style={{ color: 'var(--mut)', fontSize: '11px' }}>({team.size}P)</small>}
      </div>

      {/* Member Identity Badge */}
      {currentMember && (
        <div style={{
          background: 'rgba(20, 217, 196, 0.1)',
          border: '1px solid var(--teal)',
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '12px',
          color: 'var(--txt)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {currentMember.isCaptain ? (
            <Crown size={14} color="var(--neon)" title="Team Captain" />
          ) : (
            <span style={{ color: 'var(--teal)', fontWeight: 700 }}>ID:</span>
          )}
          <b style={{ color: 'var(--teal)' }}>{currentMember.memberId}</b>
          <span>({currentMember.name})</span>
        </div>
      )}

      {/* Stats counter row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginLeft: 'auto' }}>
        <div className="stat-card" style={statCardStyle}>
          <b style={{ color: 'var(--neon)', fontSize: '15px' }}>₹{team?.balance ?? 1000}</b>
          <small style={labelStyle}>Team Balance</small>
        </div>

        <div className="stat-card" style={statCardStyle}>
          <b style={{ color: 'var(--neon)', fontSize: '15px' }}>{team?.solved?.length || 0}</b>
          <small style={labelStyle}>Solved</small>
        </div>

        <div className="stat-card" style={statCardStyle}>
          <b style={{ color: 'var(--neon)', fontSize: '15px' }}>{team?.score || 0}</b>
          <small style={labelStyle}>Points</small>
        </div>

        <div className="stat-card" style={{
          ...statCardStyle,
          borderColor: isHighRisk ? 'var(--red)' : 'var(--bd)',
          boxShadow: isHighRisk ? '0 0 10px #ff4d6d55' : 'none'
        }}>
          <b style={{ color: isHighRisk ? 'var(--red)' : 'var(--mut)', fontSize: '15px' }}>{flagsCount}</b>
          <small style={labelStyle}>Team Flags</small>
        </div>
      </div>

      {/* Quick shortcuts */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {onOpenTransactions && (
          <button onClick={onOpenTransactions} title="View Team Purchases & Invoices">
            <Receipt size={15} /> Purchases
          </button>
        )}
        <button onClick={onOpenLeaderboard} title="View Live Ranked Scoreboard">
          <BarChart2 size={15} /> Leaderboard
        </button>
        <button onClick={onToggleFullscreen} title="Enter Fullscreen">
          <Maximize size={15} />
        </button>
        <button id="gear" onClick={onOpenProctor} title="Organiser / Proctor Panel">
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
}

const statCardStyle = {
  background: 'var(--bg3)',
  border: '1px solid var(--bd)',
  borderRadius: '6px',
  padding: '2px 10px',
  textAlign: 'center',
  minWidth: '60px'
};

const labelStyle = {
  display: 'block',
  color: 'var(--mut)',
  fontSize: '10px',
  textTransform: 'uppercase',
  marginTop: '1px'
};
