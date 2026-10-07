import React, { useState, useEffect } from 'react';
import { Trophy, Medal, X, RefreshCw } from 'lucide-react';
import { fetchLeaderboard } from '../services/api';

export function LeaderboardModal({ onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchLeaderboard();
      setLeaderboard(data.leaderboard || []);
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ov" style={{ zIndex: 950 }}>
      <div className="box" style={{ maxWidth: '680px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={22} color="var(--neon)" />
            <h2 style={{ margin: 0, color: 'var(--teal)', fontSize: '20px' }}>
              Live Contest Leaderboard
            </h2>
          </div>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        {/* Scoring Rules Banner */}
        <div style={{
          background: 'rgba(20, 217, 196, 0.08)',
          border: '1px solid rgba(20, 217, 196, 0.3)',
          borderRadius: '6px',
          padding: '8px 12px',
          marginBottom: '14px',
          fontSize: '12px',
          color: 'var(--txt)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          <div>
            <b>Scoring:</b> Easy: <span style={{ color: 'var(--neon)', fontWeight: 700 }}>200 pts</span> • Medium: <span style={{ color: 'var(--amber)', fontWeight: 700 }}>300 pts</span> • Hard: <span style={{ color: 'var(--red)', fontWeight: 700 }}>400 pts</span>
          </div>
          <div style={{ color: '#ff758f', fontWeight: 700 }}>
            Penalty: −10 pts per Wrong Submission
          </div>
        </div>

        <div style={{
          maxHeight: '440px',
          overflowY: 'auto',
          border: '1px solid var(--bd)',
          borderRadius: '8px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--bd)', color: 'var(--mut)' }}>
                <th style={{ padding: '10px 14px', width: '60px' }}>Rank</th>
                <th style={{ padding: '10px 14px' }}>Team</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Solved</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Wrong (WA)</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Contest Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((team, idx) => {
                const rank = idx + 1;
                return (
                  <tr key={team.name} style={{
                    borderBottom: '1px solid var(--bd)',
                    background: rank === 1 ? 'rgba(57, 255, 20, 0.05)' : 'transparent'
                  }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: rank <= 3 ? 'var(--neon)' : 'var(--txt)' }}>
                      #{rank}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                      {team.name}
                      {team.isLocked && <span style={{ color: 'var(--red)', fontSize: '11px', marginLeft: '6px' }}>(Locked)</span>}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--teal)' }}>
                      {team.solvedCount}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--mut)' }}>
                      {team.wrongAttempts}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--neon)' }}>
                      {team.score} pts
                    </td>
                  </tr>
                );
              })}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--mut)' }}>
                    No submissions yet. Be the first to solve!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
