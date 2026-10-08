import React, { useState } from 'react';
import { Lightbulb, Zap, Coins, Check, X, ShieldAlert, Lock, Unlock } from 'lucide-react';
import { purchaseHintPass, purchaseSabotageCard, useHintPass } from '../services/api';
import { SabotageTargetModal } from './SabotageTargetModal';

export function PowerCardsSection({
  team,
  currentMember,
  unlockedProblems = [],
  onTeamUpdated,
  onOpenProblem
}) {
  const [loadingHint, setLoadingHint] = useState(false);
  const [loadingSabotage, setLoadingSabotage] = useState(false);
  const [showSabotageModal, setShowSabotageModal] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [selectedHintProblemId, setSelectedHintProblemId] = useState('');
  const [notification, setNotification] = useState(null);
  const [recentUnlockedCard, setRecentUnlockedCard] = useState(null);

  const teamBalance = team?.balance ?? 1000;
  const hintPassesCount = team?.hintPassesCount || 0;
  const sabotageCardsCount = team?.sabotageCardsCount || 0;
  const canAfford = teamBalance >= 40;

  const isHintUnlocked = Boolean(team?.unlockedCards?.includes('HINT') || team?.hintUnlocked);
  const isSabotageUnlocked = Boolean(team?.unlockedCards?.includes('SABOTAGE') || team?.sabotageUnlocked);

  const unlockedWithoutHints = unlockedProblems.filter(
    (p) => !team?.revealedHints || !team.revealedHints[p.id]
  );

  const handlePurchaseHintPass = async () => {
    if (!canAfford) {
      setNotification({
        type: 'error',
        message: `Insufficient ByteCoins! Hint Pass costs 40 ByteCoins, but team only has ${teamBalance} ByteCoins.`
      });
      return;
    }

    setLoadingHint(true);
    setNotification(null);
    try {
      const res = await purchaseHintPass({
        teamName: team.name,
        memberId: currentMember?.memberId
      });
      setNotification({
        type: 'success',
        message: `💡 Hint Pass purchased! Added to inventory. Remaining balance: ${res.team.balance} ByteCoins.`
      });
      if (onTeamUpdated) onTeamUpdated(res.team);
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to purchase Hint Pass.' });
    } finally {
      setLoadingHint(false);
    }
  };

  const handleUseHintPassOnProblem = async (problemId) => {
    if (!problemId) return;
    setLoadingHint(true);
    setNotification(null);
    try {
      const res = await useHintPass({
        teamName: team.name,
        memberId: currentMember?.memberId,
        problemId
      });
      setNotification({
        type: 'success',
        message: `💡 Algorithmic Hint unlocked for "${problemId}"! Visible to all team members.`
      });
      setShowHintModal(false);
      setSelectedHintProblemId('');
      if (onTeamUpdated) onTeamUpdated(res.team);
      if (onOpenProblem) onOpenProblem(problemId);
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to reveal hint.' });
    } finally {
      setLoadingHint(false);
    }
  };

  const handlePurchaseSabotage = async () => {
    if (!canAfford) {
      setNotification({
        type: 'error',
        message: `Insufficient ByteCoins! Sabotage Card costs 40 ByteCoins, but team only has ${teamBalance} ByteCoins.`
      });
      return;
    }

    setLoadingSabotage(true);
    setNotification(null);
    try {
      const res = await purchaseSabotageCard({
        teamName: team.name,
        memberId: currentMember?.memberId
      });
      setNotification({
        type: 'success',
        message: `⚡ Sabotage Card purchased! Added to inventory. Remaining balance: ${res.team.balance} ByteCoins.`
      });
      if (onTeamUpdated) onTeamUpdated(res.team);
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to purchase Sabotage Card.' });
    } finally {
      setLoadingSabotage(false);
    }
  };

  return (
    <section style={{ marginBottom: '32px' }}>
      {/* Section Subheader */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '0.2px'
          }}>
            Power Cards
          </h2>
          <span style={{
            fontSize: '11px',
            color: 'var(--txt-dim)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1px 8px',
            borderRadius: '12px'
          }}>
            Shared Inventory
          </span>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--txt-muted)' }}>
          Shared Balance: <b style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{teamBalance} ByteCoins</b>
        </div>
      </div>

      {/* Global Card Notification */}
      {notification && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '8px',
          background: notification.type === 'success' ? 'rgba(63, 185, 80, 0.1)' : 'rgba(248, 81, 73, 0.1)',
          border: `1px solid ${notification.type === 'success' ? 'rgba(63, 185, 80, 0.3)' : 'rgba(248, 81, 73, 0.3)'}`,
          color: notification.type === 'success' ? '#3fb950' : '#f85149',
          fontSize: '13px',
          fontWeight: 500,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Grid: 2 Distinct Hero Power Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {/* ============================================================ */}
        {/* 1. BLUE — HINT PASS                                          */}
        {/* ============================================================ */}
        <div
          className={recentUnlockedCard === 'HINT' ? 'card-unlocked-reveal' : ''}
          style={{
            background: 'linear-gradient(180deg, rgba(30, 80, 180, 0.12) 0%, rgba(13, 17, 28, 0.85) 100%)',
            border: `1px solid ${isHintUnlocked ? 'rgba(56, 139, 253, 0.3)' : 'rgba(56, 139, 253, 0.2)'}`,
            borderRadius: '14px',
            padding: '24px 22px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: isHintUnlocked ? '0 8px 32px rgba(0, 0, 0, 0.35)' : '0 8px 24px rgba(0, 0, 0, 0.4)',
            transition: 'border-color 0.2s ease, transform 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(56, 139, 253, 0.5)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isHintUnlocked ? 'rgba(56, 139, 253, 0.3)' : 'rgba(56, 139, 253, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div>
            {/* Top Row: Icon + Inventory Tag */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(56, 139, 253, 0.15)',
                border: '1px solid rgba(56, 139, 253, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#58a6ff'
              }}>
                {isHintUnlocked ? <Lightbulb size={22} /> : <Lock size={20} />}
              </div>

              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: isHintUnlocked ? (hintPassesCount > 0 ? '#58a6ff' : 'var(--txt-dim)') : 'var(--txt-muted)',
                background: isHintUnlocked ? (hintPassesCount > 0 ? 'rgba(56, 139, 253, 0.12)' : 'rgba(255, 255, 255, 0.04)') : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isHintUnlocked ? (hintPassesCount > 0 ? 'rgba(56, 139, 253, 0.3)' : 'rgba(255, 255, 255, 0.08)') : 'rgba(255, 255, 255, 0.1)'}`,
                padding: '3px 10px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {isHintUnlocked ? `${hintPassesCount} Available` : <><Lock size={10} /> Locked Card</>}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h3 style={{
              margin: '0 0 4px',
              fontSize: '18px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.2px'
            }}>
              Hint Pass
            </h3>
            <div style={{
              fontSize: '13px',
              color: 'var(--txt-muted)',
              marginBottom: '16px'
            }}>
              Strategic assistance
            </div>

            {/* Price Tag */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '6px',
              marginBottom: '18px'
            }}>
              <span style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'var(--font-mono)'
              }}>
                40
              </span>
              <span style={{ fontSize: '13px', color: '#58a6ff', fontWeight: 600 }}>
                ByteCoins
              </span>
            </div>

            {/* Masked notice when locked */}
            {!isHintUnlocked && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px dashed rgba(56, 139, 253, 0.25)',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                <Lock size={16} color="#58a6ff" style={{ margin: '0 auto 6px', display: 'block', opacity: 0.8 }} />
                <div style={{ fontSize: '12px', color: 'var(--txt-muted)', lineHeight: 1.4 }}>
                  Hint Pass is locked by Administrator. Only the Competition Admin can unlock access from the Admin Dashboard.
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {!isHintUnlocked ? (
              <button
                type="button"
                className="btn-ghost"
                disabled
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '13px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  opacity: 0.65,
                  cursor: 'not-allowed',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <Lock size={14} /> Locked (Admin Control)
              </button>
            ) : hintPassesCount > 0 ? (
              <>
                <button
                  type="button"
                  className="btn-blue"
                  onClick={() => setShowHintModal(true)}
                  style={{
                    flex: 1,
                    padding: '9px 14px',
                    fontSize: '13px',
                    borderRadius: '8px'
                  }}
                >
                  <Check size={14} /> Use Hint
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={handlePurchaseHintPass}
                  disabled={loadingHint || !canAfford}
                  style={{
                    padding: '9px 14px',
                    fontSize: '13px',
                    borderRadius: '8px'
                  }}
                  title="Purchase additional Hint Pass (40 ByteCoins)"
                >
                  + Buy
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn-blue"
                onClick={handlePurchaseHintPass}
                disabled={loadingHint || !canAfford}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '13px',
                  borderRadius: '8px'
                }}
              >
                {loadingHint ? 'Purchasing...' : canAfford ? 'Purchase' : 'Insufficient ByteCoins'}
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. RED — SABOTAGE CARD                                       */}
        {/* ============================================================ */}
        <div
          className={recentUnlockedCard === 'SABOTAGE' ? 'card-unlocked-reveal' : ''}
          style={{
            background: 'linear-gradient(180deg, rgba(180, 25, 60, 0.12) 0%, rgba(20, 10, 16, 0.85) 100%)',
            border: `1px solid ${isSabotageUnlocked ? 'rgba(248, 81, 73, 0.3)' : 'rgba(248, 81, 73, 0.2)'}`,
            borderRadius: '14px',
            padding: '24px 22px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: isSabotageUnlocked ? '0 8px 32px rgba(0, 0, 0, 0.35)' : '0 8px 24px rgba(0, 0, 0, 0.4)',
            transition: 'border-color 0.2s ease, transform 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(248, 81, 73, 0.5)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isSabotageUnlocked ? 'rgba(248, 81, 73, 0.3)' : 'rgba(248, 81, 73, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div>
            {/* Top Row: Icon + Inventory Tag */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(248, 81, 73, 0.15)',
                border: '1px solid rgba(248, 81, 73, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff7b72'
              }}>
                {isSabotageUnlocked ? <Zap size={22} /> : <Lock size={20} />}
              </div>

              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: isSabotageUnlocked ? (sabotageCardsCount > 0 ? '#ff7b72' : 'var(--txt-dim)') : 'var(--txt-muted)',
                background: isSabotageUnlocked ? (sabotageCardsCount > 0 ? 'rgba(248, 81, 73, 0.12)' : 'rgba(255, 255, 255, 0.04)') : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isSabotageUnlocked ? (sabotageCardsCount > 0 ? 'rgba(248, 81, 73, 0.3)' : 'rgba(255, 255, 255, 0.08)') : 'rgba(255, 255, 255, 0.1)'}`,
                padding: '3px 10px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {isSabotageUnlocked ? `${sabotageCardsCount} Available` : <><Lock size={10} /> Locked Card</>}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h3 style={{
              margin: '0 0 4px',
              fontSize: '18px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.2px'
            }}>
              Sabotage Card
            </h3>
            <div style={{
              fontSize: '13px',
              color: 'var(--txt-muted)',
              marginBottom: '16px'
            }}>
              Freeze rival workspace
            </div>

            {/* Price Tag */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '6px',
              marginBottom: '18px'
            }}>
              <span style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'var(--font-mono)'
              }}>
                40
              </span>
              <span style={{ fontSize: '13px', color: '#ff7b72', fontWeight: 600 }}>
                ByteCoins
              </span>
            </div>

            {/* Masked notice when locked */}
            {!isSabotageUnlocked && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px dashed rgba(248, 81, 73, 0.25)',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                <Lock size={16} color="#ff7b72" style={{ margin: '0 auto 6px', display: 'block', opacity: 0.8 }} />
                <div style={{ fontSize: '12px', color: 'var(--txt-muted)', lineHeight: 1.4 }}>
                  Sabotage Card is locked by Administrator. Only the Competition Admin can unlock access from the Admin Dashboard.
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {!isSabotageUnlocked ? (
              <button
                type="button"
                className="btn-ghost"
                disabled
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '13px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  opacity: 0.65,
                  cursor: 'not-allowed',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <Lock size={14} /> Locked (Admin Control)
              </button>
            ) : sabotageCardsCount > 0 ? (
              <>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => setShowSabotageModal(true)}
                  style={{
                    flex: 1,
                    padding: '9px 14px',
                    fontSize: '13px',
                    borderRadius: '8px'
                  }}
                >
                  <Zap size={14} /> Use Sabotage
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={handlePurchaseSabotage}
                  disabled={loadingSabotage || !canAfford}
                  style={{
                    padding: '9px 14px',
                    fontSize: '13px',
                    borderRadius: '8px'
                  }}
                  title="Purchase additional Sabotage Card (40 ByteCoins)"
                >
                  + Buy
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn-danger"
                onClick={handlePurchaseSabotage}
                disabled={loadingSabotage || !canAfford}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '13px',
                  borderRadius: '8px',
                  background: canAfford ? 'rgba(248, 81, 73, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  color: canAfford ? '#ff7b72' : 'var(--txt-dim)',
                  border: `1px solid ${canAfford ? 'rgba(248, 81, 73, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`
                }}
              >
                {loadingSabotage ? 'Purchasing...' : canAfford ? 'Purchase' : 'Insufficient ByteCoins'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sabotage Target Modal */}
      {showSabotageModal && (
        <SabotageTargetModal
          team={team}
          currentMember={currentMember}
          onClose={() => setShowSabotageModal(false)}
          onSabotageSuccess={(res) => {
            if (onTeamUpdated && res.attackingTeam) {
              onTeamUpdated(res.attackingTeam);
            }
          }}
        />
      )}

      {/* Pick Problem for Hint Modal */}
      {showHintModal && (
        <div className="ov" style={{ zIndex: 1000 }}>
          <div className="box" style={{ maxWidth: '480px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lightbulb size={20} color="#58a6ff" />
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '17px', fontWeight: 700 }}>
                  Select Problem for Hint
                </h3>
              </div>
              <button className="btn-ghost" onClick={() => setShowHintModal(false)} style={{ padding: '6px' }}>
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--txt-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
              Choose which unlocked problem to reveal the official algorithmic hint for. The hint is shared instantly with all team members.
            </p>

            {unlockedWithoutHints.length === 0 ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--txt-dim)',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                {unlockedProblems.length === 0
                  ? 'Your team has not unlocked any problems yet. Unlock a problem first before using a Hint Pass.'
                  : 'All your currently unlocked problems already have their hints revealed!'}
              </div>
            ) : (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--txt-muted)', fontWeight: 600, marginBottom: '6px' }}>
                  Target Problem
                </label>
                <select
                  value={selectedHintProblemId}
                  onChange={(e) => setSelectedHintProblemId(e.target.value)}
                  style={{ fontSize: '13px', padding: '10px 12px', width: '100%' }}
                >
                  <option value="">-- Choose an unlocked problem --</option>
                  {unlockedWithoutHints.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} — {p.title} ({p.diff})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-ghost" onClick={() => setShowHintModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-blue"
                onClick={() => handleUseHintPassOnProblem(selectedHintProblemId)}
                disabled={loadingHint || !selectedHintProblemId}
                style={{ padding: '8px 16px', borderRadius: '6px' }}
              >
                {loadingHint ? 'Revealing...' : 'Reveal Hint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
