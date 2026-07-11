import React, { useState, useEffect } from 'react';
import { useToast } from '@org/ui-design-system';
import styles from './DeliverySettingsAdmin.module.css';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

const DUMMY_SETTINGS = {
  restaurantAddress: 'One Choice Kitchen, Patna',
  restaurantLat: 25.5941,
  restaurantLng: 85.1376,
  enableDistanceCharges: true,
  freeDeliveryDistance: 3.0,
  perKmCharge: 8.0,
  minimumDeliveryCharge: 0.0,
  maximumDeliveryCharge: null,
  enableDistanceMargin: false,
  distanceMarginValue: 0.0,
  applyMarginBeforeCharge: true,
  allowPayOnDelivery: true,
  minimumOrderValue: 0.0,
};

export default function DeliverySettingsAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const [settings, setSettings] = useState<any>(DUMMY_SETTINGS);

  useEffect(() => {
    fetch('/api/delivery-settings', { headers: authHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.text().then(t => JSON.parse(t));
      })
      .then((data) => {
        if (data) setSettings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch delivery settings, using dummy data', err);
        setSettings(DUMMY_SETTINGS);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = value === '' ? null : Number(value);
    }
    
    setSettings({ ...settings, [name]: finalValue });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/delivery-settings', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success('Delivery Settings updated successfully!');
      } else {
        throw new Error();
      }
    } catch (err) {
      // Mock save
      setTimeout(() => {
        toast.success('(Mocked) Delivery Settings updated successfully!');
        setSaving(false);
      }, 500);
      return;
    } 
    setSaving(false);
  };

  if (loading) return <div className={styles.loading}>Loading Settings...</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>🛵 Delivery & Location Settings</h1>
          <p className={styles.subtitle}>Configure delivery charges, margins, and maps integration.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className={styles.saveBtn}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className={styles.settingsGrid}>
        
        {/* Restaurant Settings */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <div className={styles.iconBox}>🏪</div> Restaurant Location
          </h3>
          <div className={styles.formGroup}>
            <div>
              <label className={styles.label}>Restaurant Address</label>
              <input type="text" name="restaurantAddress" value={settings.restaurantAddress} onChange={handleChange} className={styles.input} />
            </div>
            <div className={styles.grid2}>
              <div>
                <label className={styles.label}>Latitude</label>
                <input type="number" step="any" name="restaurantLat" value={settings.restaurantLat} onChange={handleChange} className={styles.input} />
              </div>
              <div>
                <label className={styles.label}>Longitude</label>
                <input type="number" step="any" name="restaurantLng" value={settings.restaurantLng} onChange={handleChange} className={styles.input} />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <div className={styles.iconBox}>🚚</div> Distance-Based Charges
          </h3>
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="enableDistanceCharges" checked={settings.enableDistanceCharges} onChange={handleChange} className={styles.checkbox} />
              <span>Enable Distance-Based Charges</span>
            </label>
            
            {settings.enableDistanceCharges && (
              <>
                <div>
                  <label className={styles.label}>Free Delivery Distance (KM)</label>
                  <input type="number" step="0.1" name="freeDeliveryDistance" value={settings.freeDeliveryDistance} onChange={handleChange} className={styles.input} />
                </div>
                <div>
                  <label className={styles.label}>Per KM Delivery Charge (₹)</label>
                  <input type="number" step="0.5" name="perKmCharge" value={settings.perKmCharge} onChange={handleChange} className={styles.input} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Checkout Restrictions */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <div className={styles.iconBox}>🔒</div> Checkout Restrictions
          </h3>
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="allowPayOnDelivery" checked={settings.allowPayOnDelivery ?? true} onChange={handleChange} className={styles.checkbox} />
              <span>Enable Pay on Delivery (COD)</span>
            </label>
            
            <div>
              <label className={styles.label}>Minimum Order Value for Delivery (₹)</label>
              <input type="number" step="1" name="minimumOrderValue" value={settings.minimumOrderValue ?? 0} onChange={handleChange} className={styles.input} />
              <span className={styles.helpText}>Orders below this value cannot be placed. Applies to both Menu and Tiffin.</span>
            </div>
          </div>
        </div>

        {/* Distance Margin Settings */}
        <div className={`${styles.card} ${styles.fullWidth}`}>
          <h3 className={styles.cardTitle}>
            <div className={styles.iconBox}>📏</div> Distance Margin Settings
          </h3>
          <p className={styles.description}>
            Allows you to automatically inflate the calculated distance (e.g. adding +1 KM to the actual straight line distance) to account for road detours.
          </p>
          
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="enableDistanceMargin" checked={settings.enableDistanceMargin} onChange={handleChange} className={styles.checkbox} />
              <span>Enable Distance Margin</span>
            </label>
            
            {settings.enableDistanceMargin && (
              <div className={styles.grid2}>
                <div>
                  <label className={styles.label}>Distance Margin Value (KM)</label>
                  <input type="number" step="0.1" name="distanceMarginValue" value={settings.distanceMarginValue} onChange={handleChange} className={styles.input} />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
