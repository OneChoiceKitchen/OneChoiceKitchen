import React, { useState } from 'react';
import { Bell, Globe, Lock, Save, Moon, Monitor } from 'lucide-react';

const PreferencesAdmin = () => {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    language: 'English',
    timezone: 'Asia/Kolkata',
    autoLogout: '30m',
  });

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Preferences</h1>
          <p style={{ color: 'var(--ent-text-muted)', margin: '0.25rem 0 0 0' }}>Manage your account settings and notification preferences.</p>
        </div>
        <button
          onClick={() => alert('Preferences saved successfully!')}
          style={{
            padding: '0.6rem 1.25rem',
            background: 'var(--ent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        
        {/* Notifications Section */}
        <div style={{ background: 'var(--ent-surface)', borderRadius: '12px', border: '1px solid var(--ent-border)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} style={{ color: 'var(--ent-text-muted)' }} /> Notification Settings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Email Notifications</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ent-text-muted)' }}>Receive daily summaries and critical alerts via email.</div>
              </div>
              <div 
                onClick={() => handleToggle('emailNotifications')}
                style={{ width: '40px', height: '22px', background: preferences.emailNotifications ? 'var(--ent-primary)' : '#e2e8f0', borderRadius: '11px', position: 'relative', cursor: 'pointer', transition: '0.2s' }}
              >
                <div style={{ position: 'absolute', top: '2px', left: preferences.emailNotifications ? '20px' : '2px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: '0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}></div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>SMS Notifications</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ent-text-muted)' }}>Get text messages for urgent operational issues.</div>
              </div>
              <div 
                onClick={() => handleToggle('smsNotifications')}
                style={{ width: '40px', height: '22px', background: preferences.smsNotifications ? 'var(--ent-primary)' : '#e2e8f0', borderRadius: '11px', position: 'relative', cursor: 'pointer', transition: '0.2s' }}
              >
                <div style={{ position: 'absolute', top: '2px', left: preferences.smsNotifications ? '20px' : '2px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: '0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>In-App Push Notifications</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ent-text-muted)' }}>Show real-time toast alerts while actively using the dashboard.</div>
              </div>
              <div 
                onClick={() => handleToggle('pushNotifications')}
                style={{ width: '40px', height: '22px', background: preferences.pushNotifications ? 'var(--ent-primary)' : '#e2e8f0', borderRadius: '11px', position: 'relative', cursor: 'pointer', transition: '0.2s' }}
              >
                <div style={{ position: 'absolute', top: '2px', left: preferences.pushNotifications ? '20px' : '2px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: '0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Region & Language Section */}
        <div style={{ background: 'var(--ent-surface)', borderRadius: '12px', border: '1px solid var(--ent-border)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={18} style={{ color: 'var(--ent-text-muted)' }} /> Regional Settings
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--ent-text-main)' }}>Language</label>
              <select 
                value={preferences.language}
                onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--ent-border)', background: 'var(--ent-bg)', color: 'var(--ent-text-main)' }}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--ent-text-main)' }}>Timezone</label>
              <select 
                value={preferences.timezone}
                onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--ent-border)', background: 'var(--ent-bg)', color: 'var(--ent-text-main)' }}
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div style={{ background: 'var(--ent-surface)', borderRadius: '12px', border: '1px solid var(--ent-border)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} style={{ color: 'var(--ent-text-muted)' }} /> Security Settings
          </h3>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--ent-text-main)' }}>Session Auto-Logout</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--ent-text-muted)', marginBottom: '0.5rem' }}>Automatically log out of the system after a period of inactivity.</p>
            <select 
              value={preferences.autoLogout}
              onChange={(e) => setPreferences({...preferences, autoLogout: e.target.value})}
              style={{ width: '100%', maxWidth: '300px', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--ent-border)', background: 'var(--ent-bg)', color: 'var(--ent-text-main)' }}
            >
              <option value="15m">15 Minutes</option>
              <option value="30m">30 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="never">Never (Not recommended)</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PreferencesAdmin;
