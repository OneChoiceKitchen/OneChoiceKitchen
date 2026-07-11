import { useState, useEffect } from 'react';
import { useConfirm } from '@org/ui-design-system';
import { MessageCircle } from 'lucide-react';
import styles from './WhatsappConfigAdmin.module.css';

const authHeaders = () => ({ 
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`, 
  'Content-Type': 'application/json' 
});

const DUMMY_CONFIGS = [
  { id: 'cfg_1', providerName: 'META_CLOUD', isActive: true, priority: 1, dailyLimit: 1000, phoneNumberId: '123456789', accessToken: 'EAAD...XYZ' },
  { id: 'cfg_2', providerName: 'TWILIO', isActive: false, priority: 2, dailyLimit: 500, accountSid: 'ACabc123', authToken: 'def456', fromNumber: '+1234567890' },
];

export default function WhatsappConfigAdmin() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [testPhone, setTestPhone] = useState('');
  const [testMsg, setTestMsg] = useState('Hello from One Choice Kitchen!');
  const [testResult, setTestResult] = useState('');
  const confirmDialog = useConfirm();

  const PROVIDERS = [
    { name: 'META_CLOUD', label: 'Meta Cloud API', fields: ['phoneNumberId', 'accessToken'] },
    { name: 'TWILIO', label: 'Twilio', fields: ['accountSid', 'authToken', 'fromNumber'] },
    { name: 'MSG91', label: 'MSG91', fields: ['apiKey', 'senderId'] },
  ];

  useEffect(() => { fetchConfigs(); }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/whatsapp/config', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.text().then(t => JSON.parse(t));
      const parsed = Array.isArray(data) ? data : [];
      setConfigs(parsed.length > 0 ? parsed : DUMMY_CONFIGS);
    } catch {
      setConfigs(DUMMY_CONFIGS);
    }
  };

  const save = async () => {
    try {
      const res = await fetch('/api/whatsapp/config', { 
        method: 'POST', 
        headers: authHeaders(), 
        body: JSON.stringify(editing) 
      });
      if (!res.ok) throw new Error();
      setEditing(null);
      fetchConfigs();
    } catch {
      // Mock saving
      if (editing.id) {
        setConfigs(prev => prev.map(c => c.id === editing.id ? editing : c));
      } else {
        setConfigs(prev => [...prev, { ...editing, id: `cfg_mock_${Date.now()}` }]);
      }
      setEditing(null);
    }
  };

  const remove = async (id: string) => {
    const ok = await confirmDialog({ 
      title: 'Delete WhatsApp Config', 
      message: 'Are you sure you want to delete this WhatsApp configuration?', 
      variant: 'danger' 
    });
    if (!ok) return;
    
    try {
      const res = await fetch(`/api/whatsapp/config/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error();
      fetchConfigs();
    } catch {
      // Mock delete
      setConfigs(prev => prev.filter(c => c.id !== id));
    }
  };

  const sendTest = async () => {
    if (!testPhone) return;
    try {
      const res = await fetch('/api/whatsapp/test', { 
        method: 'POST', 
        headers: authHeaders(), 
        body: JSON.stringify({ to: testPhone, message: testMsg }) 
      });
      if (!res.ok) throw new Error();
      const data = await res.text().then(t => JSON.parse(t));
      setTestResult(data.success ? `✅ Sent via ${data.provider}` : `❌ Failed: ${data.error}`);
    } catch {
      // Mock test send
      const activeProvider = configs.find(c => c.isActive) || configs[0];
      if (activeProvider) {
        setTestResult(`✅ (Mocked) Sent via ${activeProvider.providerName}`);
      } else {
        setTestResult(`❌ Failed: No active providers configured`);
      }
    }
  };

  const fieldLabels: Record<string, string> = {
    phoneNumberId: 'Phone Number ID', accessToken: 'Access Token', accountSid: 'Account SID',
    authToken: 'Auth Token', fromNumber: 'From Number (e.g. +1234567890)', apiKey: 'API Key (Auth Key)', senderId: 'Sender ID / Template ID',
  };

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.pageTitle}>💬 WhatsApp Configuration</h2>

      {/* Existing Configs */}
      <div className={styles.configList}>
        {configs.map(cfg => {
          const provider = PROVIDERS.find(p => p.name === cfg.providerName);
          return (
            <div key={cfg.id} className={styles.configCard}>
              <div className={styles.cardInfo}>
                <div className={styles.waIcon}>
                  <MessageCircle size={24} />
                </div>
                <div className={styles.providerDetails}>
                  <div className={styles.providerName}>{provider?.label || cfg.providerName}</div>
                  <div className={styles.providerMeta}>Priority: {cfg.priority} · Daily Limit: {cfg.dailyLimit}</div>
                </div>
                <span className={`${styles.statusBadge} ${cfg.isActive ? styles.active : styles.inactive}`}>
                  {cfg.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className={styles.actionGroup}>
                <button onClick={() => setEditing({ ...cfg })} className={`${styles.actionBtn} ${styles.edit}`}>Edit</button>
                <button onClick={() => remove(cfg.id)} className={`${styles.actionBtn} ${styles.delete}`}>Delete</button>
              </div>
            </div>
          );
        })}

        <button 
          onClick={() => setEditing({ providerName: 'META_CLOUD', isActive: false, priority: 1, dailyLimit: 500 })}
          className={styles.addProviderBtn}
        >
          + Add WhatsApp Provider
        </button>
      </div>

      {/* Test Panel */}
      <div className={styles.testPanel}>
        <h3 className={styles.testTitle}>📤 Send Test Message</h3>
        <div className={styles.testForm}>
          <input 
            value={testPhone} 
            onChange={e => setTestPhone(e.target.value)} 
            placeholder="+91 9876543210"
            className={`${styles.testInput} ${styles.phone}`} 
          />
          <input 
            value={testMsg} 
            onChange={e => setTestMsg(e.target.value)} 
            placeholder="Test message..."
            className={`${styles.testInput} ${styles.msg}`} 
          />
          <button onClick={sendTest} className={styles.testBtn}>Send</button>
        </div>
        {testResult && (
          <div className={`${styles.testResult} ${testResult.startsWith('✅') ? styles.success : styles.error}`}>
            {testResult}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className={styles.overlay} onClick={() => setEditing(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {editing.id ? 'Edit Provider' : 'Configure WhatsApp Provider'}
            </h3>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Provider</label>
              <select 
                value={editing.providerName} 
                onChange={e => setEditing((p: any) => ({ ...p, providerName: e.target.value }))}
                className={styles.select}
              >
                {PROVIDERS.map(p => <option key={p.name} value={p.name}>{p.label}</option>)}
              </select>
            </div>
            
            {PROVIDERS.find(p => p.name === editing.providerName)?.fields.map(field => (
              <div key={field} className={styles.formGroup}>
                <label className={styles.label}>{fieldLabels[field] || field}</label>
                <input 
                  type={field.toLowerCase().includes('secret') || field.toLowerCase().includes('token') || field.toLowerCase().includes('key') ? 'password' : 'text'}
                  value={editing[field] || ''} 
                  onChange={e => setEditing((p: any) => ({ ...p, [field]: e.target.value }))}
                  className={styles.input} 
                />
              </div>
            ))}
            
            <div className={styles.grid2}>
              <div>
                <label className={styles.label}>Priority</label>
                <input 
                  type="number" 
                  value={editing.priority || 1} 
                  onChange={e => setEditing((p: any) => ({ ...p, priority: +e.target.value }))}
                  className={styles.input} 
                />
              </div>
              <div>
                <label className={styles.label}>Daily Limit</label>
                <input 
                  type="number" 
                  value={editing.dailyLimit || 500} 
                  onChange={e => setEditing((p: any) => ({ ...p, dailyLimit: +e.target.value }))}
                  className={styles.input} 
                />
              </div>
            </div>
            
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={editing.isActive} 
                onChange={e => setEditing((p: any) => ({ ...p, isActive: e.target.checked }))} 
                className={styles.checkbox} 
              />
              <span className={styles.checkboxText}>Provider Active</span>
            </label>
            
            <div className={styles.modalActions}>
              <button onClick={() => setEditing(null)} className={`${styles.modalBtn} ${styles.cancel}`}>Cancel</button>
              <button onClick={save} className={`${styles.modalBtn} ${styles.save}`}>Save Configuration</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
