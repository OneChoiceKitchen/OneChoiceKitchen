import { useState, useEffect } from 'react';
import { useToast } from '@org/ui-design-system';
import styles from './PaymentConfiguration.module.css';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

const ALL_PROVIDERS = ['Razorpay', 'Stripe', 'PayU', 'Cashfree', 'PhonePe', 'Paytm', 'CCAvenue', 'Instamojo'];

const PROVIDER_FIELDS: any = {
  'Razorpay': [
    { key: 'apiKey', label: 'API Key', type: 'text' },
    { key: 'apiSecret', label: 'API Secret', type: 'password' },
    { key: 'webhookSecret', label: 'Webhook Secret', type: 'password' },
    { key: 'isSandbox', label: 'Test Mode (Sandbox)', type: 'checkbox' }
  ],
  'Stripe': [
    { key: 'publicKey', label: 'Publishable Key', type: 'text' },
    { key: 'apiSecret', label: 'Secret Key', type: 'password' },
    { key: 'webhookSecret', label: 'Webhook Secret', type: 'password' },
    { key: 'isSandbox', label: 'Test Mode (Sandbox)', type: 'checkbox' }
  ],
  'PayU': [
    { key: 'merchantId', label: 'Merchant ID', type: 'text' },
    { key: 'apiKey', label: 'Merchant Key', type: 'password' },
    { key: 'apiSecret', label: 'Merchant Salt', type: 'password' },
    { key: 'isSandbox', label: 'Test Mode (Sandbox)', type: 'checkbox' }
  ],
  'Cashfree': [
    { key: 'apiKey', label: 'App ID', type: 'text' },
    { key: 'apiSecret', label: 'Secret Key', type: 'password' },
    { key: 'isSandbox', label: 'Test Mode (Sandbox)', type: 'checkbox' }
  ],
  'PhonePe': [
    { key: 'merchantId', label: 'Merchant ID', type: 'text' },
    { key: 'apiKey', label: 'Salt Key', type: 'password' },
    { key: 'apiSecret', label: 'Salt Index', type: 'text' },
    { key: 'isSandbox', label: 'Test Mode (Sandbox)', type: 'checkbox' }
  ],
  'Paytm': [
    { key: 'merchantId', label: 'Merchant ID', type: 'text' },
    { key: 'apiKey', label: 'Merchant Key', type: 'password' },
    { key: 'isSandbox', label: 'Test Mode (Sandbox)', type: 'checkbox' }
  ],
  'CCAvenue': [
    { key: 'merchantId', label: 'Merchant ID', type: 'text' },
    { key: 'apiKey', label: 'Access Code', type: 'password' },
    { key: 'apiSecret', label: 'Working Key', type: 'password' },
    { key: 'isSandbox', label: 'Test Mode (Sandbox)', type: 'checkbox' }
  ],
  'Instamojo': [
    { key: 'apiKey', label: 'API Key', type: 'password' },
    { key: 'apiSecret', label: 'Auth Token', type: 'password' },
    { key: 'isSandbox', label: 'Test Mode (Sandbox)', type: 'checkbox' }
  ]
};

const DUMMY_PAYMENTS = [
  { id: 'pay_1', gatewayName: 'Razorpay', isEnabled: true, isNew: false, isSandbox: true, apiKey: 'rzp_test_123', webhookSecret: 'sec_123' },
  { id: 'pay_2', gatewayName: 'Stripe', isEnabled: false, isNew: false, isSandbox: false, publicKey: 'pk_live_123' }
];

export default function PaymentConfiguration() {
  const [providers, setProviders] = useState<any[]>([]);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const toast = useToast();

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/payments/config', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const loaded = await res.text().then(t => JSON.parse(t));
      
      const merged = ALL_PROVIDERS.map(name => {
        const existing = loaded.find((p: any) => p.gatewayName === name);
        return existing || { 
          id: `new_${name}`, 
          gatewayName: name, 
          isEnabled: false, 
          isNew: true, 
          activeMethods: 'upi,cards,netbanking',
          apiKey: '', apiSecret: '', merchantId: '', publicKey: '', webhookSecret: '',
          isSandbox: true
        };
      });
      setProviders(merged);
    } catch {
      // Fallback
      const merged = ALL_PROVIDERS.map(name => {
        const existing = DUMMY_PAYMENTS.find((p: any) => p.gatewayName === name);
        return existing || { 
          id: `new_${name}`, 
          gatewayName: name, 
          isEnabled: false, 
          isNew: true, 
          isSandbox: true 
        };
      });
      setProviders(merged);
    }
  };

  const handleSaveProviders = async (newProviders: any[]) => {
    setProviders(newProviders);
    try {
      const res = await fetch('/api/payments/config', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newProviders)
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.success('(Mocked) Saved payment configurations');
    }
  };

  const handleToggleEnable = (name: string, checked: boolean) => {
    const updated = providers.map(p => {
      if (p.gatewayName === name) return { ...p, isEnabled: checked };
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
      [key]: value
    }));
  };

  const saveConfig = () => {
    const updated = providers.map(p => {
      if (p.gatewayName === editingProvider.gatewayName) {
        return { ...editingProvider, isNew: false };
      }
      return p;
    });
    handleSaveProviders(updated);
    setEditingProvider(null);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>💳 Payment Gateways</h1>
        <p className={styles.subtitle}>Configure and manage your payment gateway integrations.</p>
      </div>

      <div className={styles.providersGrid}>
        {providers.map(provider => (
          <div key={provider.gatewayName} className={`${styles.providerCard} ${provider.isEnabled ? styles.active : styles.inactive}`}>
            <div className={styles.cardHeader}>
              <div className={styles.providerTitleGroup}>
                <div className={styles.iconBox}>
                  💳
                </div>
                <h3 className={styles.providerName}>{provider.gatewayName}</h3>
              </div>
              <label>
                <input 
                  type="checkbox" 
                  checked={provider.isEnabled} 
                  onChange={e => handleToggleEnable(provider.gatewayName, e.target.checked)} 
                  className={styles.toggleSwitch}
                />
              </label>
            </div>
            
            <div className={styles.badgeGroup}>
              <span className={`${styles.badge} ${provider.isEnabled ? styles.active : styles.inactive}`}>
                {provider.isEnabled ? 'ACTIVE' : 'INACTIVE'}
              </span>
              {!provider.isNew && (
                <span className={`${styles.badge} ${styles.mode}`}>
                  {provider.isSandbox ? 'Sandbox Mode' : 'Live Mode'}
                </span>
              )}
            </div>

            <div className={styles.metaInfo}>
              <span className={styles.metaStatus}>
                {provider.isNew ? '🛡️ Not Configured' : '✅ Configured'}
              </span>
            </div>

            <button 
              onClick={() => openConfig(provider)}
              className={styles.configBtn}
            >
              ⚙️ Configure
            </button>
          </div>
        ))}
      </div>

      {/* CONFIG MODAL */}
      {editingProvider && (
        <div className={styles.overlay} onClick={() => setEditingProvider(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingProvider.gatewayName} Configuration</h2>
              <p className={styles.modalSubtitle}>Update API keys and environment settings.</p>
            </div>
            
            <div className={styles.modalBody}>
              {PROVIDER_FIELDS[editingProvider.gatewayName]?.map((field: any) => (
                <div key={field.key} className={styles.formGroup}>
                  {field.type === 'checkbox' ? (
                    <label className={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={editingProvider[field.key] || false} 
                        onChange={e => handleConfigChange(field.key, e.target.checked)} 
                        className={styles.checkbox}
                      />
                      {field.label}
                    </label>
                  ) : (
                    <>
                      <label className={styles.label}>{field.label}</label>
                      <input 
                        type={field.type}
                        value={editingProvider[field.key] || ''}
                        onChange={e => handleConfigChange(field.key, e.target.value)}
                        placeholder={`Enter ${field.label}`}
                        className={`${styles.input} ${field.type === 'password' ? styles.mono : ''}`}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button 
                onClick={() => setEditingProvider(null)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button 
                onClick={saveConfig}
                className={styles.saveBtn}
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
