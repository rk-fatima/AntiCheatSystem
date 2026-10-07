import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, CheckCircle2, Search, Coins, Sparkles, User, Clock, AlertCircle } from 'lucide-react';

export function ProblemCatalog({
  problems,
  problemPrices = {},
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
  const [loadingId, setLoadingId] = useState(null);
  const [purchaseMessage, setPurchaseMessage] = useState(null);

  const handlePurchase = async (problemId) => {
    setLoadingId(problemId);
    setPurchaseMessage(null);
    try {
      const res = await onPurchaseProblem(problemId);
      setPurchaseMessage({
        success: true,
        text: `✅ Purchased "${res.problem?.title || problemId}" for ₹${res.transaction?.price}! Deducted from Team Balance. Unlocked for all members.`
      });
    } catch (err) {
      setPurchaseMessage({
        success: false,
        text: `❌ ${err.message || 'Purchase failed'}`
      });
    } finally {
      setLoadingId(null);
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

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Banner with Auction Balance */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, var(--bg2), var(--bg3))',
          padding: '18px 24px',
          borderRadius: '10px',
          border: '1px solid var(--bd)',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <h2 style={{ color: 'var(--teal)', margin: '0 0 4px', fontSize: '22px' }}>
              Team Problem Auction Catalog
            </h2>
            <div style={{ color: 'var(--mut)', fontSize: '13px', lineHeight: 1.5 }}>
              Prices are set dynamically by the examination organizer.
              Purchasing unlocks the problem for the <b>entire team</b> and deducts from your <b>shared team balance</b>.
            </div>
            {currentMember && (
              <div style={{ color: 'var(--txt)', fontSize: '12px', marginTop: '6px' }}>
                Active Purchaser: <b style={{ color: 'var(--teal)' }}>{currentMember.memberId}</b> ({currentMember.name})
              </div>
            )}
          </div>

          <div style={{
            background: 'var(--bg4)',
            border: '1px solid var(--neon)',
            borderRadius: '8px',
            padding: '10px 20px',
            textAlign: 'right',
            boxShadow: '0 0 12px var(--neon-dim)'
          }}>
            <small style={{ color: 'var(--mut)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
              Team Balance
            </small>
            <div style={{ color: 'var(--neon)', fontSize: '24px', fontWeight: 800 }}>
              ₹{teamBalance ?? 1000}
            </div>
          </div>
        </div>

        {/* Purchase Status Notification */}
        {purchaseMessage && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            background: purchaseMessage.success ? 'rgba(0,255,157,0.1)' : 'var(--red-dim)',
            border: '1px solid',
            borderColor: purchaseMessage.success ? 'var(--neon)' : 'var(--red)',
            color: purchaseMessage.success ? 'var(--neon)' : 'var(--red)',
            fontWeight: 600,
            fontSize: '13px'
          }}>
            {purchaseMessage.text}
          </div>
        )}

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
              placeholder="Search problems by title, ID (e.g. E1, M2), or topic..."
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

            // Dynamic price configured by organizer
            const dynamicPrice = problemPrices[prob.id] ?? prob.price;
            const hasPrice = dynamicPrice !== null && dynamicPrice !== undefined;
            const canAfford = hasPrice && (teamBalance ?? 1000) >= dynamicPrice;

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
                          🟡 IN PROGRESS (Worked on by {statusInfo.workingBy})
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: '3px' }}>
                      {prob.cat || 'Algorithms'}
                      {isUnlocked && statusInfo?.unlockedBy && (
                        <span style={{ marginLeft: '10px', color: 'var(--teal)' }}>
                          • Purchased by {statusInfo.unlockedBy}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action & Dynamic Price display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    {hasPrice ? (
                      <div>
                        <div style={{
                          color: isUnlocked ? 'var(--neon)' : 'var(--txt)',
                          fontWeight: 800,
                          fontSize: '16px'
                        }}>
                          ₹{dynamicPrice}
                        </div>
                        <small style={{ color: 'var(--mut)', fontSize: '10px', textTransform: 'uppercase' }}>
                          {isUnlocked ? 'Unlocked' : 'Current Price'}
                        </small>
                      </div>
                    ) : (
                      <div>
                        <span style={{ color: 'var(--mut)', fontSize: '12px', fontStyle: 'italic' }}>
                          Price Pending
                        </span>
                        <small style={{ display: 'block', color: 'var(--mut)', fontSize: '10px' }}>
                          Organizer review
                        </small>
                      </div>
                    )}
                  </div>

                  {isUnlocked ? (
                    <button
                      className="pri"
                      onClick={() => onSelectProblem(prob.id)}
                      style={{ padding: '7px 16px', fontWeight: 700 }}
                    >
                      Open in Workspace
                    </button>
                  ) : hasPrice ? (
                    <button
                      className={canAfford ? "ok" : ""}
                      disabled={!canAfford || !!loadingId}
                      onClick={() => handlePurchase(prob.id)}
                      style={{ padding: '7px 16px', fontWeight: 700 }}
                      title={canAfford ? `Deduct ₹${dynamicPrice} from team budget` : 'Insufficient team balance'}
                    >
                      {loadingId === prob.id ? 'Purchasing...' : (canAfford ? `Purchase (₹${dynamicPrice})` : 'Low Balance')}
                    </button>
                  ) : (
                    <button
                      disabled
                      style={{ padding: '7px 14px', opacity: 0.6 }}
                      title="Organizer has not set a price for this problem yet"
                    >
                      Not for Sale
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
      </div>
    </div>
  );
}
