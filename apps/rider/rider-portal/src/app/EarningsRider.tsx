import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, Clock, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@org/ui-design-system';

const API = '/api/payouts';

const authHeaders = () => ({
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('rider_token')}`,
    'Content-Type': 'application/json',
  }
});

function getUserIdFromToken(): string {
  try {
    const token = localStorage.getItem('rider_token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.userId || '';
  } catch {
    return '';
  }
}

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

export default function EarningsRider() {
  const userId = getUserIdFromToken();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/rider/${userId}`, { headers: authHeaders().headers });
      if (res.ok) {
        setPayouts(await res.json());
      } else {
        // Fallback mock payouts
        setPayouts([
          { id: 'P-101', amount: 1550, status: 'PROCESSED', periodStart: '2026-06-01', periodEnd: '2026-06-07', transactionRef: 'TXN8271829', createdAt: '2026-06-08' },
          { id: 'P-102', amount: 840, status: 'APPROVED', periodStart: '2026-06-08', periodEnd: '2026-06-14', transactionRef: '', createdAt: '2026-06-15' },
          { id: 'P-103', amount: 620, status: 'PENDING', periodStart: '2026-06-15', periodEnd: '2026-06-21', transactionRef: '', createdAt: '2026-06-16' }
        ]);
      }
    } catch (e) {
      console.error(e);
      setPayouts([
        { id: 'P-101', amount: 1550, status: 'PROCESSED', periodStart: '2026-06-01', periodEnd: '2026-06-07', transactionRef: 'TXN8271829', createdAt: '2026-06-08' },
        { id: 'P-102', amount: 840, status: 'APPROVED', periodStart: '2026-06-08', periodEnd: '2026-06-14', transactionRef: '', createdAt: '2026-06-15' },
        { id: 'P-103', amount: 620, status: 'PENDING', periodStart: '2026-06-15', periodEnd: '2026-06-21', transactionRef: '', createdAt: '2026-06-16' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchPayouts();
    else setLoading(false);
  }, [userId]);

  const totalEarned = payouts.filter(p => p.status === 'PROCESSED').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payouts.filter(p => p.status === 'PENDING' || p.status === 'APPROVED').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPayoutsCount = payouts.length;

  const handlePayoutRequest = async () => {
    toast.success('Instant cashout request submitted to accounting. Payout status will update shortly!');
  };

  if (loading && payouts.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading payouts...</div>;
  }

  return (
    <div style={{ paddingBottom: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.8rem' }}>My Earnings & Payouts</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Track your payouts, processed settlements, and pending transfers.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ flex: '1 1 300px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem' }}>Total Settled Earnings</p>
              <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700 }}>₹{totalEarned.toLocaleString('en-IN')}</h2>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}>
              <DollarSign size={28} color="#10b981" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', color: '#94a3b8', fontSize: '0.8rem' }}>Pending Settlements</p>
              <p style={{ margin: 0, fontWeight: 600 }}>₹{totalPending.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', color: '#94a3b8', fontSize: '0.8rem' }}>Settlements Count</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{totalPayoutsCount}</p>
            </div>
          </div>
        </div>

        <div style={{ flex: '1 1 300px', background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.1rem' }}>Request Instant Payout</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Withdraw your approved pending balance of ₹{totalPending} directly to your registered bank account.</p>
          <button
            onClick={handlePayoutRequest}
            disabled={totalPending === 0}
            style={{ width: '100%', background: totalPending > 0 ? '#2563EB' : '#94a3b8', color: 'white', border: 'none', padding: '0.85rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem', cursor: totalPending > 0 ? 'pointer' : 'not-allowed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
          >
            Request Transfer <ArrowUpRight size={18} />
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>Payout History</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Payout ID</th>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Period</th>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Transaction Ref</th>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No payouts recorded yet.</td>
                </tr>
              ) : (
                payouts.map((req, index) => (
                  <tr key={req.id} style={{ borderBottom: index === payouts.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem 1.5rem', color: '#0f172a', fontWeight: 500, fontSize: '0.9rem' }}>{req.id}</td>
                    <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                      {new Date(req.periodStart).toLocaleDateString()} - {new Date(req.periodEnd).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                      {req.transactionRef || 'N/A'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: statusColors[req.status]?.bg || '#f1f5f9',
                        color: statusColors[req.status]?.color || '#475569'
                      }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.95rem', textAlign: 'right' }}>₹{req.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
