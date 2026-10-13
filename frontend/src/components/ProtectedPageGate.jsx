import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export function ProtectedPageGate({ onUnlock, onNavigateHome }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter the password to continue.');
      return;
    }

    setSubmitting(true);

    // Exact case-sensitive password check
    if (password === 'Abcd.01@#') {
      setTimeout(() => {
        setSubmitting(false);
        onUnlock();
      }, 200);
    } else {
      setTimeout(() => {
        setSubmitting(false);
        setError('Incorrect password. Access denied.');
      }, 250);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(30, 42, 80, 0.4) 0%, #060913 75%)',
        color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Decorative ambient lighting */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(137, 87, 229, 0.18) 0%, rgba(31, 111, 235, 0.12) 50%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Centered Glassmorphism Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(13, 17, 28, 0.82)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '20px',
          padding: '40px 32px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65), 0 0 40px rgba(88, 166, 255, 0.1)',
          boxSizing: 'border-box',
          animation: 'fadeInCard 0.3s ease-out'
        }}
      >
        {/* Lock Icon Emblem */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(88, 166, 255, 0.18) 0%, rgba(188, 140, 255, 0.22) 100%)',
              border: '1px solid rgba(88, 166, 255, 0.35)',
              boxShadow: '0 8px 28px rgba(88, 166, 255, 0.25)',
              marginBottom: '18px'
            }}
          >
            <Lock size={30} color="#58a6ff" />
          </div>

          <h2
            style={{
              margin: '0 0 8px',
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '0.4px',
              color: '#ffffff'
            }}
          >
            Protected Page
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: '#8b949e',
              lineHeight: 1.5
            }}
          >
            Enter the password to continue
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(248, 81, 73, 0.12)',
              border: '1px solid rgba(248, 81, 73, 0.35)',
              color: '#ff7b72',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '20px'
            }}
          >
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '22px' }}>
            <label
              htmlFor="protected-page-password"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--txt-muted)',
                marginBottom: '8px',
                letterSpacing: '0.2px'
              }}
            >
              Password
            </label>

            <div style={{ position: 'relative' }}>
              <input
                id="protected-page-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit(e);
                  }
                }}
                placeholder="Enter password"
                autoFocus
                autoComplete="current-password"
                style={{
                  width: '100%',
                  paddingLeft: '14px',
                  paddingRight: '44px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  fontSize: '14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: error
                    ? '1px solid rgba(248, 81, 73, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.14)',
                  color: '#ffffff',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  if (!error) {
                    e.target.style.borderColor = '#58a6ff';
                    e.target.style.boxShadow = '0 0 16px rgba(88, 166, 255, 0.25)';
                  }
                }}
                onBlur={(e) => {
                  if (!error) {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />

              {/* Show/Hide eye button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--txt-dim)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'color 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--txt-dim)')}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Unlock Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '13px 20px',
              fontSize: '14px',
              fontWeight: 700,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1f6feb 0%, #8957e5 100%)',
              border: '1px solid rgba(88, 166, 255, 0.4)',
              color: '#ffffff',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 20px rgba(31, 111, 235, 0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              opacity: submitting ? 0.75 : 1
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(31, 111, 235, 0.45)';
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 111, 235, 0.35)';
              }
            }}
          >
            <span>{submitting ? 'Verifying...' : 'Unlock Page'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Return to Home link */}
        {onNavigateHome && (
          <div style={{ textAlign: 'center', marginTop: '22px' }}>
            <button
              type="button"
              onClick={onNavigateHome}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--txt-muted)',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                transition: 'color 0.15s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--txt-muted)')}
            >
              <ArrowLeft size={13} /> Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
