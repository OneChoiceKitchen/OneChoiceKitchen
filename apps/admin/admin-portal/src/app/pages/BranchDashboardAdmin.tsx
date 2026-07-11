import React, { useState, useEffect } from 'react';

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}`, 'Content-Type': 'application/json' });

interface Branch { id: string; name: string; city: string; isActive: boolean; }
interface Order  { id: string; branchId?: string; totalAmount: number; status: string; createdAt: string; }

export default function BranchDashboardAdmin() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/branches', { headers: authH() }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/orders',   { headers: authH() }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([b, o]) => {
      setBranches(Array.isArray(b) ? b : []);
      setOrders(Array.isArray(o) ? o : []);
    }).finally(() => setLoading(false));
  }, []);

  const branchStats = branches.map(br => {
    const brOrders = orders.filter(o => o.branchId === br.id);
    const revenue  = brOrders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + (o.totalAmount || 0), 0);
    const today    = new Date().toDateString();
    const todayOrd = brOrders.filter(o => new Date(o.createdAt).toDateString() === today).length;
    return { ...br, totalOrders: brOrders.length, revenue, todayOrders: todayOrd };
  }).sort((a, b) => b.revenue - a.revenue);

  const totalRev  = branchStats.reduce((s, b) => s + b.revenue, 0);
  const totalOrd  = branchStats.reduce((s, b) => s + b.totalOrders, 0);
  const activeBr  = branches.filter(b => b.isActive).length;

  const fmtMoney = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

  const KPIS = [
    { label: 'Total Branches', value: branches.length.toString(), icon: '🏪', color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Active Branches', value: activeBr.toString(),       icon: '✅', color: '#16A34A', bg: '#F0FDF4' },
    { label: 'Total Revenue',   value: fmtMoney(totalRev),        icon: '💰', color: '#059669', bg: '#ECFDF5' },
    { label: 'Total Orders',    value: totalOrd.toLocaleString(),  icon: '🛍️', color: '#EA580C', bg: '#FFF7ED' },
  ];

  if (loading) return (
    <div className="page-container">
      <div className="page-header"><div className="page-title-block"><h1 className="page-title">🏪 Branch Dashboard</h1></div></div>
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading branch data…</div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">🏪 Branch Dashboard</h1>
          <p className="page-subtitle">Per-branch performance overview — real-time from API</p>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {KPIS.map((k,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'1.25rem', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'.75rem' }}>
              <div>
                <p style={{ fontSize:'.72rem', fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'.35rem' }}>{k.label}</p>
                <h3 style={{ fontSize:'1.6rem', fontWeight:800, color:k.color, letterSpacing:'-.025em' }}>{k.value}</h3>
              </div>
              <div style={{ width:42, height:42, background:k.bg, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>{k.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Branch Performance Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Branch Name</th>
              <th>City</th>
              <th>Status</th>
              <th>Total Orders</th>
              <th>Today's Orders</th>
              <th>Revenue</th>
              <th>Avg Order Value</th>
            </tr>
          </thead>
          <tbody>
            {branchStats.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign:'center', padding:'2rem', color:'#94a3b8' }}>No branch data available</td></tr>
            ) : branchStats.map((br, i) => (
              <tr key={br.id}>
                <td><span style={{ fontWeight:700, color:i===0?'#F59E0B':i===1?'#94A3B8':i===2?'#B45309':'#64748b' }}>#{i+1}</span></td>
                <td><strong>{br.name}</strong></td>
                <td>{br.city}</td>
                <td>
                  <span style={{ padding:'.2rem .6rem', borderRadius:999, fontSize:'.72rem', fontWeight:600,
                    background: br.isActive ? '#dcfce7' : '#f1f5f9',
                    color:      br.isActive ? '#166534' : '#64748b' }}>
                    {br.isActive ? '● Active' : '○ Inactive'}
                  </span>
                </td>
                <td>{br.totalOrders.toLocaleString()}</td>
                <td>{br.todayOrders}</td>
                <td style={{ fontWeight:600, color:'#059669' }}>{fmtMoney(br.revenue)}</td>
                <td>{br.totalOrders > 0 ? fmtMoney(Math.round(br.revenue / br.totalOrders)) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
