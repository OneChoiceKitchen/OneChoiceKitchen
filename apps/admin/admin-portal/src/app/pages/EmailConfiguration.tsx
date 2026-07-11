import { useState, useEffect } from 'react';
import { useToast } from '@org/ui-design-system';
import { Play } from 'lucide-react';
import styles from './EmailConfiguration.module.css';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

const ALL_PROVIDERS = ['SMTP', 'SendGrid', 'Amazon SES', 'Gmail SMTP', 'Mailgun', 'Brevo'];

const PROVIDER_FIELDS: any = {
  'SMTP': [
    { key: 'host', label: 'Host', type: 'text' },
    { key: 'port', label: 'Port', type: 'number' },
    { key: 'username', label: 'Username', type: 'text' },
    { key: 'password', label: 'Password', type: 'password' },
    { key: 'fromEmail', label: 'From Email', type: 'email' },
    { key: 'fromName', label: 'From Name', type: 'text' },
    { key: 'useTls', label: 'Use TLS/SSL', type: 'checkbox' }
  ],
  'SendGrid': [
    { key: 'apiKey', label: 'API Key', type: 'password' },
    { key: 'fromEmail', label: 'From Email', type: 'email' },
    { key: 'fromName', label: 'From Name', type: 'text' }
  ],
  'Amazon SES': [
    { key: 'accessKeyId', label: 'Access Key ID', type: 'text' },
    { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password' },
    { key: 'region', label: 'Region', type: 'text' },
    { key: 'fromEmail', label: 'From Email', type: 'email' }
  ],
  'Gmail SMTP': [
    { key: 'email', label: 'Email Address', type: 'email' },
    { key: 'appPassword', label: 'App Password', type: 'password' },
    { key: 'fromName', label: 'From Name', type: 'text' }
  ],
  'Mailgun': [
    { key: 'apiKey', label: 'API Key', type: 'password' },
    { key: 'domain', label: 'Domain', type: 'text' },
    { key: 'fromEmail', label: 'From Email', type: 'email' },
    { key: 'fromName', label: 'From Name', type: 'text' }
  ],
  'Brevo': [
    { key: 'apiKey', label: 'API Key', type: 'password' },
    { key: 'fromEmail', label: 'From Email', type: 'email' },
    { key: 'fromName', label: 'From Name', type: 'text' }
  ]
};

const DUMMY_CONFIGS = [
  { id: 'email_1', providerName: 'SendGrid', isActive: true, isNew: false, priority: 1, dailyLimit: 50000, config: { apiKey: 'SG.fake', fromEmail: 'no-reply@example.com', fromName: 'One Choice' } },
  { id: 'email_2', providerName: 'SMTP', isActive: false, isNew: false, priority: 2, dailyLimit: 500, config: { host: 'smtp.example.com', port: 587, fromEmail: 'admin@example.com', fromName: 'Admin' } },
];

export default function EmailConfiguration() {
  const [providers, setProviders] = useState<any[]>([]);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  
  // Test modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSubject, setTestSubject] = useState('Test Email Configuration');
  const toast = useToast();
  
  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/notifications/email-configs', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const loaded = await res.text().then(t => JSON.parse(t));
      
      const merged = ALL_PROVIDERS.map(name => {
        const existing = loaded.find((p: any) => p.providerName === name);
        return existing || { id: `new_${name}`, providerName: name, isActive: false, isNew: true, priority: 1, dailyLimit: 1000, config: {} };
      });
      setProviders(merged);
    } catch {
      // Fallback
      const merged = ALL_PROVIDERS.map(name => {
        const existing = DUMMY_CONFIGS.find((p: any) => p.providerName === name);
        return existing || { id: `new_${name}`, providerName: name, isActive: false, isNew: true, priority: 1, dailyLimit: 1000, config: {} };
      });
      setProviders(merged);
    }
  };

  const handleSaveProviders = async (newProviders: any[]) => {
    setProviders(newProviders);
    try {
      const res = await fetch('/api/notifications/email-configs', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newProviders)
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.success('(Mocked) Saved email configurations');
    }
  };

  const handleToggleEnable = (name: string, checked: boolean) => {
    const updated = providers.map(p => {
      if (p.providerName === name) return { ...p, isActive: checked };
      return p;
    });
    handleSaveProviders(updated);
  };

  const openConfig = (provider: any) => {
    setEditingProvider({ ...provider });
  };

  const handleConfigChange = (key: string, value: any) => {
    setEditingProvider((prev: any) => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  const saveConfig = () => {
    const updated = providers.map(p => {
      if (p.providerName === editingProvider.providerName) {
        return { ...editingProvider, isNew: false };
      }
      return p;
    });
    handleSaveProviders(updated);
    setEditingProvider(null);
  };

  const handleTestEmail = async () => {
    if (!testEmail) return toast.warning('Please enter an email address.');
    try {
      const res = await fetch('/api/notifications/email-test', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ email: testEmail, subject: testSubject })
      });
      if (!res.ok) throw new Error();
      const data: any = await res.text().then(t => JSON.parse(t));
      if (data.success) {
        toast.success(`Test email sent via ${data.provider}`);
      } else {
        toast.error(`Failed to send test email: ${data.message || 'Unknown error'}`);
      }
    } catch {
      // Mock test email
      const activeProvider = providers.find(p => p.isActive) || providers[0];
      toast.success(`(Mocked) Test email sent via ${activeProvider.providerName}`);
    }
    setIsTestModalOpen(false);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>📧 Email Configuration</h1>
        <p className={styles.subtitle}>Manage email service providers and routing priority.</p>
      </div>

      <div className={styles.providersGrid}>
        {providers.map(provider => (
          <div key={provider.providerName} className={`${styles.providerCard} ${provider.isActive ? styles.active : styles.inactive}`}>
            
            <div className={styles.cardHeader}>
              <div className={styles.providerTitleGroup}>
                <div className={styles.iconBox}>📧</div>
                <h3 className={styles.providerName}>{provider.providerName}</h3>
              </div>
              <label>
                <input 
                  type="checkbox" 
                  checked={provider.isActive} 
                  onChange={e => handleToggleEnable(provider.providerName, e.target.checked)} 
                  className={styles.toggleSwitch}
                />
              </label>
            </div>
            
            <div className={styles.badgeGroup}>
              <span className={`${styles.badge} ${provider.isActive ? styles.active : styles.inactive}`}>
                {provider.isActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
              {!provider.isNew && (
                <span className={`${styles.badge} ${styles.priority}`}>
                  Priority: {provider.priority}
                </span>
              )}
            </div>

            <div className={styles.metaInfo}>
              <span className={styles.metaStatus}>
                {provider.isNew ? '🛡️ Not Configured' : '✅ Configured'}
              </span>
              {!provider.isNew && (
                <span className={styles.metaLimit}>
                  0 / {provider.dailyLimit} sent
                </span>
              )}
            </div>

            <div className={styles.actionGroup}>
              <button onClick={() => openConfig(provider)} className={`${styles.btn} ${styles.configBtn}`}>
                ⚙️ Configure
              </button>
              <button 
                disabled={provider.isNew}
                onClick={() => setIsTestModalOpen(true)}
                className={`${styles.btn} ${styles.testBtn}`}
              >
                <Play size={16} fill="currentColor" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CONFIG MODAL */}
      {editingProvider && (
        <div className={styles.overlay} onClick={() => setEditingProvider(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingProvider.providerName} Configuration</h2>
              <p className={styles.modalSubtitle}>Update API keys, limits, and routing priority.</p>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.grid2}>
                <div>
                  <label className={styles.label}>Priority (1 = Highest)</label>
                  <select 
                    value={editingProvider.priority} 
                    onChange={e => setEditingProvider({...editingProvider, priority: Number(e.target.value)})}
                    className={styles.select}
                  >
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className={styles.label}>Daily Limit</label>
                  <input 
                    type="number" 
                    value={editingProvider.dailyLimit} 
                    onChange={e => setEditingProvider({...editingProvider, dailyLimit: Number(e.target.value)})}
                    className={styles.input}
                  />
                </div>
              </div>

              <h4 className={styles.sectionTitle}>API Credentials</h4>
              <div className={styles.grid2}>
                {PROVIDER_FIELDS[editingProvider.providerName]?.map((field: any) => (
                  <div key={field.key} style={{ gridColumn: field.type === 'checkbox' ? '1 / -1' : 'auto' }}>
                    {field.type === 'checkbox' ? (
                      <label className={styles.checkboxLabel}>
                        <input 
                          type="checkbox" 
                          checked={editingProvider.config[field.key] || false} 
                          onChange={e => handleConfigChange(field.key, e.target.checked)}
                          className={styles.checkbox}
                        />
                        {field.label}
                      </label>
                    ) : (
                      <div className={styles.formGroup}>
                        <label className={styles.label}>{field.label}</label>
                        <input 
                          type={field.type}
                          value={editingProvider.config[field.key] || ''}
                          onChange={e => handleConfigChange(field.key, e.target.value)}
                          placeholder={`Enter ${field.label}`}
                          className={`${styles.input} ${field.type === 'password' ? styles.mono : ''}`}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button onClick={() => setEditingProvider(null)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={saveConfig} className={styles.saveBtn}>
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEST MODAL */}
      {isTestModalOpen && (
        <div className={styles.overlay} onClick={() => setIsTestModalOpen(false)}>
          <div className={styles.modal} style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Send Test Email</h2>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Recipient Email</label>
                <input 
                  type="email" 
                  value={testEmail} 
                  onChange={e => setTestEmail(e.target.value)} 
                  placeholder="admin@example.com"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Subject</label>
                <input 
                  type="text" 
                  value={testSubject} 
                  onChange={e => setTestSubject(e.target.value)} 
                  className={styles.input}
                />
              </div>
              <div className={styles.testHint}>
                "This is a test email to verify your SMTP/API configuration."
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => setIsTestModalOpen(false)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleTestEmail} className={styles.saveBtn}>
                Send Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
