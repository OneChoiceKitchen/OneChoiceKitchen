import React, { useState, useEffect } from 'react';

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}`, 'Content-Type': 'application/json' });

interface TiffinSub { id: string; status: string; planType?: string; userId?: string; totalAmount?: number; createdAt: string; }

export default function MessDashboardAdmin() {
  const [subs,    setSubs]    = useState<TiffinSub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tiffin/subscriptions', { headers: authH() })
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setSubs(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const active   = subs.filter(s => s.status === 'ACTIVE').length;
  const paused   = subs.filter(s => s.status === 'PAUSED').length;
  const cancelled= subs.filter(s => s.status === 'CANCELLED').length;
  const revenue  = subs.reduce((t, s) => t + (s.totalAmount || 0), 0);

  // Plan breakdown
  const planMap: Record<string, number> = {};
  subs.forEach(s => { const p = s.planType || 'Standard'; planMap[p] = (planMap[p] || 0) + 1; });

  // Monthly trend (last 6 months)
  const months: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months[d.toLocaleString('default', { month: 'short', year: '2-digit' })] = 0;
  }
  subs.forEach(s => {
    const d = new Date(s.createdAt);
    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (months[key] !== undefined) months[key]++;
  });

  const fmtMoney = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

  const KPIS = [
    { label: 'Total Subscriptions', value: subs.length.toString(),  icon: '🍱', color: '#EA580C', bg: '#FFF7ED' },
    { label: 'Active',              value: active.toString(),        icon: '✅', color: '#16A34A', bg: '#F0FDF4' },
    { label: 'Paused',              value: paused.toString(),        icon: '⏸️', color: '#D97706', bg: '#FFFBEB' },
    { label: 'Revenue',             value: fmtMoney(revenue),        icon: '💰', color: '#059669', bg: '#ECFDF5' },
  ];

  if (loading) return (
    <div className="page-container">
      <div className="page-header"><div className="page-title-block"><h1 className="page-title">🍱 Mess Dashboard</h1></div></div>
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading tiffin data…</div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">🍱 Mess / Tiffin Dashboard</h1>
          <p className="page-subtitle">Subscription metrics, delivery stats and plan revenue</p>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {KPIS.map((k,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'1.25rem', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'.75rem' }}>
              <div>
                <p style={{ fontSize:'.72rem', fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'.35rem' }}>{k.label}</p>
                <h3 style={{ fontSize:'1.6rem', fontWeight:800, color:k.color }}>{k.value}</h3>
              </div>
              <div style={{ width:42, height:42, background:k.bg, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>{k.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        {/* Plan Distribution */}
        <div>
          <h2 style={{ fontSize:'.95rem', fontWeight:700, color:'#0f172a', marginBottom:'.875rem' }}>📋 Plan Distribution</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
            {Object.entries(planMap).length === 0 ? (
              <p style={{ color:'#94a3b8', fontSize:'.85rem' }}>No plan data yet</p>
            ) : Object.entries(planMap).sort((a,b) => b[1]-a[1]).map(([plan, cnt], i) => {
              const pct = subs.length > 0 ? Math.round((cnt/subs.length)*100) : 0;
              return (
                <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'.875rem 1rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.375rem' }}>
                    <span style={{ fontWeight:600, fontSize:'.85rem', color:'#0f172a' }}>{plan}</span>
                    <span style={{ fontWeight:700, color:'#EA580C' }}>{cnt} ({pct}%)</span>
                  </div>
                  <div style={{ height:6, background:'#f1f5f9', borderRadius:999 }}>
                    <div style={{ height:6, width:`${pct}%`, background:'#EA580C', borderRadius:999, transition:'width .5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly New Subscriptions */}
        <div>
          <h2 style={{ fontSize:'.95rem', fontWeight:700, color:'#0f172a', marginBottom:'.875rem' }}>📅 Monthly New Subscriptions</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
            {Object.entries(months).map(([month, cnt], i) => {
              const maxVal = Math.max(...Object.values(months), 1);
              const pct = Math.round((cnt/maxVal)*100);
              return (
                <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'.875rem 1rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.375rem' }}>
                    <span style={{ fontWeight:600, fontSize:'.85rem', color:'#0f172a' }}>{month}</span>
                    <span style={{ fontWeight:700, color:'#2563EB' }}>{cnt}</span>
                  </div>
                  <div style={{ height:6, background:'#f1f5f9', borderRadius:999 }}>
                    <div style={{ height:6, width:`${pct}%`, background:'#2563EB', borderRadius:999, transition:'width .5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status breakdown footer */}
      <div style={{ marginTop:'1.5rem', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
        {[
          { label:'Active Subscriptions',    value: active,    color:'#16A34A', bg:'#F0FDF4' },
          { label:'Paused Subscriptions',    value: paused,    color:'#D97706', bg:'#FFFBEB' },
          { label:'Cancelled Subscriptions', value: cancelled, color:'#DC2626', bg:'#FEF2F2' },
        ].map((s,i) => (
          <div key={i} style={{ background:s.bg, border:`1px solid ${s.color}30`, borderRadius:12, padding:'1rem', textAlign:'center' }}>
            <div style={{ fontSize:'2rem', fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'.8rem', fontWeight:600, color:s.color, marginTop:'.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
