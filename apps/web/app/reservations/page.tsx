'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useGlobalContext } from '../context/GlobalContext';
import styles from '../page.module.css';
import { MapPin, Navigation, ArrowRight, CheckCircle, CreditCard, Calendar, Clock, Users, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Dynamically import the MapWrapper to avoid SSR 'window is not defined' errors
const MapWrapper = dynamic(() => import('./MapWrapper'), { 
  ssr: false, 
  loading: () => <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div> 
});

import TopSlider from '../components/TopSlider';

import { useSearchParams } from 'next/navigation';

export default function ReservationsPage() {
  const searchParams = useSearchParams();
  const urlBranchId = searchParams.get('branchId');

  const [isMounted, setIsMounted] = useState(false);
  const { loggedIn, setLoginModalOpen } = useGlobalContext();
  const [step, setStep] = useState('LOCATION'); // LOCATION, DETAILS, CHECKOUT, SUCCESS
  
  // Geolocation & Restaurants
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Table Booking Details
  const [formData, setFormData] = useState({ 
    date: '', 
    timeSlot: '', 
    partySize: 2 
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<any | null>(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initial fetch of restaurants
  useEffect(() => {
    setIsMounted(true);
    fetchAllRestaurants();
    locateMe(true); // Auto-locate silently on mount

    // Load payment config
    fetch('/api/payment/config', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('customer_token')}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        const active = data.find((d: any) => d.isActive);
        setPaymentConfig(active);
      }
    }).catch(console.error);
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchAllRestaurants = async (lat?: number, lng?: number) => {
    try {
      const res = await fetch('/api/branches/restaurants/all');
      const data = await res.json();
      if (Array.isArray(data)) {
        const allBranches = data.flatMap(r => 
          r.branches.filter((b: any) => b.isReservationEnabled).map((b: any) => ({
            ...b,
            restaurantName: r.name,
            restaurantId: r.id
          }))
        );

        if (lat && lng) {
          const withDistance = allBranches.map(b => {
            if (b.lat && b.lng) {
              return { ...b, distance: calculateDistance(lat, lng, b.lat, b.lng) };
            }
            return b;
          }).sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
          setBranches(withDistance);
        } else {
          setBranches(allBranches);
        }

        // Auto-select branch if branchId is in URL
        if (urlBranchId) {
          const matchedBranch = allBranches.find(b => b.id === urlBranchId);
          if (matchedBranch) {
            setSelectedBranch(matchedBranch);
            setStep('DETAILS');
          }
        }

      }
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  };

  const locateMe = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) setErrorMsg('Geolocation is not supported by your browser');
      return;
    }
    if (!silent) setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation([lat, lng]);
        fetchAllRestaurants(lat, lng);
        setLoading(false);
      },
      () => {
        if (!silent) setErrorMsg('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  const handleSelectBranch = (branch: any) => {
    if (!loggedIn) {
      setLoginModalOpen(true);
      return;
    }
    setSelectedBranch(branch);
    setStep('DETAILS');
  };

  const handleProceedToCheckout = () => {
    if (!formData.date || !formData.timeSlot || !formData.partySize) {
      setErrorMsg('Please select a date, time, and party size.');
      return;
    }
    setErrorMsg(null);
    setStep('CHECKOUT');
  };

  const handleCheckout = async () => {
    if (!acceptedTerms) {
      setErrorMsg('You must accept the terms and conditions.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem('customer_token');

      const branchId = selectedBranch?.id;

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId: selectedBranch?.restaurantId,
          branchId: branchId,
          date: new Date(formData.date).toISOString(),
          timeSlot: formData.timeSlot,
          partySize: formData.partySize,
          depositAmount: 500, // Fixed Table Deposit
          specialRequests: ''
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to create reservation');
      }

      const data = await response.json();
      setConfirmationCode(data.confirmationCode);
      setStep('SUCCESS');
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment/Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.main}>
      <TopSlider />
      
      <div style={{ background: '#f8fafc', color: '#0f172a', minHeight: '100vh', paddingBottom: '6rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            Book Your Table
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
            Find restaurants offering dining services near you, choose a time, and secure your reservation instantly!
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '1rem', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        {/* STEP 1: LOCATION & MAP */}
        {step === 'LOCATION' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            
            {/* Map Section */}
            <div style={{ height: '500px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
              <MapWrapper 
                userLocation={userLocation} 
                branches={branches.filter(b => 
                  (b.restaurantName && b.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (b.name && b.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
                  (b.address && b.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (b.city && b.city.toLowerCase().includes(searchQuery.toLowerCase()))
                )} 
              />
              
              <button 
                onClick={() => locateMe(false)}
                style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 400, background: '#2563EB', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '30px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', cursor: 'pointer' }}
              >
                {loading ? 'Locating...' : <><Navigation size={18} /> Locate Me</>}
              </button>
            </div>

            {/* List Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '500px', paddingRight: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Restaurants</h2>
              
              <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Search restaurant or location..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem', paddingLeft: '2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                />
                <Search size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>

              {branches.filter(b => 
                (b.restaurantName && b.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (b.name && b.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
                (b.address && b.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (b.city && b.city.toLowerCase().includes(searchQuery.toLowerCase()))
              ).length === 0 ? (
                <p style={{ color: '#64748b' }}>No locations found matching "{searchQuery}".</p>
              ) : (
                branches.filter(b => 
                  (b.restaurantName && b.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (b.name && b.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
                  (b.address && b.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (b.city && b.city.toLowerCase().includes(searchQuery.toLowerCase()))
                ).map(b => (
                  <div key={b.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', transition: 'all 0.2s', background: '#f8fafc', cursor: 'pointer' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#2563EB'}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                    onClick={() => handleSelectBranch(b)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>{b.restaurantName} - {b.name}</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                          <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          {b.address || b.city || 'Location unavailable'}
                        </p>
                      </div>
                      {b.distance && (
                        <span style={{ background: '#e0f2fe', color: '#0284c7', fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                          {b.distance.toFixed(1)} km
                        </span>
                      )}
                    </div>
                    
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>Dining Available</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STEP 2: BOOKING DETAILS */}
        {step === 'DETAILS' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            <button onClick={() => setStep('LOCATION')} style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}>
              ← Back to Restaurants
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Reserve a Table at {selectedBranch?.restaurantName} - {selectedBranch?.name}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                  <Calendar size={16} /> Date
                </label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} 
                />
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                  <Clock size={16} /> Time
                </label>
                <input 
                  type="time" 
                  value={formData.timeSlot} 
                  onChange={e => setFormData({...formData, timeSlot: e.target.value})} 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} 
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                  <Users size={16} /> Party Size
                </label>
                <select 
                  value={formData.partySize} 
                  onChange={e => setFormData({...formData, partySize: parseInt(e.target.value)})} 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: 'white' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleProceedToCheckout} 
                style={{ background: '#2563EB', color: 'white', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Proceed to Deposit <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CHECKOUT & T&C */}
        {step === 'CHECKOUT' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            <button onClick={() => setStep('DETAILS')} style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}>
              ← Back to Details
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Reservation Deposit</h2>
            
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Restaurant</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedBranch?.restaurantName} ({selectedBranch?.name})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Date & Time</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>{formData.date} at {formData.timeSlot}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Party Size</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>{formData.partySize} Guests</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #cbd5e1', margin: '1rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
                <span style={{ color: '#0f172a', fontWeight: 800 }}>Table Deposit</span>
                <span style={{ color: '#16a34a', fontWeight: 800 }}>₹500</span>
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '2rem', height: '150px', overflowY: 'scroll', background: '#f8fafc', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
              <strong>Terms and Conditions</strong><br/><br/>
              1. The ₹500 table deposit is fully refundable if you cancel 24 hours prior to the reservation.<br/>
              2. Your table will be held for up to 15 minutes past the reservation time.<br/>
              3. The deposit amount will be deducted from your final bill at the restaurant.<br/>
              4. Payment is processed securely via {paymentConfig?.gatewayName || 'our integrated gateway'}.<br/>
              5. By proceeding, you agree to receive automated Whatsapp and Email updates regarding your reservation.
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <span style={{ color: '#0f172a', fontWeight: 500 }}>I have read and accept the Terms and Conditions</span>
            </label>

            <button 
              onClick={handleCheckout} 
              disabled={loading || !acceptedTerms}
              style={{ width: '100%', background: '#16a34a', color: 'white', padding: '1rem', borderRadius: '8px', fontWeight: 700, fontSize: '1.1rem', border: 'none', cursor: (loading || !acceptedTerms) ? 'not-allowed' : 'pointer', opacity: (loading || !acceptedTerms) ? 0.6 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              <CreditCard size={20} /> {loading ? 'Processing Payment...' : 'Pay ₹500 & Confirm Booking'}
            </button>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'SUCCESS' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '3rem 2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Table Confirmed!</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem' }}>
              We're excited to host you on <strong>{new Date(formData.date).toLocaleDateString()}</strong> at <strong>{formData.timeSlot}</strong>.
            </p>
            
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', display: 'inline-block', marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '0.5rem' }}>Your Confirmation Code</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#2563EB', letterSpacing: '2px', margin: 0 }}>{confirmationCode}</h3>
            </div>

            <p style={{ color: '#2563EB', fontWeight: 600, fontSize: '0.95rem', marginBottom: '2rem', background: '#eff6ff', padding: '1rem', borderRadius: '8px', display: 'inline-block' }}>
              Check your WhatsApp and Email for the confirmation and details!
            </p>
            <br />
            <button 
              onClick={() => window.location.href = '/'} 
              style={{ background: '#f1f5f9', color: '#0f172a', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              Back to Home
            </button>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
