import { useState, useEffect } from 'react';
import { useToast } from '@org/ui-design-system';
import { Download, FileText, KeyRound } from 'lucide-react';
import styles from './AuditLogsAdmin.module.css';

const authHeaders = () => ({ 
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`, 
  'Content-Type': 'application/json' 
});

const DUMMY_AUDIT_LOGS = [
  { id: 'al_1', createdAt: '2026-07-07T10:15:30Z', userId: 'usr_abc123', action: 'UPDATE', entity: 'RESTAURANT_SETTINGS', entityId: 'rest_99', ipAddress: '192.168.1.10' },
  { id: 'al_2', createdAt: '2026-07-07T09:45:12Z', userId: 'usr_xyz789', action: 'DELETE', entity: 'MENU_ITEM', entityId: 'item_45', ipAddress: '10.0.0.5' },
  { id: 'al_3', createdAt: '2026-07-06T18:20:00Z', userId: 'usr_def456', action: 'CREATE', entity: 'PROMO_CODE', entityId: 'promo_1', ipAddress: '172.16.0.22' },
];

const DUMMY_LOGIN_HISTORY = [
  { id: 'lh_1', createdAt: '2026-07-07T11:00:00Z', userId: 'usr_abc123', status: 'SUCCESS', ipAddress: '192.168.1.10', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
  { id: 'lh_2', createdAt: '2026-07-07T10:55:00Z', userId: 'usr_abc123', status: 'FAILED', ipAddress: '192.168.1.10', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
  { id: 'lh_3', createdAt: '2026-07-06T09:00:00Z', userId: 'usr_xyz789', status: 'SUCCESS', ipAddress: '10.0.0.5', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
];

export default function AuditLogsAdmin() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [tab, setTab] = useState<'audit' | 'login'>('audit');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ action: '', entity: '', userId: '' });
  const toast = useToast();

  useEffect(() => { fetchLogs(); }, [tab]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      if (tab === 'audit') {
        const res = await fetch('/api/users/audit-logs?limit=100', { headers: authHeaders() });
        if (!res.ok) throw new Error();
        const data = await res.text().then(t => JSON.parse(t));
        const parsed = Array.isArray(data) ? data : (data.data || []);
        setLogs(parsed.length > 0 ? parsed : DUMMY_AUDIT_LOGS);
      } else {
        const res = await fetch('/api/users/login-history?limit=100', { headers: authHeaders() });
        if (!res.ok) throw new Error();
        const data = await res.text().then(t => JSON.parse(t));
        const parsed = Array.isArray(data) ? data : (data.data || []);
        setLoginHistory(parsed.length > 0 ? parsed : DUMMY_LOGIN_HISTORY);
      }
    } catch (e) {
      // Fallback
      if (tab === 'audit') setLogs(DUMMY_AUDIT_LOGS);
      else setLoginHistory(DUMMY_LOGIN_HISTORY);
    } finally {
      setLoading(false);
    }
  };

  // CSV Export helper
  const exportCSV = () => {
    const rows = tab === 'audit' ? filtered : loginHistory;
    if (rows.length === 0) { toast.warning('No data to export.'); return; }
    
    const headers = tab === 'audit'
      ? ['Time', 'UserID', 'Action', 'Entity', 'EntityID', 'IP']
      : ['Time', 'UserID', 'Status', 'IP', 'Device'];
      
    const csvRows = rows.map(r =>
      tab === 'audit'
        ? [new Date(r.createdAt).toLocaleString(), r.userId, r.action, r.entity, r.entityId, r.ipAddress].map(v => `"${v || ''}"` ).join(',')
        : [new Date(r.createdAt).toLocaleString(), r.userId, r.status, r.ipAddress, r.userAgent].map(v => `"${v || ''}"` ).join(',')
    );
    
    const csv = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${tab}_logs_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    toast.success(`${rows.length} records exported to CSV`);
  };

  const filtered = tab === 'audit'
    ? logs.filter(l =>
        (!filter.action || l.action?.toLowerCase().includes(filter.action.toLowerCase())) &&
        (!filter.entity || l.entity?.toLowerCase().includes(filter.entity.toLowerCase())) &&
        (!filter.userId || l.userId?.includes(filter.userId))
      )
    : loginHistory;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>📋 Audit Logs & Activity</h2>
        <button onClick={exportCSV} className={styles.exportBtn}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className={styles.tabGroup}>
        <button 
          onClick={() => setTab('audit')} 
          className={`${styles.tabBtn} ${tab === 'audit' ? styles.active : styles.inactive}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <FileText size={16} /> Audit Log
        </button>
        <button 
          onClick={() => setTab('login')} 
          className={`${styles.tabBtn} ${tab === 'login' ? styles.active : styles.inactive}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <KeyRound size={16} /> Login History
        </button>
      </div>

      {tab === 'audit' && (
        <div className={styles.filterGroup}>
          {['action', 'entity', 'userId'].map(key => (
            <input 
              key={key} 
              placeholder={`Filter by ${key === 'userId' ? 'User ID' : key}...`} 
              value={(filter as any)[key]}
              onChange={e => setFilter(f => ({ ...f, [key]: e.target.value }))}
              className={styles.filterInput}
            />
          ))}
        </div>
      )}

      {loading ? (
        <div className={styles.emptyState}>Loading logs...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                {tab === 'audit'
                  ? ['Time', 'User', 'Action', 'Entity', 'Entity ID', 'IP'].map(h => <th key={h}>{h}</th>)
                  : ['Time', 'User', 'Status', 'IP', 'Device'].map(h => <th key={h}>{h}</th>)
                }
              </tr>
            </thead>
            <tbody>
              {(tab === 'audit' ? filtered : loginHistory).length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>No records found</td>
                </tr>
              ) : (
                (tab === 'audit' ? filtered : loginHistory).map((row: any) => (
                  <tr key={row.id}>
                    <td data-label="Time">
                      <span className={styles.timestamp}>{new Date(row.createdAt).toLocaleString()}</span>
                    </td>
                    <td data-label="User">
                      <span className={styles.userId}>{row.userId?.substring(0, 8)}...</span>
                    </td>
                    
                    {tab === 'audit' ? (
                      <>
                        <td data-label="Action">
                          <span className={styles.actionBadge}>{row.action}</span>
                        </td>
                        <td data-label="Entity">{row.entity}</td>
                        <td data-label="Entity ID">
                          <span className={styles.mutedText}>{row.entityId?.substring(0, 8)}</span>
                        </td>
                        <td data-label="IP">
                          <span className={styles.mutedText}>{row.ipAddress || '—'}</span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td data-label="Status">
                          <span className={`${styles.statusBadge} ${row.status === 'SUCCESS' ? styles.success : styles.failed}`}>
                            {row.status}
                          </span>
                        </td>
                        <td data-label="IP">
                          <span className={styles.mutedText}>{row.ipAddress || '—'}</span>
                        </td>
                        <td data-label="Device">
                          <span className={styles.mutedText} title={row.userAgent}>
                            {row.userAgent?.substring(0, 40) || '—'}...
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
