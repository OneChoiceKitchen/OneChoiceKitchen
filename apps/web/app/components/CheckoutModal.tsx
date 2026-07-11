import { useState } from 'react';
import { X, User, Phone, MapPin, Plus, Trash2, Info, Tag, ShieldCheck, Clock, CheckCircle, Lock, Crosshair, ChevronDown, Leaf, Headphones } from 'lucide-react';
import LazyImage from './LazyImage';
import { useToast } from '@org/ui-design-system';

export default function CheckoutModal({
  checkoutType,
  selectedTiffinPlan,
  setSelectedTiffinPlan,
  custName, setCustName,
  custPhone, setCustPhone,
  custAddress, setCustAddress,
  custDistance, setCustDistance,
  cart,
  subtotal,
  gstTax,
  deliveryFee,
  deliveryDiscount,
  couponDiscount,
  appliedCoupon,
  updateCartQty,
  grandTotal,
  loading,
  handlePlaceOrder,
  setCheckoutModalOpen,
  styles,
  minOrderValue = 0,
  allowCOD = true
}: any) {
  
  const [showSavedLocations, setShowSavedLocations] = useState(false);
  const [errors, setErrors] = useState<{name?: string, phone?: string, address?: string}>({});
  const [isLocating, setIsLocating] = useState(false);
  const [landmark, setLandmark] = useState('');
  const [cookingInstructions, setCookingInstructions] = useState('');
  const toast = useToast();

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
          setCustAddress(data.display_name);
          setCustDistance("1.5");
          setErrors(prev => ({...prev, address: undefined}));
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

  const validateAndPlaceOrder = () => {
    const newErrors: any = {};
    if (!isLoggedIn) {
      if (!custName || custName.trim().length < 2) newErrors.name = "Please enter a valid name";
      if (!custPhone || !/^\d{10}$/.test(custPhone)) newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    if (!custAddress || custAddress.trim().length < 10) newErrors.address = "Please enter a complete delivery address";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check for out of stock / unavailable items
    const unavailableItems = Object.values(cart || {}).filter((c: any) => 
      c.item && (c.item.isActive === false || c.item.inStock === false || c.item.available === false)
    );
    if (unavailableItems.length > 0) {
      toast.error('Some items in your cart are no longer available. Please review your cart.');
      return;
    }

    setErrors({});
    handlePlaceOrder();
  };
  const isLoggedIn = true; // Hardcoded to demonstrate logged-in location history
  
  const savedLocations = [
    { id: 1, type: 'Home', address: 'House No. 123, Abhiyanta Nagar, Near Madhuban Colony, Patna, Bihar 800027', distance: 2.3 },
    { id: 2, type: 'Work', address: 'Tech Park, Building 4, Boring Road, Patna, Bihar 800001', distance: 4.5 },
    { id: 3, type: 'Friend', address: 'B-402, Kankarbagh Apartments, Patna, Bihar 800020', distance: 1.8 }
  ];

  const handleSelectLocation = (loc: any) => {
    setCustAddress(loc.address);
    setCustDistance(loc.distance.toString());
    setShowSavedLocations(false);
  };

  const freeDeliveryThreshold = 1500;
  const amountAway = freeDeliveryThreshold - subtotal;
  const progressPercent = Math.min((subtotal / freeDeliveryThreshold) * 100, 100);
  const totalCartItems = Object.values(cart || {}).reduce<number>((sum, current: any) => sum + (current?.qty || 0), 0);

  const isBelowMinOrder = subtotal < minOrderValue;

  return (
    <div className={styles.modalOverlay} onClick={() => setCheckoutModalOpen(false)}>
      <style dangerouslySetInnerHTML={{__html: `
        .chk-container { flex-direction: row; }
        .chk-right { width: 450px; }
        .chk-left { overflow-y: auto; border-right: 1px solid #f1f5f9; }
        @media (max-width: 900px) {
          .chk-container { flex-direction: column !important; overflow-y: auto !important; }
          .chk-left { overflow-y: visible !important; border-right: none !important; border-bottom: 1px solid #f1f5f9; }
          .chk-right { width: 100% !important; overflow-y: visible !important; }
        }
      `}} />
      <div 
        style={{ 
          background: 'white', 
          width: '95%', 
          maxWidth: '1100px', 
          height: '90vh', 
          maxHeight: '900px', 
          borderRadius: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden', 
          position: 'relative' 
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>🛍️</span>
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Complete Your Order</h2>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Almost there! Please fill in your details.</p>
            </div>
          </div>
          <button 
            onClick={() => setCheckoutModalOpen(false)}
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* 2-Column Layout */}
        <div className="chk-container" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* LEFT COLUMN: Details */}
          <div className="chk-left" style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {!isLoggedIn && (
              <>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Full Name</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <User size={18} color="#DC2626" style={{ position: 'absolute', left: '16px' }} />
                      <input type="text" value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="Rahul Kumar" style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600, color: '#0f172a', outlineColor: '#DC2626' }} />
                      {custName.length > 2 && <CheckCircle size={16} color="#16a34a" style={{ position: 'absolute', right: '16px' }} />}
                    </div>
                    {errors.name && <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Phone Number</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Phone size={18} color="#DC2626" style={{ position: 'absolute', left: '16px' }} />
                      <input type="tel" value={custPhone} onChange={(e) => setCustPhone(e.target.value)} placeholder="9876543210" style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600, color: '#0f172a', outlineColor: '#DC2626' }} />
                      {custPhone.length >= 10 && <CheckCircle size={16} color="#16a34a" style={{ position: 'absolute', right: '16px' }} />}
                    </div>
                    {errors.phone && <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
                  </div>
                </div>
              </>
            )}
              <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Distance</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <MapPin size={18} color="#DC2626" style={{ position: 'absolute', left: '16px' }} />
                    <input type="text" value={`${custDistance} km`} readOnly style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600, color: '#0f172a', outlineColor: '#DC2626', background: '#f8fafc' }} />
                    <span style={{ position: 'absolute', right: '12px', background: '#dcfce7', color: '#16a34a', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800 }}>Auto-calculated</span>
                  </div>
                </div>
              </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Delivery Address</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <MapPin size={18} color="#DC2626" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                <textarea 
                  value={custAddress} 
                  onChange={(e) => setCustAddress(e.target.value)} 
                  placeholder="House No. 123, Abhiyanta Nagar..." 
                  style={{ width: '100%', padding: '16px 48px 16px 48px', borderRadius: '12px', border: '1px solid #DC2626', fontSize: '14px', fontWeight: 600, color: '#0f172a', outlineColor: '#DC2626', resize: 'none', height: '70px', lineHeight: 1.5 }} 
                />
                <button onClick={() => setCustAddress('')} style={{ position: 'absolute', right: '16px', top: '16px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={12} color="#64748b" />
                </button>
              </div>
              {errors.address && <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.address}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Landmark (Optional)</label>
              <input 
                type="text" 
                value={landmark} 
                onChange={(e) => setLandmark(e.target.value)} 
                placeholder="e.g. Near SBI Bank, Apollo Hospital" 
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600, color: '#0f172a', outlineColor: '#DC2626' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Cooking Instructions (Optional)</label>
              <textarea 
                value={cookingInstructions} 
                onChange={(e) => setCookingInstructions(e.target.value)} 
                placeholder="e.g. Less spicy, no onion, extra gravy..." 
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600, color: '#0f172a', outlineColor: '#DC2626', resize: 'none', height: '70px', lineHeight: 1.5 }} 
              />
            </div>

            {/* Change Location / Saved History Banner */}
            <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '16px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Clock size={20} color="#DC2626" />
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#DC2626', margin: '0 0 4px 0' }}>We deliver to your location</h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Estimated delivery time: 25-30 mins</span>
                  </div>
                </div>
                <button onClick={() => setShowSavedLocations(!showSavedLocations)} style={{ background: 'transparent', border: 'none', color: '#DC2626', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Select on Map (Optional)</h4>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Drag the pin to adjust your exact location</span>
                </div>
                <button onClick={handleLocateMe} disabled={isLocating} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 800, color: '#0f172a', cursor: isLocating ? 'not-allowed' : 'pointer', opacity: isLocating ? 0.7 : 1 }}>
                  <Crosshair size={14} color="#3b82f6" /> {isLocating ? 'Locating...' : 'Locate Me'}
                </button>
              </div>
              <div style={{ width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0' }}>
                <LazyImage src="/map_placeholder.png" alt="Map" fill={true} style={{ objectFit: 'cover' }} isNextImage={false} />
              </div>
            </div>

            {/* Safe Delivery Banner */}
            <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
              <ShieldCheck size={20} color="#16a34a" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>We assure safe & contactless delivery to your doorstep.</span>
            </div>
            
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="chk-right" style={{ background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Order Summary</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{totalCartItems} items</span>
              </div>
              <button 
                onClick={() => setCheckoutModalOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #fee2e2', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 800, color: '#DC2626', cursor: 'pointer' }}
              >
                <Plus size={14} /> Add More
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '24px' }}>
                {Object.entries(cart || {}).map(([id, c]: any) => (
                  <div key={id} style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                      <LazyImage src={c.item.image} alt={c.item.name} fill={true} isNextImage={true} sizes="60px" style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <div style={{ width: '10px', height: '10px', border: c.item.diet === 'VEG' ? '1px solid #16a34a' : '1px solid #DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px' }}>
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: c.item.diet === 'VEG' ? '#16a34a' : '#DC2626' }}></div>
                        </div>
                        <span style={{ fontSize: '9px', fontWeight: 800, color: c.item.diet === 'VEG' ? '#16a34a' : '#DC2626', background: c.item.diet === 'VEG' ? '#f0fdf4' : '#fef2f2', padding: '2px 4px', borderRadius: '4px' }}>{c.item.diet}</span>
                      </div>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', lineHeight: 1.3 }}>{c.item.name}</h4>
                      <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px' }}>
                        {c.item.spiceLevel === 'SPICY' ? 'Extra Spicy' : c.item.spiceLevel === 'MILD' ? 'Mild Spiced' : 'Medium Spiced'}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#DC2626' }}>₹{c.item.price * c.qty}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '2px' }}>
                        <button onClick={() => updateCartQty(id, c.qty - 1)} style={{ width: '24px', height: '24px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#0f172a', fontWeight: 800, fontSize: '14px' }}>-</button>
                        <span style={{ width: '20px', textAlign: 'center', fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>{c.qty}</span>
                        <button onClick={() => updateCartQty(id, c.qty + 1)} style={{ width: '24px', height: '24px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#0f172a', fontWeight: 800, fontSize: '14px' }}>+</button>
                      </div>
                      <button onClick={() => updateCartQty(id, 0)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={14} color="#94a3b8" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Applied Coupon Banner */}
              {appliedCoupon && (
                <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px dashed #bbf7d0', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <Tag size={16} color="#16a34a" fill="#dcfce7" style={{ marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>{appliedCoupon.code} applied</div>
                      <div style={{ fontSize: '11px', color: '#15803d', marginTop: '2px' }}>You saved ₹{couponDiscount}</div>
                    </div>
                  </div>
                  <button onClick={() => {}} style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', background: 'transparent', border: 'none', cursor: 'pointer' }}>Remove</button>
                </div>
              )}

              {/* Bill Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Item Total ({totalCartItems} items)</span>
                  <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>₹{subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>Taxes & Fees <Info size={12} /></span>
                  <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>₹{gstTax}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>Delivery Fee ({custDistance} km) <Info size={12} /></span>
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
                    <span style={{ fontSize: '13px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>Coupon ({appliedCoupon?.code}) <Tag size={12} /></span>
                    <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 700 }}>- ₹{couponDiscount}</span>
                  </div>
                )}
                
                <div style={{ borderTop: '1px dashed #cbd5e1', margin: '4px 0' }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', color: '#0f172a', fontWeight: 800 }}>To Pay</span>
                  <span style={{ fontSize: '20px', color: '#0f172a', fontWeight: 900 }}>₹{grandTotal}</span>
                </div>
              </div>
              
              {/* Warnings for COD and Min Order */}
              {isBelowMinOrder ? (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '13px', fontWeight: 600 }}>
                  Minimum order value for delivery is ₹{minOrderValue}. Your current item total is ₹{subtotal}. Please add more items.
                </div>
              ) : null}

              {!allowCOD ? (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '13px', fontWeight: 600 }}>
                  <strong>Pay on Delivery is disabled.</strong> Online Payment is required for this order.
                </div>
              ) : null}

              {/* Checkout Button */}
              <button 
                onClick={validateAndPlaceOrder}
                disabled={loading || isBelowMinOrder}
                style={{ width: '100%', background: (loading || isBelowMinOrder) ? '#cbd5e1' : '#DC2626', color: 'white', borderRadius: '12px', padding: '16px', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', cursor: (loading || isBelowMinOrder) ? 'not-allowed' : 'pointer', boxShadow: (loading || isBelowMinOrder) ? 'none' : '0 4px 15px rgba(239,68,68,0.3)', transition: 'transform 0.2s', marginBottom: '24px' }}
              >
                {loading ? (
                  <span style={{ fontSize: '16px', fontWeight: 800 }}>Processing...</span>
                ) : (
                  <>
                    <span style={{ fontSize: '16px', fontWeight: 800 }}>
                      {allowCOD ? 'Place Order Securely' : 'Pay Now'}
                    </span>
                    <Lock size={18} />
                  </>
                )}
              </button>

              {/* Free Delivery Banner */}
              <div style={{ background: '#fff5f5', borderRadius: '12px', padding: '16px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px', color: '#DC2626' }}>🛵</span>
                  <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: 600 }}>
                    {amountAway > 0 ? (
                      <>You're <span style={{ fontWeight: 800 }}>₹{amountAway}</span> away from FREE delivery!</>
                    ) : (
                      <><span style={{ fontWeight: 800, color: '#16a34a' }}>Yay!</span> You get FREE delivery!</>
                    )}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: '4px', background: '#fee2e2', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progressPercent}%`, background: '#16a34a', borderRadius: '2px' }}></div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#16a34a' }}>₹{subtotal} <span style={{ color: '#94a3b8', fontWeight: 600 }}>/ ₹{freeDeliveryThreshold}</span></span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Trust Badges */}
        <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#fef2f2', padding: '8px', borderRadius: '50%' }}><ShieldCheck size={20} color="#DC2626" /></div>
            <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: 700, lineHeight: 1.2 }}>100% Safe<br/>Payments</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#fff7ed', padding: '8px', borderRadius: '50%' }}><Clock size={20} color="#f97316" /></div>
            <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: 700, lineHeight: 1.2 }}>On-time<br/>Delivery</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '50%' }}><Leaf size={20} color="#16a34a" /></div>
            <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: 700, lineHeight: 1.2 }}>Fresh & Hygienic<br/>Food</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#f5f3ff', padding: '8px', borderRadius: '50%' }}><Headphones size={20} color="#8b5cf6" /></div>
            <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: 700, lineHeight: 1.2 }}>24/7 Customer<br/>Support</span>
          </div>
        </div>

      </div>
    </div>
  );
}
