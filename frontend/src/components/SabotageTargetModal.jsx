import React, { useState, useEffect } from 'react';
import { Zap, X, AlertTriangle, ShieldCheck, RefreshCw, Snowflake, CheckCircle2 } from 'lucide-react';
import { fetchSabotageTargets, useSabotageCard } from '../services/api';

export function SabotageTargetModal({ team, currentMember, onClose, onSabotageSuccess }) {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadTargets = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchSabotageTargets(team?.name || '');
      setTargets(res.targets || []);
    } catch (err) {
      setError(err.message || 'Failed to load active teams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTargets();
  }, [team?.name]);

  const handleConfirmSabotage = async () => {
    if (!selectedTarget) {
      setError('Please select a target team to sabotage.');
      return;
    }

    if (selectedTarget.isFrozen) {
      setError(`Team "${selectedTarget.name}" is already frozen! Please select another target.`);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await useSabotageCard({
        teamName: team.name,
        memberId: currentMember?.memberId,
        targetTeamName: selectedTarget.name
      });

      setSuccessMsg(`⚡ Successfully sabotaged Team "${selectedTarget.name}"! Their coding screen is now frozen for exactly 5 minutes.`);
      if (onSabotageSuccess) {
        onSabotageSuccess(res);
      }
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to activate Sabotage card.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ov" style={{ zIndex: 1000 }}>
      <div
        className="box"
        style={{
          maxWidth: '520px',
          width: '92%',
          background: 'var(--bg2)',
          border: '2px solid #ff0055',
          boxShadow: '0 0 35px rgba(255, 0, 85, 0.3)',
          padding: '22px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(255, 0, 85, 0.15)',
              border: '1px solid #ff0055',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ff0055'
            }}>
              <Zap size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#ff4d6d', fontSize: '18px', fontWeight: 800 }}>
                ⚡ Deploy Sabotage Card
              </h3>
              <p style={{ margin: 0, color: 'var(--mut)', fontSize: '11px' }}>
                Freeze a rival team's workspace for 5 minutes (Cost: 40 ByteCoins)
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            padding: '10px 12px',
            borderRadius: '6px',
            background: 'var(--red-dim)',
            border: '1px solid var(--red)',
            color: 'var(--red)',
            fontSize: '12px',
            marginBottom: '14px',
            fontWeight: 600
          }}>
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '10px 12px',
            borderRadius: '6px',
            background: 'rgba(57, 255, 20, 0.1)',
            border: '1px solid var(--neon)',
            color: 'var(--neon)',
            fontSize: '12px',
            marginBottom: '14px',
            fontWeight: 600
          }}>
            {successMsg}
          </div>
        )}

        {/* Target List Instructions */}
        <p style={{ fontSize: '12px', color: 'var(--txt)', margin: '0 0 10px 0' }}>
          Select the rival team you wish to freeze. Once triggered, all members of that team will be completely locked out of code execution and submissions for 5 minutes.
        </p>

        {/* Targets Roster */}
        <div style={{
          maxHeight: '260px',
          overflowY: 'auto',
          border: '1px solid var(--bd)',
          borderRadius: '8px',
          background: 'var(--bg)',
          marginBottom: '16px'
        }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--mut)', fontSize: '13px' }}>
              <RefreshCw size={16} className="spin" style={{ display: 'inline', marginRight: '6px' }} />
              Scanning active rival teams...
            </div>
          ) : targets.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--mut)', fontSize: '13px' }}>
              No rival teams are currently registered in the match.
            </div>
          ) : (
            targets.map((tgt) => {
              const isSelected = selectedTarget?.name === tgt.name;
              return (
                <div
                  key={tgt.name}
                  onClick={() => !tgt.isFrozen && setSelectedTarget(tgt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--bd)',
                    cursor: tgt.isFrozen ? 'not-allowed' : 'pointer',
                    background: isSelected
                      ? 'rgba(255, 0, 85, 0.12)'
                      : tgt.isFrozen
                      ? 'rgba(0, 180, 216, 0.05)'
                      : 'transparent',
                    borderLeft: isSelected ? '4px solid #ff0055' : '4px solid transparent',
                    opacity: tgt.isFrozen ? 0.6 : 1,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <b style={{ color: isSelected ? '#ff4d6d' : 'var(--txt)', fontSize: '14px' }}>
                        {tgt.name}
                      </b>
                      <span style={{ fontSize: '10px', color: 'var(--mut)', fontFamily: 'var(--font-mono)' }}>
                        ID: {tgt.id}
                      </span>
                    </div>
                    <small style={{ color: 'var(--mut)', fontSize: '11px' }}>
                      Team Size: {tgt.size || 1} Member(s)
                    </small>
                  </div>

                  <div>
                    {tgt.isFrozen ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: 'rgba(0, 180, 216, 0.15)',
                        border: '1px solid #00b4d8',
                        color: '#00b4d8'
                      }}>
                        <Snowflake size={11} /> Frozen ({tgt.remainingSeconds}s)
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: 'rgba(57, 255, 20, 0.1)',
                        border: '1px solid var(--neon)',
                        color: 'var(--neon)'
                      }}>
                        ● Playing
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Confirmation Summary */}
        {selectedTarget && (
          <div style={{
            background: 'rgba(255, 0, 85, 0.08)',
            border: '1px solid rgba(255, 0, 85, 0.3)',
            borderRadius: '6px',
            padding: '10px 12px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#ffccd5'
          }}>
            🎯 <b>Target Selected:</b> Team <b style={{ color: '#fff' }}>{selectedTarget.name}</b>
            <div style={{ fontSize: '11px', color: 'var(--mut)', marginTop: '2px' }}>
              40 ByteCoins will be deducted from your team's shared balance.
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmSabotage}
            disabled={submitting || !selectedTarget || selectedTarget.isFrozen}
            style={{
              background: '#ff0055',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              fontWeight: 700,
              fontSize: '13px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Zap size={15} />
            {submitting ? 'Freezing Target...' : 'Confirm 5-Minute Sabotage'}
          </button>
        </div>
      </div>
    </div>
  );
}
