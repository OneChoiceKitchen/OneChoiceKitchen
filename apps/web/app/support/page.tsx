'use client';
import React from 'react';
import styles from "../page.module.css";
import PageHero from '../components/PageHero';
import { LifeBuoy, MessageSquare, Phone, Mail } from 'lucide-react';
import { useToast } from '@org/ui-design-system';

export default function SupportPage() {
  const toast = useToast();
  return (
    <div className={styles.main}>
      <PageHero 
        badgeText="24/7 Support"
        title={<>How can we <span className={styles.highlight}>Help You?</span></>}
        subtitle="Our dedicated support team is always ready to assist you with your orders, subscriptions, or any questions."
      />
      
      <div className={styles.sectionContainer} style={{ padding: '4rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
             <div style={{ display: 'inline-flex', background: '#eff6ff', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                <MessageSquare size={32} color="#2563EB" />
             </div>
             <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Live Chat</h3>
             <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Chat directly with our support agents for immediate assistance.</p>
             <button className={styles.primaryBtn} style={{ width: '100%', justifyContent: 'center' }}>Start Chat</button>
          </div>

          <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
             <div style={{ display: 'inline-flex', background: '#f0fdf4', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                <Phone size={32} color="#16a34a" />
             </div>
             <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Call Us</h3>
             <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Speak to our customer care team available round the clock.</p>
             <button className={styles.secondaryBtn} style={{ width: '100%', justifyContent: 'center' }}>+91 98765 43210</button>
          </div>

          <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
             <div style={{ display: 'inline-flex', background: '#fef2f2', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                <Mail size={32} color="#DC2626" />
             </div>
             <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Email Support</h3>
             <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Send us a detailed query and we will get back within 24 hours.</p>
             <button className={styles.secondaryBtn} style={{ width: '100%', justifyContent: 'center' }}>support@onechoice.com</button>
          </div>

        </div>

        <div style={{ marginTop: '4rem', background: 'white', padding: '3rem', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', textAlign: 'center' }}>Send Us a Message</h2>
          <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '2rem' }}>Fill out the form below and we will get back to you as soon as possible.</p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            try {
              const res = await fetch('/api/support/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: formData.get('email'),
                  subject: formData.get('subject'),
                  message: formData.get('message')
                })
              });
              if(res.ok) {
                toast.success('Message sent successfully!');
                (e.target as HTMLFormElement).reset();
              } else {
                toast.error('Failed to send message.');
              }
            } catch (err) {
              toast.error('Error sending message.');
            }
          }} style={{ display: 'grid', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
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
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 500 }}>Subject</label>
              <input type="text" name="subject" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 500 }}>Message</label>
              <textarea name="message" rows={5} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}></textarea>
            </div>
            <button type="submit" className={styles.primaryBtn} style={{ justifyContent: 'center', padding: '1rem', fontSize: '1.1rem' }}>Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}