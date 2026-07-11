import { useState } from 'react';
import { Save, Settings, MapPin, DollarSign, Clock, Package } from 'lucide-react';
import styles from './HRSettingsAdmin.module.css';

export default function HRSettingsAdmin() {
  const [activeTab, setActiveTab] = useState('riders');

  // Form State
  const [codLimit, setCodLimit] = useState('500');
  const [tipPassThrough, setTipPassThrough] = useState('100');
  const [zoneATol, setZoneATol] = useState('500'); // meters
  const [zoneBTol, setZoneBTol] = useState('800'); // meters

  const [assetTypes, setAssetTypes] = useState([
    { id: 1, name: 'Thermal Bag', cost: 50 },
    { id: 2, name: 'Kitchen Uniform', cost: 20 },
    { id: 3, name: 'Laptop', cost: 1500 }
  ]);
  const [newAsset, setNewAsset] = useState({ name: '', cost: '' });

  const handleSave = () => {
    alert('Settings Saved Successfully!');
  };

  const handleAddAsset = () => {
    if (newAsset.name && newAsset.cost) {
      setAssetTypes([...assetTypes, { id: Date.now(), name: newAsset.name, cost: Number(newAsset.cost) }]);
      setNewAsset({ name: '', cost: '' });
    }
  };

  const handleRemoveAsset = (id: number) => {
    setAssetTypes(assetTypes.filter(a => a.id !== id));
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>HR & Operations Settings</h1>
          <p className={styles.pageSubtitle}>Configure global policies, geofences, payroll rules, and asset types.</p>
        </div>
        <button className={styles.primaryButton} onClick={handleSave}>
          <Save size={18} />
          Save Configurations
        </button>
      </div>

      <div className={styles.tabsContainer}>
        <button className={`${styles.tab} ${activeTab === 'riders' ? styles.activeTab : ''}`} onClick={() => setActiveTab('riders')}>Rider & Geofence</button>
        <button className={`${styles.tab} ${activeTab === 'payroll' ? styles.activeTab : ''}`} onClick={() => setActiveTab('payroll')}>Payroll & Tax</button>
        <button className={`${styles.tab} ${activeTab === 'shifts' ? styles.activeTab : ''}`} onClick={() => setActiveTab('shifts')}>Shifts & Leaves</button>
        <button className={`${styles.tab} ${activeTab === 'assets' ? styles.activeTab : ''}`} onClick={() => setActiveTab('assets')}>Asset Categories</button>
      </div>

      <div className={styles.settingsGrid}>
        
        {activeTab === 'riders' && (
          <>
            <div className={styles.settingsCard}>
              <h3 className={styles.cardTitle}><MapPin size={18} color="#3b82f6" /> Zone A Geofence</h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>Center Coordinates (Lat, Lng)</label>
                <div className={styles.inputRow}>
                  <input type="text" className={styles.input} defaultValue="40.7128" />
                  <input type="text" className={styles.input} defaultValue="-74.0060" />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Allowed Tolerance (meters)</label>
                <input type="number" className={styles.input} value={zoneATol} onChange={e => setZoneATol(e.target.value)} />
                <span className={styles.helpText}>Riders checking in outside this radius will be marked out of bounds.</span>
              </div>
            </div>

            <div className={styles.settingsCard}>
              <h3 className={styles.cardTitle}><MapPin size={18} color="#3b82f6" /> Zone B Geofence</h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>Center Coordinates (Lat, Lng)</label>
                <div className={styles.inputRow}>
                  <input type="text" className={styles.input} defaultValue="40.7580" />
                  <input type="text" className={styles.input} defaultValue="-73.9855" />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Allowed Tolerance (meters)</label>
                <input type="number" className={styles.input} value={zoneBTol} onChange={e => setZoneBTol(e.target.value)} />
              </div>
            </div>
          </>
        )}

        {activeTab === 'payroll' && (
          <div className={styles.settingsCard}>
              <h3 className={styles.cardTitle}><DollarSign size={18} color="#16a34a" /> Rider Payout Rules</h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>Maximum COD Cash Float ($)</label>
                <input type="number" className={styles.input} value={codLimit} onChange={e => setCodLimit(e.target.value)} />
                <span className={styles.helpText}>If unremitted COD exceeds this limit, rider accounts are auto-suspended.</span>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tip Pass-through (%)</label>
                <input type="number" className={styles.input} value={tipPassThrough} onChange={e => setTipPassThrough(e.target.value)} />
                <span className={styles.helpText}>Percentage of customer tips directly passed to the rider.</span>
              </div>
            </div>
        )}

        {activeTab === 'shifts' && (
          <div className={styles.settingsCard}>
              <h3 className={styles.cardTitle}><Clock size={18} color="#9333ea" /> Shift Definitions</h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>Morning Shift</label>
                <div className={styles.inputRow}>
                  <input type="time" className={styles.input} defaultValue="08:00" />
                  <input type="time" className={styles.input} defaultValue="16:00" />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Evening Shift</label>
                <div className={styles.inputRow}>
                  <input type="time" className={styles.input} defaultValue="16:00" />
                  <input type="time" className={styles.input} defaultValue="00:00" />
                </div>
              </div>
            </div>
        )}

        {activeTab === 'assets' && (
          <div className={styles.settingsCard}>
              <h3 className={styles.cardTitle}><Package size={18} color="#eab308" /> Configured Asset Types</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                {assetTypes.map(asset => (
                  <div key={asset.id} className={styles.listItem}>
                    <div>
                      <span style={{ fontWeight: 500, display: 'block', color: '#1e293b' }}>{asset.name}</span>
                      <span className={styles.helpText}>Default Cost: ${asset.cost}</span>
                    </div>
                    <button className={styles.listAction} onClick={() => handleRemoveAsset(asset.id)}>Remove</button>
                  </div>
                ))}
              </div>
              
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Add New Asset Type</label>
                  <div className={styles.inputRow}>
                    <input type="text" placeholder="Name (e.g. Helmet)" className={styles.input} value={newAsset.name} onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} />
                    <input type="number" placeholder="Cost ($)" className={styles.input} value={newAsset.cost} onChange={e => setNewAsset({ ...newAsset, cost: e.target.value })} />
                  </div>
                  <button 
                    onClick={handleAddAsset} 
                    style={{ marginTop: '0.75rem', width: '100%', padding: '0.5rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, color: '#334155' }}
                  >
                    Add Asset Type
                  </button>
                </div>
              </div>
            </div>
        )}

      </div>
    </div>
  );
}
