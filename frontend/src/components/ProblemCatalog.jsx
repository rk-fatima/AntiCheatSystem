import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, CheckCircle2, Search, Coins, Sparkles } from 'lucide-react';

export function ProblemCatalog({
  problems,
  unlockedIds,
  solvedIds,
  teamBalance,
  currentProblemId,
  onSelectProblem,
  onUnlockKey
}) {
  const [keyInput, setKeyInput] = useState('');
  const [unlockMessage, setUnlockMessage] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [diffFilter, setDiffFilter] = useState('ALL');

  const handleUnlockWithKey = async (keyToUse) => {
    const key = (keyToUse || keyInput).trim();
    if (!key) return;

    setLoadingId(key);
    setUnlockMessage(null);
    try {
      const res = await onUnlockKey(key);
      setUnlockMessage({
        success: true,
        text: `✅ Unlocked: ${res.title || res.unlockedId} (-${res.costDeducted || 100} pts · Remaining: ${res.balance} pts)`
      });
      if (!keyToUse) setKeyInput('');
    } catch (err) {
      setUnlockMessage({ success: false, text: `❌ ${err.message || 'Unlock failed'}` });
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
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Banner with Auction Balance */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, var(--bg2), var(--bg3))',
          padding: '16px 20px',
          borderRadius: '10px',
          border: '1px solid var(--bd)',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h2 style={{ color: 'var(--teal)', margin: '0 0 4px', fontSize: '22px' }}>
              Problem Auction Catalog
            </h2>
            <div style={{ color: 'var(--mut)', fontSize: '13px' }}>
              Unlock problem specifications to solve them in your workspace. Points are deducted per tier:
              <span style={{ color: 'var(--neon)', marginLeft: '6px' }}>Easy (100)</span> ·
              <span style={{ color: 'var(--amber)', marginLeft: '4px' }}>Medium (150)</span> ·
              <span style={{ color: 'var(--red)', marginLeft: '4px' }}>Hard (200)</span>
            </div>
          </div>

          <div style={{
            background: 'var(--bg4)',
            border: '1px solid var(--neon)',
            borderRadius: '8px',
            padding: '8px 16px',
            textAlign: 'right',
            boxShadow: '0 0 12px var(--neon-dim)'
          }}>
            <small style={{ color: 'var(--mut)', fontSize: '11px', textTransform: 'uppercase' }}>
              Your Balance
            </small>
            <div style={{ color: 'var(--neon)', fontSize: '20px', fontWeight: 800 }}>
              {teamBalance ?? 1000} pts
            </div>
          </div>
        </div>

        {/* Unlock Input Bar */}
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          marginBottom: '16px',
          background: 'var(--bg2)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid var(--bd)'
        }}>
          <KeyRound size={20} color="var(--teal)" />
          <input
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlockWithKey()}
            placeholder="Type Problem #, ID, or Key (e.g. 1, LC20, TWOSUM, P1)..."
            style={{ maxWidth: '340px' }}
          />
          <button className="pri" onClick={() => handleUnlockWithKey()} disabled={!!loadingId}>
            {loadingId ? 'Unlocking...' : 'Unlock by Key / ID'}
          </button>
          {unlockMessage && (
            <span style={{
              fontWeight: 600,
              fontSize: '13px',
              color: unlockMessage.success ? 'var(--neon)' : 'var(--red)',
              marginLeft: '8px'
            }}>
              {unlockMessage.text}
            </span>
          )}
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
              placeholder="Search by title, number, or category..."
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
            const cost = prob.pts || (prob.diff === 'Hard' ? 200 : (prob.diff === 'Medium' ? 150 : 100));
            const canAfford = (teamBalance ?? 1000) >= cost;

            return (
              <div
                key={prob.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: isUnlocked ? 'var(--teal)' : 'var(--bd)',
                  background: isUnlocked ? 'var(--bg3)' : 'var(--bg2)',
                  boxShadow: isUnlocked ? '0 0 10px #14d9c422' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  {isUnlocked ? (
                    <Unlock size={20} color="var(--teal)" style={{ flexShrink: 0 }} />
                  ) : (
                    <Lock size={20} color="var(--mut)" style={{ flexShrink: 0 }} />
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
                      {isSolved && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          color: 'var(--neon)',
                          fontSize: '12px',
                          fontWeight: 700
                        }}>
                          <CheckCircle2 size={15} /> SOLVED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: '2px' }}>
                      {prob.cat || 'Algorithms'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      color: isUnlocked ? 'var(--neon)' : 'var(--mut)',
                      fontWeight: 700,
                      fontSize: '14px'
                    }}>
                      {cost} pts
                    </div>
                    <small style={{ color: 'var(--mut)', fontSize: '10px', textTransform: 'uppercase' }}>
                      {isUnlocked ? 'Unlocked' : 'Auction Cost'}
                    </small>
                  </div>

                  {isUnlocked ? (
                    <button
                      className="pri"
                      onClick={() => onSelectProblem(prob.id)}
                      style={{ padding: '6px 14px' }}
                    >
                      Open Code
                    </button>
                  ) : (
                    <button
                      className={canAfford ? "ok" : ""}
                      disabled={!canAfford || !!loadingId}
                      onClick={() => handleUnlockWithKey(prob.id)}
                      style={{ padding: '6px 14px' }}
                      title={canAfford ? `Deduct ${cost} pts to unlock` : 'Not enough points'}
                    >
                      {loadingId === prob.id ? 'Unlocking...' : (canAfford ? `Unlock (${cost} pts)` : 'Low Balance')}
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
