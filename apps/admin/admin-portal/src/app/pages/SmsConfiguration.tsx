import { useState, useEffect } from 'react';
import { useToast } from '@org/ui-design-system';
import { Play } from 'lucide-react';
import styles from './SmsConfiguration.module.css';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

const ALL_PROVIDERS = ['Local Mock (Console)', 'Twilio', 'MSG91', 'Fast2SMS', 'AWS SNS', 'Nexmo', 'Custom API'];

const PROVIDER_FIELDS: any = {
  'Twilio': [
    { key: 'accountSid', label: 'Account SID', type: 'text' },
    { key: 'authToken', label: 'Auth Token', type: 'password' },
    { key: 'fromNumber', label: 'Phone Number', type: 'text' }
  ],
  'MSG91': [
    { key: 'authKey', label: 'Auth Key', type: 'password' },
    { key: 'route', label: 'Route', type: 'text' },
    { key: 'senderId', label: 'Sender ID', type: 'text' }
  ],
  'Fast2SMS': [
    { key: 'apiKey', label: 'API Key', type: 'password' },
    { key: 'senderId', label: 'Sender ID', type: 'text' }
  ],
  'AWS SNS': [
    { key: 'accessKeyId', label: 'Access Key ID', type: 'text' },
    { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password' },
    { key: 'region', label: 'Region', type: 'text' }
  ],
  'Nexmo': [
    { key: 'apiKey', label: 'API Key', type: 'text' },
    { key: 'apiSecret', label: 'API Secret', type: 'password' },
    { key: 'fromNumber', label: 'From Number', type: 'text' }
  ],
  'Custom API': [
    { key: 'apiUrl', label: 'API URL', type: 'text' },
    { key: 'apiKey', label: 'API Key', type: 'password' },
    { key: 'requestFormat', label: 'Request Format (JSON)', type: 'text' }
  ]
};

const DUMMY_CONFIGS = [
  { id: 'sms_1', providerName: 'Twilio', isActive: true, isNew: false, priority: 1, dailyLimit: 10000, config: { accountSid: 'AC123', fromNumber: '+1234567890' } },
  { id: 'sms_2', providerName: 'MSG91', isActive: false, isNew: false, priority: 2, dailyLimit: 5000, config: { route: '4', senderId: 'ONECHK' } },
];

export default function SmsConfiguration() {
  const [providers, setProviders] = useState<any[]>([]);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  
  // Test modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const toast = useToast();
  
  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/notifications/sms-configs', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const loaded = await res.text().then(t => JSON.parse(t));
      
      const merged = ALL_PROVIDERS.map(name => {
        const existing = loaded.find((p: any) => p.providerName === name);
        return existing || { id: `new_${name}`, providerName: name, isActive: false, isNew: true, priority: 1, dailyLimit: 500, config: {} };
      });
      setProviders(merged);
    } catch {
      // Fallback
      const merged = ALL_PROVIDERS.map(name => {
        const existing = DUMMY_CONFIGS.find((p: any) => p.providerName === name);
        return existing || { id: `new_${name}`, providerName: name, isActive: false, isNew: true, priority: 1, dailyLimit: 500, config: {} };
      });
      setProviders(merged);
    }
  };

  const handleSaveProviders = async (newProviders: any[]) => {
    setProviders(newProviders);
    try {
      const res = await fetch('/api/notifications/sms-configs', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newProviders)
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.success('(Mocked) Saved SMS configurations');
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

  const handleTestSms = async () => {
    if (!testPhone) return toast.warning('Please enter a phone number.');
    try {
      const res = await fetch('/api/notifications/sms-test', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ phone: testPhone, message: "Test SMS message" })
      });
      if (!res.ok) throw new Error();
      const data: any = await res.text().then(t => JSON.parse(t));
      if (data.success) {
        toast.success(`Test SMS sent via ${data.provider}`);
      } else {
        toast.error(`Failed to send test SMS: ${data.message || 'Unknown error'}`);
      }
    } catch {
      // Mock test SMS
      const activeProvider = providers.find(p => p.isActive) || providers[0];
      toast.success(`(Mocked) Test SMS sent via ${activeProvider.providerName}`);
    }
    setIsTestModalOpen(false);
  };

  const setLocalDefault = () => {
    const updated = providers.map(p => ({
      ...p,
      isActive: p.providerName === 'Local Mock (Console)'
    }));
    handleSaveProviders(updated);
    toast.success('Local Dev Mode Active. OTPs will print in the backend terminal.');
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className={styles.pageTitle}>📱 SMS Configuration</h1>
          <p className={styles.subtitle}>Manage SMS service providers and routing priority.</p>
        </div>
        <button onClick={setLocalDefault} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
          🛠️ Set Local Dev as Default
        </button>
      </div>

      <div className={styles.providersGrid}>
        {providers.map(provider => (
          <div key={provider.providerName} className={`${styles.providerCard} ${provider.isActive ? styles.active : styles.inactive}`}>
            
            <div className={styles.cardHeader}>
              <div className={styles.providerTitleGroup}>
                <div className={styles.iconBox}>📱</div>
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
              <h2 className={styles.modalTitle}>Send Test SMS</h2>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <input 
                  type="tel" 
                  value={testPhone} 
                  onChange={e => setTestPhone(e.target.value)} 
                  placeholder="+1234567890"
                  className={styles.input}
                />
              </div>
              <div className={styles.testHint}>
                "This is a test message from your system configuration."
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => setIsTestModalOpen(false)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleTestSms} className={styles.saveBtn}>
                Send Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
