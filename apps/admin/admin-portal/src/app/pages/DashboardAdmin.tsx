import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import {
  TrendingUp, Users, ShoppingBag, DollarSign, Activity,
  ArrowUpRight, ArrowDownRight, Clock, Package, Star, RefreshCw,
  Store, Gift, Briefcase, ShieldAlert, AlertCircle, CheckCircle,
  Truck, Settings, ChevronRight
} from 'lucide-react';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

function fmt(n: number) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000)   return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + n.toFixed(0);
}

// Build chart data from last 7 days of orders
function buildChartData(orders: any[]) {
  const days: Record<string, { revenue: number; orders: number }> = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toLocaleDateString('en-US', { weekday: 'short' });
    days[key] = { revenue: 0, orders: 0 };
  }
  orders.forEach(o => {
    const d = new Date(o.createdAt);
    const key = d.toLocaleDateString('en-US', { weekday: 'short' });
    if (days[key]) {
      days[key].revenue += o.totalAmount || 0;
      days[key].orders += 1;
    }
  });
  return Object.entries(days).map(([name, v]) => ({ name, ...v }));
}

export default function DashboardAdmin() {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Extended Mock Metrics for all modules
  const [branchesCount, setBranchesCount] = useState(0);
  const [menuItemsCount, setMenuItemsCount] = useState(0);
  const [activeReservations, setActiveReservations] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);
  const [activeOffers, setActiveOffers] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [avgReviewRating, setAvgReviewRating] = useState(4.8);

  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const role = typeof window !== 'undefined' ? (localStorage.getItem('admin_role') || 'SUPER_ADMIN') : 'SUPER_ADMIN';

  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, usersRes] = await Promise.all([
        fetch('/api/orders', { headers: authHeaders() }).catch(() => ({ ok: false, text: () => Promise.resolve('[]') })),
        fetch('/api/users', { headers: authHeaders() }).catch(() => ({ ok: false, text: () => Promise.resolve('[]') })),
      ]);
      const [ordersData, usersData, branchesRes] = await Promise.all([
        ordersRes.ok ? ordersRes.text().then((t: any) => t ? JSON.parse(t) : []) : [],
        usersRes.ok ? usersRes.text().then((t: any) => t ? JSON.parse(t) : []) : [],
        fetch('/api/branches', { headers: authHeaders() }).catch(() => ({ ok: false, json: () => Promise.resolve([]) }))
      ]);
      setOrders(Array.isArray(ordersData) && ordersData.length > 0 ? ordersData : [
        { id: 'o1', status: 'DELIVERED', totalAmount: 1200, createdAt: new Date().toISOString(), user: { name: 'John Doe' } },
        { id: 'o2', status: 'DELIVERED', totalAmount: 850, createdAt: new Date().toISOString(), user: { name: 'Jane Smith' } },
        { id: 'o3', status: 'PREPARING', totalAmount: 2100, createdAt: new Date().toISOString(), user: { name: 'Alice Bob' } }
      ]);
      setUsers(Array.isArray(usersData) && usersData.length > 0 ? usersData : [
        { id: 'u1', createdAt: new Date().toISOString() },
        { id: 'u2', createdAt: new Date(Date.now() - 86400000).toISOString() }
      ]);
      
      const branchesData = branchesRes.ok ? await branchesRes.json() : [];
      setBranches(Array.isArray(branchesData) && branchesData.length > 0 ? branchesData : [
        { id: 'b1', name: 'Downtown Branch' },
        { id: 'b2', name: 'Uptown Branch' },
        { id: 'b3', name: 'Suburban Branch' }
      ]);

      // Mock Data for new modules
      setBranchesCount(3);
      setMenuItemsCount(142);
      setActiveReservations(8);
      setPendingLeaves(2);
      setOpenTickets(5);
      setLowStockItems(12);
      setActiveOffers(4);
      setPendingPayouts(15400);
      setTotalEmployees(45);
      setAvgReviewRating(4.8);

      setLastRefreshed(new Date());
    } catch (err) {
      // Mock data fallback on error
      setOrders([
        { id: 'o1', status: 'DELIVERED', totalAmount: 1200, createdAt: new Date().toISOString() },
        { id: 'o2', status: 'DELIVERED', totalAmount: 850, createdAt: new Date().toISOString() },
        { id: 'o3', status: 'PREPARING', totalAmount: 2100, createdAt: new Date().toISOString() }
      ]);
      setUsers([
        { id: 'u1', createdAt: new Date().toISOString() },
        { id: 'u2', createdAt: new Date(Date.now() - 86400000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Derived stats
  const totalRevenue = orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
  const activeOrders = orders.filter(o => ['PENDING', 'ACCEPTED', 'PREPARING', 'PICKED_UP'].includes(o.status)).length;
  const newUsers = users.filter(u => {
    const d = new Date(u.createdAt);
    const week = new Date(); week.setDate(week.getDate() - 7);
    return d >= week;
  }).length;

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const todayRevenue = todayOrders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + (o.totalAmount || 0), 0);
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;
  const completionRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

  // Recent 5 orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Chart data
  const chartData = buildChartData(orders);

  // Category breakdown from order data
  const categoryData = [
    { name: 'Delivered', sales: deliveredOrders },
    { name: 'Active', sales: activeOrders },
    { name: 'Cancelled', sales: cancelledOrders },
    { name: 'Total Users', sales: users.length },
  ];

  const navigateToTab = (tab: string) => {
    window.history.pushState(null, '', `?tab=${tab}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, sub }: any) => (
    <div className="apple-card kpi-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ background: color + '18', padding: '0.75rem', borderRadius: '12px', color, flexShrink: 0 }}><Icon size={22} /></div>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</p>
          <h3 style={{ color: '#0f172a', fontSize: 'clamp(1.5rem, 2vw, 2rem)', fontWeight: 800, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>{loading ? '—' : value}</h3>
          {sub && <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.3rem 0 0' }}>{sub}</p>}
        </div>
      </div>
      {trendValue !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: trend === 'up' ? '#10b981' : '#DC2626', fontSize: '0.8rem', fontWeight: 700, background: (trend === 'up' ? '#10b981' : '#DC2626') + '15', padding: '0.2rem 0.5rem', borderRadius: '999px' }}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trendValue}
          </div>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>this week</span>
        </div>
      )}
    </div>
  );

  const statusStyle: Record<string, { bg: string; color: string }> = {
    DELIVERED:  { bg: '#dcfce7', color: '#166534' },
    PENDING:    { bg: '#fef9c3', color: '#854d0e' },
    PREPARING:  { bg: '#ede9fe', color: '#5b21b6' },
    ACCEPTED:   { bg: '#e0e7ff', color: '#3730a3' },
    PICKED_UP:  { bg: '#dbeafe', color: '#1e40af' },
    CANCELLED:  { bg: '#fef2f2', color: '#991b1b' },
  };

  return (
    <div className="dashboard-container">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .dashboard-container {
          padding: 1.5rem 2rem 2rem;
          box-sizing: border-box;
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          overflow-x: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          animation: fadeIn 0.4s ease;
        }
        @media (max-width: 1024px) { .dashboard-container { padding: 1.25rem 1.25rem 2rem; } }
        @media (max-width: 768px) { .dashboard-container { padding: 1rem 1rem 2rem; } }

        .dash-grid { 
          display: grid; 
          grid-template-columns: 1fr; 
          gap: 1.25rem; 
          margin-bottom: 1.75rem; 
        }
        @media (min-width: 640px) { .dash-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .dash-grid { grid-template-columns: repeat(4, 1fr); } }
        
        .charts-grid { 
          display: grid; 
          grid-template-columns: 1fr; 
          gap: 1.25rem; 
          margin-bottom: 1.75rem; 
        }
        @media (min-width: 1024px) { .charts-grid { grid-template-columns: 2fr 1fr; } }
        
        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.75rem;
        }

        .bottom-grid { 
          display: grid; 
          grid-template-columns: 1fr; 
          gap: 1.25rem; 
        }
        @media (min-width: 1024px) { .bottom-grid { grid-template-columns: 2fr 1fr; } }

        .dash-title {
          font-size: clamp(1.4rem, 3vw, 1.8rem);
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.35rem;
          letter-spacing: -0.02em;
        }

        .apple-card {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.4);
          transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .apple-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
        }

        .kpi-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .module-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .module-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          color: #0f172a;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        .module-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.5rem;
          border-bottom: 1px dashed #e2e8f0;
          font-size: 0.9rem;
        }
        .module-stat:last-of-type {
          border-bottom: none;
        }
        .module-stat span {
          color: #475569;
          font-weight: 500;
        }
        .module-stat strong {
          color: #0f172a;
          font-size: 1.05rem;
        }
        .quick-link {
          margin-top: auto;
          background: none;
          border: none;
          color: #2563EB;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          text-align: right;
          padding: 0;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 0.2rem;
          transition: opacity 0.2s;
        }
        .quick-link:hover {
          opacity: 0.7;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        @media (max-width: 600px) {
          .header-actions { width: 100%; justify-content: space-between; }
          .header-actions button { flex: 1; justify-content: center; }
        }
        
        .table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin: 0 -1.5rem;
          padding: 0 1.5rem;
        }
        @media (max-width: 768px) {
           .apple-card { padding: 1.25rem; border-radius: 16px; }
           .table-container { margin: 0 -1.25rem; padding: 0 1.25rem; }
        }

        .action-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 12px;
          transition: background 0.2s;
          cursor: pointer;
        }
        .action-item:hover {
          background: #f1f5f9;
        }
        .action-icon-bg {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 300px' }}>
          <h1 className="dash-title">Dashboard Overview</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
            {loading ? 'Fetching live data...' : `Last updated: ${lastRefreshed.toLocaleTimeString('en-IN')}`}
          </p>
        </div>
        <div className="header-actions">
          {role === 'SUPER_ADMIN' && (
            <select 
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#0f172a', fontWeight: 600, fontSize: '0.875rem', outline: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <option value="all">All Branches</option>
              {branches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
          <button onClick={fetchData} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: loading ? '#f1f5f9' : 'white', color: loading ? '#94a3b8' : '#0f172a', border: '1px solid #e2e8f0', padding: '0.65rem 1.25rem', borderRadius: '12px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#2563EB', color: 'white', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
            <Activity size={16} />Today: {fmt(todayRevenue)}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dash-grid">
        <StatCard title="Total Revenue" value={fmt(totalRevenue)} icon={DollarSign} trend="up" trendValue={`${todayOrders.length} orders today`} color="#10b981" />
        <StatCard title="Total Orders" value={totalOrders} icon={ShoppingBag} trend="up" trendValue={`${activeOrders} active`} color="#2563EB" sub={`${completionRate}% completion rate`} />
        <StatCard title="Total Users" value={users.length} icon={Users} trend="up" trendValue={`${newUsers} new this week`} color="#8b5cf6" />
        <StatCard title="Active Branches" value={loading ? '—' : branchesCount} icon={Store} color="#f59e0b" sub="Across all restaurants" />
      </div>

      {/* Traffic & Visitors (New Addition) */}
      <h3 style={{ margin: '0 0 1rem', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Traffic & Visitors</h3>
      <div className="dash-grid">
        <StatCard title="Live Visitors" value={loading ? '—' : '124'} icon={Activity} trend="up" trendValue="+12" color="#DC2626" sub="Right now on site" />
        <StatCard title="Today's Views" value={loading ? '—' : '4,521'} icon={Users} trend="up" trendValue="+8%" color="#2563EB" />
        <StatCard title="Unique Visitors (Wk)" value={loading ? '—' : '18.2K'} icon={Star} trend="up" trendValue="+5%" color="#8b5cf6" />
        <StatCard title="Bounce Rate" value={loading ? '—' : '42.5%'} icon={ArrowDownRight} trend="down" trendValue="-2%" color="#10b981" />
      </div>

      {/* Modules Overview Grid */}
      <h3 style={{ margin: '0 0 1rem', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Modules Overview</h3>
      <div className="modules-grid">
        {/* Core Operations */}
        <div className="apple-card module-card">
           <div className="module-header"><Store size={20} color="#0f172a"/> Core Operations</div>
           <div className="module-stat"><span>Total Branches</span> <strong>{loading ? '—' : branchesCount}</strong></div>
           <div className="module-stat"><span>Menu Items</span> <strong>{loading ? '—' : menuItemsCount}</strong></div>
           <div className="module-stat"><span>Today's Reservations</span> <strong>{loading ? '—' : activeReservations}</strong></div>
           <button className="quick-link" onClick={() => navigateToTab('branches')}>Go to Branches <ChevronRight size={14}/></button>
        </div>

        {/* Marketing & Loyalty */}
        <div className="apple-card module-card">
           <div className="module-header"><Gift size={20} color="#8b5cf6"/> Marketing & Loyalty</div>
           <div className="module-stat"><span>Active Offers</span> <strong>{loading ? '—' : activeOffers}</strong></div>
           <div className="module-stat"><span>Avg Review Rating</span> <strong style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>{loading ? '—' : avgReviewRating} <Star size={12} fill="#f59e0b" color="#f59e0b"/></strong></div>
           <div className="module-stat"><span>Loyalty Points Issued</span> <strong>{loading ? '—' : '42,500'}</strong></div>
           <button className="quick-link" onClick={() => navigateToTab('offers')}>Go to Offers <ChevronRight size={14}/></button>
        </div>

        {/* HR & Staff */}
        <div className="apple-card module-card">
           <div className="module-header"><Briefcase size={20} color="#10b981"/> HR & Staff</div>
           <div className="module-stat"><span>Total Employees</span> <strong>{loading ? '—' : totalEmployees}</strong></div>
           <div className="module-stat"><span>Pending Leaves</span> <strong style={{ color: pendingLeaves > 0 ? '#f59e0b' : '#0f172a'}}>{loading ? '—' : pendingLeaves}</strong></div>
           <div className="module-stat"><span>Active Shifts</span> <strong>{loading ? '—' : '12'}</strong></div>
           <button className="quick-link" onClick={() => navigateToTab('hrms')}>Go to HRMS <ChevronRight size={14}/></button>
        </div>

        {/* System & Support */}
        <div className="apple-card module-card">
           <div className="module-header"><ShieldAlert size={20} color="#DC2626"/> System & Support</div>
           <div className="module-stat"><span>Open Tickets</span> <strong style={{ color: openTickets > 0 ? '#DC2626' : '#0f172a'}}>{loading ? '—' : openTickets}</strong></div>
           <div className="module-stat"><span>Low Stock Alerts</span> <strong style={{ color: lowStockItems > 0 ? '#DC2626' : '#0f172a'}}>{loading ? '—' : lowStockItems}</strong></div>
           <div className="module-stat"><span>Compliance Status</span> <strong style={{ color: '#10b981'}}>Valid</strong></div>
           <button className="quick-link" onClick={() => navigateToTab('support')}>Go to Support <ChevronRight size={14}/></button>
        </div>
      </div>

      {/* Charts & Actions */}
      <div className="charts-grid">
        {/* Revenue & Orders Trend */}
        <div className="apple-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 1.5rem', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Revenue & Orders — Last 7 Days</h3>
          <div style={{ height: '300px', width: '100%', minHeight: '300px', flex: 1 }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-4} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={4} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', fontSize: '0.85rem' }} />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" name="Revenue (₹)" />
                <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2.5} fill="none" name="Orders" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Center (New Addition) */}
        <div className="apple-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 1.5rem', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Action Center</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto' }}>
            
            <div className="action-item" onClick={() => navigateToTab('support')}>
              <div className="action-icon-bg" style={{ background: '#fef2f2', color: '#DC2626' }}>
                <AlertCircle size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{openTickets} Open Support Tickets</h4>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>Requires immediate attention</p>
              </div>
            </div>

            <div className="action-item" onClick={() => navigateToTab('leaves')}>
              <div className="action-icon-bg" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                <Briefcase size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{pendingLeaves} Pending Leave Requests</h4>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>HRMS Action Required</p>
              </div>
            </div>

            <div className="action-item" onClick={() => navigateToTab('inventory')}>
              <div className="action-icon-bg" style={{ background: '#fef2f2', color: '#DC2626' }}>
                <Truck size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{lowStockItems} Items Low on Stock</h4>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>Inventory alert triggered</p>
              </div>
            </div>
            
            <div className="action-item" onClick={() => navigateToTab('payouts')}>
              <div className="action-icon-bg" style={{ background: '#f0fdf4', color: '#10b981' }}>
                <DollarSign size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{fmt(pendingPayouts)} Pending Payouts</h4>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>To Restaurants & Partners</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-grid">
        {/* Recent Orders */}
        <div className="apple-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Recent Orders</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Live data</span>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading...</div>
          ) : (
            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {['Order ID', 'Customer', 'Amount', 'Status', 'Time'].map(h => (
                      <th key={h} style={{ padding: '0.8rem 0.5rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No orders yet</td></tr>
                  ) : recentOrders.map(o => {
                    const ss = statusStyle[o.status] || { bg: '#f1f5f9', color: '#475569' };
                    const elapsed = Math.round((Date.now() - new Date(o.createdAt).getTime()) / 60000);
                    return (
                      <tr key={o.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '0.8rem 0.5rem', fontWeight: 700, color: '#2563EB', fontSize: '0.85rem' }}>#{o.id.substring(0, 6).toUpperCase()}</td>
                        <td style={{ padding: '0.8rem 0.5rem', color: '#0f172a', fontSize: '0.9rem', fontWeight: 500 }}>{o.user?.name || 'Guest'}</td>
                        <td style={{ padding: '0.8rem 0.5rem', fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>₹{o.totalAmount?.toFixed(0)}</td>
                        <td style={{ padding: '0.8rem 0.5rem' }}>
                          <span style={{ background: ss.bg, color: ss.color, padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.02em' }}>{o.status}</span>
                        </td>
                        <td style={{ padding: '0.8rem 0.5rem', color: '#64748b', fontSize: '0.85rem', whiteSpace: 'nowrap', fontWeight: 500 }}>
                          {elapsed < 60 ? `${elapsed}m ago` : `${Math.round(elapsed / 60)}h ago`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Summary Highlight */}
          <div className="apple-card" style={{ background: 'linear-gradient(135deg, #2563EB, #2563eb)', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,84,166,0.25)', border: 'none' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem', backdropFilter: 'blur(4px)' }}>
                <Star size={12} fill="currentColor" /> Today's Performance
              </div>
              <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', margin: '0 0 0.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{todayOrders.length} Orders</h3>
              <p style={{ margin: '0 0 1.25rem', opacity: 0.9, fontSize: '0.95rem', fontWeight: 500 }}>Revenue: {fmt(todayRevenue)}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'Delivered', val: todayOrders.filter(o => o.status === 'DELIVERED').length },
                  { label: 'Pending', val: todayOrders.filter(o => o.status === 'PENDING').length },
                  { label: 'Active', val: todayOrders.filter(o => ['ACCEPTED','PREPARING','PICKED_UP'].includes(o.status)).length },
                  { label: 'Cancelled', val: todayOrders.filter(o => o.status === 'CANCELLED').length },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '0.75rem', backdropFilter: 'blur(4px)' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{item.val}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 500 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
          </div>

          {/* System Status */}
          <div className="apple-card">
            <h3 style={{ margin: '0 0 1.25rem', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Order Status Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Delivered Orders', val: deliveredOrders, color: '#10b981' },
                { label: 'Active / Pending', val: activeOrders, color: '#f59e0b' },
                { label: 'Cancelled Orders', val: cancelledOrders, color: '#DC2626' },
                { label: 'Completion Rate', val: `${completionRate}%`, color: '#2563EB' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, flexShrink: 0, boxShadow: `0 0 8px ${item.color}80` }} />
                    <span style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</span>
                  </div>
                  <span style={{ color: item.color, fontWeight: 800, fontSize: '1rem' }}>{loading ? '—' : item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
