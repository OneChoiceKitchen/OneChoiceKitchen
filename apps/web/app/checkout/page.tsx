'use client';
import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@org/ui-design-system';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ShoppingCart from '../components/ShoppingCart';
import CheckoutFlow from '../components/CheckoutFlow';
import { Button } from '@org/ui-design-system';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, setCart } = useGlobalContext();
  const [orderComplete, setOrderComplete] = useState(false);

  const cartItems = Object.values(cart || {});
  const subtotal = cartItems.reduce((acc: number, current: any) => acc + (current.item.price * current.qty), 0);

  const updateCartQty = (id: string, qty: number) => {
    setCart((prev: any) => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return {
        ...prev,
        [id]: {
          ...prev[id],
          qty
        }
      };
    });
  };

  if (orderComplete) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <Card style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '2rem' }}>
          <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 1.5rem auto' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Order Confirmed!</h1>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            Thank you for ordering with One Choice Kitchen. Your order has been placed.
          </p>
          <Button variant="primary" onClick={() => router.push('/menu')} style={{ width: '100%' }}>
            Return to Menu
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '2rem 1.5rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <button 
          onClick={() => router.back()} 
          style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 600 }}
        >
          <ArrowLeft size={20} /> Back to Menu
        </button>
        
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem' }}>Checkout</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Card>
            <CardHeader>
              <CardTitle>Your Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <ShoppingCart cart={cart} updateCartQty={updateCartQty} />
            </CardContent>
          </Card>

          {Object.keys(cart || {}).length > 0 && (
            <CheckoutFlow 
              cart={cart} 
              subtotal={subtotal} 
              onOrderComplete={() => {
                setOrderComplete(true);
                setCart({});
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
