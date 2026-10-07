import React, { useState, useEffect } from 'react';
import { Zap, X, AlertTriangle, RefreshCw, Snowflake, CheckCircle2 } from 'lucide-react';
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
      setError(`Team "${selectedTarget.name}" is already frozen!`);
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

      setSuccessMsg(`⚡ Sabotaged Team "${selectedTarget.name}"! Workspace frozen for 5 minutes.`);
      if (onSabotageSuccess) {
        onSabotageSuccess(res);
      }
      setTimeout(() => {
        onClose();
      }, 1800);
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
          maxWidth: '500px',
          width: '92%',
          background: '#0d111c',
          border: '1px solid rgba(248, 81, 73, 0.35)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 25px rgba(248, 81, 73, 0.08)',
          padding: '24px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} color="#ff7b72" />
            <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px', fontWeight: 700 }}>
              Deploy Sabotage Card
            </h3>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(248, 81, 73, 0.1)',
            border: '1px solid rgba(248, 81, 73, 0.25)',
            color: '#ff7b72',
            fontSize: '12px',
            marginBottom: '14px',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(63, 185, 80, 0.1)',
            border: '1px solid rgba(63, 185, 80, 0.25)',
            color: '#3fb950',
            fontSize: '12px',
            marginBottom: '14px',
            fontWeight: 500
          }}>
            {successMsg}
          </div>
        )}

        <p style={{ fontSize: '13px', color: 'var(--txt-muted)', margin: '0 0 14px 0', lineHeight: 1.5 }}>
          Select rival team to freeze. Their coding workspace will be locked for exactly 5 minutes.
        </p>

        {/* Targets Roster */}
        <div style={{
          maxHeight: '260px',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.02)',
          marginBottom: '20px'
        }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--txt-dim)', fontSize: '13px' }}>
              <RefreshCw size={15} className="spin" style={{ display: 'inline', marginRight: '6px' }} />
              Loading rival teams...
            </div>
          ) : targets.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--txt-dim)', fontSize: '13px' }}>
              No rival teams found.
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
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: tgt.isFrozen ? 'not-allowed' : 'pointer',
                    background: isSelected
                      ? 'rgba(248, 81, 73, 0.12)'
                      : tgt.isFrozen
                      ? 'rgba(255, 255, 255, 0.01)'
                      : 'transparent',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      border: isSelected ? '4px solid #ff7b72' : '2px solid var(--txt-dim)',
                      background: isSelected ? '#0d111c' : 'transparent',
                      flexShrink: 0
                    }} />

                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                        {tgt.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--txt-dim)', marginTop: '1px' }}>
                        ID: {tgt.teamId}
                      </div>
                    </div>
                  </div>

                  <div>
                    {tgt.isFrozen ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#58a6ff',
                        background: 'rgba(56, 139, 253, 0.1)',
                        border: '1px solid rgba(56, 139, 253, 0.25)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        <Snowflake size={12} /> Frozen ({tgt.frozenMinutesRemaining}m)
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#3fb950',
                        background: 'rgba(63, 185, 80, 0.1)',
                        border: '1px solid rgba(63, 185, 80, 0.25)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        Playing
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleConfirmSabotage}
            disabled={submitting || !selectedTarget || selectedTarget.isFrozen}
            style={{
              padding: '8px 18px',
              borderRadius: '6px'
            }}
          >
            {submitting ? 'Freezing...' : 'Freeze Workspace (5 min)'}
          </button>
        </div>
      </div>
    </div>
  );
}
