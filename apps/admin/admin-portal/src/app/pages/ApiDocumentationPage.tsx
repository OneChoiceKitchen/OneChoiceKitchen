import React, { useState } from 'react';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';

const METHOD_COLOR: Record<Method, string> = {
  GET: '#16a34a', POST: '#2563EB', PATCH: '#d97706', DELETE: '#dc2626', PUT: '#7c3aed',
};

const endpoints = [
  { method: 'GET' as Method, path: '/api/health', desc: 'API health check and system status', auth: false },
  { method: 'POST' as Method, path: '/api/auth/login', desc: 'Authenticate user and retrieve JWT token', auth: false },
  { method: 'POST' as Method, path: '/api/auth/logout', desc: 'Invalidate session and revoke JWT token', auth: true },
  { method: 'GET' as Method, path: '/api/branches', desc: 'List all restaurant branches', auth: true },
  { method: 'POST' as Method, path: '/api/branches', desc: 'Create a new restaurant branch', auth: true },
  { method: 'GET' as Method, path: '/api/branches/:id', desc: 'Retrieve a specific branch by ID', auth: true },
  { method: 'PATCH' as Method, path: '/api/branches/:id', desc: 'Update branch details', auth: true },
  { method: 'GET' as Method, path: '/api/menus', desc: 'Retrieve all menu categories and items', auth: true },
  { method: 'POST' as Method, path: '/api/menus/items', desc: 'Create a new menu item', auth: true },
  { method: 'GET' as Method, path: '/api/orders', desc: 'List all orders with filters (status, date, branch)', auth: true },
  { method: 'POST' as Method, path: '/api/orders', desc: 'Place a new order', auth: true },
  { method: 'PATCH' as Method, path: '/api/orders/:id/status', desc: 'Update order status (preparing, ready, dispatched)', auth: true },
  { method: 'GET' as Method, path: '/api/customers', desc: 'List all registered customers with pagination', auth: true },
  { method: 'GET' as Method, path: '/api/customers/:id', desc: 'Get customer profile and order history', auth: true },
  { method: 'GET' as Method, path: '/api/analytics/overview', desc: 'Get business overview KPIs (revenue, orders, customers)', auth: true },
  { method: 'GET' as Method, path: '/api/analytics/revenue', desc: 'Detailed revenue analytics with time series data', auth: true },
  { method: 'POST' as Method, path: '/api/notifications/send', desc: 'Send push/SMS/email notification to users or groups', auth: true },
  { method: 'GET' as Method, path: '/api/riders', desc: 'List all registered riders and their current status', auth: true },
  { method: 'GET' as Method, path: '/api/riders/:id/location', desc: 'Get real-time GPS location of a rider', auth: true },
  { method: 'DELETE' as Method, path: '/api/users/:id', desc: 'Delete a user account (requires admin permission)', auth: true },
];

const changelog = [
  { version: 'v2.1.0', date: 'July 2026', changes: 'Added /api/analytics/revenue endpoint, OCK Points integration, WhatsApp notification API' },
  { version: 'v2.0.0', date: 'May 2026', changes: 'Breaking: JWT format updated to RS256. New RBAC endpoint /api/roles. Deprecate /api/admin/login' },
  { version: 'v1.8.0', date: 'Feb 2026', changes: 'Added hall bookings API, tiffin subscription management endpoints' },
  { version: 'v1.6.0', date: 'Dec 2025', changes: 'Rate limiting headers added (X-RateLimit-*). Bulk order API for corporate clients' },
];

export function ApiDocumentationPage() {
  const [activeSection, setActiveSection] = useState<'overview' | 'endpoints' | 'auth' | 'changelog'>('overview');
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  const filtered = endpoints.filter(ep => {
    const q = search.toLowerCase();
    const matchSearch = !q || ep.path.toLowerCase().includes(q) || ep.desc.toLowerCase().includes(q);
    const matchMethod = methodFilter === 'ALL' || ep.method === methodFilter;
    return matchSearch && matchMethod;
  });

  return (
    <div className="page-container" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">🔌 API Documentation</h1>
          <p className="page-subtitle">OneChoiceKitchen REST API — v2.1.0 · Base URL: <code style={{ background: 'var(--bg)', padding: '0.1rem 0.35rem', borderRadius: 4, fontSize: '0.8rem' }}>http://localhost:3000</code></p>
        </div>
        <div className="page-actions">
          <a href="http://localhost:3000/api/docs" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Open Swagger UI →
          </a>
        </div>
      </div>

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 8, padding: '0.25rem' }}>
        {(['overview', 'endpoints', 'auth', 'changelog'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSection(tab)}
            style={{
              padding: '0.5rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, flex: 1,
              background: activeSection === tab ? 'var(--blue)' : 'transparent',
              color: activeSection === tab ? '#fff' : 'var(--text2)',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeSection === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { icon: '🔐', title: 'Authentication', desc: 'JWT Bearer tokens via /api/auth/login. Tokens expire in 24h. Refresh using /api/auth/refresh.', color: '#7c3aed' },
            { icon: '🚦', title: 'Rate Limiting', desc: '100 requests/minute for authenticated users. 10 requests/minute for public endpoints. Headers: X-RateLimit-Remaining.', color: '#d97706' },
            { icon: '📄', title: 'Response Format', desc: 'All responses return JSON. Success: { data, meta }. Errors: { error, message, statusCode }.', color: '#2563EB' },
            { icon: '📦', title: 'Pagination', desc: 'List endpoints support ?page=1&limit=20. Response includes meta.total, meta.pages, meta.page.', color: '#16a34a' },
            { icon: '⚠️', title: 'Error Codes', desc: '400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Validation Error, 429 Rate Limit, 500 Server Error.', color: '#dc2626' },
            { icon: '🔄', title: 'Versioning', desc: 'Current API version is v1 (no prefix needed). Future versions will use /api/v2/. Breaking changes follow semver.', color: '#0891b2' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 10, padding: '1.125rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.35rem', flexShrink: 0 }}>{card.icon}</span>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem' }}>{card.title}</div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ENDPOINTS TAB */}
      {activeSection === 'endpoints' && (
        <div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search endpoints..."
              style={{ flex: 1, minWidth: 200, padding: '0.575rem 0.75rem', border: '1.5px solid var(--bdr)', borderRadius: 6, fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', background: 'var(--bg)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
              onBlur={e => (e.target.style.borderColor = 'var(--bdr)')}
            />
            {(['ALL', 'GET', 'POST', 'PATCH', 'DELETE'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                style={{
                  padding: '0.5rem 0.75rem', borderRadius: 6, border: '1.5px solid',
                  borderColor: methodFilter === m ? (m === 'ALL' ? 'var(--blue)' : METHOD_COLOR[m as Method] || 'var(--blue)') : 'var(--bdr)',
                  background: methodFilter === m ? (m === 'ALL' ? 'var(--blu-lt)' : METHOD_COLOR[m as Method] + '18') : 'var(--surf)',
                  color: m === 'ALL' ? 'var(--blue)' : (METHOD_COLOR[m as Method] || 'var(--text)'),
                  fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                {m}
              </button>
            ))}
          </div>
          <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 10, overflow: 'hidden' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Description</th>
                  <th>Auth</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ep => (
                  <tr key={`${ep.method}::${ep.path}`}>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.5rem', borderRadius: 4,
                        background: METHOD_COLOR[ep.method] + '18',
                        color: METHOD_COLOR[ep.method],
                        fontSize: '0.72rem', fontWeight: 800, fontFamily: 'monospace',
                      }}>
                        {ep.method}
                      </span>
                    </td>
                    <td><code style={{ fontSize: '0.78rem', color: 'var(--text)', background: 'var(--bg)', padding: '0.1rem 0.3rem', borderRadius: 3 }}>{ep.path}</code></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{ep.desc}</td>
                    <td>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: ep.auth ? '#16a34a' : '#dc2626' }}>
                        {ep.auth ? '🔐 Required' : '🌐 Public'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text2)', padding: '2rem', fontSize: '0.85rem' }}>No endpoints match your search</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUTH TAB */}
      {activeSection === 'auth' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            {
              title: 'Step 1: Login to get a token',
              lang: 'bash',
              code: `curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "admin@example.com", "password": "yourpassword"}'`,
            },
            {
              title: 'Step 2: Response with JWT token',
              lang: 'json',
              code: `{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
    "refreshToken": "...",
    "expiresIn": 86400
  }
}`,
            },
            {
              title: 'Step 3: Use token in requests',
              lang: 'bash',
              code: `curl -X GET http://localhost:3000/api/branches \\
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiJ9..."`,
            },
          ].map(block => (
            <div key={block.title} style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--bdr)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>
                {block.title}
              </div>
              <pre style={{ margin: 0, padding: '1rem', fontSize: '0.78rem', lineHeight: 1.7, background: '#0f172a', color: '#e2e8f0', overflowX: 'auto' }}>
                <code>{block.code}</code>
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* CHANGELOG TAB */}
      {activeSection === 'changelog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {changelog.map(log => (
            <div key={log.version} style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 10, padding: '1.125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ padding: '0.2rem 0.625rem', background: 'var(--blu-lt)', color: 'var(--blue)', borderRadius: 999, fontSize: '0.75rem', fontWeight: 800 }}>
                  {log.version}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>{log.date}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>{log.changes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ApiDocumentationPage;
