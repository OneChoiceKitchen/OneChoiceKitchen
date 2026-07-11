import React, { useState, useEffect } from 'react';

const API = '/api/compliance';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('partner_token')}`,
  'Content-Type': 'application/json',
});

const DOC_TYPES = ['FSSAI', 'HEALTH_CERT', 'FIRE_NOC', 'TRADE_LICENSE', 'GST'] as const;

interface ComplianceDoc {
  id: string;
  documentType: string;
  documentNumber: string;
  fileUrl: string;
  issuedDate: string;
  expiryDate: string;
  status: string;
  reviewNotes?: string;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#fef08a', color: '#854d0e' },
  APPROVED: { bg: '#dcfce7', color: '#166534' },
  REJECTED: { bg: '#fee2e2', color: '#991b1b' },
  EXPIRED: { bg: '#f1f5f9', color: '#475569' },
};

export default function CompliancePartner() {
  const restaurantId = localStorage.getItem('partner_restaurant_id') || '';
  const [docs, setDocs] = useState<ComplianceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    documentType: 'FSSAI' as string,
    documentNumber: '',
    fileUrl: '',
    issuedDate: '',
    expiryDate: '',
  });

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/restaurant/${restaurantId}`, { headers: authHeaders() });
      if (res.ok) setDocs(await res.json());
    } catch (e) {
      console.error('Failed to fetch compliance docs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchDocs();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...form, restaurantId }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ documentType: 'FSSAI', documentNumber: '', fileUrl: '', issuedDate: '', expiryDate: '' });
        fetchDocs();
      }
    } catch (e) {
      console.error('Failed to upload document', e);
    }
  };

  const cardStyle: React.CSSProperties = { background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', padding: '1.5rem' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' };
  const btnPrimary: React.CSSProperties = { background: '#2563EB', color: 'white', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' };

  const friendlyType = (t: string) => t.replace(/_/g, ' ');

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.8rem' }}>Compliance Documents</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Upload and track your restaurant compliance documents.</p>
        </div>
        <button onClick={() => setShowForm(true)} style={btnPrimary}>+ Upload Document</button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div style={{ ...cardStyle, marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a' }}>Upload New Document</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Document Type</label>
                <select value={form.documentType} onChange={e => setForm({ ...form, documentType: e.target.value })} style={inputStyle}>
                  {DOC_TYPES.map(dt => <option key={dt} value={dt}>{friendlyType(dt)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Document Number</label>
                <input value={form.documentNumber} onChange={e => setForm({ ...form, documentNumber: e.target.value })} required style={inputStyle} placeholder="e.g. FSSAI-12345678" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>File URL</label>
                <input value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} required style={inputStyle} placeholder="https://storage.example.com/doc.pdf" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Issued Date</label>
                <input type="date" value={form.issuedDate} onChange={e => setForm({ ...form, issuedDate: e.target.value })} required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Expiry Date</label>
                <input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} required style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" style={btnPrimary}>Submit Document</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ ...btnPrimary, background: '#e2e8f0', color: '#475569' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Documents Table */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '3rem 0' }}>Loading documents...</p>
      ) : docs.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem', color: '#64748b' }}>No compliance documents found. Upload your first document.</div>
      ) : (
        <div style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Type</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Document #</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Issued</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Expiry</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>File</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d, i) => {
                  const sc = statusColors[d.status] || statusColors.PENDING;
                  return (
                    <tr key={d.id} style={{ borderBottom: i === docs.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem 1.5rem', color: '#0f172a', fontWeight: 500, fontSize: '0.9rem' }}>{friendlyType(d.documentType)}</td>
                      <td style={{ padding: '1rem 1.5rem', color: '#0f172a', fontSize: '0.9rem', fontFamily: 'monospace' }}>{d.documentNumber}</td>
                      <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>{d.issuedDate?.split('T')[0]}</td>
                      <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>{d.expiryDate?.split('T')[0]}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ background: sc.bg, color: sc.color, padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>{d.status}</span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {d.fileUrl ? <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', fontWeight: 600, fontSize: '0.85rem' }}>View</a> : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
