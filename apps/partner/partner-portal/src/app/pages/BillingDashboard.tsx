import React, { useState } from 'react';
import SubscriptionManager from './SubscriptionManager';
import InvoiceHistory from './InvoiceHistory';

export default function BillingDashboard() {
  const [activeTab, setActiveTab] = useState<'subscription' | 'invoices'>('subscription');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Billing & Subscriptions</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Manage your module subscriptions, view your current plan, and download invoices.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('subscription')}
          style={{
            background: 'none',
            border: 'none',
            padding: '1rem 0',
            fontWeight: 600,
            fontSize: '1rem',
            color: activeTab === 'subscription' ? '#2563EB' : '#64748b',
            borderBottom: activeTab === 'subscription' ? '3px solid #2563EB' : '3px solid transparent',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          Subscription Plans
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          style={{
            background: 'none',
            border: 'none',
            padding: '1rem 0',
            fontWeight: 600,
            fontSize: '1rem',
            color: activeTab === 'invoices' ? '#2563EB' : '#64748b',
            borderBottom: activeTab === 'invoices' ? '3px solid #2563EB' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          Invoice History
        </button>
      </div>

      {activeTab === 'subscription' ? <SubscriptionManager /> : <InvoiceHistory />}
    </div>
  );
}
