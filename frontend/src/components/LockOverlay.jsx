import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, KeyRound, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { requestTeamUnlock } from '../services/api';

export function LockOverlay({ teamName, reason, unlockRequestedInitial = false, onRequestSubmitted }) {
  const [showPrompt, setShowPrompt] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unlockRequested, setUnlockRequested] = useState(Boolean(unlockRequestedInitial));

  useEffect(() => {
    if (unlockRequestedInitial) {
      setUnlockRequested(true);
    }
  }, [unlockRequestedInitial]);

  // Extract violation count if mentioned in reason (e.g. "15 violations detected")
  const match = reason ? reason.match(/(\d+)\s+violations/i) : null;
  const violationCount = match ? match[1] : null;

  const handleRequestUnlock = async (e) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await requestTeamUnlock(teamName, password.trim());
      if (res && res.success) {
        setUnlockRequested(true);
        setPassword('');
        if (onRequestSubmitted && res.team) {
          onRequestSubmitted(res.team);
        }
      } else {
        setError(res?.error || 'Incorrect password. Screen remains locked.');
      }
    } catch (err) {
      setError(err.message || 'Incorrect password. Screen remains locked.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="ov"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(4, 7, 16, 0.96)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        userSelect: 'none'
      }}
    >
      <div
        className="box"
        style={{
          width: '100%',
          maxWidth: '460px',
          textAlign: 'center',
          padding: '36px 32px',
          borderRadius: '16px',
          background: 'linear-gradient(180deg, rgba(18, 22, 36, 0.98) 0%, rgba(10, 13, 24, 0.98) 100%)',
          border: '1px solid rgba(248, 81, 73, 0.35)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85), 0 0 40px rgba(248, 81, 73, 0.12)'
        }}
      >
        {/* Shield / Lock Icon */}
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'rgba(248, 81, 73, 0.12)',
            border: '1px solid rgba(248, 81, 73, 0.35)',
            color: '#ff7b72',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}
        >
          <ShieldAlert size={30} />
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '999px',
            background: 'rgba(248, 81, 73, 0.12)',
            border: '1px solid rgba(248, 81, 73, 0.3)',
            color: '#ff7b72',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}
        >
          <Lock size={12} /> TEAM LOCKED • {teamName}
        </div>

        <h2
          style={{
            color: '#ffffff',
            margin: '0 0 10px',
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '-0.2px',
            lineHeight: 1.3
          }}
        >
          Your screen has been locked by the administrator.
        </h2>

        {violationCount ? (
          <div
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '12px',
              background: 'rgba(248, 81, 73, 0.1)',
              border: '1px solid rgba(248, 81, 73, 0.25)',
              color: '#ff7b72',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '20px'
            }}
          >
            {violationCount} anti-cheat violations detected
          </div>
        ) : (
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.65)',
              fontSize: '13.5px',
              margin: '0 auto 24px',
              lineHeight: 1.55,
              maxWidth: '380px'
            }}
          >
            {reason && reason !== 'Your screen has been locked by the administrator.'
              ? reason
              : 'Normal portal access is temporarily suspended. Please verify your password below to request administrator unlock.'}
          </p>
        )}

        {unlockRequested ? (
          <div
            style={{
              padding: '18px 16px',
              borderRadius: '12px',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              textAlign: 'center',
              marginBottom: '12px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '14px',
                marginBottom: '6px'
              }}
            >
              <CheckCircle2 size={18} />
              Password Verified — Unlock Requested
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '12.5px', lineHeight: 1.5 }}>
              Your screen remains locked until the authorized administrator unlocks your team. Once approved, your screen will return to normal automatically.
            </div>
          </div>
        ) : !showPrompt ? (
          <button
            className="btn-primary"
            onClick={() => setShowPrompt(true)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <KeyRound size={16} /> Unlock Screen
          </button>
        ) : (
          <form onSubmit={handleRequestUnlock} style={{ textAlign: 'left' }}>
            <label
              style={{
                display: 'block',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '8px'
              }}
            >
              Enter Password to Unlock / Request Approval
            </label>
            <input
              type="password"
              placeholder="Enter team password..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              autoFocus
              style={{
                fontSize: '14px',
                padding: '12px 14px',
                width: '100%',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: error
                  ? '1px solid rgba(248, 81, 73, 0.65)'
                  : '1px solid rgba(255, 255, 255, 0.14)',
                color: '#ffffff',
                outline: 'none',
                marginBottom: '10px'
              }}
            />

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#ff7b72',
                  background: 'rgba(248, 81, 73, 0.1)',
                  border: '1px solid rgba(248, 81, 73, 0.25)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  marginBottom: '12px'
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" /> Verifying...
                </>
              ) : (
                <>
                  <KeyRound size={16} /> Submit Password to Unlock
                </>
              )}
            </button>
          </form>
        )}

        <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '11.5px', marginTop: '18px' }}>
          Waiting for administrator sync • Screen unlocks automatically upon admin approval
        </div>
      </div>
    </div>
  );
}
