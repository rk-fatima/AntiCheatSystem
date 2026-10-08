import React, { useState } from 'react';
import { Lock, Search, X } from 'lucide-react';
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
  onSelectProblem
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [diffFilter, setDiffFilter] = useState('ALL');
  const [notification, setNotification] = useState(null);

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

                {/* Right: Clean Action Button / Lock Status (Admin Controlled) */}
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
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--txt-dim)',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      userSelect: 'none'
                    }}>
                      <Lock size={12} /> Locked
                    </span>
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
      </div>
    </div>
  );
}
