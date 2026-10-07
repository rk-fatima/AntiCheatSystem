import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Loader2 } from 'lucide-react';
import { proctorUnlockTeam } from '../services/api';

export function LockOverlay({ teamName, reason, onUnlocked }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Extract violation count if mentioned in reason (e.g. "15 violations detected")
  const match = reason ? reason.match(/(\d+)\s+violations/i) : null;
  const violationCount = match ? match[1] : null;

  const handleUnlock = async () => {
    if (!pin.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await proctorUnlockTeam(teamName, pin.trim());
      if (res.success) {
        onUnlocked(res.team);
      } else {
        setError(res.error || 'Invalid Organizer PIN');
      }
    } catch (err) {
      setError(err.message || 'Unlock failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ov" style={{ zIndex: 1000, background: 'rgba(4, 7, 16, 0.94)' }}>
      <div className="box" style={{
        maxWidth: '420px',
        textAlign: 'center',
        padding: '32px 28px',
        border: '1px solid rgba(248, 81, 73, 0.3)',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 30px rgba(248, 81, 73, 0.08)'
      }}>
        {/* Subtle Shield Icon */}
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          background: 'rgba(248, 81, 73, 0.12)',
          border: '1px solid rgba(248, 81, 73, 0.3)',
          color: '#ff7b72',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px'
        }}>
          <ShieldAlert size={26} />
        </div>

        <h2 style={{ color: '#ffffff', margin: '0 0 6px', fontSize: '22px', fontWeight: 700, letterSpacing: '0.2px' }}>
          Session Locked
        </h2>

        <div style={{ color: 'var(--txt-muted)', fontSize: '14px', marginBottom: '14px' }}>
          Security verification required
        </div>

        {violationCount ? (
          <div style={{
            display: 'inline-block',
            padding: '3px 12px',
            borderRadius: '12px',
            background: 'rgba(248, 81, 73, 0.1)',
            border: '1px solid rgba(248, 81, 73, 0.25)',
            color: '#ff7b72',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '20px'
          }}>
            {violationCount} violations detected
          </div>
        ) : (
          <div style={{
            color: 'var(--txt-dim)',
            fontSize: '12px',
            marginBottom: '20px',
            lineHeight: 1.5,
            maxWidth: '340px',
            margin: '0 auto 20px'
          }}>
            {reason || 'Anti-cheat integrity threshold reached.'}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <input
            type="password"
            placeholder="Enter organizer PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            autoFocus
            style={{
              textAlign: 'center',
              letterSpacing: '4px',
              fontSize: '15px',
              padding: '10px 14px',
              width: '100%',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          />
          {error && (
            <div style={{ color: '#ff7b72', fontSize: '12px', marginTop: '8px', fontWeight: 500 }}>
              {error}
            </div>
          )}
        </div>

        <button
          className="btn-primary"
          onClick={handleUnlock}
          disabled={loading || !pin.trim()}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '13px'
          }}
        >
          {loading ? <Loader2 size={16} className="spin" /> : 'Unlock Session'}
        </button>

        <div style={{ color: 'var(--txt-dim)', fontSize: '11px', marginTop: '16px' }}>
          Organizers may also unlock remotely from the Proctor Dashboard
        </div>
      </div>
    </div>
  );
}
