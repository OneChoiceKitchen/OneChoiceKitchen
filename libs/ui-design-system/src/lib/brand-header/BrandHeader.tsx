import React from 'react';
import styles from './BrandHeader.module.css';

export interface BrandHeaderProps {
  children?: React.ReactNode;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({ children }) => {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap');
      `}} />
      <div className={styles.headerContainer}>
        <a href="/" className={styles.brandLink} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 0', textDecoration: 'none', margin: 0, borderRadius: '8px' }}>
          <img src="/branding/logo-icon.png" alt="One Choice Kitchen Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '32px', lineHeight: 1, margin: 0, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#2563EB' }}>ONE</span> <span style={{ color: '#ED1C24' }}>CHOICE</span> <span style={{ color: '#2563EB' }}>KITCHEN</span>
            </span>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#2563EB', marginTop: '2px' }}>
              ALL YOUR CRAVINGS. ONE KITCHEN
            </div>
          </div>
        </a>
        
        {children && (
          <div className={styles.childrenContainer}>
            {children}
          </div>
        )}
      </div>
    </>
  );
}
