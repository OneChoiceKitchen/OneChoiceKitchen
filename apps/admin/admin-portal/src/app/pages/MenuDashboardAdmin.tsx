import React, { useState, useEffect } from 'react';

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}`, 'Content-Type': 'application/json' });

interface MenuItem { id: string; name: string; category?: string; price: number; isAvailable: boolean; }
interface OrderItem { menuItemId?: string; quantity: number; menuItem?: { name: string; category?: string; } }
interface Order { id: string; status: string; items?: OrderItem[]; }

export default function MenuDashboardAdmin() {
  const [menus,   setMenus]   = useState<MenuItem[]>([]);
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/menus', { headers: authH() }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/orders', { headers: authH() }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([m, o]) => {
      setMenus(Array.isArray(m) ? m : []);
      setOrders(Array.isArray(o) ? o : []);
    }).finally(() => setLoading(false));
  }, []);

  // Compute top-selling items
  const itemSales: Record<string, { name: string; category: string; qty: number; revenue: number }> = {};
  orders.forEach(ord => {
    (ord.items || []).forEach((oi: any) => {
      const k = oi.menuItemId || oi.menuItem?.name || 'unknown';
      if (!itemSales[k]) itemSales[k] = { name: oi.menuItem?.name || k, category: oi.menuItem?.category || 'General', qty: 0, revenue: 0 };
      itemSales[k].qty     += oi.quantity || 1;
      itemSales[k].revenue += (oi.quantity || 1) * (oi.menuItem?.price || 0);
    });
  });
  const topItems = Object.values(itemSales).sort((a, b) => b.qty - a.qty).slice(0, 10);

  // Category breakdown
  const catMap: Record<string, { count: number; available: number }> = {};
  menus.forEach(m => {
    const c = m.category || 'General';
    if (!catMap[c]) catMap[c] = { count: 0, available: 0 };
    catMap[c].count++;
    if (m.isAvailable) catMap[c].available++;
  });
  const categories = Object.entries(catMap).sort((a, b) => b[1].count - a[1].count);

  const KPIS = [
    { label: 'Total Menu Items', value: menus.length.toString(),                            icon: '🍴', color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Available Items',  value: menus.filter(m => m.isAvailable).length.toString(), icon: '✅', color: '#16A34A', bg: '#F0FDF4' },
    { label: 'Categories',       value: categories.length.toString(),                        icon: '📂', color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Items Analysed',   value: topItems.length.toString(),                          icon: '📊', color: '#EA580C', bg: '#FFF7ED' },
  ];

  if (loading) return (
    <div className="page-container">
      <div className="page-header"><div className="page-title-block"><h1 className="page-title">🍽️ Menu Dashboard</h1></div></div>
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading menu analytics…</div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">🍽️ Menu Dashboard</h1>
          <p className="page-subtitle">Menu health, top sellers and category performance</p>
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

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1.5rem' }}>
        {/* Top Selling Items */}
        <div>
          <h2 style={{ fontSize:'.95rem', fontWeight:700, color:'#0f172a', marginBottom:'.875rem' }}>🏆 Top Selling Items</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>#</th><th>Item Name</th><th>Category</th><th>Orders</th></tr></thead>
              <tbody>
                {topItems.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign:'center', padding:'2rem', color:'#94a3b8' }}>No order data available</td></tr>
                ) : topItems.map((item, i) => (
                  <tr key={i}>
                    <td><span style={{ fontWeight:700, color: i===0?'#F59E0B':i===1?'#94A3B8':i===2?'#B45309':'#64748b' }}>#{i+1}</span></td>
                    <td><strong>{item.name}</strong></td>
                    <td><span style={{ padding:'.15rem .5rem', background:'#f1f5f9', borderRadius:4, fontSize:'.72rem', color:'#475569' }}>{item.category}</span></td>
                    <td style={{ fontWeight:600 }}>{item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h2 style={{ fontSize:'.95rem', fontWeight:700, color:'#0f172a', marginBottom:'.875rem' }}>📂 Categories</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
            {categories.length === 0 ? (
              <p style={{ color:'#94a3b8', fontSize:'.85rem' }}>No categories found</p>
            ) : categories.map(([name, data], i) => (
              <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'.75rem 1rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:'.85rem', color:'#0f172a' }}>{name}</div>
                  <div style={{ fontSize:'.72rem', color:'#64748b' }}>{data.available}/{data.count} available</div>
                </div>
                <div style={{ fontWeight:700, fontSize:'1.1rem', color:'#2563EB' }}>{data.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
