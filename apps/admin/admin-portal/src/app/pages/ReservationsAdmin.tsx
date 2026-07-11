import { useState, useEffect } from 'react';
import styles from './ReservationsAdmin.module.css';

const authHeaders = () => ({ 'Authorization': `Bearer ${localStorage.getItem('admin_token')}`, 'Content-Type': 'application/json' });

export default function ReservationsAdmin() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reservations/admin', { headers: authHeaders() });
      const data = await res.text().then(t => JSON.parse(t));
      setReservations(Array.isArray(data) ? data : data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/reservations/${id}/status`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) });
    fetchReservations();
  };

  const filtered = reservations.filter(r =>
    (!statusFilter || r.status === statusFilter) &&
    (!dateFilter || r.date?.startsWith(dateFilter))
  );

  const statusColors: Record<string, string> = { 
    PENDING: '#f59e0b', 
    CONFIRMED: '#16a34a', 
    SEATED: '#0ea5e9',
    CANCELLED: '#DC2626', 
    COMPLETED: '#2563eb' 
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>🍽️ Table Reservations</h2>
      </div>

      <div className={styles.filterBar}>
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)} 
          className={styles.filterSelect}
        >
          <option value="">All Status</option>
          {['PENDING', 'CONFIRMED', 'SEATED', 'CANCELLED', 'COMPLETED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input 
          type="date" 
          value={dateFilter} 
          onChange={e => setDateFilter(e.target.value)} 
          className={styles.filterInput} 
        />
        <button 
          onClick={() => { setStatusFilter(''); setDateFilter(''); }} 
          className={styles.secondaryBtn}
        >
          Clear
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingState}>Loading reservations...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['Code', 'Customer', 'Restaurant', 'Date & Time', 'Party', 'Table & Deposit', 'Status', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyState}>No reservations found</td>
                </tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td data-label="Code" className={styles.codeCell}>{r.confirmationCode?.substring(0, 8) || 'N/A'}</td>
                  <td data-label="Customer" className={styles.customerCell}>{r.user?.name || r.userId?.substring(0, 8)}</td>
                  <td data-label="Restaurant" className={styles.detailCell}>{r.restaurant?.name || '—'}</td>
                  <td data-label="Date & Time" className={styles.detailCell}>{new Date(r.date).toLocaleDateString()} {r.timeSlot}</td>
                  <td data-label="Party" className={styles.partyCell}>{r.partySize}</td>
                  <td data-label="Table & Deposit" className={styles.tableInfoCell}>
                    <div>Table: <strong>{r.table?.name || r.tableNumber || 'Unassigned'}</strong></div>
                    <div>Deposit: <span style={{ color: r.depositStatus === 'PAID' ? '#16a34a' : '#f59e0b', fontWeight: 600 }}>{r.depositAmount ? `₹${r.depositAmount}` : 'None'}</span></div>
                  </td>
                  <td data-label="Status">
                    <span 
                      className={styles.statusBadge} 
                      style={{ color: statusColors[r.status] || '#475569' }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className={styles.actionGroup}>
                      {r.status === 'PENDING' && (
                        <button 
                          onClick={() => updateStatus(r.id, 'CONFIRMED')} 
                          className={`${styles.actionBtn} ${styles.confirm}`}
                        >
                          Confirm
                        </button>
                      )}
                      {['PENDING', 'CONFIRMED'].includes(r.status) && (
                        <button 
                          onClick={() => updateStatus(r.id, 'CANCELLED')} 
                          className={`${styles.actionBtn} ${styles.cancel}`}
                        >
                          Cancel
                        </button>
                      )}
                      {r.status === 'CONFIRMED' && (
                        <button 
                          onClick={() => updateStatus(r.id, 'COMPLETED')} 
                          className={`${styles.actionBtn} ${styles.complete}`}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
