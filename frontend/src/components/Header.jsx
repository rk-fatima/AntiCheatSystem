import React from 'react';
import { Trophy, ShieldAlert, CheckCircle2, XCircle, Coins, Settings, BarChart2, Maximize } from 'lucide-react';

export function Header({ team, onOpenProctor, onOpenLeaderboard, onToggleFullscreen }) {
  const flagsCount = team?.violations?.length || 0;
  const isHighRisk = flagsCount >= 3;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '8px 16px',
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--bd)',
      flexWrap: 'wrap'
    }}>
      <h1 style={{
        fontSize: '18px',
        margin: 0,
        color: 'var(--teal)',
        letterSpacing: '1px',
        textShadow: '0 0 8px #14d9c455',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        QUBIT <span style={{ color: 'var(--neon)' }}>//</span> THE AUCTIONEER
      </h1>

      <div style={{
        background: 'var(--bg4)',
        border: '1px solid var(--bd)',
        borderRadius: '6px',
        padding: '4px 10px',
        fontSize: '13px',
        color: 'var(--txt)',
        fontWeight: 600
      }}>
        Team: <span style={{ color: 'var(--teal)' }}>{team?.name || 'Guest'}</span>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginLeft: 'auto' }}>
        <div className="stat-card" style={statCardStyle}>
          <b style={{ color: 'var(--neon)', fontSize: '15px' }}>{team?.balance || 0}</b>
          <small style={labelStyle}>Balance</small>
        </div>

        <div className="stat-card" style={statCardStyle}>
          <b style={{ color: 'var(--neon)', fontSize: '15px' }}>{team?.solved?.length || 0}</b>
          <small style={labelStyle}>Solved</small>
        </div>

        <div className="stat-card" style={statCardStyle}>
          <b style={{ color: 'var(--neon)', fontSize: '15px' }}>{team?.score || 0}</b>
          <small style={labelStyle}>Points</small>
        </div>

        <div className="stat-card" style={statCardStyle}>
          <b style={{ color: 'var(--red)', fontSize: '15px' }}>{team?.wrong || 0}</b>
          <small style={labelStyle}>Wrong</small>
        </div>

        <div className="stat-card" style={{
          ...statCardStyle,
          borderColor: isHighRisk ? 'var(--red)' : 'var(--bd)',
          boxShadow: isHighRisk ? '0 0 10px #ff4d6d55' : 'none'
        }}>
          <b style={{ color: isHighRisk ? 'var(--red)' : 'var(--mut)', fontSize: '15px' }}>{flagsCount}</b>
          <small style={labelStyle}>Flags</small>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={onOpenLeaderboard} title="View Live Leaderboard">
          <BarChart2 size={16} /> Leaderboard
        </button>
        <button onClick={onToggleFullscreen} title="Enter Fullscreen">
          <Maximize size={16} />
        </button>
        <button id="gear" onClick={onOpenProctor} title="Organiser / Proctor Panel">
          <Settings size={16} />
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
  minWidth: '55px'
};

const labelStyle = {
  display: 'block',
  color: 'var(--mut)',
  fontSize: '10px',
  textTransform: 'uppercase'
};
