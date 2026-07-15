import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@org/ui-design-system';

export default function GlobalAuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'APPROVE': return '#166534';
      case 'REJECT': return '#991b1b';
      default: return '#475569';
    }
  };

  const getActionBg = (action: string) => {
    switch (action) {
      case 'APPROVE': return '#dcfce7';
      case 'REJECT': return '#fee2e2';
      default: return '#f1f5f9';
    }
  };

  return (
    <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Global Audit Log</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>Chronological trail of all SLA approvals and module provisioning.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading audit logs...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Timestamp</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Approver</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Action Taken</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Target Tenant</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', color: '#1e293b', fontWeight: 500 }}>
                    {log.approver?.name || 'System / Unknown'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: getActionBg(log.action),
                      color: getActionColor(log.action),
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#1e293b' }}>
                    {log.case?.tenant?.legalName || 'N/A'}
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.notes || '-'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    No audit logs found.
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
