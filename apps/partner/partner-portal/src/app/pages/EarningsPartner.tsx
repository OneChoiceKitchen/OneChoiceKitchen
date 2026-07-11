import React, { useState, useEffect } from 'react';

const API = '/api/payouts';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('partner_token')}`,
  'Content-Type': 'application/json',
});

interface Payout {
  id: string;
  amount: number;
  status: string;
  periodStart: string;
  periodEnd: string;
  transactionRef?: string;
  createdAt: string;
  processedAt?: string;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#fef08a', color: '#854d0e' },
  APPROVED: { bg: '#dbeafe', color: '#1e40af' },
  PROCESSED: { bg: '#dcfce7', color: '#166534' },
  REJECTED: { bg: '#fee2e2', color: '#991b1b' },
};

function getUserIdFromToken(): string {
  try {
    const token = localStorage.getItem('partner_token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.userId || '';
  } catch {
    return '';
  }
}

export default function EarningsPartner() {
  const userId = getUserIdFromToken();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/partner/${userId}`, { headers: authHeaders() });
        if (res.ok) setPayouts(await res.json());
      } catch (e) {
        console.error('Failed to fetch payouts', e);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchPayouts();
    else setLoading(false);
  }, [userId]);

  const totalEarned = payouts.filter(p => p.status === 'PROCESSED').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payouts.filter(p => p.status === 'PENDING' || p.status === 'APPROVED').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPayouts = payouts.length;

  const cardStyle: React.CSSProperties = { background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', padding: '1.5rem' };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.8rem' }}>Earnings & Payouts</h2>
        <p style={{ margin: 0, color: '#64748b' }}>Track your payouts and settlement history.</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 0.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>Total Settled</p>
          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>₹{totalEarned.toLocaleString('en-IN')}</h2>
        </div>
        <div style={cardStyle}>
          <p style={{ margin: '0 0 0.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Pending Settlement</p>
          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#854d0e' }}>₹{totalPending.toLocaleString('en-IN')}</h2>
        </div>
        <div style={cardStyle}>
          <p style={{ margin: '0 0 0.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Total Payouts</p>
          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#2563EB' }}>{totalPayouts}</h2>
        </div>
      </div>

      {/* Payout History */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '3rem 0' }}>Loading payouts...</p>
      ) : payouts.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem', color: '#64748b' }}>No payout records found.</div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>Payout History</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Period</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Amount</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Transaction Ref</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p, i) => {
                  const sc = statusColors[p.status] || statusColors.PENDING;
                  return (
                    <tr key={p.id} style={{ borderBottom: i === payouts.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem 1.5rem', color: '#0f172a', fontSize: '0.9rem' }}>
                        {p.periodStart?.split('T')[0]} — {p.periodEnd?.split('T')[0]}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.95rem' }}>₹{(p.amount || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ background: sc.bg, color: sc.color, padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>{p.status}</span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontFamily: 'monospace' }}>{p.transactionRef || '—'}</td>
                      <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.85rem' }}>{p.createdAt?.split('T')[0]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
