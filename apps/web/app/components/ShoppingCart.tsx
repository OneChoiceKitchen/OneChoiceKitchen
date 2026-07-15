'use client';
import React from 'react';
import { Trash2 } from 'lucide-react';
import LazyImage from './LazyImage';

export default function ShoppingCart({ cart, updateCartQty, styles }: any) {
  const cartEntries = Object.entries(cart || {});

  if (cartEntries.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px' }}>
        <h3 style={{ margin: 0, color: '#64748b' }}>Your cart is empty</h3>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <tr>
            <th style={{ padding: '16px', fontWeight: 700, color: '#475569', fontSize: '13px' }}>ITEM</th>
            <th style={{ padding: '16px', fontWeight: 700, color: '#475569', fontSize: '13px', textAlign: 'center' }}>QTY</th>
            <th style={{ padding: '16px', fontWeight: 700, color: '#475569', fontSize: '13px', textAlign: 'right' }}>PRICE</th>
            <th style={{ padding: '16px', fontWeight: 700, color: '#475569', fontSize: '13px', textAlign: 'right' }}>TOTAL</th>
            <th style={{ padding: '16px' }}></th>
          </tr>
        </thead>
        <tbody>
          {cartEntries.map(([id, c]: any) => (
            <tr key={id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  <LazyImage src={c.item.image} alt={c.item.name} fill={true} isNextImage={true} sizes="48px" style={{ objectFit: 'cover' }} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{c.item.name}</h4>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{c.item.category}</span>
                </div>
              </td>
              <td style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px' }}>
                  <button onClick={() => updateCartQty(id, c.qty - 1)} style={{ width: '24px', height: '24px', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>-</button>
                  <span style={{ width: '24px', textAlign: 'center', fontSize: '13px', fontWeight: 700 }}>{c.qty}</span>
                  <button onClick={() => updateCartQty(id, c.qty + 1)} style={{ width: '24px', height: '24px', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>+</button>
                </div>
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', color: '#475569' }}>
                ₹{c.price}
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                ₹{c.price * c.qty}
              </td>
              <td style={{ padding: '16px', textAlign: 'right' }}>
                <button onClick={() => updateCartQty(id, 0)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
