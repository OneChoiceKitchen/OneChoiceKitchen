'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Menu, Star, ArrowRight, Settings, LogOut, FileText, HelpCircle, ChevronRight, CheckCircle, Heart } from 'lucide-react';
import { apiFetch, login, logout } from '../lib/api';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import TopSlider from './components/TopSlider';
import { BottomNav, NAV_ITEMS, NavItemConfig, useToast } from '@org/ui-design-system';

const MapWrapper = dynamic(() => import('./components/MapWrapper'), { ssr: false, loading: () => <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading Map...</div> });

const DineInTab = ({ loggedIn, onLogin, urlBranchId }: { loggedIn: boolean, onLogin: () => void, urlBranchId?: string | null }) => {
  const [bookingStep, setBookingStep] = useState('AVAILABILITY'); // AVAILABILITY, PREORDER, DEPOSIT, SUCCESS
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [formData, setFormData] = useState({ 
    restaurantId: '',
    branchId: '',
    date: '', 
    timeSlot: '', 
    partySize: 2 
  });
  const [qrScanning, setQrScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const toast = useToast();

  useEffect(() => {
    apiFetch('/branches/restaurants/all')
      .then(data => {
        if (Array.isArray(data)) {
          const filteredRestaurants = data.map(r => ({
            ...r,
            branches: r.branches?.filter((b: any) => b.isReservationEnabled) || []
          })).filter(r => r.branches.length > 0);

          setRestaurants(filteredRestaurants);
          
          // Auto select from URL parameter if passed via props, otherwise first available
          if (filteredRestaurants.length > 0) {
            let initialRestaurantId = filteredRestaurants[0].id;
            let initialBranchId = filteredRestaurants[0].branches[0]?.id || '';
            
            if (urlBranchId) {
              const rWithBranch = filteredRestaurants.find(r => r.branches.some((b: any) => b.id === urlBranchId));
              if (rWithBranch) {
                initialRestaurantId = rWithBranch.id;
                initialBranchId = urlBranchId;
              }
            }

            setFormData(prev => ({
              ...prev,
              restaurantId: initialRestaurantId,
              branchId: initialBranchId
            }));
          }
        }
      })
      .catch(console.error);
  }, []);

  const checkAvailability = async () => {
    if (!formData.restaurantId || !formData.branchId || !formData.date || !formData.timeSlot || !formData.partySize) {
      setErrorMsg("Please select location and fill all fields.");
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setBookingStep('PREORDER');
    }, 800);
  };

  const completeBooking = async () => {
    if (!loggedIn) {
      toast.warning('Please log in to confirm your booking.');
      onLogin();
      return;
    }
    if (!acceptedTerms) {
      setErrorMsg("You must accept the Terms and Conditions to proceed.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiFetch('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          restaurantId: formData.restaurantId,
          branchId: formData.branchId,
          date: new Date(formData.date).toISOString(),
          timeSlot: formData.timeSlot,
          partySize: formData.partySize,
          depositAmount: 500 - discount,
          couponCode: couponCode || undefined,
          specialRequests: ''
        })
      });
      setConfirmationCode((data as any).confirmationCode);
      setBookingStep('SUCCESS');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      // Stub for coupon API call
      // const res = await apiFetch(`/coupons/validate?code=${couponCode}`);
      // if (res.valid) setDiscount(res.discountAmount);
      if (couponCode.toUpperCase() === 'WELCOME50') {
        setDiscount(50);
        toast.success('Coupon applied! ₹50 discount.');
      } else {
        toast.error('Invalid coupon code.');
        setDiscount(0);
      }
    } catch (e) {
      toast.error('Error applying coupon.');
    }
  };

  const handleQrScan = () => {
    setQrScanning(true);
    setTimeout(() => {
      toast.success('Checked in successfully! Your pre-orders have been sent to the kitchen.');
      setQrScanning(false);
    }, 2000);;
  };

  return (
    <div style={{ paddingTop: '1rem', paddingBottom: '5rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #334155)', borderRadius: '16px', padding: '2rem 1.5rem', color: 'white', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Dine-in Experience</h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>Book your table instantly or scan to check in.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
        <button onClick={() => setBookingStep('AVAILABILITY')} style={{ flex: 1, background: bookingStep !== 'SUCCESS' ? '#0f172a' : 'white', color: bookingStep !== 'SUCCESS' ? 'white' : '#0f172a', padding: '1rem', borderRadius: '12px', fontWeight: 700, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}>
          <span style={{ fontSize: '1.5rem' }}>🍽️</span>
          <span>Book a Table</span>
        </button>
        <button onClick={handleQrScan} style={{ flex: 1, background: 'white', color: '#10b981', padding: '1rem', borderRadius: '12px', fontWeight: 700, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '1.5rem' }}>📷</span>
          <span>{qrScanning ? 'Scanning...' : 'Scan Table QR'}</span>
        </button>
      </div>

      {bookingStep === 'AVAILABILITY' && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', margin: '0 0.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} color="#2563EB" /> Find a Table
          </h3>
          
          {errorMsg && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem', border: '1px solid #fca5a5' }}>{errorMsg}</div>}
          
          <div style={{ height: '200px', marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <MapWrapper 
              userLocation={null} 
              branches={restaurants.flatMap(r => r.branches.map((b: any) => ({...b, restaurantName: r.name})))} 
              onBranchSelect={(id) => {
                const r = restaurants.find(r => r.branches.some((b: any) => b.id === id));
                if (r) setFormData({...formData, restaurantId: r.id, branchId: id});
              }}
              selectedBranchId={formData.branchId}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Select Location</label>
            <select 
              value={`${formData.restaurantId}|${formData.branchId}`}
              onChange={e => {
                const [rId, bId] = e.target.value.split('|');
                setFormData({...formData, restaurantId: rId, branchId: bId});
              }}
              style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '1rem', color: '#0f172a', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              <option value="|">-- Choose a branch --</option>
              {restaurants.map(r => (
                <optgroup key={r.id} label={r.name}>
                  {r.branches?.map((b: any) => (
                    <option key={b.id} value={`${r.id}|${b.id}`}>{b.name} - {b.address || b.city || 'Location unavailable'}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Time</label>
              <input type="time" value={formData.timeSlot} onChange={e => setFormData({...formData, timeSlot: e.target.value})} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} />
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Party Size</label>
            <input type="number" min="1" value={formData.partySize} onChange={e => setFormData({...formData, partySize: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} placeholder="Number of guests" />
          </div>

          <button onClick={checkAvailability} disabled={loading} style={{ width: '100%', background: '#0f172a', color: 'white', padding: '1rem', borderRadius: '12px', fontWeight: 700, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.2)' }}>
            {loading ? 'Checking...' : <>Continue <ArrowRight size={18} /></>}
          </button>
        </div>
      )}

      {bookingStep === 'PREORDER' && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', margin: '0 0.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Pre-order Food</h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>Your food will be ready exactly when you arrive!</p>
          <div style={{ border: '2px dashed #e2e8f0', padding: '2rem 1rem', textAlign: 'center', marginBottom: '1.5rem', borderRadius: '12px', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍲</div>
            Skip the wait by ordering now
          </div>
          <button onClick={() => setBookingStep('DEPOSIT')} style={{ width: '100%', background: '#2563EB', color: 'white', padding: '1rem', borderRadius: '12px', fontWeight: 700, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 84, 166, 0.2)' }}>Skip to Payment</button>
        </div>
      )}

      {bookingStep === 'DEPOSIT' && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', margin: '0 0.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Reservation Deposit</h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>To secure your table, we require a refundable deposit of <strong style={{ color: '#0f172a' }}>₹500</strong>.</p>
          
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#475569' }}>Date</span>
              <strong style={{ color: '#0f172a' }}>{formData.date}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#475569' }}>Time</span>
              <strong style={{ color: '#0f172a' }}>{formData.timeSlot}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#475569' }}>Guests</span>
              <strong style={{ color: '#0f172a' }}>{formData.partySize} People</strong>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: '#10b981' }}>
                <span>Discount Applied</span>
                <strong>-₹{discount}</strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>Total Deposit</span>
              <strong style={{ fontSize: '1.25rem', color: '#0f172a' }}>₹{500 - discount}</strong>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" placeholder="Coupon Code (e.g. WELCOME50)" value={couponCode} onChange={e => setCouponCode(e.target.value)} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} />
              <button onClick={handleApplyCoupon} style={{ background: '#0f172a', color: 'white', padding: '0 1rem', borderRadius: '12px', fontWeight: 600, border: 'none' }}>Apply</button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <input type="checkbox" id="terms" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} style={{ marginTop: '0.25rem', width: '1.1rem', height: '1.1rem' }} />
            <label htmlFor="terms" style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>
              I agree to the <a href="#" style={{ color: '#2563EB' }}>Terms and Conditions</a> and authorize payment for the reservation deposit.
            </label>
          </div>

          <button onClick={completeBooking} disabled={loading || !acceptedTerms} style={{ width: '100%', background: !acceptedTerms ? '#cbd5e1' : '#10b981', color: 'white', padding: '1rem', borderRadius: '12px', fontWeight: 700, border: 'none', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}>
            {loading ? 'Processing...' : `Pay ₹${500 - discount} & Confirm`}
          </button>
        </div>
      )}

      {bookingStep === 'SUCCESS' && (
        <div style={{ background: 'white', padding: '2.5rem 1.5rem', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', margin: '0 0.5rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', background: '#d1fae5', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <CheckCircle size={48} color="#10b981" />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Table Confirmed!</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>We've sent a confirmation via Email & WhatsApp.</p>
          
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px dashed #cbd5e1', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Confirmation Code</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563EB', letterSpacing: '2px' }}>{confirmationCode}</div>
          </div>
          
          <button onClick={() => setBookingStep('INIT')} style={{ width: '100%', background: '#f1f5f9', color: '#0f172a', padding: '1rem', borderRadius: '12px', fontWeight: 700, border: 'none' }}>Back to Home</button>
        </div>
      )}
    </div>
  );
};

import MobileSearchFilters from './components/MobileSearchFilters';
import MobileExploreSections from './components/MobileExploreSections';

const HomeTab = ({ setActiveTab, tiffins, loading }: { setActiveTab: any; tiffins: any[]; loading: boolean }) => {
  const todayDay = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];

  const WEEKLY = [
    { day: 'Mon', meal: 'Dal Makhani, Roti & Salad' },
    { day: 'Tue', meal: 'Rajma Masala, Aloo & Paratha' },
    { day: 'Wed', meal: 'Chole Masala, Veg Pulao & Roti' },
    { day: 'Thu', meal: 'Paneer Bhurji, Dal Tadka & Rice' },
    { day: 'Fri', meal: 'Palak Paneer & Paratha' },
    { day: 'Sat', meal: 'Kadhai Paneer, Pulao & Roti' },
    { day: 'Sun', meal: 'Shahi Paneer, Butter Roti & Kheer' },
  ];

  const OFFERS = [
    { title: 'First Order', discount: '50% OFF', code: 'WELCOME50', color: '#DC2626', bg: '#fef2f2' },
    { title: 'Weekend Deal', discount: '100 OFF', code: 'WEEKEND100', color: '#3b82f6', bg: '#eff6ff' },
    { title: 'Free Delivery', discount: '0 FEE', code: 'FREEDEL', color: '#10b981', bg: '#ecfdf5' },
  ];

  return (
    <>
      {/* Hero Banner */}
      <div style={{
        marginTop: '1.5rem',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        borderRadius: '20px',
        padding: '2rem 1.5rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 30px -8px rgba(15,23,42,0.4)',
      }}>
        <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '7rem', opacity: 0.06, lineHeight: 1 }}>🍽️</div>
        <div style={{ position: 'absolute', bottom: '-20px', left: '-10px', fontSize: '5rem', opacity: 0.05 }}>🥘</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: '#f87171', marginBottom: '0.75rem' }}>
            Premium Homestyle Food
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>
            Delicious Meals,<br />
            <span style={{ color: '#f87171' }}>Delivered Fresh.</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            Hygienic, flavorful meals — ready in 30 mins.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setActiveTab('menu')} style={{ flex: 1, background: 'linear-gradient(135deg, #DC2626, #dc2626)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.75rem', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}>
              Order Now
            </button>
            <button onClick={() => setActiveTab('tiffin')} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '0.75rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              Tiffin Plans
            </button>
          </div>
        </div>
      </div>

      {/* Service Quick Actions */}
      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0' }}>Our Services</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[
            { icon: '🛵', label: 'Food Delivery', sub: 'Order in 30 min', tab: 'menu' },
            { icon: '📅', label: 'Daily Tiffin', sub: 'Subscribe weekly', tab: 'tiffin' },
            { icon: '🍽️', label: 'Book a Table', sub: 'Dine-in booking', tab: 'dinein' },
            { icon: '🎉', label: 'Catering', sub: 'Events and parties', tab: 'menu' },
          ].map((svc, i) => (
            <div key={i} onClick={() => setActiveTab(svc.tab)} style={{ background: 'white', borderRadius: '16px', padding: '1.25rem 1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.6rem' }}>{svc.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>{svc.label}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>{svc.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Promotional Offers */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Today's Offers</h3>
          <button onClick={() => setActiveTab('menu')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>View All</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {OFFERS.map((o, i) => (
            <div key={i} style={{ background: o.bg, borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: o.color }}>{o.title}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{o.discount}</div>
              </div>
              <div style={{ background: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px dashed rgba(0,0,0,0.15)', fontWeight: 800, fontSize: '0.75rem', color: '#0f172a', letterSpacing: '0.5px' }}>
                {o.code}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Tiffin Preview */}
      <div style={{ marginTop: '2rem', background: '#0f172a', borderRadius: '20px', padding: '1.5rem', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34d399', marginBottom: '0.25rem' }}>TIFFIN PREVIEW</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>This Week</h3>
          </div>
          <button onClick={() => setActiveTab('tiffin')} style={{ background: '#34d399', color: '#0f172a', border: 'none', borderRadius: '10px', padding: '0.5rem 1rem', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}>Subscribe</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {WEEKLY.map(d => (
            <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: d.day === todayDay ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '0.6rem 0.85rem', border: d.day === todayDay ? '1px solid rgba(52,211,153,0.35)' : '1px solid transparent' }}>
              <span style={{ minWidth: '28px', fontWeight: 800, color: d.day === todayDay ? '#34d399' : '#475569', fontSize: '0.75rem' }}>{d.day}</span>
              <span style={{ color: d.day === todayDay ? 'white' : '#64748b', fontSize: '0.8rem', fontWeight: d.day === todayDay ? 600 : 400, flex: 1 }}>{d.meal}</span>
              {d.day === todayDay && <span style={{ background: '#34d399', color: '#0f172a', fontSize: '0.6rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '999px' }}>TODAY</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Popular Tiffin Plans from API */}
      {(loading || tiffins.length > 0) && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Popular Tiffin Plans</h3>
            <button onClick={() => setActiveTab('tiffin')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>See All</button>
          </div>
          {loading && <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Loading plans...</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tiffins.slice(0, 3).map((tiffin: any, idx: number) => (
              <div key={tiffin.id || idx} style={{ background: 'white', borderRadius: '16px', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', gap: '1rem', alignItems: 'center', border: '1px solid #f1f5f9' }}>
                <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', overflow: 'hidden', flexShrink: 0 }}>
                  {tiffin.image ? <img src={tiffin.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍲'}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{tiffin.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{tiffin.description || 'Daily fresh delivery'}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 900, color: '#2563EB', fontSize: '1rem' }}>Rs.{tiffin.price || tiffin.basePrice || '--'}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>per day</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust Bar */}
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingBottom: '1rem' }}>
        {[
          { icon: '🛡️', text: 'FSSAI Certified' },
          { icon: '🌿', text: 'No Preservatives' },
          { icon: '📦', text: 'Eco Packaging' },
          { icon: '📞', text: '24x7 Support' },
        ].map((t, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '1.1rem' }}>{t.icon}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>{t.text}</span>
          </div>
        ))}
      </div>
    </>
  );
};
const MenuTab = ({ setActiveTab }: { setActiveTab: any }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [collections, setCollections] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeSort, setActiveSort] = useState<string>('Relevance');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetch('/api/collections')
      .then(res => res.json())
      .then(data => setCollections(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!searchQuery && activeFilters.length === 0) {
      setSearchResults(null);
      return;
    }

    const fetchSearch = async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);
        if (activeFilters.length > 0) params.append('filters', activeFilters.join(','));
        if (activeSort) params.append('sort', activeSort);
        
        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilters, activeSort]);

  return (
    <>
      <div style={{ 
        marginTop: '1rem',
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        borderRadius: '16px',
        padding: '1.5rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 1rem 0' }}>Search Our Menu</h2>
          <div style={{ display: 'flex', background: 'white', padding: '0.25rem 0.5rem', borderRadius: '12px', alignItems: 'center' }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Dishes, restaurants..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', border: 'none', outline: 'none', padding: '0.5rem', fontSize: '0.9rem', color: '#0f172a' }}
            />
          </div>
        </div>
      </div>

      <MobileSearchFilters onFilterChange={setActiveFilters} onSortChange={setActiveSort} />

      {searchResults ? (
        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Search Results</h3>
          {isSearching && <p>Loading...</p>}
          
          {!isSearching && searchResults.dishes && searchResults.dishes.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#334155' }}>Dishes</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {searchResults.dishes.map((dish: any) => (
                  <div key={dish.id} style={{ display: 'flex', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: '80px', height: '80px', background: '#f1f5f9' }}>
                      {dish.image && <img src={dish.image} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ padding: '0.75rem', flex: 1 }}>
                      <h5 style={{ margin: '0 0 0.25rem 0', fontWeight: 700, fontSize: '0.9rem' }}>{dish.name}</h5>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>₹{dish.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <MobileExploreSections collections={collections} />
      )}
    </>
  );
};


const SavedTab = () => (
  <div style={{ paddingTop: '1rem' }}>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Saved Favourites</h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[
        { name: "Punjabi Rasoi", type: "Restaurant", rating: "4.7" },
        { name: "Green Leaf Salads", type: "Healthy", rating: "4.9" },
        { name: "Mom's Magic Tiffin", type: "Tiffins", rating: "4.6" }
      ].map((item, idx) => (
        <div key={idx} style={{ 
          background: 'white', borderRadius: '16px', padding: '1rem',
          boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
              🏪
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{item.type} • <Star size={12} fill="#eab308" color="#eab308" style={{display:'inline', verticalAlign:'middle'}}/> {item.rating}</p>
            </div>
          </div>
          <Heart fill="#DC2626" color="#DC2626" size={24} />
        </div>
      ))}
    </div>
  </div>
);

const OrdersTab = ({ orders, loading, loggedIn }: { orders: any[]; loading: boolean; loggedIn: boolean }) => (
  <div style={{ paddingTop: '1rem' }}>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>My Orders</h2>
    {!loggedIn && <p style={{ color: '#64748b' }}>Sign in from Profile to view orders.</p>}
    {loading && loggedIn && <p style={{ color: '#64748b' }}>Loading orders...</p>}
    {loggedIn && !loading && orders.length === 0 && <p style={{ color: '#64748b' }}>No orders yet.</p>}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {orders.map((order) => (
        <div key={order.id} style={{ 
          background: 'white', borderRadius: '16px', padding: '1rem',
          boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)'
        }}>
          <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Order #{order.id?.slice(0, 8)}</h4>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>
            <CheckCircle size={12} color="#10b981" style={{display:'inline', verticalAlign:'middle'}}/> {order.status} • ₹{order.totalAmount}
          </p>
        </div>
      ))}
    </div>
  </div>
);

const ProfileTab = ({ profile, loggedIn, onLogin, onLogout }: { profile: any; loggedIn: boolean; onLogin: () => void; onLogout: () => void }) => (
  <div style={{ paddingTop: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
      <div style={{ width: '80px', height: '80px', background: '#2563EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 700 }}>
        {(profile?.email || 'G')[0].toUpperCase()}
      </div>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
          {loggedIn ? (profile?.email?.split('@')[0] || 'Customer') : 'Guest'}
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{loggedIn ? profile?.email : 'Not signed in'}</p>
      </div>
    </div>

    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      {[
        { icon: MapPin, label: "Manage Addresses" },
        { icon: FileText, label: "Payment Methods" },
        { icon: Settings, label: "Settings" },
        { icon: HelpCircle, label: "Help & Support" }
      ].map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '1.25rem', borderBottom: idx !== 3 ? '1px solid #f1f5f9' : 'none',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '8px' }}>
                <Icon size={20} color="#64748b" />
              </div>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.label}</span>
            </div>
            <ChevronRight size={20} color="#cbd5e1" />
          </div>
        );
      })}
    </div>

    <button onClick={loggedIn ? onLogout : onLogin} style={{ 
      width: '100%', marginTop: '2rem', background: '#fef2f2', color: '#DC2626', 
      border: 'none', padding: '1rem', borderRadius: '16px', fontWeight: 700, 
      fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'
    }}>
      <LogOut size={20} /> {loggedIn ? 'Log Out' : 'Sign In (customer@test.com)'}
    </button>
  </div>
);

const TiffinCheckoutTab = ({ setActiveTab, loggedIn, onLogin }: { setActiveTab: any; loggedIn: boolean; onLogin: () => void }) => {
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [shift, setShift] = useState('Breakfast (7-10 AM)');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  
  const handleCheckout = () => {
    if (!loggedIn) {
      toast.warning('Please log in to confirm your booking.');
      onLogin();
      return;
    }
    if (!startDate) {
      toast.warning('Please select a start date.');
      return;
    }
    if (!acceptedTerms) {
      toast.warning('You must accept the Terms and Conditions to proceed.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Subscription Confirmed! Emails & WhatsApps have been sent.');
      setActiveTab('home');
    }, 1500);
  };

  return (
    <div style={{ paddingTop: '1rem', paddingBottom: '5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Complete Subscription</h2>
      
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>When should we start?</h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>First Meal Shift</label>
          <select value={shift} onChange={e => setShift(e.target.value)} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
            <option>Breakfast (7-10 AM)</option>
            <option>Lunch (12-3 PM)</option>
            <option>Dinner (7-10 PM)</option>
          </select>
        </div>
        
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="text" placeholder="Coupon Code" value={couponCode} onChange={e => setCouponCode(e.target.value)} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} />
            <button onClick={() => {
              if (couponCode.toUpperCase() === 'WELCOME50') {
                setDiscount(50);
                toast.success('Coupon applied!');
              } else {
                setDiscount(0);
                toast.error('Invalid coupon code.');
              }
            }} style={{ background: '#0f172a', color: 'white', padding: '0 1rem', borderRadius: '12px', fontWeight: 600, border: 'none' }}>Apply</button>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.1rem' }}>
          <span style={{ fontWeight: 600 }}>Total</span>
          <strong style={{ color: '#0f172a' }}>₹{4000 - discount}</strong>
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <input type="checkbox" id="tiffinTerms" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} style={{ marginTop: '0.25rem', width: '1.1rem', height: '1.1rem' }} />
          <label htmlFor="tiffinTerms" style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>
            I agree to the <a href="#" style={{ color: '#2563EB' }}>Terms and Conditions</a> for Tiffin Subscription.
          </label>
        </div>

        <button onClick={handleCheckout} disabled={loading || !acceptedTerms} style={{ width: '100%', background: !acceptedTerms ? '#cbd5e1' : '#10b981', color: 'white', padding: '1rem', borderRadius: '12px', fontWeight: 700, border: 'none' }}>
          {loading ? 'Processing...' : `Pay ₹${4000 - discount} & Start`}
        </button>
      </div>
    </div>
  );
};

export default function CustomerMobileApp() {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab');
  const urlBranchId = searchParams.get('branchId');

  const [activeTab, setActiveTab] = useState(urlTab || 'home');
  const [tiffins, setTiffins] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  // Cart count for badge (local state — no global ctx in mobile app)
  const [cartCount, setCartCount] = useState(0);

  // If URL changes, update active tab
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  useEffect(() => {
    const fetchTiffins = async () => {
      try {
        let url = '/tiffin/plans';
        if (urlBranchId) url += `?branchId=${urlBranchId}`;
        const data = await apiFetch<any[]>(url);
        setTiffins(data || []);
      } catch (e) {
        setTiffins([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTiffins();

    const token = localStorage.getItem('customer_token');
    if (token) {
      setLoggedIn(true);
      apiFetch('/auth/me').then(setProfile).catch(() => {});
      apiFetch<any[]>('/orders').then(setOrders).catch(() => setOrders([]));
    }

    // Sync cart count from localStorage on mount
    try {
      const saved = localStorage.getItem('saas_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        const total = Object.values(parsed as Record<string, { qty: number }>)
          .reduce((acc, v) => acc + v.qty, 0);
        setCartCount(total);
      }
    } catch (_) {}
  }, []);

  const handleLogin = async () => {
    await login('customer@test.com', 'test123');
    setLoggedIn(true);
    const me = await apiFetch('/auth/me');
    setProfile(me);
    const data = await apiFetch<any[]>('/orders').catch(() => []);
    setOrders(Array.isArray(data) ? data : []);
  };

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setProfile(null);
    setOrders([]);
  };

  /** Shared BottomNav navigation handler for the mobile app */
  const handleNavNavigate = useCallback((item: NavItemConfig) => {
    // Map shared nav ids → local tab ids
    const idMap: Record<string, string> = {
      home:    'home',
      menu:    'menu',
      dinein:  'dinein',
      tiffin:  'tiffin',
      cart:    'cart',
      profile: 'profile',
    };
    const tabId = idMap[item.id] ?? item.id;
    setActiveTab(tabId);
  }, []);

  return (
    <div style={{ 
      background: '#f8fafc', 
      minHeight: '100vh',
      maxWidth: '480px',
      margin: '0 auto',
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      boxShadow: '0 0 40px rgba(0,0,0,0.05)',
      overflowX: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(10px)',
        padding: '1.25rem 1.25rem 1rem', 
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <p style={{ color: '#2563EB', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 0.25rem 0' }}>Delivering to</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <MapPin size={16} color="#0f172a" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Home - Sector 14</h2>
            </div>
          </div>
          <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}>
            <Menu size={20} color="#0f172a" />
          </div>
        </div>
        
        {/* Search Bar - only show on Home or Saved */}
        {(activeTab === 'home' || activeTab === 'saved') && (
          <div style={{ 
            background: '#f1f5f9', 
            borderRadius: '12px', 
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Search size={18} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search restaurants, dishes, tiffins..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem', color: '#0f172a' }}
            />
          </div>
        )}
      </div>

      <main style={{ padding: '0 1.25rem 6rem' }}>
        
        {/* Global Top Slider */}
        {['home', 'menu', 'tiffin', 'dinein'].includes(activeTab) && (
          <div style={{ marginTop: '1rem', borderRadius: '16px', overflow: 'hidden' }}>
            <TopSlider />
          </div>
        )}

        {activeTab === 'home' && <HomeTab setActiveTab={setActiveTab} tiffins={tiffins} loading={loading} />}
        {activeTab === 'menu' && <MenuTab setActiveTab={setActiveTab} />}
        {activeTab === 'tiffin' && <TiffinCheckoutTab setActiveTab={setActiveTab} loggedIn={loggedIn} onLogin={handleLogin} />}
        {activeTab === 'tiffin-checkout' && <TiffinCheckoutTab setActiveTab={setActiveTab} loggedIn={loggedIn} onLogin={handleLogin} />}
        {activeTab === 'dinein' && <DineInTab loggedIn={loggedIn} onLogin={handleLogin} urlBranchId={urlBranchId} />}
        {activeTab === 'saved' && <SavedTab />}
        {activeTab === 'orders' && <OrdersTab orders={orders} loading={loading} loggedIn={loggedIn} />}
        {activeTab === 'profile' && <ProfileTab profile={profile} loggedIn={loggedIn} onLogin={handleLogin} onLogout={handleLogout} />}
      </main>

      {/* Bottom Navigation — shared BottomNav component, identical to web portal */}
      <BottomNav
        activeId={activeTab}
        onNavigate={handleNavNavigate}
        cartCount={cartCount}
        items={NAV_ITEMS}
        className="ock-bottom-nav--mobile-app"
      />
    </div>
  );
}
