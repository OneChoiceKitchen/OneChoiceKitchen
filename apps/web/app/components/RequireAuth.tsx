'use client';
import React from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { LogIn } from 'lucide-react';
import styles from '../page.module.css';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loggedIn, setLoginModalOpen } = useGlobalContext();

  if (!loggedIn) {
    return (
      <div className={styles.main} style={{ background: 'var(--bg-color, #f8fafc)', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'white', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '450px', width: '100%' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(0, 84, 166, 0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <LogIn size={40} color="#2563EB" />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#0f172a', fontWeight: 700 }}>Sign In Required</h2>
          <p style={{ color: '#64748b', marginBottom: '2.5rem', lineHeight: 1.6, fontSize: '1.05rem' }}>
            Please log in or create an account to view and manage your profile, loyalty points, referrals, and subscription details.
          </p>
          <button 
            onClick={() => setLoginModalOpen(true)}
            style={{ 
              width: '100%', 
              background: 'linear-gradient(135deg, #2563EB 0%, #2563EB 100%)', 
              color: 'white', 
              padding: '1rem', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: 600, 
              cursor: 'pointer', 
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(0, 56, 147, 0.25)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 56, 147, 0.3)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 56, 147, 0.25)'; }}
          >
            Open Login Portal
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
