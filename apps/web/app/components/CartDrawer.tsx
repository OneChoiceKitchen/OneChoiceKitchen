import { useState, useEffect } from 'react';
import { X, Trash2, Info, ArrowRight, ShieldCheck, Clock, CheckCircle, RotateCcw, Tag, ChevronDown, ChevronUp, Ticket, Percent } from 'lucide-react';
import LazyImage from './LazyImage';
import { useToast } from '@org/ui-design-system';
import { useRouter } from 'next/navigation';

export default function CartDrawer({
  cart,
  totalCartItems,
  subtotal,
  gstTax,
  deliveryFee,
  deliveryDiscount,
  couponDiscount,
  appliedCoupon,
  setAppliedCoupon,
  setCartDrawerOpen,
  updateCartQty,
  setCheckoutType,
  setCheckoutModalOpen,
  styles
}: any) {
  
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const toast = useToast();
  const router = useRouter();

  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/tiffin/offers/all')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data
            .filter((o: any) => o.isActive && o.appliesToMenu)
            .map((o: any) => ({
              code: o.title.replace(/\s+/g, '').toUpperCase().substring(0, 15),
              desc: o.description || o.title,
              discount: 0,
              isPercentage: true,
              percent: o.discountPct,
              min: o.minBookings || 0
            }));
          setAvailableCoupons(mapped);
        }
      })
      .catch(e => console.error('Error fetching offers:', e));
  }, []);

  const handleApplyCoupon = (code: string) => {
    const coupon = availableCoupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (coupon) {
      if (subtotal >= coupon.min) {
        setAppliedCoupon(coupon);
        setShowCoupons(false);
      } else {
        toast.warning(`This coupon requires a minimum order of ₹${coupon.min}`);
      }
    } else {
      // Allow manual fallback coupons for testing
      if (code.length >= 4) {
        setAppliedCoupon({ code: code.toUpperCase(), desc: 'Special Promo Applied', discount: 30, min: 0 });
        setShowCoupons(false);
      } else {
        toast.warning('Please enter a valid coupon code');
      }
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  const freeDeliveryThreshold = 1500;
  const grandTotal = subtotal + gstTax + deliveryFee - deliveryDiscount - couponDiscount;
  const savings = deliveryDiscount + couponDiscount;

  const amountAway = freeDeliveryThreshold - subtotal;
  const progressPercent = Math.min((subtotal / freeDeliveryThreshold) * 100, 100);

  return (
    <div className={styles.cartOverlay} onClick={() => setCartDrawerOpen(false)}>
      <div className={styles.cartPanel} style={{ maxWidth: '450px', padding: '0', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>🛍️</span>
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Your Order</h2>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>{totalCartItems} items in your cart</p>
            </div>
          </div>
          <button 
            onClick={() => setCartDrawerOpen(false)}
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={18} color="#64748b" />
          </button>
        </div>

        {totalCartItems === 0 ? (
          <div className={styles.cartEmpty} style={{ flex: 1, justifyContent: 'center' }}>
            <span style={{ fontSize: '4rem' }}>🛒</span>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '1rem 0 0.5rem 0' }}>Your cart is empty</h3>
            <p style={{ margin: 0 }}>Add some delicious food to get started!</p>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            
            {/* Free Delivery Banner */}
            <div style={{ margin: '20px 24px 0 24px', background: '#fff5f5', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px', color: '#DC2626' }}>🛵</span>
                <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>
                  {amountAway > 0 ? (
                    <>You're <span style={{ fontWeight: 800 }}>₹{amountAway}</span> away from FREE delivery!</>
                  ) : (
                    <><span style={{ fontWeight: 800, color: '#16a34a' }}>Yay!</span> You get FREE delivery!</>
                  )}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '6px', background: '#fee2e2', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progressPercent}%`, background: '#DC2626', borderRadius: '3px', transition: 'width 0.3s' }}></div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626' }}>₹{subtotal} <span style={{ color: '#94a3b8', fontWeight: 600 }}>/ ₹{freeDeliveryThreshold}</span></span>
              </div>
            </div>

            {/* Cart Items */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {Object.entries(cart).map(([id, c]: any) => (
                <div key={id} style={{ display: 'flex', gap: '16px', opacity: (c.item.isActive === false || c.item.inStock === false || c.item.available === false) ? 0.5 : 1 }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '12px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                    <LazyImage src={c.item.image} alt={c.item.name} fill={true} isNextImage={true} sizes="70px" style={{ objectFit: 'cover' }} />
                    {(c.item.isActive === false || c.item.inStock === false || c.item.available === false) && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                        <span style={{ background: '#DC2626', color: 'white', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>OUT OF STOCK</span>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <div style={{ width: '12px', height: '12px', border: c.item.diet === 'VEG' ? '1px solid #16a34a' : '1px solid #DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.item.diet === 'VEG' ? '#16a34a' : '#DC2626' }}></div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: c.item.diet === 'VEG' ? '#16a34a' : '#DC2626', background: c.item.diet === 'VEG' ? '#f0fdf4' : '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>
                        {c.item.diet}
                      </span>
                    </div>
                    
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', lineHeight: 1.3 }}>{c.item.name}</h4>
                    {c.customizations && c.customizations.length > 0 && (
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {c.customizations.map((custom: any, idx: number) => (
                          <span key={idx}>
                            <span style={{ fontWeight: 600 }}>{custom.attributeName}:</span> {custom.options.map((o:any) => o.name).join(', ')}
                          </span>
                        ))}
                      </div>
                    )}
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#DC2626' }}>₹{c.price * c.qty}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '2px' }}>
                      <button onClick={() => updateCartQty(id, c.qty - 1)} style={{ width: '28px', height: '28px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#0f172a', fontWeight: 800, fontSize: '16px' }}>-</button>
                      <span style={{ width: '24px', textAlign: 'center', fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>{c.qty}</span>
                      <button onClick={() => updateCartQty(id, c.qty + 1)} style={{ width: '28px', height: '28px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#0f172a', fontWeight: 800, fontSize: '16px' }}>+</button>
                    </div>
                    <button onClick={() => updateCartQty(id, 0)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={16} color="#94a3b8" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupons Section */}
            <div style={{ padding: '0 24px 24px 24px' }}>
              <div style={{ border: '1px dashed #cbd5e1', borderRadius: '12px', overflow: 'hidden' }}>
                {/* Applied Coupon State */}
                {appliedCoupon ? (
                  <div style={{ padding: '16px', background: '#f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Percent size={16} color="white" />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a' }}>'{appliedCoupon.code}' applied</div>
                        <div style={{ fontSize: '11px', color: '#15803d' }}>{appliedCoupon.desc}</div>
                      </div>
                    </div>
                    <button onClick={removeCoupon} style={{ fontSize: '12px', fontWeight: 800, color: '#DC2626', background: 'transparent', border: 'none', cursor: 'pointer' }}>REMOVE</button>
                  </div>
                ) : (
                  // Select Coupon State
                  <div>
                    <button 
                      onClick={() => setShowCoupons(!showCoupons)}
                      style={{ width: '100%', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', border: 'none', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Ticket size={20} color="#0f172a" />
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Apply Coupon</span>
                      </div>
                      {showCoupons ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
                    </button>

                    {showCoupons && (
                      <div style={{ padding: '0 16px 16px 16px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
                          <input 
                            type="text" 
                            placeholder="Enter coupon code" 
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', textTransform: 'uppercase' }}
                          />
                          <button 
                            onClick={() => handleApplyCoupon(couponInput)}
                            style={{ padding: '0 16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Apply
                          </button>
                        </div>
                        
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available Offers</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {availableCoupons.map((coupon) => (
                            <div key={coupon.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>{coupon.code}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{coupon.desc}</div>
                              </div>
                              <button 
                                onClick={() => handleApplyCoupon(coupon.code)}
                                style={{ fontSize: '12px', fontWeight: 800, color: '#DC2626', background: '#fef2f2', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                              >
                                APPLY
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Savings Banner */}
            {savings > 0 && (
              <div style={{ margin: '0 24px 24px 24px', background: '#f0fdf4', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px dashed #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={16} color="#16a34a" fill="#dcfce7" />
                  <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>You saved <span style={{ fontWeight: 800 }}>₹{savings}</span> with this order</span>
                </div>
              </div>
            )}

            {/* Bill Details */}
            <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Item Total ({totalCartItems} items)</span>
                <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>Taxes & Fees <Info size={12} /></span>
                <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>₹{gstTax}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>Delivery Fee <Info size={12} /></span>
                <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>₹{deliveryFee}</span>
              </div>
              
              {deliveryDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>Delivery Discount <Tag size={12} /></span>
                  <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 700 }}>- ₹{deliveryDiscount}</span>
                </div>
              )}
              
              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>Coupon ({appliedCoupon.code}) <Tag size={12} /></span>
                  <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 700 }}>- ₹{couponDiscount}</span>
                </div>
              )}

              <div style={{ borderTop: '1px dashed #e2e8f0', margin: '8px 0' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', color: '#0f172a', fontWeight: 800 }}>To Pay</span>
                <span style={{ fontSize: '20px', color: '#0f172a', fontWeight: 900 }}>₹{grandTotal}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <div style={{ padding: '0 24px' }}>
              <button 
                onClick={() => {
                  setCartDrawerOpen(false);
                  router.push('/checkout');
                }}
                style={{ width: '100%', background: '#DC2626', color: 'white', borderRadius: '12px', padding: '16px', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 15px rgba(239,68,68,0.3)', transition: 'transform 0.2s' }}
              >
                <span style={{ fontSize: '16px', fontWeight: 800 }}>Checkout</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800 }}>₹{grandTotal}</span>
                  <ArrowRight size={20} />
                </div>
              </button>
            </div>

            {/* Trust Badges Footer */}
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', background: '#f8fafc', marginTop: '24px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={20} color="#DC2626" />
                <span style={{ fontSize: '9px', color: '#64748b', textAlign: 'center', lineHeight: 1.2 }}>100% Safe<br/>Payments</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Clock size={20} color="#DC2626" />
                <span style={{ fontSize: '9px', color: '#64748b', textAlign: 'center', lineHeight: 1.2 }}>On-time<br/>Delivery</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={20} color="#DC2626" />
                <span style={{ fontSize: '9px', color: '#64748b', textAlign: 'center', lineHeight: 1.2 }}>Hygienic<br/>Food</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <RotateCcw size={20} color="#DC2626" />
                <span style={{ fontSize: '9px', color: '#64748b', textAlign: 'center', lineHeight: 1.2 }}>Easy<br/>Returns</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
