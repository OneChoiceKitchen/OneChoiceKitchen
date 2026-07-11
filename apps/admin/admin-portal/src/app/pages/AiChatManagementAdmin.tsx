import React, { useState, useEffect, useCallback } from 'react';
import styles from './AiChatManagementAdmin.module.css';

const API = '/api';
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}`, 'Content-Type': 'application/json' });

type Tab = 'overview' | 'requests' | 'analytics' | 'knowledge' | 'canned' | 'providers' | 'settings';

const PROVIDERS = [
  { id: 'OPENAI',       name: 'OpenAI (ChatGPT)',   icon: '🤖', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4-turbo'] },
  { id: 'GEMINI',       name: 'Google Gemini',       icon: '✨', models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'] },
  { id: 'ANTHROPIC',    name: 'Anthropic Claude',    icon: '🌟', models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'] },
  { id: 'AZURE_OPENAI', name: 'Azure OpenAI',        icon: '☁️', models: ['gpt-4o', 'gpt-4', 'gpt-35-turbo'] },
  { id: 'CUSTOM',       name: 'Custom LLM Endpoint', icon: '🔧', models: [] },
];

const KB_CATEGORIES = ['ORDERING', 'DELIVERY', 'PAYMENT', 'REFUND', 'SUBSCRIPTION', 'GENERAL', 'BOOKING', 'TIFFIN'];

function StatCard({ icon, label, value, trend, color = '#2563EB' }: any) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: color + '18', color }}>{icon}</div>
      <div>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue}>{value}</div>
        {trend && <div className={styles.statTrend}>{trend}</div>}
      </div>
    </div>
  );
}

// ─── Provider Config Form ─────────────────────────────────────────────────────
function ProviderForm({ provider, config, onSave, onDelete }: {
  provider: typeof PROVIDERS[0]; config: any; onSave: (data: any) => void; onDelete: (id: string) => void;
}) {
  const [form, setForm] = useState({
    apiKey: config?.apiKey || '',
    model: config?.model || provider.models[0] || '',
    apiEndpoint: config?.apiEndpoint || '',
    isActive: config?.isActive || false,
    isPrimary: config?.isPrimary || false,
    temperature: JSON.parse(config?.settings || '{}').temperature || 0.7,
    maxTokens: JSON.parse(config?.settings || '{}').maxTokens || 500,
    systemPrompt: JSON.parse(config?.settings || '{}').systemPrompt || '',
  });
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const save = async () => {
    setSaving(true);
    await onSave({
      provider: provider.id,
      displayName: provider.name,
      apiKey: form.apiKey || undefined,
      model: form.model,
      apiEndpoint: form.apiEndpoint || undefined,
      isActive: form.isActive,
      isPrimary: form.isPrimary,
      settings: JSON.stringify({ temperature: form.temperature, maxTokens: form.maxTokens, systemPrompt: form.systemPrompt }),
    });
    setSaving(false);
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const r = await fetch(`${API}/ai-chat/sessions`, {
        method: 'POST',
        headers: authH(),
        body: JSON.stringify({ channel: 'WEB' }),
      });
      if (r.ok) {
        const d = await r.json();
        const msgR = await fetch(`${API}/ai-chat/sessions/${d.session.id}/message`, {
          method: 'POST',
          headers: authH(),
          body: JSON.stringify({ message: 'Hello, this is a test message' }),
        });
        setTestResult(msgR.ok ? { ok: true, msg: 'Connection test passed! AI responded successfully.' } : { ok: false, msg: 'AI responded with an error. Check your API key.' });
      } else {
        setTestResult({ ok: false, msg: 'Could not start a test session.' });
      }
    } catch {
      setTestResult({ ok: false, msg: 'Network error. Is the API running?' });
    }
    setTesting(false);
  };

  return (
    <div className={styles.providerCard}>
      <div className={styles.providerCardHeader}>
        <div className={styles.providerCardTitle}>
          <span className={styles.providerIcon}>{provider.icon}</span>
          <span>{provider.name}</span>
        </div>
        <div className={styles.providerCardBadges}>
          {form.isPrimary && <span className={styles.badge} style={{ background: '#dcfce7', color: '#16a34a' }}>Primary</span>}
          {form.isActive && <span className={styles.badge} style={{ background: '#dbeafe', color: '#2563EB' }}>Active</span>}
          {!form.isActive && <span className={styles.badge} style={{ background: '#f1f5f9', color: '#64748b' }}>Inactive</span>}
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>API Key</label>
          <div className={styles.keyInput}>
            <input
              type={showKey ? 'text' : 'password'}
              placeholder={`Enter ${provider.name} API key…`}
              value={form.apiKey}
              onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
            />
            <button type="button" onClick={() => setShowKey(v => !v)}>{showKey ? '🙈' : '👁'}</button>
          </div>
        </div>

        {provider.id === 'CUSTOM' ? (
          <div className={styles.formGroup}>
            <label>API Endpoint URL</label>
            <input type="url" placeholder="https://your-llm-endpoint.com/v1/chat/completions" value={form.apiEndpoint} onChange={e => setForm(f => ({ ...f, apiEndpoint: e.target.value }))} />
          </div>
        ) : (
          <div className={styles.formGroup}>
            <label>Model</label>
            <select value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}>
              {provider.models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}

        <div className={styles.formGroup}>
          <label>Temperature <small>({form.temperature})</small></label>
          <input type="range" min="0" max="1" step="0.1" value={form.temperature} onChange={e => setForm(f => ({ ...f, temperature: +e.target.value }))} />
        </div>

        <div className={styles.formGroup}>
          <label>Max Response Tokens</label>
          <input type="number" min="100" max="4096" value={form.maxTokens} onChange={e => setForm(f => ({ ...f, maxTokens: +e.target.value }))} />
        </div>

        <div className={`${styles.formGroup} ${styles.spanFull}`}>
          <label>System Prompt <small>(leave empty for default OneChoiceKitchen prompt)</small></label>
          <textarea rows={3} placeholder="You are a helpful assistant for OneChoiceKitchen…" value={form.systemPrompt} onChange={e => setForm(f => ({ ...f, systemPrompt: e.target.value }))} />
        </div>
      </div>

      <div className={styles.toggleRow}>
        <label className={styles.toggle}>
          <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
          <span className={styles.toggleSlider} />
          <span>Active</span>
        </label>
        <label className={styles.toggle}>
          <input type="checkbox" checked={form.isPrimary} onChange={e => setForm(f => ({ ...f, isPrimary: e.target.checked }))} />
          <span className={styles.toggleSlider} />
          <span>Set as Primary</span>
        </label>
      </div>

      {testResult && (
        <div className={`${styles.testResult} ${testResult.ok ? styles.testOk : styles.testFail}`}>
          {testResult.ok ? '✅' : '❌'} {testResult.msg}
        </div>
      )}

      <div className={styles.providerActions}>
        <button className="btn btn-secondary btn-sm" onClick={testConnection} disabled={testing || !form.apiKey}>
          {testing ? '⏳ Testing…' : '🔌 Test Connection'}
        </button>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          {config && <button className="btn btn-danger btn-sm" onClick={() => onDelete(provider.id)}>Delete</button>}
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Knowledge Base Entry Form ────────────────────────────────────────────────
function KbModal({ entry, onSave, onClose }: { entry?: any; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    id: entry?.id,
    category: entry?.category || 'GENERAL',
    question: entry?.question || '',
    answer: entry?.answer || '',
    keywords: entry?.keywords ? JSON.parse(entry.keywords).join(', ') : '',
    priority: entry?.priority || 0,
    isActive: entry?.isActive ?? true,
  });
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{entry ? 'Edit FAQ Entry' : 'Add FAQ Entry'}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {KB_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Question / Trigger Phrase</label>
            <input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="e.g. How do I track my order?" />
          </div>
          <div className={styles.formGroup}>
            <label>Answer (supports markdown)</label>
            <textarea rows={5} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} placeholder="The bot will respond with this…" />
          </div>
          <div className={styles.formGroup}>
            <label>Keywords (comma-separated)</label>
            <input value={form.keywords} onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))} placeholder="track, order, status, where" />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Priority (higher = matched first)</label>
              <input type="number" min="0" max="100" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: +e.target.value }))} />
            </div>
            <label className={styles.toggle} style={{ marginTop: '1.5rem' }}>
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
              <span className={styles.toggleSlider} />
              <span>Active</span>
            </label>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={() => {
            onSave({ ...form, keywords: JSON.stringify(form.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)) });
            onClose();
          }}>Save Entry</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AiChatManagementAdmin() {
  const [tab, setTab] = useState<Tab>('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [supportRequests, setSupportRequests] = useState<any[]>([]);
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [cannedResponses, setCannedResponses] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [kbModal, setKbModal] = useState<{ open: boolean; entry?: any }>({ open: false });
  const [cannedModal, setCannedModal] = useState<{ open: boolean; entry?: any }>({ open: false });
  const [days, setDays] = useState(7);

  const load = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const [aRes, srRes, kbRes, crRes, pvRes] = await Promise.all([
        fetch(`${API}/ai-chat/admin/analytics?days=${days}`, { headers: authH() }),
        fetch(`${API}/ai-chat/support-requests`, { headers: authH() }),
        fetch(`${API}/ai-chat/admin/knowledge`, { headers: authH() }),
        fetch(`${API}/ai-chat/admin/canned-responses`, { headers: authH() }),
        fetch(`${API}/ai-chat/admin/providers`, { headers: authH() }),
      ]);
      const [a, sr, kb, cr, pv] = await Promise.all([aRes.json(), srRes.json(), kbRes.json(), crRes.json(), pvRes.json()]);
      setAnalytics(a);
      setSupportRequests(Array.isArray(sr) ? sr : []);
      setKnowledge(kb.data || []);
      setCannedResponses(Array.isArray(cr) ? cr : []);
      setProviders(Array.isArray(pv) ? pv : []);
    } catch { /* Gracefully ignore analytics fetch errors */ }
    setLoadingAnalytics(false);
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const handleSupportAction = async (id: string, status: string, assignedToId?: string) => {
    await fetch(`${API}/ai-chat/support-requests/${id}`, {
      method: 'PATCH', headers: authH(),
      body: JSON.stringify({ status, assignedToId }),
    });
    load();
  };

  const handleSaveProvider = async (data: any) => {
    await fetch(`${API}/ai-chat/admin/providers`, { method: 'POST', headers: authH(), body: JSON.stringify(data) });
    load();
  };

  const handleDeleteProvider = async (provider: string) => {
    if (!confirm(`Remove ${provider} configuration?`)) return;
    await fetch(`${API}/ai-chat/admin/providers/${provider}`, { method: 'DELETE', headers: authH() });
    load();
  };

  const handleSaveKb = async (data: any) => {
    await fetch(`${API}/ai-chat/admin/knowledge`, { method: 'POST', headers: authH(), body: JSON.stringify(data) });
    load();
  };

  const handleDeleteKb = async (id: string) => {
    if (!confirm('Delete this FAQ entry?')) return;
    await fetch(`${API}/ai-chat/admin/knowledge/${id}`, { method: 'DELETE', headers: authH() });
    load();
  };

  const handleSaveCanned = async (data: any) => {
    await fetch(`${API}/ai-chat/admin/canned-responses`, { method: 'POST', headers: authH(), body: JSON.stringify(data) });
    setCannedModal({ open: false });
    load();
  };

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'requests', label: `Support Requests${supportRequests.filter(r => r.status === 'PENDING').length ? ` (${supportRequests.filter(r => r.status === 'PENDING').length})` : ''}`, icon: '🙋' },
    { id: 'providers', label: 'AI Providers', icon: '🤖' },
    { id: 'knowledge', label: 'Knowledge Base', icon: '📚' },
    { id: 'canned', label: 'Canned Responses', icon: '💬' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  const STATUS_COLORS: Record<string, string> = {
    PENDING: '#d97706', ACCEPTED: '#2563EB', ASSIGNED: '#7c3aed', CLOSED: '#16a34a', REJECTED: '#dc2626',
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">🤖 AI Chat Management</h1>
          <p className="page-subtitle">Configure AI providers, manage chatbot knowledge, and handle support requests</p>
        </div>
        <div className="page-actions">
          <select className="select" value={days} onChange={e => setDays(+e.target.value)} style={{ width: 130 }}>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <button className="btn btn-primary" onClick={load}>🔄 Refresh</button>
        </div>
      </div>

      {/* KPI Strip */}
      {analytics && (
        <div className={styles.statsGrid}>
          <StatCard icon="💬" label="Total Sessions" value={analytics.totalSessions} trend={`Last ${days} days`} color="#2563EB" />
          <StatCard icon="💌" label="Messages Processed" value={analytics.totalMessages} color="#7c3aed" />
          <StatCard icon="✅" label="Resolution Rate" value={`${analytics.resolutionRate}%`} trend="Sessions closed" color="#16a34a" />
          <StatCard icon="🙋" label="Escalations" value={analytics.escalations} trend={`${analytics.escalationRate}% escalation rate`} color="#ea580c" />
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t.id} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className={styles.overviewGrid}>
          <div className="card">
            <div className="card-header"><span className="card-title">🏆 Top Intents</span></div>
            <div className="card-body">
              {analytics?.topIntents?.length > 0 ? (
                analytics.topIntents.map((i: any) => (
                  <div key={i.intent} className={styles.intentRow}>
                    <span className={styles.intentName}>{i.intent?.replace(/_/g, ' ')}</span>
                    <div className={styles.intentBar}>
                      <div className={styles.intentFill} style={{ width: `${Math.min((i.count / (analytics.topIntents[0]?.count || 1)) * 100, 100)}%` }} />
                    </div>
                    <span className={styles.intentCount}>{i.count}</span>
                  </div>
                ))
              ) : <p className={styles.empty}>No data yet</p>}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">🤖 Active AI Provider</span></div>
            <div className="card-body">
              {providers.find((p: any) => p.isPrimary) ? (
                <div className={styles.activeProvider}>
                  <div className={styles.providerName}>
                    {PROVIDERS.find(p => p.id === providers.find((p: any) => p.isPrimary)?.provider)?.icon} {providers.find((p: any) => p.isPrimary)?.displayName}
                  </div>
                  <div className={styles.providerModel}>Model: {providers.find((p: any) => p.isPrimary)?.model}</div>
                  <div className={styles.providerUsage}>Used {providers.find((p: any) => p.isPrimary)?.usageCount} times</div>
                  <div className={styles.badge} style={{ background: '#dcfce7', color: '#16a34a', display: 'inline-block', marginTop: '.5rem' }}>🟢 Live</div>
                </div>
              ) : (
                <div className={styles.empty}>
                  <p>No active AI provider</p>
                  <p>Using rules-based engine only</p>
                  <button className="btn btn-primary btn-sm" onClick={() => setTab('providers')}>Configure AI →</button>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">📋 Pending Requests</span></div>
            <div className="card-body">
              {supportRequests.filter(r => r.status === 'PENDING').slice(0, 5).map((r: any) => (
                <div key={r.id} className={styles.pendingRow}>
                  <div className={styles.pendingUser}>🧑 Customer #{r.id.slice(-6).toUpperCase()}</div>
                  <div className={styles.pendingReason}>{r.reason || 'Human support requested'}</div>
                  <div className={styles.pendingActions}>
                    <button className="btn btn-primary btn-sm" onClick={() => handleSupportAction(r.id, 'ACCEPTED')}>Accept</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleSupportAction(r.id, 'REJECTED')}>Reject</button>
                  </div>
                </div>
              ))}
              {supportRequests.filter(r => r.status === 'PENDING').length === 0 && (
                <p className={styles.empty}>No pending requests 🎉</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Support Requests ──────────────────────────────────────────────── */}
      {tab === 'requests' && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Request ID</th><th>Customer</th><th>Reason</th><th>Status</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {supportRequests.map((r: any) => (
                <tr key={r.id}>
                  <td><code>#{r.id.slice(-8).toUpperCase()}</code></td>
                  <td>{r.customerId ? `User #${r.customerId.slice(-6)}` : 'Anonymous'}</td>
                  <td>{r.reason || '—'}</td>
                  <td>
                    <span className="badge" style={{ background: STATUS_COLORS[r.status] + '18', color: STATUS_COLORS[r.status] }}>
                      {r.status}
                    </span>
                  </td>
                  <td>{new Date(r.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '.35rem' }}>
                      {r.status === 'PENDING' && <>
                        <button className="btn btn-primary btn-sm" onClick={() => handleSupportAction(r.id, 'ACCEPTED')}>Accept</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleSupportAction(r.id, 'REJECTED')}>Reject</button>
                      </>}
                      {r.status === 'ACCEPTED' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleSupportAction(r.id, 'CLOSED')}>Close</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {supportRequests.length === 0 && (
                <tr><td colSpan={6} className={styles.empty}>No support requests</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── AI Providers ──────────────────────────────────────────────────── */}
      {tab === 'providers' && (
        <div>
          <div className={styles.providersNote}>
            <span>💡</span>
            <p>Configure one or more AI providers below. Mark one as <strong>Primary</strong> to use it for all chatbot responses. If no provider is active, the bot uses the built-in rules engine automatically. API keys are stored securely and never exposed to the frontend.</p>
          </div>
          <div className={styles.providersGrid}>
            {PROVIDERS.map(p => (
              <ProviderForm
                key={p.id}
                provider={p}
                config={providers.find((c: any) => c.provider === p.id)}
                onSave={handleSaveProvider}
                onDelete={handleDeleteProvider}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Knowledge Base ────────────────────────────────────────────────── */}
      {tab === 'knowledge' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setKbModal({ open: true })}>+ Add FAQ Entry</button>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Category</th><th>Question</th><th>Keywords</th><th>Priority</th><th>Used</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {knowledge.map((e: any) => (
                  <tr key={e.id}>
                    <td><span className="badge badge-blue">{e.category}</span></td>
                    <td style={{ maxWidth: 200 }}>{e.question}</td>
                    <td style={{ maxWidth: 150, fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>
                      {JSON.parse(e.keywords || '[]').join(', ')}
                    </td>
                    <td>{e.priority}</td>
                    <td>{e.usageCount}</td>
                    <td><span className={`badge ${e.isActive ? 'badge-green' : 'badge-yellow'}`}>{e.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '.35rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setKbModal({ open: true, entry: e })}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteKb(e.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {knowledge.length === 0 && <tr><td colSpan={7} className={styles.empty}>No FAQ entries yet. Add some to improve chatbot accuracy!</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Canned Responses ──────────────────────────────────────────────── */}
      {tab === 'canned' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setCannedModal({ open: true })}>+ Add Response</button>
          </div>
          <div className={styles.cannedGrid}>
            {cannedResponses.map((r: any) => (
              <div key={r.id} className={styles.cannedCard}>
                <div className={styles.cannedHeader}>
                  <span className={styles.cannedTitle}>{r.title}</span>
                  {r.shortCode && <code className={styles.cannedCode}>{r.shortCode}</code>}
                </div>
                {r.category && <span className="badge badge-blue" style={{ fontSize: 10 }}>{r.category}</span>}
                <p className={styles.cannedContent}>{r.content}</p>
                <div className={styles.cannedActions}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setCannedModal({ open: true, entry: r })}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={async () => { if (confirm('Delete?')) { await fetch(`${API}/ai-chat/admin/canned-responses/${r.id}`, { method: 'DELETE', headers: authH() }); load(); } }}>Delete</button>
                </div>
              </div>
            ))}
            {cannedResponses.length === 0 && <p className={styles.empty}>No canned responses. Add templates for quick replies.</p>}
          </div>
        </div>
      )}

      {/* ── Analytics ─────────────────────────────────────────────────────── */}
      {tab === 'analytics' && analytics && (
        <div className={styles.analyticsGrid}>
          <div className="card">
            <div className="card-header"><span className="card-title">📊 Summary Statistics</span></div>
            <div className="card-body">
              <table className="table">
                <tbody>
                  <tr><td>Total Sessions</td><td><strong>{analytics.totalSessions}</strong></td></tr>
                  <tr><td>Messages Processed</td><td><strong>{analytics.totalMessages}</strong></td></tr>
                  <tr><td>Human Escalations</td><td><strong>{analytics.escalations}</strong></td></tr>
                  <tr><td>Closed Sessions</td><td><strong>{analytics.closedSessions}</strong></td></tr>
                  <tr><td>Resolution Rate</td><td><strong>{analytics.resolutionRate}%</strong></td></tr>
                  <tr><td>Escalation Rate</td><td><strong>{analytics.escalationRate}%</strong></td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">🏆 Top User Intents</span></div>
            <div className="card-body">
              {analytics.topIntents?.map((i: any) => (
                <div key={i.intent} className={styles.intentRow}>
                  <span className={styles.intentName}>{i.intent?.replace(/_/g, ' ')}</span>
                  <div className={styles.intentBar}>
                    <div className={styles.intentFill} style={{ width: `${Math.min((i.count / (analytics.topIntents[0]?.count || 1)) * 100, 100)}%` }} />
                  </div>
                  <span className={styles.intentCount}>{i.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {kbModal.open && (
        <KbModal entry={kbModal.entry} onSave={handleSaveKb} onClose={() => setKbModal({ open: false })} />
      )}

      {cannedModal.open && (
        <div className={styles.modalOverlay} onClick={() => setCannedModal({ open: false })}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{cannedModal.entry ? 'Edit' : 'Add'} Canned Response</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setCannedModal({ open: false })}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <CannedForm entry={cannedModal.entry} onSave={handleSaveCanned} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CannedForm({ entry, onSave }: { entry?: any; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ id: entry?.id, title: entry?.title || '', content: entry?.content || '', category: entry?.category || '', shortCode: entry?.shortCode || '', isActive: entry?.isActive ?? true });
  return (
    <div className={styles.formGrid}>
      <div className={styles.formGroup}><label>Title</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Apology response" /></div>
      <div className={styles.formGroup}><label>Short Code (optional)</label><input value={form.shortCode} onChange={e => setForm(f => ({ ...f, shortCode: e.target.value }))} placeholder="/sorry" /></div>
      <div className={`${styles.formGroup} ${styles.spanFull}`}><label>Response Content</label><textarea rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="We sincerely apologize for the inconvenience…" /></div>
      <div className={styles.formGroup}><label>Category</label><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. APOLOGY, GREETING, REFUND" /></div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '.5rem' }}>
        <button className="btn btn-primary btn-sm" onClick={() => onSave(form)}>Save Response</button>
      </div>
    </div>
  );
}
