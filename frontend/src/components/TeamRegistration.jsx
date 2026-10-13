import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Users,
  Shield,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { submitTeamRegistration, fetchEventStatus } from '../services/api';

export function TeamRegistration({ onNavigateLogin }) {
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [leaderName, setLeaderName] = useState('');
  const [leaderContact, setLeaderContact] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [memberCount, setMemberCount] = useState(2);
  const [members, setMembers] = useState([
    { name: '', rollNo: '', email: '', phone: '', college: '' },
    { name: '', rollNo: '', email: '', phone: '', college: '' },
    { name: '', rollNo: '', email: '', phone: '', college: '' }
  ]);

  const [eventStatus, setEventStatus] = useState('REGISTRATION_CLOSED');
  const [statusLoading, setStatusLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedReg, setSubmittedReg] = useState(null);

  // QR Modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Registration URL
  const regUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#register`
    : '';

  useEffect(() => {
    let active = true;
    async function checkStatus(isInitial = false) {
      if (isInitial) setStatusLoading(true);
      try {
        const state = await fetchEventStatus();
        if (active) setEventStatus(state?.status || 'REGISTRATION_CLOSED');
      } catch (e) {
        if (active) setEventStatus('REGISTRATION_CLOSED');
      } finally {
        if (active && isInitial) setStatusLoading(false);
      }
    }
    checkStatus(true);
    const interval = setInterval(() => checkStatus(false), 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Generate QR Code
  useEffect(() => {
    if (regUrl) {
      QRCode.toDataURL(regUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('QR code generation error:', err));
    }
  }, [regUrl]);

  // Keep leader name synced with member 1 name
  const handleLeaderNameChange = (val) => {
    setLeaderName(val);
    setMembers(prev => {
      const copy = [...prev];
      copy[0] = { ...copy[0], name: val };
      return copy;
    });
  };

  const handleMemberChange = (idx, field, val) => {
    setMembers(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      if (idx === 0 && field === 'name') {
        setLeaderName(val);
      }
      return copy;
    });
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(regUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const normTeam = teamName.trim().toUpperCase();
    if (!normTeam || normTeam.length < 2) {
      setErrorMsg('Team Name must be at least 2 characters.');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMsg('Team Password must be at least 4 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your team password.');
      return;
    }

    const normLeader = leaderName.trim();
    if (!normLeader) {
      setErrorMsg('Team Leader Name is required.');
      return;
    }

    const cleanContact = leaderContact.trim();
    if (!cleanContact) {
      setErrorMsg('Team Leader Phone / WhatsApp number is required.');
      return;
    }
    const phoneDigits = cleanContact.replace(/[\s\-\(\)]/g, '');
    if (!/^(?:\+91|91|0)?[6-9]\d{9}$/.test(phoneDigits)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g., 9876543210 or +91 98765 43210).');
      return;
    }

    // Validate all members up to memberCount
    for (let i = 0; i < memberCount; i++) {
      const mName = (members[i]?.name || '').trim();
      if (!mName) {
        setErrorMsg(`Please enter the name for Member ${i + 1}${i === 0 ? ' (Leader)' : ''}.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        teamName: normTeam,
        leaderName: normLeader,
        leaderContact: cleanContact,
        leaderEmail: leaderEmail.trim(),
        password,
        memberCount,
        members: members.slice(0, memberCount).map((m, idx) => ({
          name: m.name.trim(),
          rollNo: (m.rollNo || '').trim(),
          college: (m.college || '').trim(),
          phone: (m.phone || (idx === 0 ? cleanContact : '')).trim(),
          email: (m.email || (idx === 0 ? leaderEmail.trim() : '')).trim()
        }))
      };

      const res = await submitTeamRegistration(payload);
      if (res.registration) {
        setSubmittedReg(res.registration);
      } else {
        throw new Error(res.error || 'Failed to submit registration.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during team registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const isRegistrationClosed = eventStatus !== 'EVENT_LIVE' && eventStatus !== 'REGISTRATION_OPEN';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(ellipse at 50% 10%, rgba(30, 42, 80, 0.3) 0%, #060913 70%)',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Top Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 28px',
        background: 'rgba(9, 13, 24, 0.94)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.6px', color: '#ffffff' }}>
              QUBIT
            </span>
            <span style={{ color: '#bc8cff', fontWeight: 600, fontSize: '15px' }}>//</span>
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1.2px',
              color: '#58a6ff',
              textTransform: 'uppercase'
            }}>
              TEAM REGISTRATION
            </span>
          </div>

          <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.1)' }} />

          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '12px',
            background: isRegistrationClosed
              ? 'rgba(248, 81, 73, 0.12)'
              : 'rgba(46, 160, 67, 0.15)',
            border: isRegistrationClosed
              ? '1px solid rgba(248, 81, 73, 0.3)'
              : '1px solid rgba(46, 160, 67, 0.4)',
            color: isRegistrationClosed
              ? '#ff7b72'
              : '#3fb950',
            letterSpacing: '0.4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isRegistrationClosed ? '#f85149' : '#3fb950'
            }} />
            {isRegistrationClosed ? 'REGISTRATION CLOSED' : 'REGISTRATION OPEN'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#58a6ff',
              background: 'rgba(88, 166, 255, 0.08)',
              border: '1px solid rgba(88, 166, 255, 0.25)',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <QrCode size={14} />
            <span>Show QR Code</span>
          </button>

          <button
            type="button"
            onClick={onNavigateLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#c9d1d9',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <span>Team Login</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{
        flex: '1 0 auto',
        display: 'flex',
        justifyContent: 'center',
        padding: '32px 16px 80px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {submittedReg ? (
          /* Confirmation Success Card */
          <div style={{
            maxWidth: '520px',
            width: '100%',
            background: '#0d111c',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '16px',
            padding: '36px 28px',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 24px rgba(56, 189, 248, 0.12)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(46, 160, 67, 0.15)',
              border: '1px solid rgba(46, 160, 67, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              color: '#3fb950'
            }}>
              <CheckCircle2 size={32} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px', color: '#ffffff' }}>
              Registration Submitted!
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--txt-muted)', margin: '0 0 24px', lineHeight: 1.5 }}>
              Your team has been entered into the registration queue.
            </p>

            {/* Registration Details Box */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '18px',
              textAlign: 'left',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>Registration ID:</span>
                <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', color: '#bc8cff' }}>
                  {submittedReg.id}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>Team Name:</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                  {submittedReg.teamName}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>Leader:</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#c9d1d9' }}>
                  {submittedReg.leaderName}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>Members Registered:</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#c9d1d9' }}>
                  {submittedReg.memberCount} Participants
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>Approval Status:</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'rgba(210, 153, 34, 0.15)',
                  border: '1px solid rgba(210, 153, 34, 0.35)',
                  color: '#d29922'
                }}>
                  PENDING ADMIN APPROVAL
                </span>
              </div>
            </div>

            {/* Informative Guidance */}
            <div style={{
              background: 'rgba(88, 166, 255, 0.06)',
              border: '1px solid rgba(88, 166, 255, 0.2)',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '12px',
              color: '#8b949e',
              textAlign: 'left',
              lineHeight: 1.5,
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#58a6ff', fontWeight: 700, marginBottom: '4px' }}>
                <Shield size={13} />
                <span>Next Steps:</span>
              </div>
              Organizers will review and approve your team from the Admin Dashboard. Once approved, your team will receive ₹1,000 ByteCoins and individual Member IDs to log in.
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={onNavigateLogin}
                style={{
                  flex: 1,
                  padding: '10px 18px',
                  background: 'linear-gradient(135deg, #1f6feb 0%, #388bfd 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Go to Team Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedReg(null);
                  setTeamName('');
                  setPassword('');
                  setConfirmPassword('');
                  setLeaderName('');
                  setLeaderContact('');
                  setLeaderEmail('');
                  setMembers([
                    { name: '', rollNo: '', email: '', phone: '', college: '' },
                    { name: '', rollNo: '', email: '', phone: '', college: '' },
                    { name: '', rollNo: '', email: '', phone: '', college: '' }
                  ]);
                }}
                style={{
                  padding: '10px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#c9d1d9',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Register Another
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div style={{
            maxWidth: '560px',
            width: '100%',
            background: '#0d111c',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '28px 24px',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Register Your Team
                </h1>
                <div style={{
                  background: 'rgba(188, 140, 255, 0.1)',
                  border: '1px solid rgba(188, 140, 255, 0.3)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#bc8cff',
                  fontFamily: 'monospace'
                }}>
                  INITIAL: ₹1,000
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--txt-muted)', lineHeight: 1.4 }}>
                Enter your team information. Your registration will be verified and approved by the event administrator.
              </p>
            </div>

            {isRegistrationClosed && (
              <div style={{
                background: 'rgba(248, 81, 73, 0.1)',
                border: '1px solid rgba(248, 81, 73, 0.3)',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#ff7b72',
                fontSize: '13px'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Registration is closed.</strong> {eventStatus === 'EVENT_ENDED' ? 'The competition has concluded.' : 'Please wait for the administrator to start the event.'}
                </div>
              </div>
            )}

            {errorMsg && (
              <div style={{
                background: 'rgba(248, 81, 73, 0.1)',
                border: '1px solid rgba(248, 81, 73, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#ff7b72',
                fontSize: '12px'
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Section 1: Team Credentials */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '18px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#58a6ff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  1. Team Identity & Security
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#c9d1d9', marginBottom: '5px' }}>
                    Team Name <span style={{ color: '#f85149' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isRegistrationClosed}
                    placeholder="e.g. CYBER_TITANS"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--txt-dim)', marginTop: '3px' }}>
                    Choose a distinct name. This will appear on the competition leaderboard.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#c9d1d9', marginBottom: '5px' }}>
                      Team Password <span style={{ color: '#f85149' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        disabled={isRegistrationClosed}
                        placeholder="Min 4 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '9px 34px 9px 12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '6px',
                          color: '#ffffff',
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

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#c9d1d9', marginBottom: '5px' }}>
                      Confirm Password <span style={{ color: '#f85149' }}>*</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      disabled={isRegistrationClosed}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Team Leader Contact */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '18px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#bc8cff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  2. Team Leader Contact
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#c9d1d9', marginBottom: '5px' }}>
                    Leader Full Name <span style={{ color: '#f85149' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isRegistrationClosed}
                    placeholder="e.g. Salman Khan"
                    value={leaderName}
                    onChange={(e) => handleLeaderNameChange(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#c9d1d9', marginBottom: '5px' }}>
                      Phone / WhatsApp <span style={{ color: '#f85149' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      disabled={isRegistrationClosed}
                      placeholder="+91 98765 43210"
                      value={leaderContact}
                      onChange={(e) => setLeaderContact(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '13px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#c9d1d9', marginBottom: '5px' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled={isRegistrationClosed}
                      placeholder="leader@college.edu"
                      value={leaderEmail}
                      onChange={(e) => setLeaderEmail(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Team Members (1 to 3) */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '22px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    3. Team Members (1 – 3)
                  </div>

                  {/* Size Selector Pill */}
                  <div style={{
                    display: 'flex',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '6px',
                    padding: '2px',
                    gap: '2px'
                  }}>
                    {[1, 2, 3].map(num => (
                      <button
                        key={num}
                        type="button"
                        disabled={isRegistrationClosed}
                        onClick={() => setMemberCount(num)}
                        style={{
                          padding: '4px 10px',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: memberCount === num ? 700 : 500,
                          background: memberCount === num ? '#1f6feb' : 'transparent',
                          color: memberCount === num ? '#ffffff' : 'var(--txt-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {num} {num === 1 ? 'Solo' : 'Members'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Member Input Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Array.from({ length: memberCount }).map((_, idx) => {
                    const isLeader = idx === 0;
                    return (
                      <div
                        key={idx}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>
                            {isLeader ? 'Member 1 (Team Leader)' : `Member ${idx + 1}`}
                          </span>
                          {isLeader && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(188, 140, 255, 0.15)',
                              color: '#bc8cff'
                            }}>
                              LEADER
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '8px' }}>
                          <input
                            type="text"
                            required
                            disabled={isRegistrationClosed}
                            placeholder={isLeader ? 'Leader Full Name' : `Member ${idx + 1} Full Name`}
                            value={members[idx]?.name || ''}
                            onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                            style={{
                              width: '100%',
                              boxSizing: 'border-box',
                              padding: '8px 10px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '12px'
                            }}
                          />

                          <input
                            type="text"
                            disabled={isRegistrationClosed}
                            placeholder="College / Dept (Optional)"
                            value={members[idx]?.college || ''}
                            onChange={(e) => handleMemberChange(idx, 'college', e.target.value)}
                            style={{
                              width: '100%',
                              boxSizing: 'border-box',
                              padding: '8px 10px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '12px'
                            }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <input
                            type="text"
                            disabled={isRegistrationClosed}
                            placeholder="Roll No / ID (Optional)"
                            value={members[idx]?.rollNo || ''}
                            onChange={(e) => handleMemberChange(idx, 'rollNo', e.target.value)}
                            style={{
                              width: '100%',
                              boxSizing: 'border-box',
                              padding: '8px 10px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '12px'
                            }}
                          />

                          <input
                            type="text"
                            disabled={isRegistrationClosed}
                            placeholder="Phone / Email (Optional)"
                            value={members[idx]?.phone || ''}
                            onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                            style={{
                              width: '100%',
                              boxSizing: 'border-box',
                              padding: '8px 10px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '12px'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || isRegistrationClosed}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: isRegistrationClosed
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'linear-gradient(135deg, #1f6feb 0%, #388bfd 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: isRegistrationClosed || submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: isRegistrationClosed ? 'none' : '0 4px 14px rgba(31, 111, 235, 0.35)'
                }}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>Submitting Registration...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Team Registration</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* QR Code Modal for Audience Projection */}
      {showQrModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#0d111c',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '380px',
            width: '100%',
            textAlign: 'center',
            position: 'relative'
          }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
              Scan to Register
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '12px', color: 'var(--txt-muted)' }}>
              Scan with your mobile camera to open self-registration.
            </p>

            <div style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '12px',
              display: 'inline-block',
              marginBottom: '16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
            }}>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Registration QR Code"
                  style={{ width: '220px', height: '220px', display: 'block' }}
                />
              ) : (
                <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                  Generating QR...
                </div>
              )}
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '8px 10px',
              fontSize: '11px',
              color: 'var(--txt-muted)',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              marginBottom: '18px'
            }}>
              {regUrl}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  background: 'rgba(88, 166, 255, 0.1)',
                  border: '1px solid rgba(88, 166, 255, 0.3)',
                  borderRadius: '6px',
                  color: '#58a6ff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedLink ? 'Copied Link' : 'Copy Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                style={{
                  padding: '9px 16px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
