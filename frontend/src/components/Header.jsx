import React from 'react';
import { Trophy, ShieldAlert, CheckCircle2, Coins, Settings, BarChart2, Maximize, Crown, Users, Receipt, Flag, Shield } from 'lucide-react';

export function Header({ team, currentMember, onOpenLeaderboard, onOpenTransactions, onToggleFullscreen, onOpenAdmin }) {
  const flagsCount = team?.violations?.length || 0;
  const isHighRisk = flagsCount >= 3;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      background: 'rgba(6, 9, 19, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      minHeight: '56px',
      flexWrap: 'wrap',
      gap: '16px',
      zIndex: 50
    }}>
      {/* Left: Brand + Team Workspace identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{
            fontSize: '17px',
            fontWeight: 800,
            letterSpacing: '0.5px',
            color: '#ffffff'
          }}>
            QUBIT
          </span>
          <span style={{ color: '#bc8cff', fontWeight: 600, fontSize: '14px' }}>//</span>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1.2px',
            color: 'var(--txt-muted)',
            textTransform: 'uppercase'
          }}>
            TEAM WORKSPACE
          </span>
        </div>

        {/* Subtle Divider */}
        <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Small Team & Member Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span style={{
            color: '#f0f6fc',
            fontWeight: 700,
            letterSpacing: '0.3px',
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {team?.name || 'GUEST'}
          </span>

          {currentMember && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--txt-muted)' }}>
              <span>•</span>
              {currentMember.isCaptain && (
                <Crown size={12} color="#f0b72f" title="Team Leader" style={{ flexShrink: 0 }} />
              )}
              <span style={{ color: '#c9d1d9', fontWeight: 500 }}>{currentMember.name}</span>
              <span style={{ color: 'var(--txt-dim)', fontSize: '11px' }}>({currentMember.memberId})</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Essential Stats (no heavy pills) + Ghost Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* Simple Text + Icons Stats Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px' }}>
          {/* ByteCoins */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Team Shared ByteCoins Balance">
            <Coins size={15} color="#58a6ff" />
            <b style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
              {team?.balance ?? 1000}
            </b>
            <span style={{ color: 'var(--txt-muted)', fontSize: '12px' }}>ByteCoins</span>
          </div>

          <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>•</span>

          {/* Points */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Leaderboard Contest Points">
            <Trophy size={15} color="#bc8cff" />
            <b style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
              {team?.score || 0}
            </b>
            <span style={{ color: 'var(--txt-muted)', fontSize: '12px' }}>Points</span>
          </div>

          <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>•</span>

          {/* Solved */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Problems Solved">
            <CheckCircle2 size={15} color="#3fb950" />
            <b style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
              {team?.solved?.length || 0}
            </b>
            <span style={{ color: 'var(--txt-muted)', fontSize: '12px' }}>Solved</span>
          </div>

          {/* Flags (subtle, only red if high risk) */}
          {flagsCount > 0 && (
            <>
              <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>•</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: isHighRisk ? '#f85149' : 'var(--txt-muted)'
              }} title="Integrity violations logged">
                <Flag size={14} color={isHighRisk ? '#f85149' : 'var(--txt-muted)'} />
                <span style={{ fontWeight: 600, fontSize: '12px' }}>
                  {flagsCount} Flags
                </span>
              </div>
            </>
          )}
        </div>

        {/* Subtle Divider */}
        <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Clean Action Icons / Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onOpenTransactions && (
            <button
              className="btn-ghost"
              onClick={onOpenTransactions}
              title="View Team Purchases & Invoices"
              style={{ fontSize: '12px', padding: '5px 10px' }}
            >
              <Receipt size={14} /> Purchases
            </button>
          )}
          <button
            className="btn-ghost"
            onClick={onOpenLeaderboard}
            title="View Live Leaderboard"
            style={{ fontSize: '12px', padding: '5px 10px' }}
          >
            <BarChart2 size={14} /> Leaderboard
          </button>
          <button
            className="btn-ghost"
            onClick={onToggleFullscreen}
            title="Toggle Fullscreen"
            style={{ padding: '6px' }}
          >
            <Maximize size={14} />
          </button>
          {onOpenAdmin && (
            <button
              className="btn-ghost"
              onClick={onOpenAdmin}
              title="Admin Portal (Secure Login)"
              style={{ fontSize: '12px', padding: '5px 10px', color: '#58a6ff', borderColor: 'rgba(56, 139, 253, 0.3)' }}
            >
              <Shield size={13} /> Admin
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
