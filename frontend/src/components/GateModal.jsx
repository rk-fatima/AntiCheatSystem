import React, { useState } from 'react';
import { ShieldCheck, Maximize2, Search, Check, RefreshCw, AlertCircle, Crown, Lock, Eye, EyeOff, QrCode, Clock, ArrowLeft } from 'lucide-react';
import { getTeamStatus, loginTeam, verifyTeamCredentials } from '../services/api';

export function GateModal({ onTeamSessionReady, onOpenAdmin, onOpenRegister, onBackToLanding }) {
  const [teamInput, setTeamInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedTeam, setVerifiedTeam] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleVerifyTeam = async () => {
    const trimmed = teamInput.trim().toUpperCase();
    if (!trimmed) {
      setFeedback({ type: 'error', message: 'Please enter your registered Team Name.' });
      return;
    }

    setVerifying(true);
    setFeedback(null);
    setVerifiedTeam(null);
    setSelectedMember(null);

    try {
      const res = await verifyTeamCredentials({ teamName: trimmed, password: passwordInput });
      const team = res.team;
      if (!team || !team.members || team.members.length === 0) {
        throw new Error(`Team "${trimmed}" has no registered members in the database.`);
      }
      setVerifiedTeam(team);
    } catch (err) {
      setVerifiedTeam(null);
      setSelectedMember(null);
      const isPending = err.isPending || (err.message && err.message.toLowerCase().includes('pending'));
      const isRejected = err.isRejected || (err.message && err.message.toLowerCase().includes('rejected'));
      setFeedback({
        type: isPending ? 'pending' : isRejected ? 'rejected' : 'error',
        message: err.message || `Team "${trimmed}" not found in registration database.`
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    if (feedback?.type === 'error') {
      setFeedback(null);
    }
  };

  const handleEnterWorkspace = async () => {
    if (!verifiedTeam) {
      setFeedback({ type: 'error', message: 'Please verify your registered Team Name and Password first.' });
      return;
    }
    if (!selectedMember) {
      setFeedback({ type: 'error', message: 'Please select your identity from the registered team members.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await loginTeam({
        teamName: verifiedTeam.name,
        memberId: selectedMember.memberId,
        password: passwordInput
      });

      onTeamSessionReady(res.team, res.member);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Login failed. Please verify with the proctor.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ov" style={{ zIndex: 999, padding: '16px' }}>
      <div
        className="box"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '28px 24px',
          background: '#0d111c',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.2)',
          position: 'relative',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top Header Row with Shared Budget Badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>QUBIT</span>
              <span style={{ color: '#bc8cff', fontWeight: 600, fontSize: '14px' }}>//</span>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: 'var(--txt-muted)', textTransform: 'uppercase' }}>
                ENTRANCE
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--txt-muted)' }}>
              Developer Competitive Platform
            </p>
          </div>

          {/* Shared Team Budget Badge */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '6px 10px',
            textAlign: 'right',
            flexShrink: 0
          }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--txt-dim)', textTransform: 'uppercase' }}>
              Team Budget
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
              ₹1,000
            </div>
            <div style={{ fontSize: '10px', color: 'var(--txt-muted)' }}>
              Shared balance
            </div>
          </div>
        </div>

        {/* Step 1: Team Name & Password Verification Input */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--txt-muted)',
              marginBottom: '5px'
            }}>
              Registered Team Name
            </label>
            <input
              type="text"
              placeholder="e.g. CYBER_TITANS"
              value={teamInput}
              onChange={(e) => {
                setTeamInput(e.target.value.toUpperCase());
                if (verifiedTeam) {
                  setVerifiedTeam(null);
                  setSelectedMember(null);
                }
                if (feedback) setFeedback(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleVerifyTeam();
                }
              }}
              disabled={verifying}
              autoFocus
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '9px 12px',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--txt-muted)',
              marginBottom: '5px'
            }}>
              Team Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your team password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (verifiedTeam) {
                    setVerifiedTeam(null);
                    setSelectedMember(null);
                  }
                  if (feedback) setFeedback(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleVerifyTeam();
                  }
                }}
                disabled={verifying}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 34px 9px 12px',
                  fontSize: '13px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--txt-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleVerifyTeam}
            disabled={verifying || !teamInput.trim()}
            className={verifiedTeam ? 'btn-ghost' : 'btn-primary'}
            style={{
              width: '100%',
              padding: '9px 14px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {verifying ? (
              <>
                <RefreshCw size={14} className="spin" />
                <span>Authenticating Team...</span>
              </>
            ) : verifiedTeam ? (
              <>
                <Check size={14} color="#3fb950" />
                <span>Verified & Authenticated ✓</span>
              </>
            ) : (
              <>
                <Search size={14} />
                <span>Verify Team Credentials</span>
              </>
            )}
          </button>

          {/* Validation Feedback States */}
          {!verifying && verifiedTeam && (
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              background: 'rgba(63, 185, 80, 0.1)',
              border: '1px solid rgba(63, 185, 80, 0.3)',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#3fb950',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Check size={14} style={{ flexShrink: 0 }} />
              <span>Team verified: <b>{verifiedTeam.name}</b>. Select your member identity below.</span>
            </div>
          )}

          {!verifying && feedback?.type === 'pending' && (
            <div style={{
              marginTop: '10px',
              padding: '10px 14px',
              background: 'rgba(210, 153, 34, 0.12)',
              border: '1px solid rgba(210, 153, 34, 0.35)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#d29922',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              lineHeight: 1.4
            }}>
              <Clock size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Registration Pending Approval:</strong>
                <div style={{ marginTop: '2px' }}>{feedback.message}</div>
              </div>
            </div>
          )}

          {!verifying && (feedback?.type === 'error' || feedback?.type === 'rejected') && (
            <div style={{
              marginTop: '10px',
              padding: '10px 14px',
              background: 'rgba(248, 81, 73, 0.1)',
              border: '1px solid rgba(248, 81, 73, 0.3)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#ff7b72',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              lineHeight: 1.4
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Step 2: Dynamic Member Selection */}
        <div style={{
          marginBottom: '16px',
          opacity: verifiedTeam ? 1 : 0.45,
          pointerEvents: verifiedTeam ? 'auto' : 'none',
          transition: 'opacity 0.2s ease'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px'
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--txt-muted)'
            }}>
              Select Identity
            </span>
            {verifiedTeam && (
              <span style={{ fontSize: '11px', color: 'var(--txt-dim)' }}>
                {verifiedTeam.members?.length} registered
              </span>
            )}
          </div>

          {!verifiedTeam ? (
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
              color: 'var(--txt-dim)',
              fontSize: '12px'
            }}>
              Enter and verify your registered Team Name above to load members.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {verifiedTeam.members.map((member) => {
                const isSelected = selectedMember?.memberId === member.memberId;
                return (
                  <div
                    key={member.memberId}
                    onClick={() => handleSelectMember(member)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(56, 139, 253, 0.12)' : 'rgba(255, 255, 255, 0.025)',
                      border: `1px solid ${isSelected ? 'rgba(56, 139, 253, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        border: isSelected ? '4px solid #58a6ff' : '2px solid var(--txt-dim)',
                        background: isSelected ? '#0d111c' : 'transparent',
                        flexShrink: 0
                      }} />

                      <div>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? '#ffffff' : 'var(--txt)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {member.name}
                          {member.isCaptain && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '10px',
                              fontWeight: 600,
                              color: '#d29922',
                              background: 'rgba(210, 153, 34, 0.12)',
                              padding: '1px 5px',
                              borderRadius: '4px'
                            }}>
                              <Crown size={10} /> Leader
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: isSelected ? '#58a6ff' : 'var(--txt-muted)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {member.memberId}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirmation Card */}
        {selectedMember && verifiedTeam && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '12px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--txt-dim)' }}>Team</div>
                <div style={{ fontWeight: 600, color: '#ffffff' }}>{verifiedTeam.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--txt-dim)' }}>Member</div>
                <div style={{ fontWeight: 600, color: '#ffffff' }}>{selectedMember.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--txt-dim)' }}>Member ID</div>
                <div style={{ fontWeight: 600, color: '#58a6ff', fontFamily: 'var(--font-mono)' }}>
                  {selectedMember.memberId}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Anti-Cheat Notice */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          color: 'var(--txt-dim)',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Lock size={13} color="#d29922" style={{ flexShrink: 0 }} />
          <span>Fullscreen examination mode is mandatory. Exits trigger integrity flags.</span>
        </div>

        {/* Main Action Button */}
        <button
          type="button"
          className="btn-primary"
          onClick={handleEnterWorkspace}
          disabled={submitting || !verifiedTeam || !selectedMember}
          style={{
            width: '100%',
            padding: '11px',
            fontSize: '13px',
            borderRadius: '8px'
          }}
        >
          <Maximize2 size={15} />
          {submitting ? 'Entering Workspace...' : 'Enter Shared Workspace in Fullscreen'}
        </button>

        <div style={{
          textAlign: 'center',
          marginTop: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <a
            href="#register"
            onClick={(e) => {
              e.preventDefault();
              if (onOpenRegister) {
                onOpenRegister();
              } else {
                window.location.hash = '#register';
              }
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--txt-muted)',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 8px',
              textDecoration: 'none'
            }}
          >
            <QrCode size={12} color="#58a6ff" /> Register Team via QR
          </a>

          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--txt-dim)',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 8px'
              }}
            >
              <ArrowLeft size={11} /> Main Portal
            </button>
          )}

          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--txt-dim)',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 8px'
              }}
            >
              <Lock size={11} /> Admin Portal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
