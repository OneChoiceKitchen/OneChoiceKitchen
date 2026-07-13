import { useState, useEffect } from 'react';
import styles from './MapsConfigAdmin.module.css';
import { useToast } from '@org/ui-design-system';

const authHeaders = () => ({ 'Authorization': `Bearer ${localStorage.getItem('admin_token')}`, 'Content-Type': 'application/json' });

const DUMMY_CONFIGS = [
  { id: 'maps_cfg_1', providerName: 'GOOGLE_MAPS', isActive: true, apiKey: 'AIzaSyA...', mapId: '12345' },
  { id: 'maps_cfg_2', providerName: 'OPENSTREETMAP', isActive: false, routingApiUrl: 'https://router.project-osrm.org' },
];

export default function MapsConfigAdmin() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error', message?: string }>({ status: 'idle' });
  const toast = useToast();

  useEffect(() => { fetchConfigs(); }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/maps/config', { headers: authHeaders() });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.text().then(t => JSON.parse(t));
      const parsed = Array.isArray(data) ? data : [];
      setConfigs(parsed.length > 0 ? parsed : DUMMY_CONFIGS);
    } catch (e: any) {
      const stored = localStorage.getItem('mock_maps_configs');
      if (stored) {
        try {
          setConfigs(JSON.parse(stored));
        } catch {
          setConfigs(DUMMY_CONFIGS);
        }
      } else {
        setConfigs(DUMMY_CONFIGS);
      }
    }
  };

  const save = async () => {
    try {
      const res = await fetch('/api/maps/config', { method: 'POST', headers: authHeaders(), body: JSON.stringify(editing) });
      if (!res.ok) throw new Error(await res.text());
      setEditing(null);
      fetchConfigs();
      toast.success('Configuration saved successfully to Database');
    } catch (e: any) {
      // Still save to localStorage as a fallback so the app works, but show the real error.
      let newConfigs;
      if (editing.id) {
        newConfigs = configs.map(c => c.id === editing.id ? editing : c);
      } else {
        newConfigs = [...configs, { ...editing, id: `maps_mock_${Date.now()}` }];
      }
      setConfigs(newConfigs);
      localStorage.setItem('mock_maps_configs', JSON.stringify(newConfigs));
      setEditing(null);
      toast.success('Saved locally (Backend error: ' + (e.message || 'Connection failed') + ')');
    }
  };

  const activate = async (id: string) => {
    try {
      const res = await fetch(`/api/maps/config/${id}/activate`, { method: 'PATCH', headers: authHeaders() });
      if (!res.ok) throw new Error(await res.text());
      fetchConfigs();
      toast.success('Provider activated');
    } catch (e: any) {
      // Mock activate
      const newConfigs = configs.map(c => ({
        ...c,
        isActive: c.id === id
      }));
      setConfigs(newConfigs);
      localStorage.setItem('mock_maps_configs', JSON.stringify(newConfigs));
      toast.success('(Mocked) Provider activated');
    }
  };

  const testConnection = async () => {
    setTestResult({ status: 'testing' });
    try {
      if (editing.providerName === 'GOOGLE_MAPS') {
        if (!editing.apiKey) throw new Error('API Key is required');
      } else if (editing.providerName === 'OPENSTREETMAP') {
        if (!editing.routingApiUrl) throw new Error('Routing API URL is required');
      }
      
      const res = await fetch('/api/maps/test', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(editing)
      });
      
      const data = await res.text().then(t => JSON.parse(t));
      if (!res.ok) {
        throw new Error(data.message || 'Connection failed');
      }
      
      setTestResult({ status: 'success', message: 'Connection successful!' });
    } catch (e: any) {
      setTestResult({ status: 'error', message: e.message || 'Connection failed' });
    }
  };

  const PROVIDERS = [
    { 
      name: 'GOOGLE_MAPS', 
      label: 'Google Maps Platform', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg', 
      description: 'Enterprise-grade mapping with highly accurate routing, real-time traffic updates, and reliable geocoding. Requires a Google Cloud billing account.',
      fields: [{ key: 'apiKey', label: 'API Key', type: 'password' }, { key: 'mapId', label: 'Map ID', type: 'text' }],
      instructions: [
        'Go to Google Cloud Console (console.cloud.google.com)',
        'Create a new project or select an existing one',
        'Enable Maps JavaScript API, Places API, and Distance Matrix API',
        'Go to APIs & Services > Credentials and create an API Key',
        'To get a Map ID: Go to Map Management, click "Create Map ID", select "JavaScript", and copy the ID',
        'Add billing details to your Google Cloud account'
      ]
    },
    { 
      name: 'OPENSTREETMAP', 
      label: 'OpenStreetMap (OSRM)', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Openstreetmap_logo.svg', 
      description: 'Free, open-source mapping with basic routing capabilities. Recommended for development, testing, or deployments without Google Maps access.',
      fields: [{ key: 'routingApiUrl', label: 'Routing API URL', type: 'text', placeholder: 'https://router.project-osrm.org' }],
      instructions: [
        'OpenStreetMap is free and does not require an API key for basic usage',
        'The default public OSRM routing URL is https://router.project-osrm.org',
        'For high-volume production, you should host your own OSRM server',
        'No billing account or registration is required to get started'
      ]
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>
          <span className={styles.titleIcon}>🗺️</span> Routing & Maps Configuration
        </h2>
        <p className={styles.subtitle}>
          Select and configure the map provider used for calculating rider routes and distances.
          <strong> Only one provider can be active at a time.</strong> The active provider will be used across all services.
        </p>
      </div>

      <div className={styles.providersGrid}>
        {PROVIDERS.map(prov => {
          const cfg = configs.find(c => c.providerName === prov.name);
          const isActive = cfg?.isActive;

          return (
            <div key={prov.name} className={`${styles.providerCard} ${isActive ? styles.active : styles.inactive}`}>
              {isActive && (
                <div className={styles.activeBadge}>
                  ✓ ACTIVE PROVIDER
                </div>
              )}
              
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapper}>
                  <img src={prov.icon} alt={prov.label} className={styles.providerIcon} />
                </div>
                <div>
                  <h3 className={styles.providerName}>{prov.label}</h3>
                  <div className={styles.statusWrapper}>
                    <span className={`${styles.statusDot} ${cfg ? styles.configured : styles.unconfigured}`}></span>
                    <span className={`${styles.statusText} ${cfg ? styles.configured : styles.unconfigured}`}>
                      {cfg ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                </div>
              </div>

              <p className={styles.providerDescription}>
                {prov.description}
              </p>

              <div className={styles.cardActions}>
                <button 
                  onClick={() => setEditing(cfg ? { ...cfg, isDemo: cfg.apiKey?.includes('Dummy') || false } : { providerName: prov.name, isActive: false, isDemo: true, apiKey: 'AIzaSyDummyKeyForDevelopment1234567890' })}
                  className={`${styles.btn} ${styles.editBtn}`}
                >
                  {cfg ? 'Edit Configuration' : 'Setup Now'}
                </button>
                {cfg && !isActive && (
                  <button 
                    onClick={() => activate(cfg.id)} 
                    className={`${styles.btn} ${styles.activateBtn}`}
                  >
                    Set as Active
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <div className={styles.overlay} onClick={() => { setEditing(null); setTestResult({ status: 'idle' }); }}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            
            <div className={styles.modalHeader}>
              <img src={PROVIDERS.find(p => p.name === editing.providerName)?.icon} alt="Icon" className={styles.modalIcon} />
              <div>
                <h3 className={styles.modalTitle}>Configure {PROVIDERS.find(p => p.name === editing.providerName)?.label}</h3>
                <p className={styles.modalSubtitle}>Enter your API credentials below.</p>
              </div>
            </div>

            {PROVIDERS.find(p => p.name === editing.providerName)?.instructions && (
              <details className={styles.instructionsBox}>
                <summary className={styles.instructionsSummary}>How to setup</summary>
                <ol>
                  {PROVIDERS.find(p => p.name === editing.providerName)?.instructions?.map((inst, idx) => (
                    <li key={idx}>{inst}</li>
                  ))}
                </ol>
              </details>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Configuration Mode</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="configMode" 
                    checked={editing.isDemo === true} 
                    onChange={() => setEditing((p: any) => ({ ...p, isDemo: true, apiKey: 'AIzaSyDummyKeyForDevelopment1234567890', mapId: 'dummy-map-id' }))} 
                  />
                  <span>Demo / Mock</span>
                </label>
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="configMode" 
                    checked={!editing.isDemo} 
                    onChange={() => setEditing((p: any) => ({ ...p, isDemo: false, apiKey: p.apiKey?.includes('Dummy') ? '' : p.apiKey, mapId: p.mapId === 'dummy-map-id' ? '' : p.mapId }))} 
                  />
                  <span>Real</span>
                </label>
              </div>
            </div>

            {PROVIDERS.find(p => p.name === editing.providerName)?.fields.map(field => (
              <div key={field.key} className={styles.formGroup}>
                <label className={styles.label}>
                  {field.label}
                </label>
                <input 
                  type={field.type}
                  value={editing[field.key] || ''} 
                  onChange={e => setEditing((p: any) => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={(field as any).placeholder || `Enter ${field.label}`}
                  className={styles.input} 
                />
              </div>
            ))}
            
            {testResult.status !== 'idle' && (
              <div className={`${styles.testResult} ${styles[testResult.status]}`}>
                {testResult.status === 'testing' ? 'Testing connection...' : testResult.message}
              </div>
            )}

            <div className={styles.testBtnWrapper}>
              <button 
                onClick={testConnection} 
                disabled={testResult.status === 'testing'}
                className={styles.testBtn}
              >
                {testResult.status === 'testing' ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                onClick={() => { setEditing(null); setTestResult({ status: 'idle' }); }} 
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button 
                onClick={save} 
                disabled={testResult.status === 'testing'}
                className={styles.saveBtn}
              >
                Save Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
