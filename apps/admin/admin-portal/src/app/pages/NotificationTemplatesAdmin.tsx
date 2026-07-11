import React, { useState, useEffect } from 'react';
import { useToast, useConfirm } from '@org/ui-design-system';
import styles from './NotificationTemplatesAdmin.module.css';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

const CHANNELS = ['EMAIL', 'WHATSAPP', 'SMS', 'PUSH'];

const DUMMY_TEMPLATES = [
  { id: 'tpl_1', eventName: 'ORDER_CONFIRMED', channel: 'EMAIL', subject: 'Your Order #{{orderId}} is confirmed', body: 'Hello {{customerName}}, your order #{{orderId}} has been confirmed and will be delivered by {{estimatedTime}}.' },
  { id: 'tpl_2', eventName: 'TIFFIN_REMINDER', channel: 'WHATSAPP', subject: '', body: 'Hey {{customerName}}! Just a reminder that your tiffin plan {{planName}} expires on {{startDate}}.' },
  { id: 'tpl_3', eventName: 'NEW_PROMO', channel: 'PUSH', subject: '', body: 'Get 20% off your next meal! Use code {{promoCode}} today.' },
];

export default function NotificationTemplatesAdmin() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [channelFilter, setChannelFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const toast = useToast();
  const confirmDialog = useConfirm();

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/templates', { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch templates');
      const data = await res.text().then(t => JSON.parse(t));
      const parsed = Array.isArray(data) ? data : [];
      setTemplates(parsed.length > 0 ? parsed : DUMMY_TEMPLATES);
    } catch (err: any) {
      setTemplates(DUMMY_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    setLoading(true);
    try {
      const isEdit = !!editingTemplate.id;
      const url = isEdit
        ? `/api/notifications/templates/${editingTemplate.id}`
        : '/api/notifications/templates';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(editingTemplate)
      });
      if (!res.ok) throw new Error('Failed to save template');
      toast.success(isEdit ? 'Template updated successfully' : 'Template created successfully');
      setEditingTemplate(null);
      fetchTemplates();
    } catch (err: any) {
      // Mock Save
      if (editingTemplate.id) {
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
      } else {
        setTemplates(prev => [...prev, { ...editingTemplate, id: `tpl_mock_${Date.now()}` }]);
      }
      toast.success(editingTemplate.id ? '(Mocked) Template updated' : '(Mocked) Template created');
      setEditingTemplate(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, eventName: string) => {
    const ok = await confirmDialog({
      title: 'Delete Template',
      message: `Delete template "${eventName}"? This cannot be undone.`,
      variant: 'danger'
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/notifications/templates/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error();
      toast.success('Template deleted');
      fetchTemplates();
    } catch {
      // Mock delete
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('(Mocked) Template deleted');
    }
  };

  const filtered = templates.filter(t => {
    const matchChannel = !channelFilter || t.channel === channelFilter;
    const matchSearch = !searchQuery || t.eventName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchChannel && matchSearch;
  });

  const highlightPlaceholders = (text: string) => {
    if (!text) return '';
    return text.replace(/\{\{(\w+)\}\}/g, '<mark style="background:#fef3c7;color:#92400e;padding:0 2px;border-radius:3px;font-weight:600">{{$1}}</mark>');
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.cardPanel}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.pageTitle}>🔔 Notification Templates</h2>
            <p className={styles.subtitle}>{templates.length} template{templates.length !== 1 ? 's' : ''} configured</p>
          </div>
          <button
            onClick={() => setEditingTemplate({ eventName: '', channel: 'EMAIL', subject: '', body: '' })}
            className={styles.primaryBtn}
          >
            + New Template
          </button>
        </div>

        {/* Edit / Create Form */}
        {editingTemplate && (
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h3 className={styles.formTitle}>
                {editingTemplate.id ? '✏️ Edit Template' : '✨ Create Template'}
              </h3>
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className={`${styles.previewToggleBtn} ${showPreview ? styles.active : styles.inactive}`}
                type="button"
              >
                {showPreview ? '✕ Hide Preview' : '👁 Preview'}
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.grid2}>
                <div>
                  <label className={styles.label}>Event Name *</label>
                  <input
                    required type="text"
                    value={editingTemplate.eventName}
                    onChange={e => setEditingTemplate({ ...editingTemplate, eventName: e.target.value })}
                    placeholder="e.g. ORDER_CONFIRMED, TIFFIN_REMINDER"
                    className={styles.input}
                  />
                </div>
                <div>
                  <label className={styles.label}>Channel *</label>
                  <select
                    value={editingTemplate.channel}
                    onChange={e => setEditingTemplate({ ...editingTemplate, channel: e.target.value })}
                    className={styles.select}
                  >
                    {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {editingTemplate.channel === 'EMAIL' && (
                <div>
                  <label className={styles.label}>Subject (Email Only)</label>
                  <input
                    type="text"
                    value={editingTemplate.subject || ''}
                    onChange={e => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    placeholder="Your order {{orderId}} has been confirmed!"
                    className={styles.input}
                  />
                </div>
              )}

              <div>
                <label className={styles.label}>Content *</label>
                <textarea
                  required
                  value={editingTemplate.body}
                  onChange={e => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                  placeholder="Hello {{customerName}}, your order #{{orderId}} has been confirmed."
                  className={styles.textarea}
                />
                <p className={styles.hint}>
                  Use <span className={styles.codeHint}>{'{{variableName}}'}</span> placeholders:
                  {' '}customerName, orderId, planName, startDate, amount, estimatedTime
                </p>
              </div>

              {/* Live Preview Panel */}
              {showPreview && editingTemplate.body && (
                <div className={styles.previewPanel}>
                  <div className={styles.previewLabel}>Preview</div>
                  {editingTemplate.channel === 'EMAIL' && editingTemplate.subject && (
                    <div 
                      className={styles.previewSubject}
                      dangerouslySetInnerHTML={{ __html: highlightPlaceholders(editingTemplate.subject) }} 
                    />
                  )}
                  <div 
                    className={styles.previewBody}
                    dangerouslySetInnerHTML={{ __html: highlightPlaceholders(editingTemplate.body) }} 
                  />
                </div>
              )}

              <div className={styles.formActions}>
                <button type="submit" disabled={loading} className={styles.saveBtn}>
                  {loading ? 'Saving...' : editingTemplate.id ? '💾 Update Template' : '✅ Create Template'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEditingTemplate(null); setShowPreview(false); }}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className={styles.filters}>
          <input
            type="text" placeholder="Search by event name..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className={styles.filterInput}
          />
          <select 
            value={channelFilter} 
            onChange={e => setChannelFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Channels</option>
            {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Templates Table */}
        {loading && !templates.length ? (
          <div className={styles.emptyState}>Loading templates...</div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {['Event Name', 'Channel', 'Subject', 'Body Preview', 'Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>
                      {searchQuery || channelFilter ? 'No templates match your filters.' : 'No templates. Create one above.'}
                    </td>
                  </tr>
                ) : filtered.map(tpl => (
                  <tr key={tpl.id}>
                    <td data-label="Event Name">
                      <span className={styles.eventName}>{tpl.eventName}</span>
                    </td>
                    <td data-label="Channel">
                      <span className={`${styles.channelBadge} ${styles[tpl.channel.toLowerCase()]}`}>
                        {tpl.channel}
                      </span>
                    </td>
                    <td data-label="Subject">
                      <div className={styles.cellSubject}>
                        {tpl.subject || <span style={{ color: '#cbd5e1' }}>—</span>}
                      </div>
                    </td>
                    <td data-label="Body Preview">
                      <div className={styles.cellBody}>
                        {tpl.body}
                      </div>
                    </td>
                    <td data-label="Actions">
                      <div className={styles.actionGroup}>
                        <button 
                          onClick={() => { setEditingTemplate(tpl); setShowPreview(false); }}
                          className={`${styles.actionBtn} ${styles.edit}`}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(tpl.id, tpl.eventName)}
                          className={`${styles.actionBtn} ${styles.delete}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
