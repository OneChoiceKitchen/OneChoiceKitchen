import React, { useState, useEffect } from 'react';

interface Coupon {
  id: string;
  code: string;
  discount: number;
  discountType: 'PERCENTAGE' | 'FLAT';
  minOrderValue: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  description: string;
}

const AUTH = () => ({
  Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json',
});

const BASE = '/api/coupons';

export default function CouponsAdmin() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<Partial<Coupon>>({
    code: '', discount: 10, discountType: 'PERCENTAGE',
    minOrderValue: 100, maxDiscount: 200, usageLimit: 100,
    expiresAt: '', isActive: true, description: '',
  });

  const MOCK: Coupon[] = [
    { id: '1', code: 'WELCOME20', discount: 20, discountType: 'PERCENTAGE', minOrderValue: 200, maxDiscount: 100, usageLimit: 500, usedCount: 128, expiresAt: '2026-12-31', isActive: true, description: 'Welcome discount for new users' },
    { id: '2', code: 'FLAT50',    discount: 50, discountType: 'FLAT',       minOrderValue: 300, maxDiscount: 50,  usageLimit: 200, usedCount: 67,  expiresAt: '2026-09-30', isActive: true, description: '₹50 off on orders above ₹300' },
    { id: '3', code: 'SUMMER30',  discount: 30, discountType: 'PERCENTAGE', minOrderValue: 150, maxDiscount: 150, usageLimit: 1000,usedCount: 432, expiresAt: '2026-08-31', isActive: false,description: 'Summer season offer' },
    { id: '4', code: 'LUNCH15',   discount: 15, discountType: 'PERCENTAGE', minOrderValue: 100, maxDiscount: 75,  usageLimit: 300, usedCount: 89,  expiresAt: '2026-10-15', isActive: true, description: 'Weekday lunch offer' },
    { id: '5', code: 'DIWALI100', discount: 100,discountType: 'FLAT',       minOrderValue: 500, maxDiscount: 100, usageLimit: 100, usedCount: 12,  expiresAt: '2026-11-01', isActive: true, description: 'Diwali special flat discount' },
  ];

  useEffect(() => {
    fetch(BASE, { headers: AUTH() })
      .then(r => r.ok ? r.json() : null)
      .then(d => Array.isArray(d) && d.length ? setCoupons(d) : setCoupons(MOCK))
      .catch(() => setCoupons(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const filtered = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditing(null);
    setForm({ code: '', discount: 10, discountType: 'PERCENTAGE', minOrderValue: 100, maxDiscount: 200, usageLimit: 100, expiresAt: '', isActive: true, description: '' });
    setShowModal(true);
  };

  const openEdit = (c: Coupon) => { setEditing(c); setForm({ ...c }); setShowModal(true); };

  const save = async () => {
    try {
      const opts = { method: editing ? 'PATCH' : 'POST', headers: AUTH(), body: JSON.stringify(form) };
      const r = await fetch(editing ? `${BASE}/${editing.id}` : BASE, opts);
      if (!r.ok) throw new Error();
      const d = await r.json();
      setCoupons(prev => editing ? prev.map(x => x.id === editing.id ? d : x) : [...prev, d]);
    } catch {
      // fallback mock update
      setCoupons(prev => editing
        ? prev.map(x => x.id === editing.id ? { ...x, ...form } as Coupon : x)
        : [...prev, { ...form, id: Date.now().toString(), usedCount: 0 } as Coupon]
      );
    }
    setShowModal(false);
  };

  const toggleActive = async (c: Coupon) => {
    try {
      await fetch(`${BASE}/${c.id}`, { method: 'PATCH', headers: AUTH(), body: JSON.stringify({ isActive: !c.isActive }) });
    } catch { /* fallback */ }
    setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, isActive: !x.isActive } : x));
  };

  const remove = async (c: Coupon) => {
    if (!confirm(`Delete coupon "${c.code}"?`)) return;
    try { await fetch(`${BASE}/${c.id}`, { method: 'DELETE', headers: AUTH() }); } catch { /* fallback */ }
    setCoupons(prev => prev.filter(x => x.id !== c.id));
  };

  const pct = (c: Coupon) => Math.round((c.usedCount / c.usageLimit) * 100);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">🏷️ Coupon Management</h1>
          <p className="page-subtitle">Create and manage discount coupons and promo codes.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openNew}>+ New Coupon</button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <input
          className="search-input"
          placeholder="Search coupons..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-stats">
          <span className="stat-pill stat-blue">{coupons.filter(c => c.isActive).length} Active</span>
          <span className="stat-pill stat-gray">{coupons.filter(c => !c.isActive).length} Inactive</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="skeleton-table">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton skeleton-row" />)}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Max Discount</th>
                <th>Usage</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No coupons found.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <strong style={{ fontFamily: 'monospace', fontSize: '.9rem', color: '#0f172a', letterSpacing: '.5px' }}>{c.code}</strong>
                      <span style={{ fontSize: '.72rem', color: '#94a3b8' }}>{c.description}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ background: c.discountType === 'PERCENTAGE' ? '#eff6ff' : '#ecfdf5', color: c.discountType === 'PERCENTAGE' ? '#2563eb' : '#16a34a', padding: '.25rem .6rem', borderRadius: 6, fontWeight: 700, fontSize: '.8rem' }}>
                      {c.discountType === 'PERCENTAGE' ? `${c.discount}%` : `₹${c.discount}`}
                    </span>
                  </td>
                  <td style={{ fontSize: '.85rem', color: '#475569' }}>₹{c.minOrderValue}</td>
                  <td style={{ fontSize: '.85rem', color: '#475569' }}>₹{c.maxDiscount}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: '#64748b' }}>
                        <span>{c.usedCount} / {c.usageLimit}</span>
                        <span>{pct(c)}%</span>
                      </div>
                      <div style={{ height: 4, background: '#e2e8f0', borderRadius: 999 }}>
                        <div style={{ width: `${pct(c)}%`, height: '100%', background: pct(c) > 80 ? '#dc2626' : '#2563eb', borderRadius: 999 }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '.82rem', color: '#475569' }}>{c.expiresAt || '—'}</td>
                  <td>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <div
                        onClick={() => toggleActive(c)}
                        style={{ width: 36, height: 20, background: c.isActive ? '#2563EB' : '#cbd5e1', borderRadius: 999, position: 'relative', cursor: 'pointer', transition: 'background .2s' }}
                      >
                        <div style={{ position: 'absolute', top: 2, left: c.isActive ? 18 : 2, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
                      </div>
                      <span style={{ fontSize: '.75rem', color: c.isActive ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>{c.isActive ? 'Active' : 'Off'}</span>
                    </label>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => remove(c)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 500, boxShadow: '0 8px 40px rgba(0,0,0,.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{editing ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Coupon Code', key: 'code', type: 'text', placeholder: 'e.g. WELCOME20' },
                { label: 'Description', key: 'description', type: 'text', placeholder: 'Brief description' },
                { label: 'Discount Value', key: 'discount', type: 'number', placeholder: '10' },
                { label: 'Min Order Value (₹)', key: 'minOrderValue', type: 'number', placeholder: '100' },
                { label: 'Max Discount (₹)', key: 'maxDiscount', type: 'number', placeholder: '200' },
                { label: 'Usage Limit', key: 'usageLimit', type: 'number', placeholder: '100' },
                { label: 'Expires At', key: 'expiresAt', type: 'date', placeholder: '' },
              ].map(f => (
                <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
                  <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151' }}>{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={(form as any)[f.key] ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    style={{ padding: '.65rem .875rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.875rem', outline: 'none', fontFamily: 'inherit', width: '100%' }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
                <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151' }}>Discount Type</label>
                <select value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value as any }))}
                  style={{ padding: '.65rem .875rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit' }}>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT">Flat (₹)</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '.625rem 1.25rem', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff', fontSize: '.875rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} style={{ padding: '.625rem 1.5rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 8, fontSize: '.875rem', fontWeight: 700, cursor: 'pointer' }}>
                {editing ? 'Save Changes' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
