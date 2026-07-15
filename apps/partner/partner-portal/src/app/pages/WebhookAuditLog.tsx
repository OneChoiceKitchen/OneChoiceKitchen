import React, { useState, useEffect } from 'react';

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  payload: any;
  responseStatus: number | null;
  responseBody: string | null;
  success: boolean;
  createdAt: string;
}

export function WebhookAuditLog({ webhookId }: { webhookId?: string }) {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [webhookId]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const url = webhookId ? `/api/webhooks/${webhookId}/logs` : '/api/webhooks/logs';
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch webhook logs');
      const data = await res.json();
      setLogs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading audit logs...</div>;

  return (
    <div className="webhook-audit-log" style={{ marginTop: '2rem' }}>
      <h2>Webhook Audit Log</h2>
      {error && <div className="error" style={{ color: 'var(--brand-red)' }}>{error}</div>}

      <div className="logs-list" style={{ background: 'var(--surf)', borderRadius: '8px', border: '1px solid var(--bdr)' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bdr)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Timestamp</th>
              <th style={{ padding: '1rem' }}>Event</th>
              <th style={{ padding: '1rem' }}>Status Code</th>
              <th style={{ padding: '1rem' }}>Success</th>
              <th style={{ padding: '1rem' }}>Response</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>No logs found.</td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--bdr)' }}>
                  <td style={{ padding: '1rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}>{log.event}</td>
                  <td style={{ padding: '1rem' }}>{log.responseStatus || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '999px', 
                      fontSize: '0.875rem',
                      background: log.success ? 'var(--brand-blue-lt)' : 'var(--brand-red-lt)',
                      color: log.success ? 'var(--brand-blue-dk)' : 'var(--brand-red-dk)'
                    }}>
                      {log.success ? 'Success' : 'Failed'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.responseBody || ''}>
                    {log.responseBody || 'No response'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
