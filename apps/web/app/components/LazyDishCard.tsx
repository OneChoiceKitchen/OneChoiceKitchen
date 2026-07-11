'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';

export default function LazyDishCard({ item, cartItem, onAdd, onUpdateQty, styles }: any) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className={styles.dishCard} style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <div className={styles.dishImageWrapper}>
        <span className={`${styles.dietBadge} ${item.diet === 'VEG' ? styles.dietVeg : styles.dietNonVeg}`} style={{ zIndex: 10 }}>
          {item.diet === 'VEG' ? '🌱 VEG' : '🍗 NON-VEG'}
        </span>
        
        {/* Skeleton Pulse for Image */}
        {!imageLoaded && item.image && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
            <img src="/branding/logo-icon.png" alt="Loading" style={{ width: '48px', height: '48px', opacity: 0.4, animation: 'pulse 1.5s infinite ease-in-out' }} />
          </div>
        )}

        {item.image ? (
          <Image 
            unoptimized={item.image.startsWith('http')} 
            src={item.image} 
            alt={item.name} 
            fill 
            sizes="(max-width: 768px) 100vw, 300px" 
            className={styles.dishImage} 
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
          />
        ) : (
          <div className={styles.placeholderImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', height: '100%' }}>
            <img src="/branding/logo-icon.png" alt="Placeholder Icon" className={styles.placeholderIcon} style={{ width: '64px', height: '64px', opacity: 0.4 }} />
          </div>
        )}
      </div>
      
      <div className={styles.dishContent}>
        <div className={styles.dishTitleRow}>
          <h3 className={styles.dishName}>{item.name}</h3>
          <span className={styles.dishPrice}>₹{item.price}</span>
        </div>
        <p className={styles.dishDesc}>{item.description}</p>
        
        {item.youtubeUrl && (
          <a 
            href={item.youtubeUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#DC2626', textDecoration: 'none', fontWeight: 600, marginBottom: '0.75rem', padding: '4px 8px', background: '#fef2f2', borderRadius: '16px', width: 'fit-content' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            Preparation Video
          </a>
        )}

        {cartItem ? (
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '0.25rem', borderRadius: '10px', border: '1px solid #e2e8f0'}}>
            <button onClick={() => onUpdateQty(item.id, cartItem.qty - 1)} className={styles.qtyBtn}><Minus size={16} /></button>
            <span style={{fontWeight: 800, color: '#0f172a'}}>{cartItem.qty}</span>
            <button onClick={() => onUpdateQty(item.id, cartItem.qty + 1)} className={styles.qtyBtn}><Plus size={16} /></button>
          </div>
        ) : (
          <button 
            onClick={() => onAdd(item)} 
            className={styles.addBtn}
            disabled={item.isOutOfStock}
            style={item.isOutOfStock ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            {item.isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
}
