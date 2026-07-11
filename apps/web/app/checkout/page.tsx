'use client';
import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { Button, Card, CardContent, CardHeader, CardTitle, CardFooter } from '@org/ui-design-system';
import { MapPin, Info, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, setCart, deliveryAddress, setDeliveryAddress, deliveryLocation } = useGlobalContext();
  
  const [addressLine1, setAddressLine1] = useState(deliveryAddress || '');
  const [landmark, setLandmark] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce((acc, current) => acc + (current.item.price * current.qty), 0);
  const deliveryFee = subtotal > 0 ? 40 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    // In a real app, this would send an API request to the backend to create an Order
    // and save the final address to the user's profile (Address table).
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Optional: save address back to context to persist it
    setDeliveryAddress(addressLine1);
    
    setOrderComplete(true);
    setCart({}); // clear cart
    setIsSubmitting(false);
  };

  if (orderComplete) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <Card style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '2rem' }}>
          <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 1.5rem auto' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Order Confirmed!</h1>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            Thank you for ordering with One Choice Kitchen. Your order will be delivered to <strong>{addressLine1}</strong> shortly.
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
          <ArrowLeft size={20} /> Back
        </button>
        
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem' }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', gridAutoFlow: 'row' }}>
          {/* Left Column: Form & Address */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <Card>
              <CardHeader>
                <CardTitle>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={24} color="#DC2626" />
                    Delivery Details
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {deliveryLocation ? (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '8px', color: '#166534', fontSize: '0.9rem' }}>
                    <strong>Map Location Captured:</strong> {deliveryLocation.lat.toFixed(4)}, {deliveryLocation.lng.toFixed(4)}
                  </div>
                ) : (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1rem', borderRadius: '8px', color: '#92400e', fontSize: '0.9rem' }}>
                    No exact map location selected. Delivery might be slightly delayed.
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Delivery Address (Edit if required)
                  </label>
                  <textarea 
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    rows={3}
                    placeholder="E.g. Flat 101, Building Name, Street..."
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Nearest Landmark
                  </label>
                  <input 
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="E.g. Near Apollo Hospital, Opp. SBI Bank..."
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem' }}
                  />
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Help our delivery partner locate you easily.</p>
                </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Info size={24} color="#3b82f6" />
                    Cooking Instructions
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea 
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={3}
                  placeholder="Any preferences? (e.g. Less spicy, Extra gravy, No onion/garlic)"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column (or bottom on mobile): Order Summary */}
          <div>
            <Card style={{ position: 'sticky', top: '2rem' }}>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <p style={{ color: '#64748b' }}>Your cart is empty.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {cartItems.map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{c.item.name}</p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Qty: {c.qty}</p>
                        </div>
                        <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>₹{c.item.price * c.qty}</p>
                      </div>
                    ))}
                    <div style={{ height: '1px', background: '#e2e8f0', margin: '0.5rem 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                      <span>Delivery Fee</span>
                      <span>₹{deliveryFee}</span>
                    </div>
                    <div style={{ height: '1px', background: '#e2e8f0', margin: '0.5rem 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="primary" 
                  style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} 
                  disabled={cartItems.length === 0 || !addressLine1 || isSubmitting}
                  onClick={handlePlaceOrder}
                >
                  {isSubmitting ? 'Processing...' : `Place Order (₹${total})`}
                </Button>
              </CardFooter>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
