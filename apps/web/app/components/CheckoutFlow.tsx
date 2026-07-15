'use client';
import React, { useState } from 'react';
import { useToast } from '@org/ui-design-system';
import PromoCodeInput from './PromoCodeInput';

export default function CheckoutFlow({ cart, subtotal, onOrderComplete }: any) {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const toast = useToast();

  const handleApplyPromo = (code: string, discount: number) => {
    setPromoCode(code);
    setDiscountAmount(discount);
    toast.success(`Promo code applied! Saved ₹${discount}`);
  };

  const handleRemovePromo = () => {
    setPromoCode(null);
    setDiscountAmount(0);
  };

  const handleCheckout = async () => {
    if (!address) {
      toast.error('Please enter a delivery address');
      return;
    }

    setLoading(true);

    try {
      // Transforming cart into the expected CreateOrderDto shape
      const items = Object.values(cart).map((c: any) => ({
        menuItemId: c.item.id,
        quantity: c.qty,
        price: c.price,
        customizations: c.customizations ? JSON.stringify(c.customizations) : undefined,
      }));

      const orderData = {
        serviceType: 'FOOD_ORDERING',
        deliveryAddress: address,
        paymentMethod,
        promoCode: promoCode || undefined,
        items,
      };

      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to place order');
      }

      toast.success('Order placed successfully!');
      onOrderComplete();
    } catch (e: any) {
      toast.error(e.message || 'Error processing checkout');
    } finally {
      setLoading(false);
    }
  };

  if (Object.keys(cart || {}).length === 0) return null;

  const finalTotal = Math.max(0, subtotal - discountAmount);
  // Get tenantId from first item in cart
  const firstCartItem = Object.values(cart)[0] as any;
  const tenantId = firstCartItem?.item?.tenantId;

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '24px' }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>Checkout Details</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Delivery Address</label>
        <textarea 
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter complete address..."
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical', minHeight: '80px' }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Payment Method</label>
        <select 
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white' }}
        >
          <option value="ONLINE">Pay Online (Card/UPI)</option>
          <option value="COD">Cash on Delivery</option>
        </select>
      </div>

      {tenantId && (
        <PromoCodeInput
          tenantId={tenantId}
          cartTotal={subtotal}
          onApply={handleApplyPromo}
          onRemove={handleRemovePromo}
          appliedCode={promoCode}
          discountAmount={discountAmount}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '16px' }}>
        <div>
          <span style={{ display: 'block', fontSize: '13px', color: '#64748b' }}>Total to Pay</span>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>₹{finalTotal}</span>
        </div>
        
        <button 
          onClick={handleCheckout}
          disabled={loading}
          style={{ 
            background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', 
            borderRadius: '8px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          {loading ? (
            <>
              <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              Processing...
            </>
          ) : (
            'Place Order'
          )}
        </button>
      </div>
    </div>
  );
}
