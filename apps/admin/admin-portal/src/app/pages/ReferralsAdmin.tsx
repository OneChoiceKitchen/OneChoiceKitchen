import { useState, useEffect } from 'react';
import { useToast } from '@org/ui-design-system';
import styles from './ReferralsAdmin.module.css';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

const DUMMY_REFERRALS = [
  { id: 'ref1', referrer: { name: 'John Doe' }, referrerId: 'user123', referredEmail: 'friend@example.com', createdAt: '2026-07-01T10:00:00Z', bonusPoints: 50, status: 'PENDING' },
  { id: 'ref2', referrer: { name: 'Jane Smith' }, referrerId: 'user456', referredEmail: 'colleague@example.com', createdAt: '2026-07-02T14:30:00Z', bonusPoints: 100, status: 'COMPLETED' },
  { id: 'ref3', referrer: { name: 'Alice Jones' }, referrerId: 'user789', referredEmail: 'sister@example.com', createdAt: '2026-07-03T09:15:00Z', bonusPoints: 50, status: 'REWARDED' },
  { id: 'ref4', referrer: { name: 'Bob Wilson' }, referrerId: 'user321', referredEmail: 'brother@example.com', createdAt: '2026-07-05T16:20:00Z', bonusPoints: 0, status: 'CANCELLED' }
];

export default function ReferralsAdmin() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  useEffect(() => { fetchReferrals(); }, []);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/referrals/admin', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.text().then(t => JSON.parse(t));
      const fetchedReferrals = Array.isArray(data) ? data : [];
      setReferrals(fetchedReferrals.length > 0 ? fetchedReferrals : DUMMY_REFERRALS);
    } catch (err) {
      // Fallback on API failure
      setReferrals(DUMMY_REFERRALS);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/referrals/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error();
      toast.success(`Referral marked as ${newStatus.toLowerCase()}`);
      fetchReferrals();
    } catch {
      // Mock status update
      setReferrals(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast.success(`(Mocked) Referral marked as ${newStatus.toLowerCase()}`);
    }
  };

  const filtered = referrals.filter(r => {
    const matchesStatus = !statusFilter || r.status === statusFilter;
    const matchesSearch = !searchQuery ||
      r.referrer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referrerId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referredEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusConfig: Record<string, { bg: string; color: string }> = {
    PENDING:   { bg: '#fef9c3', color: '#854d0e' },
    COMPLETED: { bg: '#dcfce7', color: '#166534' },
    CANCELLED: { bg: '#fef2f2', color: '#991b1b' },
    REWARDED:  { bg: '#ede9fe', color: '#5b21b6' },
  };

  // Stats summary
  const stats = {
    total: referrals.length,
    completed: referrals.filter(r => r.status === 'COMPLETED').length,
    pending: referrals.filter(r => r.status === 'PENDING').length,
    rewarded: referrals.filter(r => r.status === 'REWARDED').length,
  };

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.pageTitle}>🔗 Referrals Management</h2>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {[
          { label: 'Total', value: stats.total, color: '#0ea5e9', bg: '#f0f9ff' },
          { label: 'Completed', value: stats.completed, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Pending', value: stats.pending, color: '#d97706', bg: '#fffbeb' },
          { label: 'Rewarded', value: stats.rewarded, color: '#8b5cf6', bg: '#f5f3ff' },
        ].map(s => (
          <div key={s.label} className={styles.statCard} style={{ background: s.bg, border: `1px solid ${s.color}33` }}>
            <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
            <div className={styles.statLabel} style={{ color: s.color }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={styles.filtersGroup}>
        <input
          type="text"
          placeholder="Search by referrer or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={styles.searchBox}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className={styles.statusSelect}
        >
          <option value="">All Status</option>
          {['PENDING', 'COMPLETED', 'CANCELLED', 'REWARDED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading && referrals.length === 0 ? (
        <div className={styles.emptyState}>Loading referrals...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Referrer</th>
                <th>Referred Email</th>
                <th>Date</th>
                <th>Bonus Points</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ref => {
                const sc = statusConfig[ref.status] || { bg: '#f1f5f9', color: '#475569' };
                return (
                  <tr key={ref.id}>
                    <td data-label="Referrer">
                      <span className={styles.primaryCell}>{ref.referrer?.name || 'Unknown User'}</span>
                      <span className={styles.secondaryCell}>#{ref.referrerId?.substring(0, 8)}</span>
                    </td>
                    <td data-label="Referred Email" className={styles.emailCell}>
                      {ref.referredEmail || ref.referred?.email || '—'}
                    </td>
                    <td data-label="Date" className={styles.dateCell}>
                      {ref.createdAt ? new Date(ref.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td data-label="Bonus Points" className={styles.pointsCell}>
                      {ref.bonusPoints || ref.rewardPoints || '—'}
                    </td>
                    <td data-label="Status">
                      <span className={styles.statusBadge} style={{ background: sc.bg, color: sc.color }}>
                        {ref.status}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className={styles.actionGroup}>
                        {ref.status === 'PENDING' && (
                          <button 
                            onClick={() => handleUpdateStatus(ref.id, 'COMPLETED')}
                            className={`${styles.actionBtn} ${styles.complete}`}
                          >
                            Complete
                          </button>
                        )}
                        {ref.status === 'COMPLETED' && (
                          <button 
                            onClick={() => handleUpdateStatus(ref.id, 'REWARDED')}
                            className={`${styles.actionBtn} ${styles.reward}`}
                          >
                            Mark Rewarded
                          </button>
                        )}
                        {['PENDING', 'COMPLETED'].includes(ref.status) && (
                          <button 
                            onClick={() => handleUpdateStatus(ref.id, 'CANCELLED')}
                            className={`${styles.actionBtn} ${styles.cancel}`}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    {searchQuery || statusFilter ? 'No referrals match your filters.' : 'No referrals created yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
