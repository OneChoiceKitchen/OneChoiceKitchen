import React, { useState } from 'react';
import { DollarSign, ArrowUpRight, Clock, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@org/ui-design-system';

const mockWithdrawals = [
  { id: 'W-9012', amount: 45000, date: '2026-05-28', status: 'Completed', method: 'Bank Transfer' },
  { id: 'W-9045', amount: 32000, date: '2026-06-05', status: 'Completed', method: 'UPI' },
  { id: 'W-9102', amount: 15000, date: '2026-06-12', status: 'Pending', method: 'Bank Transfer' }
];

export default function EarningsAdmin() {
  const [withdrawals, setWithdrawals] = useState(mockWithdrawals);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');
  
  const [balance, setBalance] = useState(85400);
  const toast = useToast();

  const handleWithdrawRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (val > balance) {
      toast.error('Insufficient available balance');
      return;
    }

    const newReq = {
      id: 'W-' + Math.floor(1000 + Math.random() * 9000),
      amount: val,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      method: method === 'bank' ? 'Bank Transfer' : 'UPI'
    };

    setWithdrawals([newReq, ...withdrawals]);
    setBalance(prev => prev - val);
    setAmount('');
    toast.success('Withdrawal request submitted successfully! It will be processed within 2-3 business days.');
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.8rem' }}>Earnings & Payouts</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Manage your revenue and request withdrawals.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ flex: '1 1 300px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem' }}>Available Balance</p>
              <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700 }}>₹{balance.toLocaleString('en-IN')}</h2>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}>
              <DollarSign size={28} color="#10b981" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', color: '#94a3b8', fontSize: '0.8rem' }}>Total Earned</p>
              <p style={{ margin: 0, fontWeight: 600 }}>₹4,50,000</p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', color: '#94a3b8', fontSize: '0.8rem' }}>Next Payout Date</p>
              <p style={{ margin: 0, fontWeight: 600 }}>15th Jun 2026</p>
            </div>
          </div>
        </div>

        <div style={{ flex: '1 1 300px', background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.1rem' }}>Request Withdrawal</h3>
          <form onSubmit={handleWithdrawRequest}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Amount to Withdraw</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 600 }}>₹</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Withdrawal Method</label>
              <select 
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
              >
                <option value="bank">Bank Transfer (...4589)</option>
                <option value="upi">UPI (partner@okicici)</option>
              </select>
            </div>
            <button type="submit" style={{ width: '100%', background: '#2563EB', color: 'white', border: 'none', padding: '0.85rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              Submit Request <ArrowUpRight size={18} />
            </button>
          </form>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>Withdrawal History</h3>
          <button style={{ background: 'transparent', color: '#2563EB', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={16} /> Download Statement
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Transaction ID</th>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Method</th>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Amount</th>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((req, index) => (
                <tr key={req.id} style={{ borderBottom: index === withdrawals.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem 1.5rem', color: '#0f172a', fontWeight: 500, fontSize: '0.9rem' }}>{req.id}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>{req.date}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>{req.method}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.95rem' }}>₹{req.amount.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      background: req.status === 'Completed' ? '#dcfce7' : '#fef08a', 
                      color: req.status === 'Completed' ? '#166534' : '#854d0e',
                      padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 
                    }}>
                      {req.status === 'Completed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
