import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import {
  TrendingUp, Users, ShoppingBag, DollarSign, Activity,
  ArrowUpRight, ArrowDownRight, Briefcase, CheckCircle, AlertCircle
} from 'lucide-react';

// Mock Data Builders
function buildRevenueData() {
  const data = [];
  const today = new Date();
  for (let i = 14; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 5000) + 15000,
      users: Math.floor(Math.random() * 200) + 500,
    });
  }
  return data;
}

const mockActivity = [
  { id: 1, type: 'order', text: 'New large order #1042 placed', time: '5 mins ago', color: '#10b981' },
  { id: 2, type: 'user', text: '14 new users registered', time: '20 mins ago', color: '#3b82f6' },
  { id: 3, type: 'alert', text: 'Server memory utilization high', time: '1 hour ago', color: '#f59e0b' },
  { id: 4, type: 'hr', text: 'Payroll processing completed', time: '3 hours ago', color: '#8b5cf6' },
];

export default function OverallDashboardAdmin() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API load
    setTimeout(() => {
      setChartData(buildRevenueData());
      setLoading(false);
    }, 800);
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
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>vs last week</span>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '2rem', animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>Unified Overview</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>Bird's-eye view of your entire organization across all modules.</p>
      </div>
      
      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Total Platform Revenue" value="$284,500" icon={DollarSign} trend="up" trendValue="14.2%" color="#10b981" />
        <StatCard title="Total Active Users" value="45.2K" icon={Users} trend="up" trendValue="5.1%" color="#3b82f6" />
        <StatCard title="Active Subscriptions" value="1,240" icon={ShoppingBag} trend="up" trendValue="2.4%" color="#8b5cf6" />
        <StatCard title="Total Employees" value="120" icon={Briefcase} trend="up" trendValue="0.0%" color="#6366f1" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Main Chart */}
        <div className="apple-card" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>Revenue & Growth Trend</h3>
              <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Last 14 days performance</p>
            </div>
            <select style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
              <option>Last 14 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
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
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Activity Feed & System Health side-by-side */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', gridColumn: '1 / -1' }}>
          
          <div className="apple-card" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>Global Activity Feed</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {mockActivity.map(act => (
                <div key={act.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: act.color, marginTop: '6px', flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: '0 0 0.2rem', color: '#0f172a', fontWeight: 600, fontSize: '0.95rem' }}>{act.text}</p>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <button style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
              View All Activity
            </button>
          </div>

          <div className="apple-card" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>System Health Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle size={20} color="#10b981" />
                  <span style={{ fontWeight: 600, color: '#334155' }}>Core APIs</span>
                </div>
                <span style={{ background: '#10b98115', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>Online</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle size={20} color="#10b981" />
                  <span style={{ fontWeight: 600, color: '#334155' }}>Payment Gateways</span>
                </div>
                <span style={{ background: '#10b98115', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>Online</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AlertCircle size={20} color="#f59e0b" />
                  <span style={{ fontWeight: 600, color: '#334155' }}>WhatsApp Integration</span>
                </div>
                <span style={{ background: '#f59e0b15', color: '#f59e0b', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>Degraded</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle size={20} color="#10b981" />
                  <span style={{ fontWeight: 600, color: '#334155' }}>Database Cluster</span>
                </div>
                <span style={{ background: '#10b98115', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
