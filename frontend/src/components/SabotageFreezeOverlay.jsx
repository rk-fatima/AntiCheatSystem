import React, { useState, useEffect } from 'react';
import { Zap, ShieldAlert, Lock, AlertOctagon } from 'lucide-react';

export function SabotageFreezeOverlay({ team, onFreezeExpired }) {
  const [remainingMs, setRemainingMs] = useState(() => {
    if (!team?.frozenUntil) return 0;
    return Math.max(0, team.frozenUntil - Date.now());
  });

  useEffect(() => {
    const updateTimer = () => {
      if (!team?.frozenUntil) {
        setRemainingMs(0);
        return;
      }
      const left = Math.max(0, team.frozenUntil - Date.now());
      setRemainingMs(left);
      if (left <= 0 && onFreezeExpired) {
        onFreezeExpired();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [team?.frozenUntil, onFreezeExpired]);

  if (remainingMs <= 0) return null;

  const totalSec = Math.ceil(remainingMs / 1000);
  const minutes = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const seconds = String(totalSec % 60).padStart(2, '0');
  const formattedTime = `${minutes}:${seconds}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(8, 2, 14, 0.94)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        userSelect: 'none',
        pointerEvents: 'all'
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          background: 'radial-gradient(ellipse at top, #2b0a1a 0%, #12040c 70%, #080106 100%)',
          border: '2px solid #ff0055',
          borderRadius: '12px',
          padding: '32px 28px',
          textAlign: 'center',
          boxShadow: '0 0 50px rgba(255, 0, 85, 0.4), inset 0 0 30px rgba(255, 0, 85, 0.15)',
          animation: 'pulseGlow 2s infinite ease-in-out'
        }}
      >
        {/* Pulsing Lightning Icon */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'rgba(255, 0, 85, 0.15)',
            border: '2px solid #ff0055',
            color: '#ff0055',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 24px rgba(255, 0, 85, 0.6)'
          }}
        >
          <Zap size={38} className="spin-slow" />
        </div>

        {/* Heading */}
        <div style={{
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '2px',
          color: '#ff4d6d',
          textTransform: 'uppercase',
          marginBottom: '6px'
        }}>
          RIVAL POWER CARD TRIGGERED
        </div>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: 900,
            color: '#fff',
            margin: '0 0 6px 0',
            letterSpacing: '2px',
            textShadow: '0 0 16px #ff0055'
          }}
        >
          ⚡ SABOTAGED
        </h1>

        <p style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#ff758f',
          margin: '0 0 18px 0'
        }}>
          Your screen is frozen
        </p>

        {/* Countdown Timer Display */}
        <div
          style={{
            background: 'rgba(20, 3, 10, 0.8)',
            border: '1px solid rgba(255, 0, 85, 0.5)',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '20px',
            boxShadow: 'inset 0 0 15px rgba(255, 0, 85, 0.2)'
          }}
        >
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--mut)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '6px'
          }}>
            Time Remaining
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '44px',
              fontWeight: 900,
              color: '#ff0055',
              letterSpacing: '3px',
              textShadow: '0 0 20px #ff0055'
            }}
          >
            {formattedTime}
          </div>

          <div style={{
            fontSize: '12px',
            color: '#ffb3c1',
            marginTop: '6px',
            fontWeight: 600
          }}>
            {team?.frozenBy ? (
              <>Attack launched by: <b style={{ color: '#fff' }}>Team {team.frozenBy}</b></>
            ) : (
              'Attack launched by rival team'
            )}
          </div>
        </div>

        {/* Lockout Details */}
        <div
          style={{
            background: 'rgba(255, 0, 85, 0.08)',
            border: '1px solid rgba(255, 0, 85, 0.2)',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '12px',
            color: '#ffccd5',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textAlign: 'left'
          }}
        >
          <Lock size={18} color="#ff0055" style={{ flexShrink: 0 }} />
          <span>
            Code editor execution, tests, and submissions are strictly locked during this 5-minute freeze. Your workspace will automatically re-activate when the countdown reaches 00:00.
          </span>
        </div>
      </div>
    </div>
  );
}
