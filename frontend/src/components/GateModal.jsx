import React, { useState } from 'react';
import { ShieldCheck, Maximize2, Search, Check, RefreshCw, AlertCircle, Crown, Lock } from 'lucide-react';
import { getTeamStatus, loginTeam } from '../services/api';

export function GateModal({ onTeamSessionReady }) {
  const [teamInput, setTeamInput] = useState('');
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
      const res = await getTeamStatus(trimmed);
      const team = res.team;
      if (!team || !team.members || team.members.length === 0) {
        throw new Error(`Team "${trimmed}" has no registered members in the database.`);
      }
      setVerifiedTeam(team);
    } catch (err) {
      setVerifiedTeam(null);
      setSelectedMember(null);
      setFeedback({
        type: 'error',
        message: err.message || `Team "${trimmed}" not found in registration database. Please verify your team name.`
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
      setFeedback({ type: 'error', message: 'Please verify your registered Team Name first.' });
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
        memberId: selectedMember.memberId
      });

      onTeamSessionReady(res.team, res.member);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Login failed. Please verify your team identity with the proctor.'
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
          padding: '20px 22px',
          background: 'var(--bg2)',
          border: '1px solid var(--bd)',
          borderRadius: '10px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.75), 0 0 1px var(--teal)',
          position: 'relative',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top Header Row with Shared Budget Badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(20, 217, 196, 0.1)',
              border: '1px solid rgba(20, 217, 196, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={20} color="var(--teal)" />
            </div>
            <div>
              <h2 style={{
                color: 'var(--txt)',
                margin: 0,
                fontSize: '17px',
                fontWeight: 700,
                letterSpacing: '0.3px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                Qubit <span style={{ color: 'var(--teal)', fontSize: '13px', fontWeight: 600 }}>// Team Entrance</span>
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--mut)' }}>
                Competitive Programming Shared Workspace
              </p>
            </div>
          </div>

          {/* Shared Team Budget Badge (Requirement 9) */}
          <div style={{
            background: 'rgba(57, 255, 20, 0.06)',
            border: '1px solid rgba(57, 255, 20, 0.35)',
            borderRadius: '7px',
            padding: '5px 9px',
            textAlign: 'right',
            flexShrink: 0
          }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--mut)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              TEAM BUDGET
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--neon)', lineHeight: 1.1, margin: '2px 0' }}>
              ₹1,000
            </div>
            <div style={{ fontSize: '9px', color: 'var(--mut)', whiteSpace: 'nowrap' }}>
              Shared by all team members
            </div>
          </div>
        </div>

        {/* Step 1: Team Name Verification Input */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--teal)',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>
            <span>Registered Team Name</span>
            {verifiedTeam && (
              <span style={{ fontSize: '10px', color: 'var(--mut)', textTransform: 'none', fontWeight: 500 }}>
                Press Enter to re-verify
              </span>
            )}
          </label>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="e.g. SYNORA"
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
                  padding: '8px 10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  border: verifiedTeam ? '1px solid var(--teal)' : '1px solid var(--bd)',
                  background: 'var(--bg4)',
                  borderRadius: '6px'
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleVerifyTeam}
              disabled={verifying || !teamInput.trim()}
              className={verifiedTeam ? '' : 'pri'}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                borderRadius: '6px',
                minWidth: '105px',
                background: verifiedTeam ? 'var(--bg3)' : 'var(--teal)',
                color: verifiedTeam ? 'var(--teal)' : '#012',
                border: verifiedTeam ? '1px solid var(--teal)' : 'none'
              }}
            >
              {verifying ? (
                <>
                  <RefreshCw size={13} className="spin" />
                  <span>Checking...</span>
                </>
              ) : verifiedTeam ? (
                <>
                  <Check size={13} color="var(--neon)" />
                  <span>Verified ✓</span>
                </>
              ) : (
                <>
                  <Search size={13} />
                  <span>Verify Team</span>
                </>
              )}
            </button>
          </div>

          {/* Validation Feedback States */}
          {verifying && (
            <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <RefreshCw size={11} className="spin" />
              <span>Loading team members...</span>
            </div>
          )}

          {!verifying && verifiedTeam && (
            <div style={{
              marginTop: '6px',
              padding: '6px 10px',
              background: 'rgba(57, 255, 20, 0.08)',
              border: '1px solid rgba(57, 255, 20, 0.25)',
              borderRadius: '5px',
              fontSize: '11px',
              color: 'var(--neon)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>✓ Team found: <b>{verifiedTeam.name}</b> ({verifiedTeam.members?.length || 0} registered)</span>
              <span style={{ fontSize: '10px', color: 'var(--mut)' }}>Shared Workspace</span>
            </div>
          )}

          {!verifying && feedback?.type === 'error' && (
            <div style={{
              marginTop: '6px',
              padding: '7px 10px',
              background: 'var(--red-dim)',
              border: '1px solid var(--red)',
              borderRadius: '5px',
              fontSize: '11px',
              color: 'var(--red)',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={13} style={{ flexShrink: 0 }} />
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Step 2: Dynamic Member Selection (Requirement 4, 5, 6, 7) */}
        <div style={{
          marginBottom: '14px',
          opacity: verifiedTeam ? 1 : 0.5,
          pointerEvents: verifiedTeam ? 'auto' : 'none',
          transition: 'all 0.2s ease'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px'
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--teal)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              Select Your Identity
            </span>
            {verifiedTeam && (
              <span style={{ fontSize: '10px', color: 'var(--mut)' }}>
                {verifiedTeam.members?.length} {verifiedTeam.members?.length === 1 ? 'member' : 'members'} registered
              </span>
            )}
          </div>

          {!verifiedTeam ? (
            <div style={{
              padding: '14px',
              borderRadius: '6px',
              background: 'var(--bg3)',
              border: '1px dashed var(--bd)',
              textAlign: 'center',
              color: 'var(--mut)',
              fontSize: '11px'
            }}>
              Enter and verify your registered Team Name above to load members.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
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
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(20, 217, 196, 0.08)' : 'var(--bg3)',
                      border: isSelected ? '1px solid var(--teal)' : '1px solid var(--bd)',
                      boxShadow: isSelected ? '0 0 10px rgba(20, 217, 196, 0.15)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Left: Radio Dot + Member Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        border: isSelected ? '4px solid var(--teal)' : '2px solid var(--mut)',
                        background: isSelected ? '#0a1128' : 'transparent',
                        flexShrink: 0,
                        transition: 'all 0.15s ease'
                      }} />

                      <div>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: isSelected ? 700 : 600,
                          color: isSelected ? 'var(--teal)' : 'var(--txt)',
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
                              fontSize: '9px',
                              fontWeight: 700,
                              color: 'var(--amber)',
                              background: 'rgba(255, 196, 61, 0.12)',
                              padding: '1px 5px',
                              borderRadius: '3px'
                            }}>
                              <Crown size={10} /> Leader
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Member ID Monospace Badge */}
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isSelected ? 'var(--teal)' : 'var(--mut)',
                      background: isSelected ? 'rgba(20, 217, 196, 0.12)' : 'var(--bg4)',
                      border: isSelected ? '1px solid rgba(20, 217, 196, 0.3)' : '1px solid var(--bd)',
                      padding: '2px 7px',
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

        {/* Step 3: Selected Identity Confirmation Card (Requirement 8) */}
        {selectedMember && verifiedTeam && (
          <div style={{
            background: 'rgba(20, 217, 196, 0.05)',
            border: '1px solid rgba(20, 217, 196, 0.25)',
            borderRadius: '6px',
            padding: '8px 12px',
            marginBottom: '12px',
            fontSize: '11px'
          }}>
            <div style={{
              fontSize: '9px',
              fontWeight: 700,
              color: 'var(--teal)',
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}>
              Confirmed Session Identity
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '6px' }}>
              <div>
                <div style={{ fontSize: '9px', color: 'var(--mut)' }}>Team:</div>
                <div style={{ fontWeight: 700, color: 'var(--txt)', fontSize: '12px' }}>{verifiedTeam.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: 'var(--mut)' }}>Member:</div>
                <div style={{ fontWeight: 700, color: 'var(--txt)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedMember.name}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: 'var(--mut)' }}>Member ID:</div>
                <div style={{ fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  {selectedMember.memberId}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compact Anti-Cheat & Fullscreen Notice */}
        <div style={{
          background: 'var(--bg4)',
          border: '1px solid var(--bd)',
          borderRadius: '6px',
          padding: '8px 10px',
          fontSize: '11px',
          color: 'var(--mut)',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          lineHeight: 1.4
        }}>
          <Lock size={13} color="var(--amber)" style={{ flexShrink: 0 }} />
          <span>Fullscreen examination is mandatory. Tab switches or exits trigger integrity flags.</span>
        </div>

        {/* Main Action Button */}
        <button
          type="button"
          className="pri"
          onClick={handleEnterWorkspace}
          disabled={submitting || !verifiedTeam || !selectedMember}
          style={{
            width: '100%',
            padding: '11px',
            fontSize: '14px',
            fontWeight: 700,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Maximize2 size={16} />
          {submitting ? 'Entering Workspace...' : 'Enter Shared Workspace in Fullscreen'}
        </button>
      </div>
    </div>
  );
}
