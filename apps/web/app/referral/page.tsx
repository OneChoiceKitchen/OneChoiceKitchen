'use client';
import React from 'react';
import styles from "../page.module.css";
import PageHero from '../components/PageHero';
import { Gift, Users, Copy, CheckCircle2 } from 'lucide-react';
import { useToast } from '@org/ui-design-system';

export default function ReferralPage() {
  const toast = useToast();
  return (
    <div className={styles.main}>
      <PageHero 
        badgeText="Earn Rewards"
        title={<>Refer & <span className={styles.highlight}>Earn Together.</span></>}
        subtitle="Invite your friends to One Choice Kitchen and both of you earn exclusive rewards and discounts on your next orders."
      />
      
      <div className={styles.sectionContainer} style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '3rem 2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'inline-flex', background: '#eff6ff', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Gift size={48} color="#2563EB" />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Get 20% Off Your Next Meal</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Share your unique referral code. When a friend signs up and places their first order, you both get 20% off.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '1rem', marginBottom: '2rem' }}>
            <div style={{ flex: 1, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '2px', color: '#0f172a' }}>OCK-FRIEND20</div>
            <button style={{ background: '#2563EB', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Copy size={18} /> Copy
            </button>
          </div>
          
          <button className={styles.primaryBtn} style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
            <Users size={20} /> Invite Friends Now
          </button>
        </div>

        <div style={{ maxWidth: '600px', margin: '4rem auto 0', background: 'white', padding: '3rem 2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Have a Referral Code?</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Enter your friend's code below to claim your 20% discount.
          </p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            try {
              const res = await fetch('/api/referrals/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  code: formData.get('code'),
                  email: formData.get('email')
                })
              });
              if(res.ok) {
                toast.success('Referral code applied! Check your email for the discount.');
                (e.target as HTMLFormElement).reset();
              } else {
                toast.error('Invalid or expired referral code.');
              }
            } catch (err) {
              toast.error('Error processing code.');
            }
          }} style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', color: '#475569', fontWeight: 500 }}>Your Email</label>
              <input type="email" name="email" required placeholder="Enter your email" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', color: '#475569', fontWeight: 500 }}>Referral Code</label>
              <input type="text" name="code" required placeholder="e.g. OCK-FRIEND20" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', textTransform: 'uppercase' }} />
            </div>
            <button type="submit" className={styles.secondaryBtn} style={{ justifyContent: 'center', padding: '1rem' }}>
              <CheckCircle2 size={20} /> Redeem Code
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}