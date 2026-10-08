import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { adminLogin } from '../services/api';

export function AdminLogin({ onLoginSuccess, onBackToWorkspace }) {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminId.trim() || !password.trim()) {
      setError('Please provide both Admin ID and Password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await adminLogin(adminId.trim(), password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setError('Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError(err.message || 'Invalid Admin ID or Password. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse at 50% 20%, rgba(30, 42, 80, 0.3) 0%, #060913 75%)',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Container Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(13, 17, 28, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '36px 32px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(88, 166, 255, 0.08)'
      }}>
        {/* Top Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(88, 166, 255, 0.2) 0%, rgba(188, 140, 255, 0.2) 100%)',
            border: '1px solid rgba(88, 166, 255, 0.3)',
            marginBottom: '16px',
            boxShadow: '0 0 25px rgba(88, 166, 255, 0.2)'
          }}>
            <Shield size={26} color="#58a6ff" />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '6px'
          }}>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.8px', color: '#ffffff' }}>
              QUBIT
            </span>
            <span style={{ color: '#bc8cff', fontWeight: 600 }}>//</span>
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1.2px',
              color: 'var(--txt-muted)',
              textTransform: 'uppercase'
            }}>
              ADMIN PORTAL
            </span>
          </div>

          <p style={{
            margin: 0,
            fontSize: '13px',
            color: 'var(--txt-muted)',
            lineHeight: 1.5
          }}>
            Competition Control & Unlock Management Console
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '8px',
            background: 'rgba(248, 81, 73, 0.12)',
            border: '1px solid rgba(248, 81, 73, 0.35)',
            color: '#ff7b72',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Admin ID field */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--txt-muted)',
              marginBottom: '6px'
            }}>
              Admin ID
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                color="var(--txt-dim)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Enter Admin ID"
                autoFocus
                style={{
                  width: '100%',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--txt-muted)',
              marginBottom: '6px'
            }}>
              Master Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                color="var(--txt-dim)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Admin Password"
                style={{
                  width: '100%',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px 18px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '8px',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(88, 166, 255, 0.25)'
            }}
          >
            {loading ? (
              'Authenticating...'
            ) : (
              <>
                <span>Access Admin Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Back to Workspace button */}
        {onBackToWorkspace && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onBackToWorkspace}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--txt-muted)',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px'
              }}
            >
              <ArrowLeft size={13} /> Return to Team Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
