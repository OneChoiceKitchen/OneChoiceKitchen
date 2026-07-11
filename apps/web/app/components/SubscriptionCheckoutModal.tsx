'use client';
import { useState, FormEvent, useEffect } from 'react';
import { X, CheckCircle, Info, User, Phone, MapPin, Clock, Crosshair, ChevronDown, ShieldCheck, Ticket, Percent, ChevronUp, Tag } from 'lucide-react';
import LazyImage from './LazyImage';
import { useToast } from '@org/ui-design-system';

interface TiffinPlan {
  id: string;
  name: string;
  dietType: string;
  monthlyPrice: number;
}

interface SubscriptionCheckoutModalProps {
  plan: TiffinPlan;
  onClose: () => void;
  custDistance: string;
  setCustDistance: (dist: string) => void;
}

export default function SubscriptionCheckoutModal({ plan, onClose, custDistance, setCustDistance }: SubscriptionCheckoutModalProps) {
  const [step, setStep] = useState(1);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [deliverySettings, setDeliverySettings] = useState<any>(null);
  const [showSavedLocations, setShowSavedLocations] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const isLoggedIn = true; // Hardcoded to demonstrate logged-in location history
  const toast = useToast();

  const savedLocations = [
    { id: 1, type: 'Home', address: 'House No. 123, Abhiyanta Nagar, Near Madhuban Colony, Patna, Bihar 800027', distance: 2.3 },
    { id: 2, type: 'Work', address: 'Tech Park, Building 4, Boring Road, Patna, Bihar 800001', distance: 4.5 },
    { id: 3, type: 'Friend', address: 'B-402, Kankarbagh Apartments, Patna, Bihar 800020', distance: 1.8 }
  ];

  const handleSelectLocation = (loc: any) => {
    setFormData({...formData, address: loc.address});
    setCustDistance(loc.distance.toString());
    setShowSavedLocations(false);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        if (data && data.display_name) {
          setFormData({...formData, address: data.display_name});
          setCustDistance("1.5");
        } else {
          toast.error('Could not fetch address details.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching location details.');
      } finally {
        setIsLocating(false);
      }
    }, () => {
      toast.error('Unable to retrieve your location. Please check your browser permissions.');
      setIsLocating(false);
    });
  };


  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryType: 'DELIVERY' // DELIVERY or PICKUP
  });

  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/tiffin/offers/all')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data
            .filter((o: any) => o.isActive && o.appliesToTiffin)
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
      if (plan.monthlyPrice >= coupon.min) {
        setAppliedCoupon(coupon);
        setShowCoupons(false);
      } else {
        toast.warning(`This coupon requires a minimum order of ₹${coupon.min}`);
      }
    } else {
      if (code.length >= 4) {
        setAppliedCoupon({ code: code.toUpperCase(), desc: 'Special Promo Applied', discount: 30, min: 0 });
        setShowCoupons(false);
      } else {
        toast.error('Invalid coupon code.');
      }
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Fetch Delivery Settings
  useEffect(() => {
    fetch('/api/delivery-settings')
      .then(res => res.json())
      .then(data => {
        setDeliverySettings(data);
        setLoadingSettings(false);
      })
      .catch(() => setLoadingSettings(false));
  }, []);

  const deliveryDistance = Number(custDistance) || 2;
  const freeDeliveryDistance = deliverySettings?.freeDeliveryDistance ?? 3;
  const perKmCharge = deliverySettings?.perKmCharge ?? 8;
  const deliveryFee = formData.deliveryType === 'DELIVERY' && deliveryDistance > freeDeliveryDistance 
    ? (deliveryDistance - freeDeliveryDistance) * perKmCharge 
    : 0;

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.isPercentage) {
      couponDiscount = (plan.monthlyPrice * appliedCoupon.percent) / 100;
      if (appliedCoupon.maxLimit && couponDiscount > appliedCoupon.maxLimit) {
        couponDiscount = appliedCoupon.maxLimit;
      }
    } else {
      couponDiscount = appliedCoupon.discount || 0;
    }
  }

  const totalMonthlyPrice = plan.monthlyPrice + deliveryFee - couponDiscount;

  const minOrderValue = deliverySettings?.minimumOrderValue || 0;
  const allowCOD = deliverySettings?.allowPayOnDelivery ?? true;

  const isBelowMinOrder = totalMonthlyPrice < minOrderValue;


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep(2); // Move to success step
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Subscription Checkout</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem', overflowY: 'auto', maxHeight: '80vh' }}>
          {step === 1 ? (
            <form onSubmit={handleSubmit}>
              
              {/* Plan Summary */}
              <div style={{ background: plan.dietType === 'VEG' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${plan.dietType === 'VEG' ? '#bbf7d0' : '#fecaca'}`, borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: plan.dietType === 'VEG' ? '#166534' : '#991b1b' }}>
                  {plan.dietType} - {plan.name}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', color: '#64748b' }}>Plan Price</span>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#0f172a' }}>₹{plan.monthlyPrice}</span>
                </div>
                {formData.deliveryType === 'DELIVERY' && deliveryFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Delivery Fee ({deliveryDistance} km)</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f172a' }}>₹{deliveryFee}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#16a34a' }}>Coupon ({appliedCoupon.code})</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#16a34a' }}>- ₹{couponDiscount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: `1px dashed ${plan.dietType === 'VEG' ? '#bbf7d0' : '#fecaca'}` }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a' }}>Total Monthly</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>
                    ₹{totalMonthlyPrice} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'normal' }}>/ month</span>
                  </div>
                </div>
              </div>

              {/* Coupons Section */}
              <div style={{ marginBottom: '1.5rem' }}>
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
                      <button type="button" onClick={removeCoupon} style={{ fontSize: '12px', fontWeight: 800, color: '#DC2626', background: 'transparent', border: 'none', cursor: 'pointer' }}>REMOVE</button>
                    </div>
                  ) : (
                    // Select Coupon State
                    <div>
                      <button 
                        type="button"
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
                              type="button"
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
                                  type="button"
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

              {!isLoggedIn && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="Enter your full name" />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>Phone Number</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="Enter your 10-digit number" />
                  </div>
                </>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>Preference</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="pref" checked={formData.deliveryType === 'DELIVERY'} onChange={() => setFormData({...formData, deliveryType: 'DELIVERY'})} />
                    Home Delivery
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="pref" checked={formData.deliveryType === 'PICKUP'} onChange={() => setFormData({...formData, deliveryType: 'PICKUP'})} />
                    Shop Pickup (5% Off)
                  </label>
                </div>
              </div>

              {formData.deliveryType === 'DELIVERY' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>Delivery Address</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <MapPin size={18} color="#DC2626" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <textarea 
                      required 
                      rows={3} 
                      value={formData.address} 
                      onChange={e => setFormData({...formData, address: e.target.value})} 
                      style={{ width: '100%', padding: '16px 48px 16px 48px', borderRadius: '12px', border: '1px solid #DC2626', fontSize: '14px', fontWeight: 600, color: '#0f172a', outlineColor: '#DC2626', resize: 'none', height: '70px', lineHeight: 1.5 }} 
                      placeholder="Enter your full address" 
                    />
                    <button type="button" onClick={() => setFormData({...formData, address: ''})} style={{ position: 'absolute', right: '16px', top: '16px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <X size={12} color="#64748b" />
                    </button>
                  </div>

                  {/* Change Location / Saved History Banner */}
                  <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '16px', position: 'relative', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <Clock size={20} color="#DC2626" />
                        <div>
                          <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#DC2626', margin: '0 0 4px 0' }}>We deliver to your location</h4>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Estimated delivery time: 25-30 mins</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => setShowSavedLocations(!showSavedLocations)} style={{ background: 'transparent', border: 'none', color: '#DC2626', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Change Location <ChevronDown size={14} />
                      </button>
                    </div>
                    
                    {/* Saved Locations Dropdown Area */}
                    {isLoggedIn && showSavedLocations && (
                      <div style={{ marginTop: '16px', borderTop: '1px solid #fca5a5', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>Saved Locations</div>
                        {savedLocations.map(loc => (
                          <div key={loc.id} onClick={() => handleSelectLocation(loc)} style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <MapPin size={16} color="#DC2626" />
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{loc.type}</div>
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{loc.address}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Map Section */}
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Select on Map (Optional)</h4>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Drag the pin to adjust your exact location</span>
                      </div>
                      <button type="button" onClick={handleLocateMe} disabled={isLocating} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 800, color: '#0f172a', cursor: isLocating ? 'not-allowed' : 'pointer', opacity: isLocating ? 0.7 : 1 }}>
                        <Crosshair size={14} color="#3b82f6" /> {isLocating ? 'Locating...' : 'Locate Me'}
                      </button>
                    </div>
                    <div style={{ width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0' }}>
                      <LazyImage src="/map_placeholder.png" alt="Map" fill={true} style={{ objectFit: 'cover' }} isNextImage={false} />
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Distance</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input type="text" value={`${custDistance} km`} readOnly style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600, color: '#0f172a', background: '#f8fafc' }} />
                        <span style={{ position: 'absolute', right: '12px', background: '#dcfce7', color: '#16a34a', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>Auto-calculated</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginTop: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>
                    <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Free delivery up to {freeDeliveryDistance} KM. ₹{perKmCharge} per additional KM thereafter. (Determined by delivery settings)</span>
                  </div>
                </div>
              )}

              {isBelowMinOrder ? (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  The minimum order value for delivery is ₹{minOrderValue}. Your total is ₹{totalMonthlyPrice}. Please add more items or choose pickup.
                </div>
              ) : null}

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: 600 }}>
                <ShieldCheck size={20} color="#16a34a" />
                We assure safe & contactless delivery to your building.
              </div>

              <button 
                type="submit" 
                disabled={isBelowMinOrder}
                style={{ width: '100%', padding: '1rem', background: isBelowMinOrder ? '#cbd5e1' : '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: isBelowMinOrder ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
              >
                {allowCOD ? 'Confirm Subscription (Pay on Delivery)' : 'Pay Now'}
              </button>

            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle size={64} color="#22c55e" style={{ margin: '0 auto 1.5rem auto' }} />
              <h3 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', color: '#0f172a' }}>Subscription Confirmed!</h3>
              <p style={{ color: '#475569', marginBottom: '2rem', lineHeight: '1.6' }}>
                Thank you, {formData.name}! Your request for the <strong>{plan.dietType} - {plan.name}</strong> has been received. Our team will contact you at {formData.phone} shortly to finalize the delivery details.
              </p>
              <button onClick={onClose} style={{ padding: '0.75rem 2rem', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
