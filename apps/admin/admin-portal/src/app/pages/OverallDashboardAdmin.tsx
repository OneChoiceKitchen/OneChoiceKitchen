import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Users, ShoppingBag, DollarSign, Activity,
  ArrowUpRight, Briefcase, CheckCircle, AlertCircle
} from 'lucide-react';

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` });

export default function OverallDashboardAdmin() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ revenue: 0, users: 0, subscriptions: 0, employees: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ordersRes, usersRes, subsRes, empRes] = await Promise.all([
          fetch('/api/orders', { headers: authH() }).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/users', { headers: authH() }).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/subscriptions/plans', { headers: authH() }).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/employees', { headers: authH() }).then(r => r.ok ? r.json() : []).catch(() => []),
        ]);

        // Normalise arrays (some endpoints wrap in { data: [] })
        const orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.data ?? []);
        const users  = Array.isArray(usersRes)  ? usersRes  : (usersRes?.data  ?? []);
        const subs   = Array.isArray(subsRes)   ? subsRes   : (subsRes?.data   ?? []);
        const emps   = Array.isArray(empRes)    ? empRes    : (empRes?.data    ?? []);

        // Revenue = sum of delivered/completed orders
        const revenue = orders
          .filter((o: any) => ['DELIVERED','COMPLETED'].includes(o.status))
          .reduce((s: number, o: any) => s + (Number(o.totalAmount) || 0), 0);

        setMetrics({ revenue, users: users.length, subscriptions: subs.length, employees: emps.length });

        // Build last-14-day chart from orders
        const days: Record<string, number> = {};
        const now = Date.now();
        for (let i = 13; i >= 0; i--) {
          const d = new Date(now - i * 86400000);
          days[d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })] = 0;
        }
        orders.forEach((o: any) => {
          const d = new Date(o.createdAt);
          if (now - d.getTime() <= 14 * 86400000) {
            const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            if (key in days) days[key] += Number(o.totalAmount) || 0;
          }
        });
        setChartData(Object.entries(days).map(([date, revenue]) => ({ date, revenue })));

        // Activity feed: last 8 orders sorted by createdAt desc
        const recent = [...orders]
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8)
          .map((o: any, idx: number) => ({
            id: o.id || idx,
            text: `Order #${o.orderNumber || o.id?.slice(0,8) || idx + 1} — ₹${Number(o.totalAmount || 0).toLocaleString('en-IN')} [${o.status}]`,
            time: new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
            color: o.status === 'DELIVERED' ? '#10b981' : o.status === 'CANCELLED' ? '#DC2626' : '#3b82f6',
          }));
        setActivities(recent);
      } catch (err) {
        console.error('OverallDashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const nav = (tab: string) => {
    window.history.pushState(null, '', `?tab=${tab}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const StatCard = ({ title, value, icon: Icon, color, sub, link }: any) => {
    const [hovered, setHovered] = useState(false);
    return (
      <div
        className="apple-card kpi-card"
        onClick={() => link && nav(link)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          cursor: link ? 'pointer' : 'default',
          padding: '1.5rem', borderRadius: '16px', background: 'white',
          boxShadow: hovered && link ? '0 10px 25px rgba(0,0,0,0.1)' : '0 4px 20px rgba(0,0,0,0.03)',
          border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column',
          transform: hovered && link ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</p>
            <h3 style={{ color: '#0f172a', fontSize: 'clamp(1.5rem, 2vw, 2rem)', fontWeight: 800, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {loading ? '—' : value}
            </h3>
            {sub && <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.3rem 0 0' }}>{sub}</p>}
          </div>
          <div style={{ background: color + '18', padding: '0.75rem', borderRadius: '12px', color }}>
            <Icon size={22} />
          </div>
        </div>
        {link && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '1.2rem', color, fontSize: '0.8rem', fontWeight: 600 }}>
            <ArrowUpRight size={14} /> View details
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>Unified Overview</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>Bird's-eye view of your entire organization across all modules.</p>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Total Platform Revenue" value={`₹ ${metrics.revenue.toLocaleString('en-IN')}`} icon={DollarSign} color="#10b981" sub="delivered + completed orders" link="orders" />
        <StatCard title="Total Active Users"      value={metrics.users.toLocaleString()}         icon={Users}      color="#3b82f6" sub="registered customers"         link="users" />
        <StatCard title="Subscription Plans"      value={metrics.subscriptions.toLocaleString()} icon={ShoppingBag}color="#8b5cf6" sub="active plans configured"      link="tiffin" />
        <StatCard title="Total Employees"         value={metrics.employees.toLocaleString()}      icon={Briefcase}  color="#6366f1" sub="all staff records"            link="hrms" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Revenue Chart */}
        <div className="apple-card" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>Revenue Trend</h3>
              <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Last 14 days — from live orders</p>
            </div>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            {loading ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={32} style={{ opacity: 0.3 }} />
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
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} formatter={(v: any) => [`₹ ${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Activity Feed & System Health */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', gridColumn: '1 / -1' }}>
          <div className="apple-card" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>Recent Orders</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {activities.map((act: any) => (
                <div key={act.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: act.color, marginTop: '6px', flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: '0 0 0.2rem', color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>{act.text}</p>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{act.time}</span>
                  </div>
                </div>
              ))}
              {activities.length === 0 && !loading && (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No recent orders.</p>
              )}
            </div>
            <button
              onClick={() => nav('orders')}
              style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
            >
              View All Orders →
            </button>
          </div>

          <div className="apple-card" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>System Health Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Core APIs',            ok: true  },
                { label: 'Payment Gateways',      ok: true  },
                { label: 'WhatsApp Integration',  ok: false },
                { label: 'Database Cluster',      ok: true  },
              ].map(({ label, ok }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {ok ? <CheckCircle size={20} color="#10b981" /> : <AlertCircle size={20} color="#f59e0b" />}
                    <span style={{ fontWeight: 600, color: '#334155' }}>{label}</span>
                  </div>
                  <span style={{ background: ok ? '#10b98115' : '#f59e0b15', color: ok ? '#10b981' : '#f59e0b', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>
                    {ok ? 'Online' : 'Degraded'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}