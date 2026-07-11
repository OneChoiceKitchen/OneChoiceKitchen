import React, { useState, useEffect } from 'react';

const API = '/api/reservations';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('partner_token')}`,
  'Content-Type': 'application/json',
});

interface Reservation {
  id: string;
  customerName?: string;
  user?: { name: string; phone?: string };
  partySize: number;
  reservationDate: string;
  timeSlot: string;
  status: string;
  specialRequests?: string;
  tableNumber?: string;
}

const STATUS_LIST = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'] as const;

const statusColors: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#fef08a', color: '#854d0e' },
  CONFIRMED: { bg: '#dbeafe', color: '#1e40af' },
  CANCELLED: { bg: '#fee2e2', color: '#991b1b' },
  COMPLETED: { bg: '#dcfce7', color: '#166534' },
  NO_SHOW: { bg: '#f1f5f9', color: '#475569' },
};

export default function ReservationsPartner() {
  const restaurantId = localStorage.getItem('partner_restaurant_id') || '';
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const dateParam = dateFilter ? `?date=${dateFilter}` : '';
      const res = await fetch(`${API}/restaurant/${restaurantId}${dateParam}`, { headers: authHeaders() });
      if (res.ok) setReservations(await res.json());
    } catch (e) {
      console.error('Failed to fetch reservations', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchReservations();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter]);

  const updateStatus = async (id: string, status: string, tableNumber?: string) => {
    try {
      const body: any = { status };
      if (tableNumber) body.tableNumber = tableNumber;
      const res = await fetch(`${API}/${id}/status`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body) });
      if (res.ok) fetchReservations();
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const handleConfirm = (id: string) => {
    const table = prompt('Assign table number (optional):');
    updateStatus(id, 'CONFIRMED', table || undefined);
  };

  const filtered = statusFilter === 'ALL' ? reservations : reservations.filter(r => r.status === statusFilter);

  const cardStyle: React.CSSProperties = { background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', padding: '1.5rem' };
  const inputStyle: React.CSSProperties = { padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' };
  const btnPrimary: React.CSSProperties = { background: '#2563EB', color: 'white', border: 'none', padding: '0.45rem 0.9rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.8rem' }}>Reservations</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Manage table reservations for your restaurant.</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginRight: '0.5rem' }}>Date:</label>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginRight: '0.5rem' }}>Status:</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}>
            {STATUS_LIST.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
          </select>
        </div>
        {dateFilter && (
          <button onClick={() => setDateFilter('')} style={{ ...btnPrimary, background: '#e2e8f0', color: '#475569' }}>Clear Date</button>
        )}
      </div>

      {/* Reservations */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '3rem 0' }}>Loading reservations...</p>
      ) : filtered.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem', color: '#64748b' }}>No reservations found for the selected filters.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(r => {
            const sc = statusColors[r.status] || statusColors.PENDING;
            const name = r.customerName || r.user?.name || 'Guest';
            return (
              <div key={r.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem' }}>{name}</h3>
                  <span style={{ background: sc.bg, color: sc.color, padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600 }}>{r.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem' }}>📅 {r.reservationDate?.split('T')[0]}</p>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem' }}>🕐 {r.timeSlot}</p>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem' }}>👥 Party of {r.partySize}</p>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem' }}>🪑 {r.tableNumber || 'Unassigned'}</p>
                </div>
                {r.specialRequests && (
                  <p style={{ margin: '0 0 0.75rem', color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>📝 {r.specialRequests}</p>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                  {r.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleConfirm(r.id)} style={btnPrimary}>Confirm</button>
                      <button onClick={() => updateStatus(r.id, 'CANCELLED')} style={{ ...btnPrimary, background: '#DC2626' }}>Cancel</button>
                    </>
                  )}
                  {r.status === 'CONFIRMED' && (
                    <button onClick={() => updateStatus(r.id, 'COMPLETED')} style={{ ...btnPrimary, background: '#16a34a' }}>Mark Complete</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
