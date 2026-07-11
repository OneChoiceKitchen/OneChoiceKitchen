import React, { useState, useEffect } from 'react';

const API = '/api/branches';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('partner_token')}`,
  'Content-Type': 'application/json',
});

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  operatingHours: string;
  qrCodeUrl: string;
  isQrMenuEnabled: boolean;
  isReservationEnabled: boolean;
}

const emptyForm = {
  name: '',
  address: '',
  city: '',
  operatingHours: '',
  qrCodeUrl: '',
  isQrMenuEnabled: false,
  isReservationEnabled: false,
};

export default function BranchesPartner() {
  const restaurantId = localStorage.getItem('partner_restaurant_id') || '';
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/restaurant/${restaurantId}`, { headers: authHeaders() });
      if (res.ok) setBranches(await res.json());
    } catch (e) {
      console.error('Failed to fetch branches', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchBranches();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId ? `${API}/${editId}` : API;
      const method = editId ? 'PATCH' : 'POST';
      const body = editId ? form : { ...form, restaurantId };
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
      if (res.ok) {
        setShowForm(false);
        setEditId(null);
        setForm({ ...emptyForm });
        fetchBranches();
      }
    } catch (e) {
      console.error('Failed to save branch', e);
    }
  };

  const handleEdit = (b: Branch) => {
    setEditId(b.id);
    setForm({
      name: b.name,
      address: b.address || '',
      city: b.city || '',
      operatingHours: b.operatingHours || '',
      qrCodeUrl: b.qrCodeUrl || '',
      isQrMenuEnabled: b.isQrMenuEnabled,
      isReservationEnabled: b.isReservationEnabled,
    });
    setShowForm(true);
  };

  const toggleField = async (id: string, field: 'isQrMenuEnabled' | 'isReservationEnabled', current: boolean) => {
    try {
      const res = await fetch(`${API}/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ [field]: !current }),
      });
      if (res.ok) fetchBranches();
    } catch (e) {
      console.error('Toggle failed', e);
    }
  };

  const cardStyle: React.CSSProperties = { background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', padding: '1.5rem' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' };
  const btnPrimary: React.CSSProperties = { background: '#2563EB', color: 'white', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.8rem' }}>Branch Management</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Manage your restaurant branches, QR menus and reservations.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyForm }); }} style={btnPrimary}>+ Add Branch</button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ ...cardStyle, marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a' }}>{editId ? 'Edit Branch' : 'Add New Branch'}</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Branch Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inputStyle} placeholder="e.g. Koramangala Outlet" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Address</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={inputStyle} placeholder="Street address" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>City</label>
                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} style={inputStyle} placeholder="e.g. Bengaluru" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Operating Hours</label>
                <input value={form.operatingHours} onChange={e => setForm({ ...form, operatingHours: e.target.value })} style={inputStyle} placeholder="e.g. 10:00 AM - 11:00 PM" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>QR Code URL</label>
                <input value={form.qrCodeUrl} onChange={e => setForm({ ...form, qrCodeUrl: e.target.value })} style={inputStyle} placeholder="https://..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#475569' }}>
                <input type="checkbox" checked={form.isQrMenuEnabled} onChange={e => setForm({ ...form, isQrMenuEnabled: e.target.checked })} /> Enable QR Menu
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#475569' }}>
                <input type="checkbox" checked={form.isReservationEnabled} onChange={e => setForm({ ...form, isReservationEnabled: e.target.checked })} /> Enable Reservations
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" style={btnPrimary}>{editId ? 'Update Branch' : 'Create Branch'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} style={{ ...btnPrimary, background: '#e2e8f0', color: '#475569' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Branches List */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '3rem 0' }}>Loading branches...</p>
      ) : branches.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem', color: '#64748b' }}>No branches found. Add your first branch to get started.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {branches.map(b => (
            <div key={b.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>{b.name}</h3>
                <button onClick={() => handleEdit(b)} style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>Edit</button>
              </div>
              {b.address && <p style={{ margin: '0 0 0.25rem', color: '#475569', fontSize: '0.9rem' }}>📍 {b.address}</p>}
              {b.city && <p style={{ margin: '0 0 0.25rem', color: '#475569', fontSize: '0.9rem' }}>🏙️ {b.city}</p>}
              {b.operatingHours && <p style={{ margin: '0 0 0.75rem', color: '#475569', fontSize: '0.9rem' }}>🕐 {b.operatingHours}</p>}
              {b.qrCodeUrl && <p style={{ margin: '0 0 0.75rem', color: '#64748b', fontSize: '0.8rem', wordBreak: 'break-all' }}>🔗 {b.qrCodeUrl}</p>}

              <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => toggleField(b.id, 'isQrMenuEnabled', b.isQrMenuEnabled)}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '999px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem', background: b.isQrMenuEnabled ? '#dcfce7' : '#f1f5f9', color: b.isQrMenuEnabled ? '#166534' : '#64748b' }}
                >
                  {b.isQrMenuEnabled ? '✅ QR Menu' : '⬜ QR Menu'}
                </button>
                <button
                  onClick={() => toggleField(b.id, 'isReservationEnabled', b.isReservationEnabled)}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '999px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem', background: b.isReservationEnabled ? '#dcfce7' : '#f1f5f9', color: b.isReservationEnabled ? '#166534' : '#64748b' }}
                >
                  {b.isReservationEnabled ? '✅ Reservations' : '⬜ Reservations'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
