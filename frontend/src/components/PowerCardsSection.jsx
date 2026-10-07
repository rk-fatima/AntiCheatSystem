import React, { useState } from 'react';
import { Lightbulb, Zap, ShoppingCart, Check, AlertCircle, ArrowRight, Coins } from 'lucide-react';
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

  const teamBalance = team?.balance ?? 1000;
  const hintPassesCount = team?.hintPassesCount || 0;
  const sabotageCardsCount = team?.sabotageCardsCount || 0;
  const canAfford = teamBalance >= 40;

  // Unlocked problems that don't have hints revealed yet
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
        message: `💡 Hint Pass purchased! Added to team inventory. Remaining balance: ${res.team.balance} ByteCoins.`
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
    <div style={{ marginBottom: '22px' }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🃏</span>
          <h3 style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 800,
            color: 'var(--txt)',
            letterSpacing: '0.8px',
            textTransform: 'uppercase'
          }}>
            TEAM POWER CARDS
          </h3>
          <span style={{
            fontSize: '11px',
            background: 'var(--bg3)',
            color: 'var(--mut)',
            padding: '2px 8px',
            borderRadius: '10px',
            border: '1px solid var(--bd)'
          }}>
            Shared Team Arsenal
          </span>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--mut)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Team Balance:</span>
          <b style={{ color: 'var(--neon)', fontFamily: 'var(--font-mono)' }}>
            {teamBalance} ByteCoins
          </b>
        </div>
      </div>

      {/* Global Card Notification */}
      {notification && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '7px',
          background: notification.type === 'success' ? 'rgba(57, 255, 20, 0.1)' : 'var(--red-dim)',
          border: `1px solid ${notification.type === 'success' ? 'var(--neon)' : 'var(--red)'}`,
          color: notification.type === 'success' ? 'var(--neon)' : 'var(--red)',
          fontSize: '12px',
          fontWeight: 600,
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid of the 2 Power Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '14px' }}>
        {/* ============================================================ */}
        {/* 1. 💡 HINT PASS — BLUE CARD                                  */}
        {/* ============================================================ */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.08) 0%, rgba(10, 25, 47, 0.8) 100%)',
            border: '1px solid #00b4d8',
            borderRadius: '10px',
            padding: '16px 18px',
            position: 'relative',
            boxShadow: '0 4px 20px rgba(0, 180, 216, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {/* Card Title & Icon */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '7px',
                  background: 'rgba(0, 180, 216, 0.18)',
                  border: '1px solid #00b4d8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00b4d8'
                }}>
                  <Lightbulb size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#90e0ef', letterSpacing: '0.5px' }}>
                    💡 HINT PASS
                  </h4>
                  <small style={{ color: 'var(--mut)', fontSize: '10px', textTransform: 'uppercase' }}>
                    Blue Power Card
                  </small>
                </div>
              </div>

              {/* Price Tag */}
              <div style={{
                background: 'rgba(0, 180, 216, 0.15)',
                border: '1px solid #00b4d8',
                borderRadius: '6px',
                padding: '4px 8px',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#90e0ef', fontFamily: 'var(--font-mono)' }}>
                  40 ByteCoins
                </div>
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: '12px', color: 'var(--txt)', lineHeight: 1.45, margin: '8px 0 12px 0' }}>
              Unlocks the official algorithmic strategy & data structure hint for any problem your team has unlocked.
            </p>

            {/* Inventory Badge */}
            <div style={{ fontSize: '11px', color: 'var(--mut)', marginBottom: '14px' }}>
              Inventory: <b style={{ color: hintPassesCount > 0 ? '#00b4d8' : 'var(--txt)' }}>{hintPassesCount} Available</b>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {hintPassesCount > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowHintModal(true)}
                  style={{
                    flex: 1,
                    background: '#00b4d8',
                    color: '#001a2c',
                    fontWeight: 700,
                    fontSize: '12px',
                    border: 'none',
                    padding: '9px 12px',
                    borderRadius: '6px'
                  }}
                >
                  <Check size={14} /> Use Hint Pass ({hintPassesCount})
                </button>
                <button
                  type="button"
                  onClick={handlePurchaseHintPass}
                  disabled={loadingHint || !canAfford}
                  style={{
                    background: 'var(--bg3)',
                    border: '1px solid #00b4d8',
                    color: '#90e0ef',
                    fontSize: '12px',
                    padding: '9px 12px'
                  }}
                  title="Buy additional hint pass for 40 ByteCoins"
                >
                  + Buy
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handlePurchaseHintPass}
                disabled={loadingHint || !canAfford}
                style={{
                  width: '100%',
                  background: canAfford ? '#00b4d8' : 'var(--bg3)',
                  color: canAfford ? '#001a2c' : 'var(--mut)',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: canAfford ? 'none' : '1px solid var(--bd)',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  boxShadow: canAfford ? '0 0 12px rgba(0, 180, 216, 0.3)' : 'none'
                }}
              >
                {loadingHint ? 'Purchasing...' : canAfford ? 'Purchase (40 ByteCoins)' : 'Insufficient ByteCoins'}
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. ⚡ SABOTAGE CARD — RED CARD                                 */}
        {/* ============================================================ */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(255, 0, 85, 0.08) 0%, rgba(20, 5, 12, 0.8) 100%)',
            border: '1px solid #ff0055',
            borderRadius: '10px',
            padding: '16px 18px',
            position: 'relative',
            boxShadow: '0 4px 20px rgba(255, 0, 85, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {/* Card Title & Icon */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '7px',
                  background: 'rgba(255, 0, 85, 0.18)',
                  border: '1px solid #ff0055',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ff0055'
                }}>
                  <Zap size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#ff758f', letterSpacing: '0.5px' }}>
                    ⚡ SABOTAGE CARD
                  </h4>
                  <small style={{ color: 'var(--mut)', fontSize: '10px', textTransform: 'uppercase' }}>
                    Red Power Card
                  </small>
                </div>
              </div>

              {/* Price Tag */}
              <div style={{
                background: 'rgba(255, 0, 85, 0.15)',
                border: '1px solid #ff0055',
                borderRadius: '6px',
                padding: '4px 8px',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#ff758f', fontFamily: 'var(--font-mono)' }}>
                  40 ByteCoins
                </div>
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: '12px', color: 'var(--txt)', lineHeight: 1.45, margin: '8px 0 12px 0' }}>
              Instantly freezes a chosen rival team's entire workspace for exactly 5 minutes with real-time countdown.
            </p>

            {/* Inventory Badge */}
            <div style={{ fontSize: '11px', color: 'var(--mut)', marginBottom: '14px' }}>
              Inventory: <b style={{ color: sabotageCardsCount > 0 ? '#ff0055' : 'var(--txt)' }}>{sabotageCardsCount} Available</b>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {sabotageCardsCount > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowSabotageModal(true)}
                  style={{
                    flex: 1,
                    background: '#ff0055',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '12px',
                    border: 'none',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Zap size={14} /> Use Sabotage ({sabotageCardsCount})
                </button>
                <button
                  type="button"
                  onClick={handlePurchaseSabotage}
                  disabled={loadingSabotage || !canAfford}
                  style={{
                    background: 'var(--bg3)',
                    border: '1px solid #ff0055',
                    color: '#ff758f',
                    fontSize: '12px',
                    padding: '9px 12px'
                  }}
                  title="Buy additional sabotage card for 40 ByteCoins"
                >
                  + Buy
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handlePurchaseSabotage}
                disabled={loadingSabotage || !canAfford}
                style={{
                  width: '100%',
                  background: canAfford ? '#ff0055' : 'var(--bg3)',
                  color: canAfford ? '#fff' : 'var(--mut)',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: canAfford ? 'none' : '1px solid var(--bd)',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  boxShadow: canAfford ? '0 0 12px rgba(255, 0, 85, 0.3)' : 'none'
                }}
              >
                {loadingSabotage ? 'Purchasing...' : canAfford ? 'Purchase (40 ByteCoins)' : 'Insufficient ByteCoins'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: Sabotage Target Selection                           */}
      {/* ============================================================ */}
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

      {/* ============================================================ */}
      {/* MODAL 2: Pick Unlocked Problem to Reveal Hint For             */}
      {/* ============================================================ */}
      {showHintModal && (
        <div className="ov" style={{ zIndex: 1000 }}>
          <div className="box" style={{ maxWidth: '480px', width: '92%', background: 'var(--bg2)', border: '2px solid #00b4d8', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lightbulb size={20} color="#00b4d8" />
                <h3 style={{ margin: 0, color: '#90e0ef', fontSize: '17px', fontWeight: 800 }}>
                  💡 Use Hint Pass
                </h3>
              </div>
              <button onClick={() => setShowHintModal(false)} style={{ padding: '6px' }}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--txt)', marginBottom: '14px', lineHeight: 1.5 }}>
              Select which unlocked problem you want to reveal the algorithmic hint for. The hint will immediately be visible to all members of your team.
            </p>

            {unlockedWithoutHints.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--mut)', background: 'var(--bg)', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
                {unlockedProblems.length === 0
                  ? 'Your team has not unlocked any problems yet. Unlock a problem first before using a Hint Pass.'
                  : 'All your currently unlocked problems already have their hints revealed!'}
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--teal)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  Select Unlocked Problem
                </label>
                <select
                  value={selectedHintProblemId}
                  onChange={(e) => setSelectedHintProblemId(e.target.value)}
                  style={{ fontSize: '13px', padding: '10px' }}
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
              <button type="button" onClick={() => setShowHintModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUseHintPassOnProblem(selectedHintProblemId)}
                disabled={loadingHint || !selectedHintProblemId}
                style={{
                  background: '#00b4d8',
                  color: '#001a2c',
                  border: 'none',
                  fontWeight: 700,
                  padding: '9px 16px',
                  borderRadius: '6px'
                }}
              >
                {loadingHint ? 'Revealing...' : 'Reveal Predefined Hint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
