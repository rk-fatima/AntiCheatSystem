import React, { useState, useEffect } from 'react';
import { Trophy, X, FileDown, Image } from 'lucide-react';
import { fetchLeaderboard } from '../services/api';
import { exportLeaderboardToPDF, exportLeaderboardToPNG } from '../utils/leaderboardExport';

export function LeaderboardModal({ onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

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

  const handleDownloadPDF = () => {
    if (leaderboard.length === 0) return;
    setExporting(true);
    try {
      exportLeaderboardToPDF({
        leaderboard,
        eventName: 'QUBIT Code Auctioneer'
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (leaderboard.length === 0) return;
    setExporting(true);
    try {
      await exportLeaderboardToPNG({
        leaderboard,
        eventName: 'QUBIT Code Auctioneer'
      });
    } catch (err) {
      console.error('Failed to export PNG:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="ov" style={{ zIndex: 950 }}>
      <div className="box" style={{ maxWidth: '720px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={20} color="#bc8cff" />
            <h2 style={{ margin: 0, color: '#ffffff', fontSize: '18px', fontWeight: 700 }}>
              Live Contest Leaderboard
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={exporting || leaderboard.length === 0}
              className="btn-ghost"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                padding: '6px 12px',
                color: '#58a6ff',
                borderColor: 'rgba(88, 166, 255, 0.3)',
                background: 'rgba(88, 166, 255, 0.08)',
                borderRadius: '6px',
                cursor: (exporting || leaderboard.length === 0) ? 'not-allowed' : 'pointer'
              }}
              title="Download Leaderboard as PDF"
            >
              <FileDown size={14} />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={exporting || leaderboard.length === 0}
              className="btn-ghost"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                padding: '6px 12px',
                color: '#bc8cff',
                borderColor: 'rgba(188, 140, 255, 0.3)',
                background: 'rgba(188, 140, 255, 0.08)',
                borderRadius: '6px',
                cursor: (exporting || leaderboard.length === 0) ? 'not-allowed' : 'pointer'
              }}
              title="Download Leaderboard as PNG"
            >
              <Image size={14} />
              <span>Download PNG</span>
            </button>

            <button className="btn-ghost" onClick={onClose} style={{ padding: '6px', marginLeft: '4px' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scoring Rules Strip */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.025)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '16px',
          fontSize: '12px',
          color: 'var(--txt-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          <div>
            <span>Scoring: Easy (400) • Medium (650) • Hard (800)</span>
          </div>
          <div style={{ color: '#ff7b72' }}>
            −10 pts per Wrong Submission
          </div>
        </div>

        <div style={{
          maxHeight: '440px',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--txt-dim)' }}>
                <th style={{ padding: '10px 14px', width: '60px', fontWeight: 600 }}>Rank</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Team</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600 }}>Solved</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600 }}>ByteCoins</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((team, idx) => {
                const rank = idx + 1;
                return (
                  <tr key={team.name} style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    background: rank === 1 ? 'rgba(56, 139, 253, 0.04)' : 'transparent'
                  }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: rank <= 3 ? '#ffffff' : 'var(--txt-dim)' }}>
                      #{rank}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#ffffff' }}>
                      {team.name}
                      {team.isLocked && <span style={{ color: '#ff7b72', fontSize: '11px', marginLeft: '6px' }}>(Locked)</span>}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#58a6ff', fontWeight: 600 }}>
                      {team.solvedCount}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#3fb950', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {team.balance ?? 1000} BC
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      <div>{team.score} pts</div>
                      {Boolean(team.auctionBonusAwarded && team.bytecoinBonus > 0) && (
                        <div style={{ fontSize: '10px', color: '#e3b341', fontWeight: 600 }}>
                          (+{team.bytecoinBonus} BC bonus)
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--txt-dim)' }}>
                    {loading ? 'Loading leaderboard standings...' : 'No active competition session or submissions yet.'}
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
