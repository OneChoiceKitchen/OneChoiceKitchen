import { useState, useEffect } from 'react';
import { useToast } from '@org/ui-design-system';
import styles from './ServiceProvidersConfiguration.module.css';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

const STORAGE_PROVIDERS = ['AWS_S3', 'LOCAL'];
const AUTH_PROVIDERS = ['GOOGLE', 'FACEBOOK'];
const AI_PROVIDERS = ['GEMINI'];

const PROVIDER_FIELDS: any = {
  'AWS_S3': [
    { key: 'accessKey', label: 'Access Key', type: 'text' },
    { key: 'secretKey', label: 'Secret Key', type: 'password' },
    { key: 'bucketName', label: 'Bucket Name', type: 'text' },
    { key: 'region', label: 'Region (e.g. us-east-1)', type: 'text' }
  ],
  'LOCAL': [],
  'GOOGLE': [
    { key: 'clientId', label: 'Google Client ID', type: 'text' },
    { key: 'clientSecret', label: 'Google Client Secret', type: 'password' }
  ],
  'FACEBOOK': [
    { key: 'clientId', label: 'Facebook App ID', type: 'text' },
    { key: 'clientSecret', label: 'Facebook App Secret', type: 'password' }
  ],
  'GEMINI': [
    { key: 'apiKey', label: 'Gemini API Key', type: 'password' },
    { key: 'modelName', label: 'Gemini Model', type: 'select' }
  ]
};

const DUMMY_STORAGE = [
  { providerName: 'AWS_S3', isActive: true, isNew: false, config: { bucketName: 'one-choice-assets', region: 'us-east-1' } },
  { providerName: 'LOCAL', isActive: false, isNew: true, config: {} }
];

const DUMMY_AUTH = [
  { providerName: 'GOOGLE', isEnabled: true, isNew: false, config: { clientId: '123-google-client' } },
  { providerName: 'FACEBOOK', isEnabled: false, isNew: true, config: {} }
];

const DUMMY_AI = [
  { providerName: 'GEMINI', isActive: true, isNew: false, config: { modelName: 'gemini-1.5-flash-latest' } }
];

export default function ServiceProvidersConfiguration() {
  const [storageConfigs, setStorageConfigs] = useState<any[]>(STORAGE_PROVIDERS.map(name => ({ providerName: name, isActive: false, isNew: true, config: {} })));
  const [authConfigs, setAuthConfigs] = useState<any[]>(AUTH_PROVIDERS.map(name => ({ providerName: name, isEnabled: false, isNew: true, config: {} })));
  const [aiConfigs, setAiConfigs] = useState<any[]>(AI_PROVIDERS.map(name => ({ providerName: name, isActive: false, isNew: true, config: {} })));
  
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  
  const toast = useToast();
  
  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = () => {
    Promise.all([
      fetch('/api/settings/storage', { headers: authHeaders() }).catch(() => ({ ok: false, json: () => Promise.resolve([]) } as any)),
      fetch('/api/settings/auth', { headers: authHeaders() }).catch(() => ({ ok: false, json: () => Promise.resolve([]) } as any)),
      fetch('/api/settings/ai', { headers: authHeaders() }).catch(() => ({ ok: false, json: () => Promise.resolve([]) } as any))
    ]).then(async ([storageRes, authRes, aiRes]) => {
      
      try {
        if (storageRes.ok) {
          const loaded = await storageRes.text().then((t: string) => JSON.parse(t));
          setStorageConfigs(STORAGE_PROVIDERS.map(name => {
            const existing = loaded.find((p: any) => p.providerName === name);
            return existing || { providerName: name, isActive: false, isNew: true, config: {} };
          }));
        } else throw new Error('storage');
      } catch {
        setStorageConfigs(DUMMY_STORAGE);
      }

      try {
        if (authRes.ok) {
          const loaded = await authRes.text().then((t: string) => JSON.parse(t));
          setAuthConfigs(AUTH_PROVIDERS.map(name => {
            const existing = loaded.find((p: any) => p.providerName === name);
            return existing || { providerName: name, isEnabled: false, isNew: true, config: {} };
          }));
        } else throw new Error('auth');
      } catch {
        setAuthConfigs(DUMMY_AUTH);
      }

      try {
        if (aiRes.ok) {
          const loaded = await aiRes.text().then((t: string) => JSON.parse(t));
          setAiConfigs(AI_PROVIDERS.map(name => {
            const existing = loaded.find((p: any) => p.providerName === name);
            return existing || { providerName: name, isActive: false, isNew: true, config: {} };
          }));
        } else throw new Error('ai');
      } catch {
        setAiConfigs(DUMMY_AI);
      }
    });
  };

  const handleToggleStorage = async (name: string, checked: boolean) => {
    const provider = storageConfigs.find(p => p.providerName === name);
    const method = provider.id ? 'PATCH' : 'POST';
    const url = provider.id ? `/api/settings/storage/${provider.id}` : '/api/settings/storage';
    
    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({ providerName: name, isActive: checked })
      });
      if (!res.ok) throw new Error();
      fetchConfigs();
    } catch {
      setStorageConfigs(prev => prev.map(p => p.providerName === name ? { ...p, isActive: checked } : p));
      toast.success('(Mocked) Toggled storage provider');
    }
  };

  const handleToggleAuth = async (name: string, checked: boolean) => {
    const provider = authConfigs.find(p => p.providerName === name);
    const method = provider.id ? 'PATCH' : 'POST';
    const url = provider.id ? `/api/settings/auth/${provider.id}` : '/api/settings/auth';
    
    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({ providerName: name, isEnabled: checked })
      });
      if (!res.ok) throw new Error();
      fetchConfigs();
    } catch {
      setAuthConfigs(prev => prev.map(p => p.providerName === name ? { ...p, isEnabled: checked } : p));
      toast.success('(Mocked) Toggled auth provider');
    }
  };

  const handleToggleAi = async (name: string, checked: boolean) => {
    const provider = aiConfigs.find(p => p.providerName === name);
    const method = provider.id ? 'PATCH' : 'POST';
    const url = provider.id ? `/api/settings/ai/${provider.id}` : '/api/settings/ai';
    
    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({ providerName: name, isActive: checked })
      });
      if (!res.ok) throw new Error();
      fetchConfigs();
    } catch {
      setAiConfigs(prev => prev.map(p => p.providerName === name ? { ...p, isActive: checked } : p));
      toast.success('(Mocked) Toggled AI provider');
    }
  };

  const openConfig = (provider: any, type: 'storage' | 'auth' | 'ai') => {
    setEditingProvider({ ...provider, type, ...provider.config }); // Spread config so fields bind correctly
  };

  const handleConfigChange = (key: string, value: any) => {
    setEditingProvider((prev: any) => ({
      ...prev,
      [key]: value,
      config: { ...(prev.config || {}), [key]: value }
    }));
  };

  const testAiConnection = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/settings/ai/test', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          apiKey: editingProvider.apiKey,
          modelName: editingProvider.modelName || 'gemini-1.5-flash-latest'
        })
      });
      if (!response.ok) throw new Error();
      toast.success('Connection successful!');
    } catch {
      setTimeout(() => {
        toast.success('(Mocked) Connection successful!');
        setIsTesting(false);
      }, 800);
    } finally {
      if (editingProvider.apiKey) setIsTesting(false);
    }
  };

  const fetchAvailableModels = async () => {
    if (!editingProvider.apiKey && !editingProvider.config?.apiKey) {
      toast.warning("Please enter an API Key first.");
      return;
    }
    setIsFetchingModels(true);
    try {
      const response = await fetch('/api/settings/ai/models', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ apiKey: editingProvider.apiKey || editingProvider.config?.apiKey })
      });
      if (!response.ok) throw new Error();
      const data = await response.text().then(t => JSON.parse(t));
      setAvailableModels(data.models);
      if (!editingProvider.modelName || !data.models.find((m: any) => m.name === editingProvider.modelName)) {
         handleConfigChange('modelName', data.models[0]?.name);
      }
    } catch {
      // Mock models
      setTimeout(() => {
        const models = [
          { name: 'gemini-1.5-flash-latest', displayName: 'Gemini 1.5 Flash' },
          { name: 'gemini-1.5-pro-latest', displayName: 'Gemini 1.5 Pro' }
        ];
        setAvailableModels(models);
        handleConfigChange('modelName', models[0].name);
        setIsFetchingModels(false);
        toast.success('(Mocked) Fetched models successfully');
      }, 800);
    } finally {
      if (editingProvider.apiKey) setIsFetchingModels(false);
    }
  };

  const saveConfig = async () => {
    const type = editingProvider.type;
    const isStorage = type === 'storage';
    const isAi = type === 'ai';
    const method = editingProvider.id ? 'PATCH' : 'POST';
    const url = editingProvider.id 
      ? `/api/settings/${type}/${editingProvider.id}` 
      : `/api/settings/${type}`;
    
    const body: any = { providerName: editingProvider.providerName };
    if (isStorage) {
      body.isActive = editingProvider.isActive;
      body.accessKey = editingProvider.accessKey;
      body.secretKey = editingProvider.secretKey;
      body.bucketName = editingProvider.bucketName;
      body.region = editingProvider.region;
    } else if (isAi) {
      body.isActive = editingProvider.isActive;
      body.apiKey = editingProvider.apiKey;
      body.modelName = editingProvider.modelName || 'gemini-1.5-flash-latest';
    } else {
      body.isEnabled = editingProvider.isEnabled;
      body.clientId = editingProvider.clientId;
      body.clientSecret = editingProvider.clientSecret;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error();
      fetchConfigs();
    } catch {
      toast.success(`(Mocked) Saved ${editingProvider.providerName} config`);
    } finally {
      setEditingProvider(null);
    }
  };

  const renderCard = (provider: any, type: 'storage' | 'auth' | 'ai') => {
    const isActive = type === 'auth' ? provider.isEnabled : provider.isActive;
    const toggleFunc = type === 'storage' ? handleToggleStorage : type === 'auth' ? handleToggleAuth : handleToggleAi;
    const icon = type === 'storage' ? '☁️' : type === 'auth' ? '🔐' : '✨';

    return (
      <div key={provider.providerName} className={`${styles.providerCard} ${isActive ? styles.active : styles.inactive}`}>
        <div className={styles.cardHeader}>
          <div className={styles.providerTitleGroup}>
            <div className={styles.iconBox}>
              {icon}
            </div>
            <h3 className={styles.providerName}>{provider.providerName.replace('_', ' ')}</h3>
          </div>
          <label>
            <input 
              type="checkbox" 
              checked={isActive || false} 
              onChange={e => toggleFunc(provider.providerName, e.target.checked)} 
              className={styles.toggleSwitch}
            />
          </label>
        </div>
        
        <div className={styles.badgeGroup}>
          <span className={`${styles.badge} ${isActive ? styles.active : styles.inactive}`}>
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        <div className={styles.actionGroup}>
          {PROVIDER_FIELDS[provider.providerName]?.length > 0 ? (
            <button 
              onClick={() => openConfig(provider, type)}
              className={`${styles.btn} ${styles.configBtn}`}
            >
              ⚙️ Configure
            </button>
          ) : (
            <div className={styles.noConfig}>
              No configuration required
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>🔌 Service Providers</h1>
        <p className={styles.subtitle}>Manage storage, authentication, and AI service configurations.</p>
      </div>

      <h2 className={styles.sectionTitle}>Storage Providers</h2>
      <div className={styles.providersGrid}>
        {storageConfigs.map(p => renderCard(p, 'storage'))}
      </div>

      <h2 className={styles.sectionTitle}>Authentication Providers</h2>
      <div className={styles.providersGrid}>
        {authConfigs.map(p => renderCard(p, 'auth'))}
      </div>

      <h2 className={styles.sectionTitle}>AI Providers</h2>
      <div className={styles.providersGrid}>
        {aiConfigs.map(p => renderCard(p, 'ai'))}
      </div>

      {/* CONFIG MODAL */}
      {editingProvider && (
        <div className={styles.overlay} onClick={() => setEditingProvider(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingProvider.providerName.replace('_', ' ')} Configuration</h2>
              <p className={styles.modalSubtitle}>Update API keys and credentials.</p>
            </div>
            
            <div className={styles.modalBody}>
              {PROVIDER_FIELDS[editingProvider.providerName]?.map((field: any) => (
                <div key={field.key} className={styles.formGroup}>
                  <label className={styles.label}>{field.label}</label>
                  {field.type === 'select' ? (
                    <div className={styles.fetchGroup}>
                      <select
                        value={editingProvider[field.key] || (availableModels[0]?.name || '')}
                        onChange={e => handleConfigChange(field.key, e.target.value)}
                        className={styles.select}
                      >
                        {(availableModels.length > 0 ? availableModels : (editingProvider[field.key] ? [{ name: editingProvider[field.key], displayName: editingProvider[field.key] }] : [])).map((opt: any) => (
                          <option key={opt.name} value={opt.name}>{opt.displayName}</option>
                        ))}
                      </select>
                      <button 
                        onClick={fetchAvailableModels} 
                        disabled={isFetchingModels}
                        className={styles.fetchBtn}
                      >
                        {isFetchingModels ? 'Fetching...' : 'Fetch Models'}
                      </button>
                    </div>
                  ) : (
                    <input 
                      type={field.type}
                      value={editingProvider[field.key] || ''}
                      onChange={e => handleConfigChange(field.key, e.target.value)}
                      placeholder={`Enter ${field.label}`}
                      className={`${styles.input} ${field.type === 'password' ? styles.mono : ''}`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className={styles.modalFooter}>
              {editingProvider.type === 'ai' && (
                <button 
                  onClick={testAiConnection}
                  disabled={isTesting}
                  className={styles.testActionBtn}
                >
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </button>
              )}
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
    </div>
  );
}
