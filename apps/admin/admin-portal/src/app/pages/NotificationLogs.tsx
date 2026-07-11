import React, { useState, useEffect } from 'react';

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}`, 'Content-Type': 'application/json' });

interface NotifLog {
  id: string; channel: string; recipient: string; subject?: string;
  status: string; provider?: string; createdAt: string; error?: string;
}

export default function NotificationLogs() {
  const [logs,    setLogs]    = useState<NotifLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState('');
  const [status,  setStatus]  = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (channel) params.set('channel', channel);
    if (status)  params.set('status', status);
    fetch(`/api/notifications/logs?${params}`, { headers: authH() })
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setLogs(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [channel, status]);

  const CHANNELS = ['', 'EMAIL', 'SMS', 'WHATSAPP', 'PUSH'];
  const STATUSES = ['', 'SENT', 'FAILED', 'PENDING', 'QUEUED'];

  const channelColor: Record<string, string> = { EMAIL: '#2563EB', SMS: '#16A34A', WHATSAPP: '#16A34A', PUSH: '#7C3AED' };
  const statusColor:  Record<string, string> = { SENT: '#16A34A', FAILED: '#DC2626', PENDING: '#D97706', QUEUED: '#0891B2' };
  const statusBg:     Record<string, string> = { SENT: '#F0FDF4', FAILED: '#FEF2F2', PENDING: '#FFFBEB', QUEUED: '#ECFEFF' };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">📨 Notification Logs</h1>
          <p className="page-subtitle">Track all outbound notification activity — email, SMS, WhatsApp and push</p>
        </div>
      </div>

      <div style={{ display:'flex', gap:'.75rem', marginBottom:'1.25rem' }}>
        <select value={channel} onChange={e => setChannel(e.target.value)}
          style={{ padding:'.5rem .75rem', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:'.85rem', fontFamily:'inherit', outline:'none' }}>
          {CHANNELS.map(c => <option key={c} value={c}>{c || 'All Channels'}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ padding:'.5rem .75rem', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:'.85rem', fontFamily:'inherit', outline:'none' }}>
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Channel</th><th>Recipient</th><th>Subject / Message</th>
              <th>Provider</th><th>Status</th><th>Error</th><th>Sent At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign:'center', padding:'2rem', color:'#94a3b8' }}>Loading logs…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign:'center', padding:'2rem', color:'#94a3b8' }}>No notification logs found</td></tr>
            ) : logs.map(log => (
              <tr key={log.id}>
                <td>
                  <span style={{ padding:'.2rem .6rem', borderRadius:999, fontSize:'.72rem', fontWeight:600,
                    background: (channelColor[log.channel]||'#64748b')+'20', color: channelColor[log.channel]||'#64748b' }}>
                    {log.channel}
                  </span>
                </td>
                <td style={{ fontSize:'.8rem' }}>{log.recipient}</td>
                <td style={{ fontSize:'.8rem', color:'#475569', maxWidth:240, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.subject||'—'}</td>
                <td style={{ fontSize:'.75rem', color:'#64748b' }}>{log.provider||'—'}</td>
                <td>
                  <span style={{ padding:'.2rem .6rem', borderRadius:999, fontSize:'.72rem', fontWeight:600,
                    background: statusBg[log.status]||'#f1f5f9', color: statusColor[log.status]||'#64748b' }}>
                    {log.status}
                  </span>
                </td>
                <td style={{ fontSize:'.72rem', color:'#DC2626', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.error||'—'}</td>
                <td style={{ fontSize:'.75rem', color:'#64748b' }}>{new Date(log.createdAt).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
