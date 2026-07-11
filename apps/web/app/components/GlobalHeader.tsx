'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { BrandHeader } from '@org/ui-design-system';
import { useGlobalContext } from '../context/GlobalContext';
import styles from '../page.module.css';

export default function GlobalHeader() {
  const { totalCartItems, setCartDrawerOpen, loggedIn, setLoginModalOpen } = useGlobalContext();

  return (
    <BrandHeader>
      <div className={`${styles.navLinks} desktop-nav-links`}>
        <Link href="/menu" className={styles.navLink}>Menu</Link>
        <Link href="/reservations" className={styles.navLink}>Dining</Link>
        <Link href="/tiffin" className={styles.navLink}>Tiffins</Link>
        <Link href="/blogs" className={styles.navLink}>Blogs</Link>
        <Link href="/loyalty" className={styles.navLink}>Loyalty Store</Link>
        <Link href="/referral" className={styles.navLink}>Referrals</Link>
        <Link href="/support" className={styles.navLink}>Support</Link>
        <Link href="/reviews" className={styles.navLink}>Reviews</Link>
        <button 
          className={styles.cartIconBtn} 
          onClick={() => setCartDrawerOpen(true)}
          style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <ShoppingBag size={24} color="#2563EB" />
          {totalCartItems > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#DC2626',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {totalCartItems}
            </span>
          )}
        </button>
        {loggedIn ? (
          <Link href="/profile" className={styles.primaryBtn} style={{padding: '0.5rem 1.25rem', fontSize: '0.9rem', textDecoration: 'none', background: 'var(--accent-gradient)'}}>Profile</Link>
        ) : (
          <button onClick={() => setLoginModalOpen(true)} className={styles.primaryBtn} style={{padding: '0.5rem 1.25rem', fontSize: '0.9rem', textDecoration: 'none'}}>Sign In</button>
        )}
      </div>
    </BrandHeader>
  );
}
