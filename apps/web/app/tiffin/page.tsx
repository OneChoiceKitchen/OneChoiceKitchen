'use client';
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { Calendar, CheckCircle2, Megaphone, AlertTriangle, MapPin } from 'lucide-react';
import PageHero from "../components/PageHero";
import TopSlider from "../components/TopSlider";
import styles from "../page.module.css";
import { useGlobalContext } from '../context/GlobalContext';
import { useToast, Button } from '@org/ui-design-system';

const CheckoutModal = dynamic(() => import('../components/CheckoutModal'), { ssr: false });
const SubscriptionCheckoutModal = dynamic(() => import('../components/SubscriptionCheckoutModal'), { ssr: false });
const LocationMapModal = dynamic(() => import('../components/LocationMapModal'), { ssr: false });
const GlobalOffersDisplay = dynamic(() => import('../components/GlobalOffersDisplay'), { ssr: false });

const INITIAL_TIFFIN_NOTICES = {
  gasNoticeActive: true,
  gasNoticeAmount1: 1,
  gasNoticeAmount2: 2,
  gasNoticeAmount3: 3,
  packagingCharge: 10,
  juiceOfferActive: true
};

const DEFAULT_WEEKLY_TIFFIN = {
  Mon: { breakfast: 'Poha & Sprouts', lunch: 'Dal Makhani, Mix Veg, Roti, Rice', dinner: 'Kadhi Chawal & Aloo Bhujia' },
  Tue: { breakfast: 'Idli Sambhar', lunch: 'Rajma Masala, Jeera Aloo, Roti, Rice', dinner: 'Matar Paneer & Paratha' },
  Wed: { breakfast: 'Aloo Paratha', lunch: 'Chole Masala, Pulao, Roti, Salad', dinner: 'Lauki Kofta & Roti' },
  Thu: { breakfast: 'Upma & Chutney', lunch: 'Paneer Bhurji, Dal Tadka, Roti, Rice', dinner: 'Khichdi & Papad' },
  Fri: { breakfast: 'Veg Sandwich', lunch: 'Black Chana, Bhindi Fry, Roti, Rice', dinner: 'Palak Paneer & Paratha' },
  Sat: { breakfast: 'Puri Sabzi', lunch: 'Kadhai Paneer, Veg Pulao, Roti', dinner: 'Mix Dal & Roti' },
  Sun: { breakfast: 'Moong Dal Cheela', lunch: 'Special Shahi Paneer, Butter Roti, Rice, Kheer', dinner: 'Aloo Shimla Mirch & Paratha' }
};

import { useSearchParams } from 'next/navigation';

export default function TiffinPage() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branchId');
  const toast = useToast();

  const [weeklyTiffin, setWeeklyTiffin] = useState<any>({});
  const [tiffinSettings, setTiffinSettings] = useState<any>({});
  const [tiffinNotices, setTiffinNotices] = useState<any>(INITIAL_TIFFIN_NOTICES);
  const [tiffinDietTab, setTiffinDietTab] = useState<'VEG' | 'NON_VEG'>('VEG');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationName, setLocationName] = useState('Detecting Location...');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [todayIsHoliday, setTodayIsHoliday] = useState(false);

  // Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedTiffinPlan, setSelectedTiffinPlan] = useState<any>(null);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custDistance, setCustDistance] = useState('2');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationName('Current Location');
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationName('Location Unknown');
        }
      );
    } else {
      setLocationName('Location not supported');
    }
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      let loadedPlans = null;
      if (branchId) {
        try {
          const res = await fetch(`/api/tiffin/plans?branchId=${branchId}`);
          if (res.ok) {
            const data = await res.json();
            // Assuming API returns format compatible with weeklyTiffin
            if (data && Object.keys(data).length > 0) {
              loadedPlans = data;
            }
          }
        } catch (e) {
          console.error("Failed to fetch branch specific plans", e);
        }
      }

      if (!loadedPlans) {
        loadedPlans = {};
      }
      
      setWeeklyTiffin(loadedPlans);

      try {
        const settingsRes = await fetch(`/api/tiffin/settings${branchId ? `?branchId=${branchId}` : ''}`);
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setTiffinSettings(settingsData || {});
        }
      } catch (e) {
        console.error("Failed to fetch tiffin settings", e);
      }

      const localNotices = localStorage.getItem('saas_tiffin_notices');
      if (localNotices) setTiffinNotices(JSON.parse(localNotices));
    };
    fetchAll();
  }, [userLocation, branchId]);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone || !custAddress) {
      toast.warning('Please fill out all delivery details.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCheckoutModalOpen(false);

      const newSub = {
        id: 'sub-' + Math.random().toString(36).substr(2, 9),
        name: custName,
        phone: custPhone,
        branchId: branchId, // Track the branch context
        plan: selectedTiffinPlan?.name || 'Standard Plan',
        diet: tiffinDietTab.toUpperCase(),
        distance: Number(custDistance),
        status: 'Active'
      };

      const existingSubs = JSON.parse(localStorage.getItem('saas_subscribers') || '[]');
      localStorage.setItem('saas_subscribers', JSON.stringify([newSub, ...existingSubs]));

      setOrderSuccess({
        title: 'Subscription Activated! 🍱',
        desc: `Welcome ${custName}! Your fresh homestyle meals will start arriving from tomorrow.`
      });
    }, 1200);
  };

  return (
    <div className={styles.main}>
      <TopSlider />
      
      <div style={{ background: '#f8fafc', color: '#0f172a', minHeight: '100vh' }}>
      <PageHero 
        badgeText="Daily Tiffin Subscriptions"
        badgeIcon={<Calendar size={16} fill="currentColor" />}
        title={<>Daily Tiffin <span className={styles.highlight}>Subscriptions</span></>}
        subtitle="Get fresh home-cooked meals delivered to your doorstep everyday. Choose from Veg and Non-Veg plans tailored to your cravings."
      />

      <div style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 1.5rem' }}>
        {todayIsHoliday && (
          <div style={{ background: '#fef2f2', border: '2px solid #DC2626', borderRadius: '12px', padding: '1.5rem', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AlertTriangle size={28} color="#DC2626" />
            <div>
              <strong style={{ color: '#DC2626', fontSize: '1.2rem' }}>Today is a Holiday – No Service</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>We are taking a day off today. Service will resume tomorrow.</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} color="#2563EB" />
            <div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Delivering to</p>
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#0f172a' }}>{locationName}</h3>
            </div>
          </div>
          <Button 
            onClick={() => setShowLocationModal(true)}
            variant="secondary"
          >
            Change Location
          </Button>
        </div>

        {showLocationModal && (
          <LocationMapModal 
            onClose={() => setShowLocationModal(false)}
            onSave={(lat, lng, address) => {
              setUserLocation({ lat, lng });
              setLocationName(address);
              setShowLocationModal(false);
            }}
            initialLat={userLocation?.lat}
            initialLng={userLocation?.lng}
          />
        )}

        <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#d97706', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📢 Important Notice regarding Monthly/Weekly Tiffin Service</h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#451a03', display: 'grid', gap: '0.5rem' }}>
            {tiffinNotices.gasNoticeActive && (
              <li><strong style={{color:'#b45309'}}>Current Notice (till Gas starts):</strong> Food will be {tiffinNotices.gasNoticeAmount1} time Extra. Example, for 2 times food you will have to pay for {tiffinNotices.gasNoticeAmount2} times, for 3 times you will have to pay for {tiffinNotices.gasNoticeAmount3} times.</li>
            )}
            {tiffinNotices.packagingCharge > 0 && (
              <li><strong style={{color:'#b45309'}}>Packaging Charge:</strong> ₹{tiffinNotices.packagingCharge} extra will be charged daily for disposable packaging per meal.</li>
            )}
            {tiffinNotices.juiceOfferActive && (
              <li><strong style={{color:'#b45309'}}>Offers:</strong> On 7 days continuous orders, Sunday lunch juice will be on us.</li>
            )}
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <button 
            onClick={() => setTiffinDietTab('VEG')}
            style={{ padding: '0.8rem 2rem', borderRadius: '30px', border: 'none', background: tiffinDietTab === 'VEG' ? '#10b981' : '#f1f5f9', color: tiffinDietTab === 'VEG' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: tiffinDietTab === 'VEG' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none' }}
          >🥬 Veg Tiffin Plan</button>
          <button 
            onClick={() => setTiffinDietTab('NON_VEG')}
            style={{ padding: '0.8rem 2rem', borderRadius: '30px', border: 'none', background: tiffinDietTab === 'NON_VEG' ? '#DC2626' : '#f1f5f9', color: tiffinDietTab === 'NON_VEG' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: tiffinDietTab === 'NON_VEG' ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none' }}
          >🍗 Non-Veg Tiffin Plan</button>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ position: 'relative', height: '250px' }}>
            <Image src={tiffinDietTab === 'VEG' ? '/veg_tiffin_thali.png' : '/non_veg_tiffin_thali.png'} alt="Tiffin" fill style={{ objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'white' }}>
              <h3 style={{ fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {tiffinDietTab === 'VEG' ? 'Pure Veg Premium Thali' : 'Non-Veg Premium Thali'}
              </h3>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '1.1rem' }}>
                {tiffinDietTab === 'VEG' ? 'Wholesome homestyle vegetarian meals prepared with premium ingredients and minimal oil.' : 'Authentic and rich homestyle non-vegetarian meals crafted for the perfect craving.'}
              </p>
            </div>
          </div>

          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {Object.keys(weeklyTiffin).map((day) => {
                const dayData = weeklyTiffin[day]?.[tiffinDietTab];
                if (!dayData) return null;
                return (
                  <div key={day} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem', borderBottom: '2px solid #cbd5e1', paddingBottom: '0.5rem' }}>{day}</div>
                    <div style={{ display: 'grid', gap: '0.8rem' }}>
                      <div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <strong style={{color:'#64748b', fontSize:'0.85rem', textTransform:'uppercase'}}>Breakfast:</strong>
                          {tiffinSettings.breakfastYoutubeUrl && (
                            <a href={tiffinSettings.breakfastYoutubeUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.65rem', color: '#DC2626', textDecoration: 'none', fontWeight: 600, background: '#fef2f2', padding: '2px 6px', borderRadius: '12px' }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                              Video
                            </a>
                          )}
                        </div>
                        <div style={{color:'#334155'}}>{dayData.breakfast?.text || dayData.breakfast || '-'}</div>
                      </div>
                      <div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <strong style={{color:'#64748b', fontSize:'0.85rem', textTransform:'uppercase'}}>Lunch:</strong> 
                          {tiffinSettings.lunchYoutubeUrl && (
                            <a href={tiffinSettings.lunchYoutubeUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.65rem', color: '#DC2626', textDecoration: 'none', fontWeight: 600, background: '#fef2f2', padding: '2px 6px', borderRadius: '12px' }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                              Video
                            </a>
                          )}
                        </div>
                        <div style={{color:'#334155'}}>{dayData.lunch?.text || dayData.lunch || '-'}</div>
                      </div>
                      <div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <strong style={{color:'#64748b', fontSize:'0.85rem', textTransform:'uppercase'}}>Dinner:</strong> 
                          {tiffinSettings.dinnerYoutubeUrl && (
                            <a href={tiffinSettings.dinnerYoutubeUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.65rem', color: '#DC2626', textDecoration: 'none', fontWeight: 600, background: '#fef2f2', padding: '2px 6px', borderRadius: '12px' }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                              Video
                            </a>
                          )}
                        </div>
                        <div style={{color:'#334155'}}>{dayData.dinner?.text || dayData.dinner || '-'}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => { setSelectedTiffinPlan({ name: 'Monthly Standard', diet: tiffinDietTab }); setCheckoutModalOpen(true); }}
                className={styles.primaryBtn} style={{ padding: '1rem 3rem', fontSize: '1.1rem', border: 'none' }}
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {checkoutModalOpen && (
        <CheckoutModal
          selectedTiffinPlan={selectedTiffinPlan}
          setSelectedTiffinPlan={setSelectedTiffinPlan}
          custName={custName} setCustName={setCustName}
          custPhone={custPhone} setCustPhone={setCustPhone}
          custAddress={custAddress} setCustAddress={setCustAddress}
          custDistance={custDistance} setCustDistance={setCustDistance}
          deliveryFee={0}
          grandTotal={3000}
          loading={loading}
          handlePlaceOrder={handlePlaceOrder}
          setCheckoutModalOpen={setCheckoutModalOpen}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />
      )}

      {orderSuccess && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'}}>
          <div style={{background: 'white', borderRadius: '24px', padding: '3rem 2rem', textAlign: 'center', maxWidth: '400px', width: '100%', animation: 'slideUp 0.3s ease'}}>
            <div style={{background: '#dcfce7', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'}}>
              <CheckCircle2 size={40} color="#10b981" />
            </div>
            <h2 style={{color: '#0f172a', fontSize: '1.75rem', marginBottom: '0.5rem'}}>{orderSuccess.title}</h2>
            <p style={{color: '#64748b', marginBottom: '2rem', lineHeight: 1.5}}>{orderSuccess.desc}</p>
            <Link href="/" className={styles.primaryBtn} style={{width: '100%', justifyContent: 'center', textDecoration: 'none'}}>
              Return Home
            </Link>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
