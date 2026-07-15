import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@org/ui-design-system';

export default function SubscriptionManager() {
  const [plans] = useState([
    { id: 'tier-1', name: 'Starter', price: 999, features: ['Food Ordering', 'Basic Menu CMS', 'Standard Support'] },
    { id: 'tier-2', name: 'Professional', price: 1999, features: ['Everything in Starter', 'Inventory Management', 'Advanced Analytics', 'Priority Support'] },
    { id: 'tier-3', name: 'Enterprise', price: 3999, features: ['Everything in Pro', 'Dining Reservations', 'HRMS & Staff Kiosk', 'Hall Bookings'] }
  ]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubscribe = async (plan: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('partner_token');
      // Simulate backend payment and subscription logic
      const res = await axios.post('/api/billing/subscribe', {
        subscriptionId: plan.id,
        amount: plan.price
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success(`Successfully subscribed to ${plan.name} plan!`);
      } else {
        toast.error('Subscription failed');
      }
    } catch (err) {
      toast.error('An error occurred during subscription processing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '1rem', fontWeight: 700 }}>Available Plans</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {plans.map(plan => (
          <div key={plan.id} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>{plan.name}</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2563EB', marginBottom: '1.5rem' }}>
              ₹{plan.price} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>/ month</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {plan.features.map((feature, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.95rem' }}>
                  <span style={{ color: '#10b981' }}>✓</span> {feature}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleSubscribe(plan)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
