import React from 'react';
import { X, Receipt } from 'lucide-react';

export function TransactionsModal({ team, onClose }) {
  const transactions = team?.transactions || [];
  const totalSpent = transactions.reduce((acc, t) => acc + (Number(t.bidAmount || t.price) || 0), 0);

  return (
    <div className="ov" style={{ zIndex: 1000 }}>
      <div className="box" style={{ maxWidth: '680px', width: '95%', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={20} color="#58a6ff" />
            <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px', fontWeight: 700 }}>
              Purchase & Winning Bid History
            </h3>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Summary Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.025)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--txt-muted)' }}>
              Team: <b style={{ color: '#ffffff' }}>{team?.name}</b>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--txt-dim)', marginTop: '2px' }}>
              Remaining Budget: <b style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>₹{team?.balance ?? 1000} ByteCoins</b>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--txt-dim)', textTransform: 'uppercase' }}>
              Total Bids Spent
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
              ₹{totalSpent}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--txt-dim)' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Problem</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Winning Bid</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Bidder</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Remaining</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '11px 14px', color: '#ffffff' }}>
                    <b>{t.problemId}</b> — {t.problemTitle}
                  </td>
                  <td style={{ padding: '11px 14px', color: '#58a6ff', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    ₹{t.bidAmount || t.price}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ color: 'var(--txt-muted)' }}>{t.purchasedBy}</span>
                    {t.purchasedByName && (
                      <small style={{ color: 'var(--txt-dim)', marginLeft: '6px' }}>({t.purchasedByName})</small>
                    )}
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--txt-muted)', fontFamily: 'var(--font-mono)' }}>
                    ₹{t.remainingBalance !== undefined ? t.remainingBalance : '-'}
                  </td>
                  <td style={{ padding: '11px 14px', textAlign: 'right', color: 'var(--txt-dim)', fontSize: '12px' }}>
                    {t.displayTime || new Date(t.purchaseTime).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--txt-dim)' }}>
                    No recorded winning bids yet.
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
