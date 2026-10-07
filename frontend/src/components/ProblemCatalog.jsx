import React, { useState } from 'react';
import { Lock, Unlock, CheckCircle2, Search, X, Gavel, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { PowerCardsSection } from './PowerCardsSection';

export function ProblemCatalog({
  problems = [],
  unlockedIds = [],
  solvedIds = [],
  problemStatuses = {},
  teamBalance = 1000,
  currentMember,
  team,
  onTeamUpdated,
  onSelectProblem,
  onPurchaseProblem
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [diffFilter, setDiffFilter] = useState('ALL');
  const [selectedBidProblem, setSelectedBidProblem] = useState(null);
  const [bidAmountInput, setBidAmountInput] = useState('');
  const [customProblemId, setCustomProblemId] = useState('');
  const [isQuickUnlockOpen, setIsQuickUnlockOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleOpenBidModal = (prob) => {
    setSelectedBidProblem(prob);
    setBidAmountInput('');
    setNotification(null);
  };

  const handleOpenQuickUnlockModal = () => {
    setIsQuickUnlockOpen(true);
    setCustomProblemId('');
    setBidAmountInput('');
    setNotification(null);
  };

  const handleConfirmBid = async () => {
    const targetProblem = selectedBidProblem || (customProblemId ? problems.find(p => p.id.toUpperCase() === customProblemId.trim().toUpperCase()) : null);
    const probId = targetProblem ? targetProblem.id : customProblemId.trim().toUpperCase();

    if (!probId) {
      setNotification({ success: false, text: 'Please select or enter a valid Problem ID.' });
      return;
    }

    const amount = parseInt(bidAmountInput, 10);
    if (isNaN(amount) || amount < 0) {
      setNotification({ success: false, text: 'Please enter a valid bid amount (≥ ₹0).' });
      return;
    }

    if (amount > (teamBalance ?? 1000)) {
      setNotification({
        success: false,
        text: `Insufficient team budget! Your bid is ₹${amount}, but team only has ₹${teamBalance ?? 1000} remaining.`
      });
      return;
    }

    setLoading(true);
    setNotification(null);
    try {
      const res = await onPurchaseProblem(probId, amount);
      setNotification({
        success: true,
        text: `Unlocked "${probId}" for ₹${amount}. Remaining Team Balance: ₹${res.team?.balance}.`
      });
      setSelectedBidProblem(null);
      setIsQuickUnlockOpen(false);
      setBidAmountInput('');
      setCustomProblemId('');
    } catch (err) {
      setNotification({
        success: false,
        text: err.message || 'Unlock failed. Please check the problem ID and budget.'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter((prob) => {
    const matchesSearch =
      prob.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prob.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prob.cat || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDiff =
      diffFilter === 'ALL' ||
      prob.diff.toUpperCase() === diffFilter ||
      (diffFilter === 'UNLOCKED' && unlockedIds.includes(prob.id));

    return matchesSearch && matchesDiff;
  });

  const currentBidNum = parseInt(bidAmountInput, 10) || 0;
  const projectedRemaining = (teamBalance ?? 1000) - currentBidNum;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        {/* Global Notification Banner */}
        {notification && (
          <div style={{
            padding: '12px 18px',
            borderRadius: '8px',
            marginBottom: '20px',
            background: notification.success ? 'rgba(63, 185, 80, 0.1)' : 'rgba(248, 81, 73, 0.1)',
            border: `1px solid ${notification.success ? 'rgba(63, 185, 80, 0.3)' : 'rgba(248, 81, 73, 0.3)'}`,
            color: notification.success ? '#3fb950' : '#f85149',
            fontWeight: 500,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>{notification.text}</span>
            <button
              onClick={() => setNotification(null)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* 1. HERO SECTION: Team Power Cards Arsenal */}
        <PowerCardsSection
          team={team}
          currentMember={currentMember}
          unlockedProblems={problems.filter(p => unlockedIds.includes(p.id))}
          onTeamUpdated={onTeamUpdated}
          onOpenProblem={onSelectProblem}
        />

        {/* 2. SEARCH & SEGMENTED FILTERS (Single Elegant Control) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search
              size={15}
              color="var(--txt-dim)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '36px',
                paddingRight: '12px',
                paddingTop: '8px',
                paddingBottom: '8px',
                fontSize: '13px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            />
          </div>

          {/* Segmented Filter Control */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            gap: '2px'
          }}>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'EASY', label: 'Easy' },
              { id: 'MEDIUM', label: 'Medium' },
              { id: 'HARD', label: 'Hard' },
              { id: 'UNLOCKED', label: 'Unlocked' }
            ].map(tab => {
              const isActive = diffFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setDiffFilter(tab.id)}
                  style={{
                    background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--txt-muted)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 500,
                    boxShadow: 'none',
                    transform: 'none'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Unlock Action Trigger */}
          <button
            className="btn-ghost"
            onClick={handleOpenQuickUnlockModal}
            title="Record winning bid by Problem ID"
            style={{ fontSize: '12px', padding: '7px 12px', borderRadius: '8px' }}
          >
            <Gavel size={14} /> Record Winning Bid
          </button>
        </div>

        {/* 3. PROBLEM LIST (Whitespace over borders) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          {filteredProblems.map((prob) => {
            const isUnlocked = unlockedIds.includes(prob.id);
            const isSolved = solvedIds.includes(prob.id);
            const statusInfo = problemStatuses[prob.id];
            const diffPoints = prob.diff === 'Hard' ? 400 : (prob.diff === 'Medium' ? 300 : 200);
            const wrongCount = team?.problemWrong?.[prob.id] ?? statusInfo?.wrongSubmissions ?? 0;

            return (
              <div
                key={prob.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: '8px',
                  transition: 'background 0.15s ease',
                  gap: '16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.025)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Left: Status Icon + Title + Metadata */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                  {/* Status Indicator */}
                  <div style={{ flexShrink: 0, width: '20px', textAlign: 'center' }}>
                    {isSolved ? (
                      <span style={{ color: '#3fb950', fontSize: '16px', fontWeight: 700 }}>✓</span>
                    ) : isUnlocked ? (
                      <span style={{ color: '#58a6ff', fontSize: '13px' }}>●</span>
                    ) : (
                      <span style={{ color: 'var(--txt-dim)', fontSize: '14px' }}>🔒</span>
                    )}
                  </div>

                  {/* Problem Details */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: isUnlocked ? '#ffffff' : '#c9d1d9',
                        letterSpacing: '0.1px'
                      }}>
                        {prob.id} &nbsp;{prob.title}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: 'var(--txt-muted)',
                      marginTop: '2px',
                      flexWrap: 'wrap'
                    }}>
                      <span>{prob.diff} · {diffPoints} pts</span>

                      {isSolved && (
                        <>
                          <span>•</span>
                          <span style={{ color: '#3fb950', fontWeight: 500 }}>
                            Solved {statusInfo?.solvedByName || statusInfo?.solvedBy ? `by ${statusInfo.solvedByName || statusInfo.solvedBy}` : ''}
                          </span>
                        </>
                      )}

                      {!isSolved && statusInfo?.status === 'IN_PROGRESS' && (
                        <>
                          <span>•</span>
                          <span style={{ color: '#d29922', fontWeight: 500 }}>
                            In progress by {statusInfo.workingBy}
                          </span>
                        </>
                      )}

                      {wrongCount > 0 && !isSolved && (
                        <>
                          <span>•</span>
                          <span style={{ color: '#ff7b72' }}>
                            {wrongCount} WA (-{wrongCount * 10} pts)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Clean Action Button */}
                <div style={{ flexShrink: 0 }}>
                  {isUnlocked ? (
                    <button
                      className="btn-ghost"
                      onClick={() => onSelectProblem(prob.id)}
                      style={{
                        padding: '6px 14px',
                        fontSize: '13px',
                        borderRadius: '6px',
                        color: '#58a6ff'
                      }}
                    >
                      Open →
                    </button>
                  ) : (
                    <button
                      className="btn-ghost"
                      onClick={() => handleOpenBidModal(prob)}
                      style={{
                        padding: '6px 14px',
                        fontSize: '13px',
                        borderRadius: '6px'
                      }}
                    >
                      Unlock →
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredProblems.length === 0 && (
            <div style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--txt-dim)',
              fontSize: '13px'
            }}>
              No problems match "{searchTerm}".
            </div>
          )}
        </div>

        {/* 4. MODAL: UNLOCK PROBLEM */}
        {(selectedBidProblem || isQuickUnlockOpen) && (
          <div className="ov" style={{ zIndex: 1100 }}>
            <div className="box" style={{ maxWidth: '440px', padding: '24px' }}>
              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                  Unlock Problem
                </h3>
                <button
                  className="btn-ghost"
                  onClick={() => { setSelectedBidProblem(null); setIsQuickUnlockOpen(false); }}
                  style={{ padding: '6px' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Target Problem Info */}
              {selectedBidProblem ? (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '18px'
                }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
                    {selectedBidProblem.id} — {selectedBidProblem.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--txt-muted)', marginTop: '2px' }}>
                    {selectedBidProblem.diff} · {selectedBidProblem.diff === 'Hard' ? 400 : (selectedBidProblem.diff === 'Medium' ? 300 : 200)} pts
                  </div>
                </div>
              ) : (
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

              {/* Winning Bid Input */}
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
                    value={bidAmountInput}
                    onChange={(e) => setBidAmountInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirmBid()}
                    autoFocus
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
              </div>

              {/* Budget Impact Preview */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'var(--txt-muted)',
                marginBottom: '20px',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                <span>Remaining after unlock:</span>
                <span style={{
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  color: projectedRemaining < 0 ? '#f85149' : '#ffffff'
                }}>
                  ₹{projectedRemaining} ByteCoins
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => { setSelectedBidProblem(null); setIsQuickUnlockOpen(false); }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleConfirmBid}
                  disabled={loading || (currentBidNum > (teamBalance ?? 1000))}
                  style={{ padding: '8px 18px', borderRadius: '6px' }}
                >
                  {loading ? 'Unlocking...' : 'Unlock Problem'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
