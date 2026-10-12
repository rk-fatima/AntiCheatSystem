import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  Gavel,
  Layers,
  BarChart2,
  Coins,
  Trophy,
  Sparkles,
  Activity,
  Award,
  ArrowRight,
  Shield,
  UserPlus
} from 'lucide-react';
import { fetchEventStatus } from '../services/api';

export function LandingPage({ onNavigateAdmin, onNavigateTeam, onNavigateRegister }) {
  const [eventStatus, setEventStatus] = useState('REGISTRATION_OPEN');

  useEffect(() => {
    async function loadStatus() {
      try {
        const state = await fetchEventStatus();
        setEventStatus(state?.status || 'REGISTRATION_OPEN');
      } catch (e) {
        setEventStatus('REGISTRATION_OPEN');
      }
    }
    loadStatus();
  }, []);

  const isRegistrationClosed = eventStatus === 'REGISTRATION_CLOSED' || eventStatus === 'EVENT_LIVE';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(20, 30, 65, 0.45) 0%, #050711 65%, #020308 100%)',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Subtle Background Decorative Cyber Ambience */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0
      }}>
        {/* Ambient Top Glow */}
        <div style={{
          position: 'absolute',
          top: '-120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, rgba(14, 165, 233, 0.12) 50%, transparent 75%)',
          filter: 'blur(70px)'
        }} />

        {/* Subtle Decorative Code Glyphs */}
        <div style={{
          position: 'absolute',
          top: '22%',
          left: '4%',
          fontFamily: 'monospace',
          fontSize: '84px',
          fontWeight: 700,
          color: 'rgba(124, 58, 237, 0.04)',
          userSelect: 'none'
        }}>
          {'{ }'}
        </div>
        <div style={{
          position: 'absolute',
          top: '26%',
          right: '4%',
          fontFamily: 'monospace',
          fontSize: '84px',
          fontWeight: 700,
          color: 'rgba(56, 189, 248, 0.04)',
          userSelect: 'none'
        }}>
          {'</>'}
        </div>
      </div>

      {/* Top Navigation Bar */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 36px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        background: 'rgba(7, 10, 20, 0.75)',
        backdropFilter: 'blur(16px)'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{
            fontSize: '20px',
            fontWeight: 800,
            letterSpacing: '0.6px',
            color: '#ffffff'
          }}>
            QUBIT
          </span>
          <span style={{ color: '#bc8cff', fontWeight: 600, fontSize: '15px' }}>//</span>
          <span style={{
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '1.4px',
            color: '#58a6ff',
            textTransform: 'uppercase'
          }}>
            CODE AUCTIONEER
          </span>
        </div>

        {/* Live Event Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '5px 12px',
          borderRadius: '16px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.6px',
          background: isRegistrationClosed
            ? (eventStatus === 'EVENT_LIVE' ? 'rgba(188, 140, 255, 0.12)' : 'rgba(248, 81, 73, 0.12)')
            : 'rgba(46, 160, 67, 0.12)',
          border: isRegistrationClosed
            ? (eventStatus === 'EVENT_LIVE' ? '1px solid rgba(188, 140, 255, 0.35)' : '1px solid rgba(248, 81, 73, 0.35)')
            : '1px solid rgba(46, 160, 67, 0.35)',
          color: isRegistrationClosed
            ? (eventStatus === 'EVENT_LIVE' ? '#d2a8ff' : '#ff7b72')
            : '#3fb950'
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: isRegistrationClosed
              ? (eventStatus === 'EVENT_LIVE' ? '#bc8cff' : '#f85149')
              : '#3fb950',
            boxShadow: `0 0 8px ${isRegistrationClosed ? '#bc8cff' : '#3fb950'}`
          }} />
          <span>
            {eventStatus === 'EVENT_LIVE'
              ? 'EVENT LIVE'
              : (isRegistrationClosed ? 'REGISTRATION CLOSED' : 'REGISTRATION OPEN')}
          </span>
        </div>
      </header>

      {/* Main Content Body */}
      <main style={{
        position: 'relative',
        zIndex: 10,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 20px 64px',
        maxWidth: '1120px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h1 style={{
            fontSize: 'clamp(44px, 7vw, 68px)',
            fontWeight: 900,
            letterSpacing: '1px',
            margin: '0 0 6px',
            background: 'linear-gradient(135deg, #ffffff 15%, #60a5fa 55%, #c084fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(96, 165, 250, 0.25)'
          }}>
            QUBIT
          </h1>

          <div style={{
            fontSize: '14px',
            fontWeight: 800,
            letterSpacing: '3.5px',
            color: '#38bdf8',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            // CODE AUCTIONEER
          </div>

          <p style={{
            margin: '0 0 16px',
            fontSize: '15px',
            color: '#94a3b8',
            letterSpacing: '0.4px',
            fontWeight: 400
          }}>
            Bid. Solve. Strategize. Win.
          </p>

          {/* Accent Horizontal Pill Line */}
          <div style={{
            width: '46px',
            height: '3px',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)',
            margin: '0 auto'
          }} />
        </div>

        {/* Side-by-Side Dual Portals Container */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
          width: '100%',
          maxWidth: '920px',
          marginBottom: '48px'
        }}>
          {/* ================= PORTAL 1: ADMIN PORTAL ================= */}
          <div
            style={{
              position: 'relative',
              background: 'rgba(13, 17, 30, 0.85)',
              border: '1px solid rgba(168, 85, 247, 0.28)',
              borderRadius: '20px',
              padding: '36px 30px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(168, 85, 247, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.55)';
              e.currentTarget.style.boxShadow = '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 45px rgba(168, 85, 247, 0.16)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.28)';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(168, 85, 247, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Icon Header */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, rgba(124, 58, 237, 0.08) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.15)'
            }}>
              <Settings size={28} color="#c084fc" />
            </div>

            {/* Title & Description */}
            <h2 style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 8px',
              textAlign: 'center',
              letterSpacing: '0.3px'
            }}>
              Admin Portal
            </h2>

            <p style={{
              fontSize: '13px',
              color: '#94a3b8',
              lineHeight: 1.5,
              textAlign: 'center',
              margin: '0 0 24px',
              minHeight: '38px'
            }}>
              Manage the event, registrations, teams, auctions, problems, hints, sabotage cards and ByteCoins.
            </p>

            {/* Feature Roster */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '30px',
              flex: 1
            }}>
              {[
                { icon: <Users size={16} color="#c084fc" />, text: 'Approve Registrations' },
                { icon: <Gavel size={16} color="#c084fc" />, text: 'Manage Auctions' },
                { icon: <Layers size={16} color="#c084fc" />, text: 'Control Problems & Cards' },
                { icon: <BarChart2 size={16} color="#c084fc" />, text: 'View Leaderboard' },
                { icon: <Coins size={16} color="#c084fc" />, text: 'Manage ByteCoins' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '13px',
                  color: '#e2e8f0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: 'rgba(168, 85, 247, 0.1)',
                    flexShrink: 0
                  }}>
                    {item.icon}
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Admin Login Button */}
            <button
              type="button"
              onClick={onNavigateAdmin}
              style={{
                width: '100%',
                padding: '13px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(124, 58, 237, 0.35)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 26px rgba(124, 58, 237, 0.55)';
                e.currentTarget.style.filter = 'brightness(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.35)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              <span>Admin Login</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* ================= PORTAL 2: TEAM PORTAL ================= */}
          <div
            style={{
              position: 'relative',
              background: 'rgba(13, 17, 30, 0.85)',
              border: '1px solid rgba(56, 189, 248, 0.28)',
              borderRadius: '20px',
              padding: '36px 30px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(56, 189, 248, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.55)';
              e.currentTarget.style.boxShadow = '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 45px rgba(56, 189, 248, 0.16)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.28)';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(56, 189, 248, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Icon Header */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(37, 99, 235, 0.08) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)'
            }}>
              <Users size={28} color="#38bdf8" />
            </div>

            {/* Title & Description */}
            <h2 style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 8px',
              textAlign: 'center',
              letterSpacing: '0.3px'
            }}>
              Team Portal
            </h2>

            <p style={{
              fontSize: '13px',
              color: '#94a3b8',
              lineHeight: 1.5,
              textAlign: 'center',
              margin: '0 0 24px',
              minHeight: '38px'
            }}>
              Log in to your registered team account and participate in the Code Auctioneer competition.
            </p>

            {/* Feature Roster */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '30px',
              flex: 1
            }}>
              {[
                { icon: <Users size={16} color="#38bdf8" />, text: 'Access Your Team Dashboard' },
                { icon: <Trophy size={16} color="#38bdf8" />, text: 'Bid for Problems' },
                { icon: <Sparkles size={16} color="#38bdf8" />, text: 'Use Hints & Sabotage Cards' },
                { icon: <Activity size={16} color="#38bdf8" />, text: 'Track Progress' },
                { icon: <Award size={16} color="#38bdf8" />, text: 'Climb the Leaderboard' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '13px',
                  color: '#e2e8f0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: 'rgba(56, 189, 248, 0.1)',
                    flexShrink: 0
                  }}>
                    {item.icon}
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Team Login Button */}
            <button
              type="button"
              onClick={onNavigateTeam}
              style={{
                width: '100%',
                padding: '13px',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(29, 78, 216, 0.35)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 26px rgba(29, 78, 216, 0.55)';
                e.currentTarget.style.filter = 'brightness(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(29, 78, 216, 0.35)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              <span>Team Login</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Bottom Section: Registration Access */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          width: '100%',
          maxWidth: '540px'
        }}>
          {/* Subtle Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            gap: '14px',
            color: 'rgba(255, 255, 255, 0.3)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1.5px',
            textTransform: 'uppercase'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
            <span>NEW TO QUBIT?</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
          </div>

          {/* Register Your Team Button */}
          <button
            type="button"
            onClick={onNavigateRegister}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              background: 'rgba(255, 255, 255, 0.035)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#f0f6fc',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.035)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.color = '#f0f6fc';
            }}
          >
            <UserPlus size={15} color="#38bdf8" />
            <span>Register Your Team</span>
            <ArrowRight size={14} />
          </button>

          {/* Informative Subtext */}
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            textAlign: 'center'
          }}>
            {isRegistrationClosed
              ? 'Team registration is currently closed by the administrator.'
              : 'Team registration is open. Click above to register.'}
          </div>
        </div>
      </main>
    </div>
  );
}
