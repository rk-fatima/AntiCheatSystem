import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Lock } from 'lucide-react';
import { proctorUnlockTeam } from '../services/api';

export function LockOverlay({ teamName, reason, onUnlocked }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    if (!pin.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await proctorUnlockTeam(teamName, pin.trim());
      if (res.success) {
        onUnlocked(res.team);
      } else {
        setError(res.error || 'Invalid Organiser PIN');
      }
    } catch (err) {
      setError(err.message || 'Unlock failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ov" style={{ zIndex: 1000, background: 'rgba(10, 5, 15, 0.95)' }}>
      <div className="box" style={{ maxWidth: '460px', textAlign: 'center', border: '2px solid var(--red)' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--red-dim)',
          color: 'var(--red)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <ShieldAlert size={32} />
        </div>

        <h2 style={{ color: 'var(--red)', margin: '0 0 10px', fontSize: '22px' }}>
          Session Locked
        </h2>

        <p style={{ color: 'var(--txt)', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
          {reason || 'Too many integrity flags detected (fullscreen exits, tab switches, or forbidden shortcuts). An exam proctor must unlock your session to resume.'}
        </p>

        <div style={{
          background: 'var(--bg3)',
          border: '1px solid var(--bd)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '18px'
        }}>
          <div style={{
            fontSize: '11px',
            color: 'var(--mut)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px'
          }}>
            Organiser Unlock PIN
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '16px' }}
            />
            <button className="pri" onClick={handleUnlock} disabled={loading}>
              <KeyRound size={16} /> Unlock
            </button>
          </div>
          {error && (
            <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '8px', fontWeight: 600 }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ color: 'var(--mut)', fontSize: '12px' }}>
          Tip: Organisers can also remotely unlock your station from the Proctor Dashboard.
        </div>
      </div>
    </div>
  );
}
