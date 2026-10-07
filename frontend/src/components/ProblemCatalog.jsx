import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, CheckCircle2, Search, Coins, Sparkles, User, Clock, AlertCircle, Gavel, X, Info } from 'lucide-react';

export function ProblemCatalog({
  problems,
  unlockedIds = [],
  solvedIds = [],
  problemStatuses = {},
  teamBalance = 1000,
  currentMember,
  onSelectProblem,
  onPurchaseProblem
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [diffFilter, setDiffFilter] = useState('ALL');
  const [selectedBidProblem, setSelectedBidProblem] = useState(null);
  const [bidAmountInput, setBidAmountInput] = useState('');
  const [quickProblemId, setQuickProblemId] = useState('');
  const [quickBidAmount, setQuickBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleOpenBidModal = (prob) => {
    setSelectedBidProblem(prob);
    setBidAmountInput('');
    setNotification(null);
  };

  const handleConfirmBid = async () => {
    if (!selectedBidProblem) return;

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
      const res = await onPurchaseProblem(selectedBidProblem.id, amount);
      setNotification({
        success: true,
        text: `✅ Won & Unlocked "${selectedBidProblem.id} — ${selectedBidProblem.title}" for ₹${amount}! Remaining Team Balance: ₹${res.team?.balance}. Unlocked for all members.`
      });
      setSelectedBidProblem(null);
      setBidAmountInput('');
    } catch (err) {
      setNotification({
        success: false,
        text: `❌ ${err.message || 'Unlock failed'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickUnlock = async () => {
    const pId = quickProblemId.trim().toUpperCase();
    if (!pId) {
      setNotification({ success: false, text: 'Please enter a Problem ID (e.g. E1, M2, H1).' });
      return;
    }
    const amount = parseInt(quickBidAmount, 10);
    if (isNaN(amount) || amount < 0) {
      setNotification({ success: false, text: 'Please enter a valid winning bid amount.' });
      return;
    }

    setLoading(true);
    setNotification(null);
    try {
      const res = await onPurchaseProblem(pId, amount);
      setNotification({
        success: true,
        text: `✅ Won & Unlocked "${res.problem?.id || pId}" for ₹${amount}! Remaining Team Balance: ₹${res.team?.balance}. Unlocked for all members.`
      });
      setQuickProblemId('');
      setQuickBidAmount('');
    } catch (err) {
      setNotification({ success: false, text: `❌ ${err.message || 'Unlock failed'}` });
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

  const easyCount = problems.filter(p => p.diff === 'Easy').length;
  const medCount = problems.filter(p => p.diff === 'Medium').length;
  const hardCount = problems.filter(p => p.diff === 'Hard').length;

  const currentBidNum = parseInt(bidAmountInput, 10) || 0;
  const projectedRemaining = (teamBalance ?? 1000) - currentBidNum;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        {/* Global Notification Banner */}
        {notification && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            background: notification.success ? 'rgba(0,255,157,0.1)' : 'var(--red-dim)',
            border: '1px solid',
            borderColor: notification.success ? 'var(--neon)' : 'var(--red)',
            color: notification.success ? 'var(--neon)' : 'var(--red)',
            fontWeight: 600,
            fontSize: '13px'
          }}>
            {notification.text}
          </div>
        )}

        {/* Quick Winning Bid Input Bar */}
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          marginBottom: '16px',
          background: 'var(--bg2)',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid var(--bd)',
          flexWrap: 'wrap'
        }}>
          <Gavel size={18} color="var(--teal)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt)' }}>Quick Unlock:</span>
          <input
            placeholder="Problem ID (e.g. E1, M2, H1)..."
            value={quickProblemId}
            onChange={(e) => setQuickProblemId(e.target.value)}
            style={{ width: '180px' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--mut)', fontSize: '13px' }}>₹</span>
            <input
              type="number"
              placeholder="Winning Bid"
              value={quickBidAmount}
              onChange={(e) => setQuickBidAmount(e.target.value)}
              style={{ width: '130px' }}
            />
          </div>
          <button
            className="pri"
            onClick={handleQuickUnlock}
            disabled={loading}
            style={{ padding: '8px 16px', fontWeight: 700 }}
          >
            {loading ? 'Unlocking...' : 'Unlock via Winning Bid'}
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} color="var(--mut)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              placeholder="Search problems by title, ID, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setDiffFilter('ALL')}
              style={{ background: diffFilter === 'ALL' ? 'var(--teal)' : 'var(--bg3)', color: diffFilter === 'ALL' ? '#000' : 'var(--txt)' }}
            >
              All ({problems.length})
            </button>
            <button
              onClick={() => setDiffFilter('EASY')}
              style={{ background: diffFilter === 'EASY' ? 'var(--neon)' : 'var(--bg3)', color: diffFilter === 'EASY' ? '#000' : 'var(--txt)' }}
            >
              Easy ({easyCount})
            </button>
            <button
              onClick={() => setDiffFilter('MEDIUM')}
              style={{ background: diffFilter === 'MEDIUM' ? 'var(--amber)' : 'var(--bg3)', color: diffFilter === 'MEDIUM' ? '#000' : 'var(--txt)' }}
            >
              Medium ({medCount})
            </button>
            <button
              onClick={() => setDiffFilter('HARD')}
              style={{ background: diffFilter === 'HARD' ? 'var(--red)' : 'var(--bg3)', color: diffFilter === 'HARD' ? '#fff' : 'var(--txt)' }}
            >
              Hard ({hardCount})
            </button>
            <button
              onClick={() => setDiffFilter('UNLOCKED')}
              style={{ background: diffFilter === 'UNLOCKED' ? 'var(--teal)' : 'var(--bg3)', color: diffFilter === 'UNLOCKED' ? '#000' : 'var(--txt)' }}
            >
              Unlocked ({unlockedIds.length})
            </button>
          </div>
        </div>

        {/* Problem Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredProblems.map((prob) => {
            const isUnlocked = unlockedIds.includes(prob.id);
            const isSolved = solvedIds.includes(prob.id);
            const statusInfo = problemStatuses[prob.id];

            return (
              <div
                key={prob.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: isSolved ? 'var(--neon)' : (isUnlocked ? 'var(--teal)' : 'var(--bd)'),
                  background: isUnlocked ? 'var(--bg3)' : 'var(--bg2)',
                  boxShadow: isSolved ? '0 0 10px #00ff9d22' : (isUnlocked ? '0 0 8px #14d9c422' : 'none'),
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  {isSolved ? (
                    <CheckCircle2 size={22} color="var(--neon)" style={{ flexShrink: 0 }} />
                  ) : isUnlocked ? (
                    <Unlock size={22} color="var(--teal)" style={{ flexShrink: 0 }} />
                  ) : (
                    <Lock size={22} color="var(--mut)" style={{ flexShrink: 0 }} />
                  )}

                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '15px',
                      color: isUnlocked ? 'var(--txt)' : '#c9d1d9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <span>{prob.id} — {prob.title}</span>
                      <span className={`badge ${prob.diff}`}>{prob.diff}</span>

                      {/* Solved attribution */}
                      {isSolved && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'rgba(0, 255, 157, 0.15)',
                          color: 'var(--neon)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          ✅ SOLVED {statusInfo?.solvedBy ? `by ${statusInfo.solvedBy}` : ''}
                        </span>
                      )}

                      {/* In-progress attribution */}
                      {!isSolved && statusInfo?.status === 'IN_PROGRESS' && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'rgba(255, 196, 61, 0.15)',
                          color: 'var(--amber)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          🟡 IN PROGRESS ({statusInfo.workingBy})
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: '3px' }}>
                      {prob.cat || 'Algorithms'}
                      {isUnlocked && statusInfo?.unlockedBy && (
                        <span style={{ marginLeft: '10px', color: 'var(--teal)' }}>
                          • Won by {statusInfo.unlockedBy} {statusInfo.bidAmount ? `(Bid: ₹${statusInfo.bidAmount})` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  {isUnlocked ? (
                    <button
                      className="pri"
                      onClick={() => onSelectProblem(prob.id)}
                      style={{ padding: '7px 16px', fontWeight: 700 }}
                    >
                      Open in Workspace
                    </button>
                  ) : (
                    <button
                      className="ok"
                      onClick={() => handleOpenBidModal(prob)}
                      style={{ padding: '7px 16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Enter the winning bid amount from offline auction"
                    >
                      <Gavel size={14} /> Enter Winning Bid
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredProblems.length === 0 && (
            <div style={{
              padding: '30px',
              textAlign: 'center',
              color: 'var(--mut)',
              background: 'var(--bg2)',
              borderRadius: '8px',
              border: '1px solid var(--bd)'
            }}>
              No problems found matching "{searchTerm}".
            </div>
          )}
        </div>

        {/* Modal: Enter Winning Bid Amount */}
        {selectedBidProblem && (
          <div className="ov" style={{ zIndex: 1100 }}>
            <div className="box" style={{ maxWidth: '480px', width: '92%', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Gavel size={22} color="var(--teal)" />
                  <h3 style={{ margin: 0, color: 'var(--teal)', fontSize: '18px' }}>
                    Offline Bid Unlock
                  </h3>
                </div>
                <button onClick={() => setSelectedBidProblem(null)}><X size={16} /></button>
              </div>

              <div style={{
                background: 'var(--bg3)',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--bd)',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--txt)' }}>
                  {selectedBidProblem.id} — {selectedBidProblem.title}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                  <span className={`badge ${selectedBidProblem.diff}`}>{selectedBidProblem.diff}</span>
                  <span style={{ fontSize: '12px', color: 'var(--mut)' }}>{selectedBidProblem.cat}</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--teal)', fontWeight: 700, marginBottom: '6px' }}>
                  ENTER FINAL WINNING BID AMOUNT (₹)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '18px', color: 'var(--neon)', fontWeight: 700 }}>₹</span>
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    value={bidAmountInput}
                    onChange={(e) => setBidAmountInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirmBid()}
                    autoFocus
                    style={{ fontSize: '16px', fontWeight: 700, padding: '8px 12px' }}
                  />
                </div>
              </div>

              {/* Budget impact preview */}
              <div style={{
                background: 'var(--bg4)',
                border: '1px solid var(--bd)',
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '12px',
                marginBottom: '18px',
                lineHeight: 1.6
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--mut)' }}>
                  <span>Current Team Balance:</span>
                  <b style={{ color: 'var(--txt)' }}>₹{teamBalance ?? 1000}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--mut)' }}>
                  <span>Bid Amount Deducted:</span>
                  <b style={{ color: 'var(--red)' }}>- ₹{currentBidNum}</b>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--bd)',
                  marginTop: '6px',
                  paddingTop: '6px'
                }}>
                  <span style={{ fontWeight: 700, color: projectedRemaining >= 0 ? 'var(--neon)' : 'var(--red)' }}>
                    Remaining Team Budget:
                  </span>
                  <b style={{
                    fontSize: '14px',
                    color: projectedRemaining >= 0 ? 'var(--neon)' : 'var(--red)'
                  }}>
                    ₹{projectedRemaining}
                  </b>
                </div>
                {currentMember && (
                  <div style={{ fontSize: '11px', color: 'var(--teal)', marginTop: '4px' }}>
                    Purchaser Identity: <b>{currentMember.memberId}</b> ({currentMember.name})
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedBidProblem(null)}
                  style={{ flex: 1, padding: '10px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="pri"
                  onClick={handleConfirmBid}
                  disabled={loading || projectedRemaining < 0}
                  style={{ flex: 2, padding: '10px', fontWeight: 700 }}
                >
                  {loading ? 'Unlocking...' : 'Confirm & Unlock for Team'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
