import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  DollarSign, Activity, ArrowUpRight, ArrowDownRight,
  CreditCard, Briefcase, Zap, FileText, Upload
} from 'lucide-react';

// Mock Data Builders
function buildFinanceData() {
  const data = [];
  const today = new Date();
  for (let i = 14; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const revenue = Math.floor(Math.random() * 5000) + 15000;
    const payouts = Math.floor(revenue * (0.6 + Math.random() * 0.15)); // 60-75% of revenue
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue,
      payouts
    });
  }
  return data;
}

const recentTransactions = [
  { id: 'TRX-9482', entity: 'Downtown Branch', type: 'Payout', amount: 4500, status: 'Completed', time: 'Today, 09:41 AM' },
  { id: 'TRX-9481', entity: 'Customer Refund', type: 'Refund', amount: 45, status: 'Completed', time: 'Yesterday, 04:15 PM' },
  { id: 'TRX-9480', entity: 'Corporate Account A', type: 'Invoice Paid', amount: 12000, status: 'Completed', time: 'Oct 12, 11:30 AM' },
  { id: 'TRX-9479', entity: 'Uptown Branch', type: 'Payout', amount: 6200, status: 'Processing', time: 'Oct 11, 10:00 AM' },
];

export default function FinanceDashboardAdmin() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API load
    setTimeout(() => {
      setChartData(buildFinanceData());
      setLoading(false);
    }, 700);
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, sub }: any) => (
    <div className="apple-card kpi-card" style={{ padding: '1.5rem', borderRadius: '16px', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</p>
          <h3 style={{ color: '#0f172a', fontSize: 'clamp(1.5rem, 2vw, 2rem)', fontWeight: 800, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>{loading ? '—' : value}</h3>
          {sub && <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.3rem 0 0' }}>{sub}</p>}
        </div>
        <div style={{ background: color + '18', padding: '0.75rem', borderRadius: '12px', color }}><Icon size={22} /></div>
      </div>
      {trendValue !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: trend === 'up' ? '#10b981' : '#DC2626', fontSize: '0.8rem', fontWeight: 700, background: (trend === 'up' ? '#10b981' : '#DC2626') + '15', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trendValue}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>vs last period</span>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '2rem', animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>Finance & Billing</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>Monitor revenue streams, payouts, and corporate invoicing.</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#0f172a', color: 'white', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          <Upload size={18} />
          Export Report
        </button>
      </div>
      
      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Pending Payouts" value="$24,200" icon={DollarSign} trend="up" trendValue="5%" color="#f59e0b" />
        <StatCard title="Processed Refunds" value="$1,120" icon={CreditCard} trend="down" trendValue="-2.1%" color="#DC2626" sub="This Month" />
        <StatCard title="Active Surge Zones" value="12" icon={Zap} trend="up" trendValue="4" color="#8b5cf6" />
        <StatCard title="Corporate Invoices" value="$84,000" icon={Briefcase} trend="up" trendValue="12%" color="#3b82f6" sub="Outstanding" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Main Chart */}
        <div className="apple-card" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>Revenue vs Payouts</h3>
              <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Gross Revenue and Vendor Payouts over the last 14 days</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#10b981' }} />
                <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Revenue</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#3b82f6' }} />
                <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Payouts</span>
              </div>
            </div>
          </div>
          
          <div style={{ height: '350px', width: '100%' }}>
            {loading ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={32} className="animate-spin text-slate-300" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  <Area yAxisId="left" type="monotone" dataKey="payouts" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPay)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="apple-card" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>Recent Ledger Activity</h3>
            <button style={{ color: '#3b82f6', background: 'transparent', border: 'none', fontWeight: 600, cursor: 'pointer' }}>View All</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid #f1f5f9' }}>Transaction ID</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid #f1f5f9' }}>Entity</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid #f1f5f9' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid #f1f5f9' }}>Time</th>
                  <th style={{ textAlign: 'right', padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid #f1f5f9' }}>Amount</th>
                  <th style={{ textAlign: 'right', padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid #f1f5f9' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((trx, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover-bg-slate-50">
                    <td style={{ padding: '1rem', color: '#0f172a', fontWeight: 500 }}>{trx.id}</td>
                    <td style={{ padding: '1rem', color: '#475569' }}>{trx.entity}</td>
                    <td style={{ padding: '1rem', color: '#475569' }}>{trx.type}</td>
                    <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>{trx.time}</td>
                    <td style={{ padding: '1rem', color: '#0f172a', fontWeight: 700, textAlign: 'right' }}>${trx.amount.toLocaleString()}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <span style={{ 
                        background: trx.status === 'Completed' ? '#10b98115' : '#f59e0b15',
                        color: trx.status === 'Completed' ? '#10b981' : '#f59e0b',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
