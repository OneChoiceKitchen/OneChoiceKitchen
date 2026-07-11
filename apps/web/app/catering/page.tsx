'use client';
import React from 'react';
import PageHero from '../components/PageHero';
import { useToast } from '@org/ui-design-system';

export default function CateringPage() {
  const toast = useToast();
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <PageHero 
        badgeText="Catering"
        title="Corporate Catering" 
        subtitle="Elevate your office events and parties with our premium catering packages."
      />
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1rem' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '1rem', textAlign: 'center' }}>Request a Catering Quote</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6', textAlign: 'center', marginBottom: '2rem' }}>
            Fill out the form below with your event details, and our catering team will get back to you with a customized menu and quote.
          </p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            try {
              const res = await fetch('/api/support/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: formData.get('email'),
                  subject: `Catering Inquiry: ${formData.get('eventType')}`,
                  message: `Event Type: ${formData.get('eventType')}\nGuests: ${formData.get('guests')}\nDate: ${formData.get('date')}\n\nMessage:\n${formData.get('message')}`
                })
              });
              if(res.ok) {
                toast.success('Catering inquiry submitted! We will contact you soon.');
                (e.target as HTMLFormElement).reset();
              } else {
                toast.error('Failed to submit inquiry.');
              }
            } catch (err) {
              toast.error('Error submitting inquiry.');
            }
          }} style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 500 }}>Name</label>
                <input type="text" name="name" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 500 }}>Email</label>
                <input type="email" name="email" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 500 }}>Event Type</label>
                <select name="eventType" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                  <option value="Corporate">Corporate</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Party">Party</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 500 }}>No. of Guests</label>
                <input type="number" name="guests" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 500 }}>Event Date</label>
                <input type="date" name="date" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 500 }}>Additional Requirements</label>
              <textarea name="message" rows={4} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}></textarea>
            </div>
            <button type="submit" style={{ background: '#2563EB', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}>Submit Inquiry</button>
          </form>
        </div>
      </div>
    </div>
  );
}
