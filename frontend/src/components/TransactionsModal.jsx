import React from 'react';
import { X, Receipt, CheckCircle, Clock, Gavel } from 'lucide-react';

export function TransactionsModal({ team, onClose }) {
  const transactions = team?.transactions || [];
  const totalSpent = transactions.reduce((acc, t) => acc + (Number(t.bidAmount || t.price) || 0), 0);

  return (
    <div className="ov" style={{ zIndex: 1000 }}>
      <div className="box" style={{ maxWidth: '720px', width: '95%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Receipt size={22} color="var(--teal)" />
            <h3 style={{ margin: 0, color: 'var(--teal)', fontSize: '18px' }}>
              Offline Bidding & Purchase Transaction History
            </h3>
          </div>
          <button onClick={onClose}><X size={16} /></button>
        </div>

        {/* Summary Card */}
        <div style={{
          background: 'var(--bg3)',
          border: '1px solid var(--bd)',
          borderRadius: '8px',
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--txt)' }}>
              Team: <b style={{ color: 'var(--teal)' }}>{team?.name}</b>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: '2px' }}>
              Current Remaining Budget: <b style={{ color: 'var(--neon)' }}>₹{team?.balance ?? 1000}</b>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--mut)', textTransform: 'uppercase' }}>
              Total Bids Spent
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--amber)' }}>
              ₹{totalSpent}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid var(--bd)', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg4)', borderBottom: '1px solid var(--bd)', color: 'var(--mut)' }}>
                <th style={{ padding: '8px 12px' }}>Problem</th>
                <th style={{ padding: '8px 12px' }}>Winning Bid</th>
                <th style={{ padding: '8px 12px' }}>Bidder (Member ID)</th>
                <th style={{ padding: '8px 12px' }}>Remaining Balance</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--bd)' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <b>{t.problemId}</b> — {t.problemTitle}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--neon)', fontWeight: 700 }}>
                    ₹{t.bidAmount || t.price}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ color: 'var(--teal)', fontWeight: 600 }}>{t.purchasedBy}</span>
                    {t.purchasedByName && (
                      <small style={{ color: 'var(--mut)', marginLeft: '6px' }}>({t.purchasedByName})</small>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--txt)' }}>
                    ₹{t.remainingBalance !== undefined ? t.remainingBalance : '-'}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--mut)', fontSize: '12px' }}>
                    {t.displayTime || new Date(t.purchaseTime).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--mut)' }}>
                    No problems unlocked via bidding yet. When you win an offline bid and enter the winning amount, the transaction will appear here.
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
