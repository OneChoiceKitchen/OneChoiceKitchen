'use client';
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ClearCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAndAdd: () => void;
}

export default function ClearCartModal({ isOpen, onClose, onClearAndAdd }: ClearCartModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={24} color="#dc2626" />
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#94a3b8' }}>
              <X size={20} />
            </button>
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Replace cart items?</h3>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Your cart contains dishes from another restaurant. Do you want to discard the selection and add dishes from this restaurant?
          </p>
        </div>
        <div style={{ padding: '16px 24px', background: '#f8fafc', display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0' }}>
          <button 
            onClick={onClose}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
          >
            No, cancel
          </button>
          <button 
            onClick={onClearAndAdd}
            style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, cursor: 'pointer' }}
          >
            Yes, replace
          </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
