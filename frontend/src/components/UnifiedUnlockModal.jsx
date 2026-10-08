import React, { useState, useEffect } from 'react';
import { Lock, Unlock, KeyRound, AlertCircle, CheckCircle2, X, Eye, EyeOff, Loader2, Lightbulb, Zap, Gavel } from 'lucide-react';

export function UnifiedUnlockModal({
  isOpen,
  onClose,
  target,
  team,
  currentMember,
  teamBalance = 1000,
  onUnlockSuccess
}) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [customProblemId, setCustomProblemId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setShowPassword(false);
      setError(null);
      setShake(false);
      setSuccessAnimation(false);
      setCustomProblemId(target?.id || '');
      setBidAmount(target?.defaultBid !== undefined ? String(target.defaultBid) : (target?.type === 'PROBLEM' ? '0' : '40'));
    }
  }, [isOpen, target]);

  if (!isOpen || !target) return null;

  const isProblem = target.type === 'PROBLEM';
  const isHintCard = target.type === 'HINT';
  const isSabotageCard = target.type === 'SABOTAGE';
  const isProblemHint = target.type === 'PROBLEM_HINT';

  const accentColor = isSabotageCard
    ? '#ff7b72'
    : isHintCard || isProblemHint
    ? '#58a6ff'
    : '#bc8cff';

  const accentGlow = isSabotageCard
    ? 'rgba(248, 81, 73, 0.15)'
    : isHintCard || isProblemHint
    ? 'rgba(56, 139, 253, 0.15)'
    : 'rgba(188, 140, 255, 0.15)';

  const getTargetIcon = () => {
    if (successAnimation) return <Unlock size={20} className="unlock-morph" color="#3fb950" />;
    if (isSabotageCard) return <Zap size={20} color="#ff7b72" />;
    if (isHintCard || isProblemHint) return <Lightbulb size={20} color="#58a6ff" />;
    return <Lock size={20} color={accentColor} />;
  };

  const currentBidNum = parseInt(bidAmount, 10) || 0;
  const projectedRemaining = (teamBalance ?? 1000) - (isProblem ? currentBidNum : 0);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const trimmedPass = (password || '').trim();

    if (!trimmedPass) {
      triggerError('Please enter the verification password.');
      return;
    }

    // Bid amount validation for problem purchase
    if (isProblem) {
      if (isNaN(currentBidNum) || currentBidNum < 0) {
        triggerError('Please enter a valid bid amount (≥ 0 ByteCoins).');
        return;
      }
      if (currentBidNum > (teamBalance ?? 1000)) {
        triggerError(`Insufficient team budget! Your bid is ₹${currentBidNum}, but team only has ₹${teamBalance ?? 1000} ByteCoins.`);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Password verification logic
      const norm = trimmedPass.toLowerCase();
      let isValid = false;

      // Master organizer PIN
      if (norm === 'qubit' || norm === 'admin' || norm === '1234') {
        isValid = true;
      } else if (isSabotageCard) {
        const validSabotageKeys = ['sabotage', 'freeze', 'sabotage40', 'redcard'];
        if (validSabotageKeys.includes(norm)) isValid = true;
      } else if (isHintCard) {
        const validHintKeys = ['hint', 'hintpass', 'hint40', 'bluecard'];
        if (validHintKeys.includes(norm)) isValid = true;
      } else if (isProblemHint) {
        const validProbHintKeys = [
          'hint',
          'hintpass',
          'hint40',
          (target.problemId || '').toLowerCase(),
          (target.key || '').toLowerCase()
        ].filter(Boolean);
        if (validProbHintKeys.includes(norm)) isValid = true;
      } else if (isProblem) {
        const validProbKeys = [
          (target.key || '').toLowerCase(),
          (target.id || customProblemId || '').toLowerCase(),
          (target.title || '').toLowerCase()
        ].filter(Boolean);
        if (validProbKeys.includes(norm)) isValid = true;
      }

      if (!isValid) {
        throw new Error('Incorrect verification password. Access denied.');
      }

      // 2. Play subtle unlock animation on success
      setSuccessAnimation(true);

      // Brief delay so the user witnesses the lock morph animation
      await new Promise(resolve => setTimeout(resolve, 400));

      if (onUnlockSuccess) {
        await onUnlockSuccess({
          target,
          password: trimmedPass,
          bidAmount: isProblem ? currentBidNum : 40,
          customProblemId: customProblemId.trim().toUpperCase()
        });
      }

      onClose();
    } catch (err) {
      triggerError(err.message || 'Incorrect password. Card remains locked.');
    } finally {
      setLoading(false);
    }
  };

  const triggerError = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="ov" style={{ zIndex: 1200 }} onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}>
      <div
        className={`box ${shake ? 'lock-shake' : ''}`}
        style={{
          maxWidth: '450px',
          padding: '24px',
          border: error ? '1px solid rgba(248, 81, 73, 0.4)' : successAnimation ? '1px solid rgba(63, 185, 80, 0.5)' : `1px solid ${accentColor}33`,
          boxShadow: `0 24px 64px rgba(0, 0, 0, 0.8), 0 0 30px ${accentGlow}`
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: accentGlow,
              border: `1px solid ${accentColor}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {getTargetIcon()}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                {successAnimation ? 'Item Unlocked' : `Unlock ${target.title || 'Protected Item'}`}
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--txt-muted)', marginTop: '1px' }}>
                {successAnimation ? 'Password verified successfully' : 'Password verification required'}
              </div>
            </div>
          </div>

          <button
            className="btn-ghost"
            onClick={onClose}
            disabled={loading}
            style={{ padding: '6px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Target Details Card */}
        <div style={{
          padding: '12px 14px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
              {target.title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--txt-muted)', marginTop: '2px' }}>
              {target.subtitle || (target.diff ? `${target.diff} · ${target.pts || 200} pts` : 'Power Card')}
            </div>
          </div>

          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '12px',
            background: successAnimation ? 'rgba(63, 185, 80, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${successAnimation ? 'rgba(63, 185, 80, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
            color: successAnimation ? '#3fb950' : 'var(--txt-dim)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {successAnimation ? <Unlock size={11} /> : <Lock size={11} />}
            {successAnimation ? 'Unlocked' : 'Locked'}
          </span>
        </div>

        {/* Target Problem ID input if Quick Unlock mode */}
        {isProblem && target.isQuickUnlock && (
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--txt-muted)', fontWeight: 600, marginBottom: '6px' }}>
              Problem ID
            </label>
            <input
              placeholder="e.g. E3, M1, H2"
              value={customProblemId}
              onChange={(e) => setCustomProblemId(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
            />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Password Input Field */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--txt-muted)', fontWeight: 600, marginBottom: '6px' }}>
              Verification Password / Unlock Key
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--txt-dim)',
                display: 'flex'
              }}>
                <KeyRound size={15} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password to unlock"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                autoFocus
                disabled={loading || successAnimation}
                style={{
                  width: '100%',
                  paddingLeft: '34px',
                  paddingRight: '36px',
                  paddingTop: '9px',
                  paddingBottom: '9px',
                  fontSize: '14px',
                  fontFamily: showPassword ? 'inherit' : 'var(--font-mono)',
                  borderColor: error ? '#f85149' : undefined
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  color: 'var(--txt-muted)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--txt-dim)', marginTop: '5px' }}>
              {isSabotageCard && 'Enter sabotage password or organizer PIN to reveal controls.'}
              {isHintCard && 'Enter hint password or organizer PIN to access hints.'}
              {isProblemHint && 'Enter problem hint key or organizer PIN.'}
              {isProblem && 'Enter the secret problem key or organizer PIN.'}
            </div>
          </div>

          {/* Winning Bid Input (Only for Problems) */}
          {isProblem && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--txt-muted)', fontWeight: 600, marginBottom: '6px' }}>
                Winning Bid (ByteCoins)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-dim)', fontSize: '14px' }}>
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="Enter winning bid amount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  disabled={loading || successAnimation}
                  style={{
                    width: '100%',
                    paddingLeft: '28px',
                    paddingRight: '12px',
                    paddingTop: '9px',
                    paddingBottom: '9px',
                    fontSize: '14px',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              {/* Budget Preview */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'var(--txt-muted)',
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                <span>Remaining Team Balance:</span>
                <span style={{
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  color: projectedRemaining < 0 ? '#f85149' : '#ffffff'
                }}>
                  ₹{projectedRemaining} ByteCoins
                </span>
              </div>
            </div>
          )}

          {/* Error Message Box */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '6px',
              background: 'rgba(248, 81, 73, 0.1)',
              border: '1px solid rgba(248, 81, 73, 0.3)',
              color: '#ff7b72',
              fontSize: '12px',
              marginBottom: '16px',
              fontWeight: 500
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successAnimation && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '6px',
              background: 'rgba(63, 185, 80, 0.1)',
              border: '1px solid rgba(63, 185, 80, 0.3)',
              color: '#3fb950',
              fontSize: '12px',
              marginBottom: '16px',
              fontWeight: 500
            }}>
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>Password verified. Unlocking item...</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '18px' }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={onClose}
              disabled={loading || successAnimation}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={isSabotageCard ? 'btn-danger' : isHintCard || isProblemHint ? 'btn-blue' : 'btn-primary'}
              disabled={loading || successAnimation || !password.trim()}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                fontWeight: 600
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="spin" /> Verifying...
                </>
              ) : successAnimation ? (
                <>
                  <Unlock size={14} /> Unlocked!
                </>
              ) : (
                <>
                  <Lock size={14} /> Unlock {target.title || 'Item'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
