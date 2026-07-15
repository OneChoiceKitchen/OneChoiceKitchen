import React, { useState } from 'react';
import axios from 'axios';

interface PromoCodeInputProps {
  tenantId: string;
  cartTotal: number;
  onApply: (promoCode: string, discountAmount: number) => void;
  onRemove: () => void;
  appliedCode?: string | null;
  discountAmount?: number;
}

export default function PromoCodeInput({ tenantId, cartTotal, onApply, onRemove, appliedCode, discountAmount }: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/promotions/validate', {
        code: code.trim(),
        tenantId,
        cartTotal
      });
      
      const { valid, discountAmount } = response.data;
      if (valid) {
        onApply(code.trim(), discountAmount);
        setCode('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid promo code');
    } finally {
      setLoading(false);
    }
  };

  if (appliedCode) {
    return (
      <div style={{
        padding: '12px',
        background: 'var(--brand-blue-lt, #eff6ff)',
        border: '1px dashed var(--brand-blue, #2563EB)',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '16px'
      }}>
        <div>
          <strong style={{ color: 'var(--brand-blue, #2563EB)' }}>{appliedCode.toUpperCase()}</strong> applied
          <div style={{ fontSize: '0.85rem', color: '#16a34a', marginTop: '4px', fontWeight: 600 }}>
            You saved ₹{discountAmount}
          </div>
        </div>
        <button 
          onClick={onRemove}
          style={{ 
            background: 'none', border: 'none', color: 'var(--brand-red, #DC2626)', 
            cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' 
          }}
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '16px' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
        Have a promo code?
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          placeholder="Enter code" 
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          style={{ 
            flex: 1, 
            padding: '10px 12px', 
            borderRadius: '8px', 
            border: '1px solid #cbd5e1',
            textTransform: 'uppercase'
          }}
        />
        <button 
          onClick={handleApply}
          disabled={loading || !code.trim()}
          style={{
            background: 'var(--brand-blue, #2563EB)',
            color: 'white',
            border: 'none',
            padding: '0 16px',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: loading || !code.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !code.trim() ? 0.7 : 1
          }}
        >
          {loading ? '...' : 'Apply'}
        </button>
      </div>
      {error && (
        <p style={{ color: 'var(--brand-red, #DC2626)', fontSize: '0.8rem', marginTop: '6px', fontWeight: 500 }}>
          {error}
        </p>
      )}
    </div>
  );
}
