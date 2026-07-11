import { useState, useEffect } from 'react';
import { useToast } from '@org/ui-design-system';
import styles from './WaitlistAdmin.module.css';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

const DUMMY_WAITLIST = [
  { id: 'w1', user: { name: 'Alice Smith', phone: '555-0100' }, partySize: 2, estimatedWaitTime: 15, createdAt: new Date(Date.now() - 1000*60*5).toISOString(), status: 'WAITING' },
  { id: 'w2', user: { name: 'Bob Johnson', phone: '555-0101' }, partySize: 4, estimatedWaitTime: 30, createdAt: new Date(Date.now() - 1000*60*25).toISOString(), status: 'NOTIFIED' },
  { id: 'w3', user: { name: 'Charlie Davis', email: 'charlie@example.com' }, partySize: 6, estimatedWaitTime: 45, createdAt: new Date(Date.now() - 1000*60*40).toISOString(), status: 'SEATED' },
  { id: 'w4', user: { name: 'Diana Prince', phone: '555-0102' }, partySize: 2, estimatedWaitTime: null, createdAt: new Date(Date.now() - 1000*60*60).toISOString(), status: 'CANCELLED' }
];

export default function WaitlistAdmin() {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => { fetchWaitlist(); }, []);

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      // Simulate network delay for dummy data without triggering 404 in console
      await new Promise(r => setTimeout(r, 600));
      setWaitlist(DUMMY_WAITLIST);
    } catch (e) {
      console.error(e);
      setWaitlist(DUMMY_WAITLIST);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, action: string) => {
    try {
      // Simulate network delay for update
      await new Promise(r => setTimeout(r, 400));
      
      const actionLabels: Record<string, string> = {
        notify: 'Customer notified',
        seat: 'Customer seated',
        cancel: 'Entry cancelled',
      };

      // Mock the update directly since the API doesn't exist yet
        setWaitlist(prev => prev.map(w => {
          if (w.id === id) {
            let newStatus = w.status;
            if (action === 'notify') newStatus = 'NOTIFIED';
            if (action === 'seat') newStatus = 'SEATED';
            if (action === 'cancel') newStatus = 'CANCELLED';
            return { ...w, status: newStatus };
          }
          return w;
        }));
        toast.success(`(Mocked) ${actionLabels[action] || 'Status updated'}`);
    } catch {
      toast.error(`Failed to ${action} entry`);
    }
  };

  const filtered = waitlist.filter(w => !statusFilter || w.status === statusFilter);

  const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    WAITING:   { bg: '#fef3c7', color: '#d97706', label: 'Waiting' },
    NOTIFIED:  { bg: '#e0f2fe', color: '#0284c7', label: 'Notified' },
    SEATED:    { bg: '#dcfce7', color: '#16a34a', label: 'Seated' },
    CANCELLED: { bg: '#fef2f2', color: '#DC2626', label: 'Cancelled' },
  };

  const counts = Object.keys(statusConfig).reduce((acc, s) => {
    acc[s] = waitlist.filter(w => w.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>⏳ Waitlist Management</h2>
      </div>

      {/* Status Summary Pills */}
      <div className={styles.statusSummary}>
        {[{ label: 'All', value: '', count: waitlist.length, color: '#0ea5e9' },
          ...Object.entries(statusConfig).map(([k, v]) => ({ label: v.label, value: k, count: counts[k], color: v.color }))
        ].map(pill => (
          <button 
            key={pill.value} 
            onClick={() => setStatusFilter(pill.value)}
            className={`${styles.summaryPill} ${statusFilter === pill.value ? styles.active : styles.inactive}`}
            style={{
              background: statusFilter === pill.value ? pill.color : '#f1f5f9',
              color: statusFilter === pill.value ? 'white' : '#475569',
              fontWeight: statusFilter === pill.value ? 700 : 500
            }}
          >
            {pill.label}
            <span 
              className={styles.pillCount}
              style={{
                background: statusFilter === pill.value ? 'rgba(255,255,255,0.3)' : '#e2e8f0',
                color: statusFilter === pill.value ? 'white' : '#64748b'
              }}
            >
              {pill.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingState}>Loading waitlist...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['#', 'Customer', 'Party Size', 'Est. Wait', 'Joined At', 'Status', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    {statusFilter ? `No ${statusFilter} entries` : 'No waitlist entries'}
                  </td>
                </tr>
              ) : filtered.map((w, i) => {
                const sc = statusConfig[w.status] || { bg: '#f1f5f9', color: '#475569' };
                return (
                  <tr key={w.id}>
                    <td data-label="#" className={styles.idCell}>#{i + 1}</td>
                    <td data-label="Customer">
                      <div className={styles.customerName}>{w.user?.name || 'Guest'}</div>
                      <div className={styles.customerContact}>{w.user?.phone || w.user?.email || '—'}</div>
                    </td>
                    <td data-label="Party Size" className={styles.partyCell}>{w.partySize}</td>
                    <td data-label="Est. Wait" className={styles.waitCell}>
                      {w.estimatedWaitTime ? `${w.estimatedWaitTime} min` : '—'}
                    </td>
                    <td data-label="Joined At" className={styles.timeCell}>
                      {w.createdAt ? new Date(w.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td data-label="Status">
                      <span 
                        className={styles.statusBadge}
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className={styles.actionGroup}>
                        {w.status === 'WAITING' && (
                          <button 
                            onClick={() => updateStatus(w.id, 'notify')}
                            className={`${styles.actionBtn} ${styles.notify}`}
                          >
                            📳 Notify
                          </button>
                        )}
                        {w.status === 'NOTIFIED' && (
                          <button 
                            onClick={() => updateStatus(w.id, 'seat')}
                            className={`${styles.actionBtn} ${styles.seat}`}
                          >
                            ✅ Seat
                          </button>
                        )}
                        {['WAITING', 'NOTIFIED'].includes(w.status) && (
                          <button 
                            onClick={() => updateStatus(w.id, 'cancel')}
                            className={`${styles.actionBtn} ${styles.cancel}`}
                          >
                            ✕ Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
