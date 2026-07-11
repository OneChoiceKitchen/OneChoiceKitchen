import React, { useState, useEffect } from 'react';
import {
  Settings, Key, Link as LinkIcon, Smartphone,
  MapPin, Mail, CreditCard, ShieldCheck, AlertCircle, RefreshCw
} from 'lucide-react';

const mockIntegrations = [
  { id: 'whatsapp', name: 'WhatsApp Business API', icon: Smartphone, status: 'Connected', lastSync: '10 mins ago', latency: '45ms', color: '#10b981' },
  { id: 'maps', name: 'Google Maps & Places', icon: MapPin, status: 'Connected', lastSync: '1 hour ago', latency: '120ms', color: '#3b82f6' },
  { id: 'email', name: 'SendGrid Email API', icon: Mail, status: 'Connected', lastSync: '2 hours ago', latency: '85ms', color: '#8b5cf6' },
  { id: 'sms', name: 'Twilio SMS Gateway', icon: Smartphone, status: 'Warning', lastSync: '5 hours ago', latency: '350ms', color: '#f59e0b', message: 'High latency detected' },
  { id: 'stripe', name: 'Stripe Payments', icon: CreditCard, status: 'Connected', lastSync: 'Just now', latency: '30ms', color: '#6366f1' },
  { id: 'auth', name: 'SSO & OAuth Providers', icon: ShieldCheck, status: 'Disconnected', lastSync: 'Never', latency: '-', color: '#DC2626', message: 'Credentials missing' },
];

export default function ConfigDashboardAdmin() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API load
    setTimeout(() => {
      setLoading(false);
    }, 400);
  }, []);

  return (
    <div style={{ padding: '2rem', animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>Configurations Hub</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>Manage third-party API integrations, Webhooks, and global settings.</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#0f172a', color: 'white', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          <RefreshCw size={18} />
          Sync All APIs
        </button>
      </div>
      
      {/* Integrations Grid */}
      <h3 style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Active Integrations</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {mockIntegrations.map(integration => {
          const Icon = integration.icon;
          return (
            <div key={integration.id} className="apple-card" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: `1px solid ${integration.status === 'Warning' ? '#f59e0b50' : integration.status === 'Disconnected' ? '#DC262650' : 'rgba(0,0,0,0.05)'}`, display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: integration.color + '15', color: integration.color, padding: '0.75rem', borderRadius: '12px' }}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>{integration.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>ID: {integration.id}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Status</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: integration.status === 'Connected' ? '#10b981' : integration.status === 'Warning' ? '#f59e0b' : '#DC2626', fontWeight: 700, fontSize: '0.85rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: integration.status === 'Connected' ? '#10b981' : integration.status === 'Warning' ? '#f59e0b' : '#DC2626' }} />
                    {integration.status}
                  </div>
                </div>
                {integration.message && (
                  <div style={{ fontSize: '0.8rem', color: integration.status === 'Warning' ? '#f59e0b' : '#DC2626', fontWeight: 500, marginTop: '-0.4rem' }}>
                    {integration.message}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Last Sync</span>
                  <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>{integration.lastSync}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Latency</span>
                  <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>{integration.latency}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                <button style={{ flex: 1, padding: '0.75rem', background: 'transparent', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <Settings size={16} /> Config
                </button>
                <button style={{ flex: 1, padding: '0.75rem', background: '#f8fafc', color: '#3b82f6', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <LinkIcon size={16} /> Test
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Global Security Panel */}
      <div className="apple-card" style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px', color: '#64748b' }}>
            <Key size={32} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>API Key Management</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>Rotate, revoke, and manage root-level API keys and webhook secrets.</p>
          </div>
        </div>
        <button style={{ padding: '0.8rem 1.5rem', background: '#0f172a', color: 'white', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          Manage Keys
        </button>
      </div>
    </div>
  );
}
