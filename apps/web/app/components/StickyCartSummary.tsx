'use client';
import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';

export default function StickyCartSummary() {
  const { totalCartItems, cart, setCartDrawerOpen } = useGlobalContext();

  if (totalCartItems === 0) return null;

  // Calculate total price
  const totalPrice = Object.values(cart).reduce((sum, current) => {
    return sum + (Number(current.item.price) * current.qty);
  }, 0);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: '600px',
      background: '#16a34a',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.4), 0 8px 10px -6px rgba(22, 163, 74, 0.2)',
      zIndex: 9000,
      cursor: 'pointer',
      animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    }} onClick={() => setCartDrawerOpen(true)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingBag size={20} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{totalCartItems} Item{totalCartItems !== 1 ? 's' : ''} added</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total: ₹{totalPrice}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '1.05rem' }}>
        View Cart
        <ArrowRight size={20} />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUpFade {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}} />
    </div>
  );
}
