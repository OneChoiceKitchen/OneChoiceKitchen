'use client';
import React, { useState, useEffect } from 'react';
import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";
import dynamic from 'next/dynamic';
import { ShoppingBag, Home as HomeIcon, Utensils, User, Star, Plus, Minus, X, CheckCircle2, Navigation, ListFilter, Leaf, Drumstick, Search, ArrowRight } from 'lucide-react';
import { DEFAULT_MENU_CATALOGUE } from './data';
import LazyDishCard from './components/LazyDishCard';
import PageHero from './components/PageHero';
import { useGlobalContext } from './context/GlobalContext';

const CheckoutModal = dynamic(() => import('./components/CheckoutModal'), { ssr: false });
const CartDrawer = dynamic(() => import('./components/CartDrawer'), { ssr: false });

// -------------------------------------------------------------
// DEFAULT DATA FALLBACKS (Will be overwritten by live admin data)
// -------------------------------------------------------------
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

export default function Home() {
  const [restaurantItems, setRestaurantItems] = useState<any[]>([]);
  const [weeklyTiffin, setWeeklyTiffin] = useState<any>({});
  const [tiffinNotices, setTiffinNotices] = useState<any>(INITIAL_TIFFIN_NOTICES);
  const [selectedDayMenu, setSelectedDayMenu] = useState<string>('Mon');
  const [tiffinDietTab, setTiffinDietTab] = useState<'veg' | 'nonveg'>('veg');
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const loaderRef = React.useRef(null);

  // App Configs
  const [gstRate, setGstRate] = useState(18);
  const [deliveryBaseKm, setDeliveryBaseKm] = useState(3);
  const [deliveryRatePerKm, setDeliveryRatePerKm] = useState(8);

  // Customer Shopping State
  const { cart, setCart, cartDrawerOpen, setCartDrawerOpen, totalCartItems } = useGlobalContext();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [dietFilter, setDietFilter] = useState<'ALL' | 'VEG' | 'NON-VEG'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Checkout Modal State
  const [checkoutType, setCheckoutType] = useState<'dish' | 'tiffin'>('dish');
  const [selectedTiffinPlan, setSelectedTiffinPlan] = useState<any>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custDistance, setCustDistance] = useState('2'); // default 2KM
  
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Read live data on load
  useEffect(() => {
    const localItems = localStorage.getItem('saas_restaurant_items');
    const version = localStorage.getItem('saas_menu_version');
    let parsedItems = localItems ? JSON.parse(localItems) : null;
    if (!parsedItems || version !== 'v10') {
      parsedItems = DEFAULT_MENU_CATALOGUE; // Force upgrade to include isVisible
      localStorage.setItem('saas_restaurant_items', JSON.stringify(DEFAULT_MENU_CATALOGUE));
      localStorage.setItem('saas_menu_version', 'v10');
    }
    setRestaurantItems(parsedItems);

    const localTiffin = localStorage.getItem('saas_weekly_tiffin');
    setWeeklyTiffin(localTiffin ? JSON.parse(localTiffin) : DEFAULT_WEEKLY_TIFFIN);

    const localNotices = localStorage.getItem('saas_tiffin_notices');
    if (localNotices) setTiffinNotices(JSON.parse(localNotices));

    const localGst = localStorage.getItem('saas_gst_rate');
    if (localGst) setGstRate(Number(localGst));
    const localBase = localStorage.getItem('saas_delivery_base_km');
    if (localBase) setDeliveryBaseKm(Number(localBase));
    const localRate = localStorage.getItem('saas_delivery_rate_per_km');
    if (localRate) setDeliveryRatePerKm(Number(localRate));
  }, []);

  // Sync back live updates from local storage
  useEffect(() => {
    const handleStorageChange = () => {
      const localItems = localStorage.getItem('saas_restaurant_items');
      if (localItems) setRestaurantItems(JSON.parse(localItems));

      const localTiffin = localStorage.getItem('saas_weekly_tiffin');
      if (localTiffin) setWeeklyTiffin(JSON.parse(localTiffin));

      const localNotices = localStorage.getItem('saas_tiffin_notices');
      if (localNotices) setTiffinNotices(JSON.parse(localNotices));

      const localGst = localStorage.getItem('saas_gst_rate');
      if (localGst) setGstRate(Number(localGst));
      const localBase = localStorage.getItem('saas_delivery_base_km');
      if (localBase) setDeliveryBaseKm(Number(localBase));
      const localRate = localStorage.getItem('saas_delivery_rate_per_km');
      if (localRate) setDeliveryRatePerKm(Number(localRate));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle Hash Routing manually after hydration
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [restaurantItems.length]); // Re-run if items load and shift layout

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => prev + 12);
      }
    });
    const currentRef = loaderRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [visibleCount, restaurantItems.length, activeCategory, dietFilter, searchQuery]);

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: { item, qty: existing ? existing.qty + 1 : 1 }
      };
    });
  };

  const updateCartQty = (id: string, newQty: number) => {
    if (newQty <= 0) {
      setCart(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } else {
      setCart(prev => ({
        ...prev,
        [id]: { ...prev[id], qty: newQty }
      }));
    }
  };

  const subtotal = Object.values(cart).reduce((sum, current) => sum + (current.item.price * current.qty), 0);
  const gstTax = subtotal * (gstRate / 100);
  const deliveryDistance = Number(custDistance) || 2;
  const deliveryFee = deliveryDistance > deliveryBaseKm ? (deliveryDistance - deliveryBaseKm) * deliveryRatePerKm : 0;
  const grandTotal = subtotal + gstTax + deliveryFee;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone || !custAddress) {
      alert('Please fill out all delivery details.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCheckoutModalOpen(false);

      if (checkoutType === 'dish') {
        const newOrder = {
          id: Math.floor(1000 + Math.random() * 9000).toString(),
          customer: custName,
          items: Object.values(cart).map(c => `${c.qty}x ${c.item.name}`).join(', '),
          cartDetails: Object.values(cart).map(c => ({
            id: c.item.id,
            name: c.item.name,
            qty: c.qty,
            price: c.item.price,
            image: c.item.image
          })),
          total: Math.round(grandTotal),
          status: 'New',
          rider: 'Unassigned'
        };

        const existingOrders = JSON.parse(localStorage.getItem('saas_orders') || '[]');
        localStorage.setItem('saas_orders', JSON.stringify([newOrder, ...existingOrders]));

        setCart({});
        setOrderSuccess({
          title: 'Order Placed successfully! ≡ƒÄë',
          desc: `Thank you ${custName}. Your food is being prepared and will be delivered shortly. Track it in your profile.`
        });

      } else {
        const newSub = {
          id: 'sub-' + Math.random().toString(36).substr(2, 9),
          name: custName,
          phone: custPhone,
          plan: selectedTiffinPlan.name,
          diet: selectedTiffinPlan.diet,
          distance: Number(custDistance),
          status: 'Active'
        };

        const existingSubs = JSON.parse(localStorage.getItem('saas_subscribers') || '[]');
        localStorage.setItem('saas_subscribers', JSON.stringify([newSub, ...existingSubs]));

        setOrderSuccess({
          title: 'Subscription Activated! ≡ƒì▒',
          desc: `Welcome ${custName}! Your fresh homestyle meals will start arriving from tomorrow.`
        });
      }
    }, 1200);
  };

  const categories = ['All', 'North Indian', 'Chinese', 'Fast Food', 'Beverages', 'Desserts', 'South Indian', 'Healthy', 'Extras'];
  const filteredDishes = restaurantItems.filter((item: any) => {
    if (item.isVisible === false) return false;
    const categoryMatch = activeCategory === 'All' || item.category === activeCategory;
    const dietMatch = dietFilter === 'ALL' || item.diet === dietFilter;
    const searchMatch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && dietMatch && searchMatch;
  });

  useEffect(() => {
    setVisibleCount(12);
  }, [activeCategory, dietFilter, searchQuery]);

  return (
    <div className={styles.main}>
      {/* Hero Section */}
      <PageHero 
        badgeText="Premium Homestyle Food Delivery"
        title={<>Delicious Meals, <br /><span className={styles.highlight}>Delivered Fresh Daily.</span></>}
        subtitle="Craving restaurant-quality food or looking for a reliable daily tiffin service? We've got you covered with hygienic, flavorful, and affordable meals."
      >
        <a href="#menu" className={styles.primaryBtn}>
          <Utensils size={20} /> Order Now
        </a>
        <Link href="/tiffin" className={styles.secondaryBtn}>
          Explore Tiffins
        </Link>
      </PageHero>

      {/* Main Content Area */}
      <div className={styles.sectionContainer} style={{padding: '0 1.5rem'}}>
        
        {/* Categories Strip */}
        <div className={styles.categoriesStrip}>
          {categories.map((cat, idx) => (
            <div 
              key={cat} 
              className={`${styles.categoryCard} ${activeCategory === cat ? styles.active : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              <div className={styles.categoryImage}>
                 {/* Placeholders for category icons */}
                 <Image src={idx === 0 ? '/Logo.webp' : idx === 1 ? '/paneer_tikka.png' : idx === 2 ? '/veg_noodles.png' : idx === 3 ? '/cold_coffee.png' : '/chocolate_brownie.png'} 
                        alt={cat} width={60} height={60} />
              </div>
              <span className={styles.categoryName}>{cat}</span>
            </div>
          ))}
        </div>

        <div className={styles.gridLayout}>
          
          {/* Menu Catalog Area */}
          <div id="menu">
            <div className={styles.sectionHeader} style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <h2 className={styles.sectionTitle}>
                  {activeCategory === 'All' ? 'Explore Our Menu' : `${activeCategory} Specials`}
                </h2>
                <p className={styles.sectionSubtitle}>Handcrafted dishes ready in minutes</p>
              </div>
              
              <div className={styles.searchFilterWrapper}>
                {/* SEARCH BAR */}
                <div className={styles.searchContainer}>
                  <Search size={18} className={styles.searchIcon} />
                  <input 
                    type="text" 
                    placeholder="Search dishes, ingredients..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>

                {/* DIET FILTER TOGGLE */}
                <div className={styles.filterContainer}>
                  <button 
                    onClick={() => setDietFilter('ALL')}
                    style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: dietFilter === 'ALL' ? 'white' : 'transparent', color: dietFilter === 'ALL' ? '#0f172a' : '#64748b', boxShadow: dietFilter === 'ALL' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  ><ListFilter size={14} /> All</button>
                  <button 
                    onClick={() => setDietFilter('VEG')}
                    style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: dietFilter === 'VEG' ? 'white' : 'transparent', color: dietFilter === 'VEG' ? '#10b981' : '#64748b', boxShadow: dietFilter === 'VEG' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  ><Leaf size={14} /> Veg</button>
                  <button 
                    onClick={() => setDietFilter('NON-VEG')}
                    style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: dietFilter === 'NON-VEG' ? 'white' : 'transparent', color: dietFilter === 'NON-VEG' ? '#ef4444' : '#64748b', boxShadow: dietFilter === 'NON-VEG' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  ><Drumstick size={14} /> Non-Veg</button>
                </div>
              </div>
            </div>

            <div className={styles.dishesGrid}>
              {filteredDishes.length > 0 ? (
                <>
                  {filteredDishes.slice(0, visibleCount).map((item: any) => (
                    <LazyDishCard 
                      key={item.id} 
                      item={item} 
                      cartItem={cart[item.id]} 
                      onAdd={addToCart} 
                      onUpdateQty={updateCartQty} 
                      styles={styles} 
                    />
                  ))}
                  {visibleCount < filteredDishes.length && (
                    <div ref={loaderRef} style={{ height: '50px', width: '100%', gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <div className={styles.loadingSpinner}></div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
                  No dishes available in this category.
                </div>
              )}
            </div>
          </div>

          {/* Cart Drawer - Dynamically Imported */}
          {cartDrawerOpen && (
            <CartDrawer
              cart={cart}
              totalCartItems={totalCartItems}
              subtotal={subtotal}
              gstTax={gstTax}
              setCartDrawerOpen={setCartDrawerOpen}
              updateCartQty={updateCartQty}
              setCheckoutType={setCheckoutType}
              setCheckoutModalOpen={setCheckoutModalOpen}
              styles={styles}
            />
          )}
        </div>
      </div>

      {/* Tiffin Banner */}
      <section id="tiffin" className={`${styles.section} ${styles.tiffinBg}`} style={{marginTop: '4rem', padding: '4rem 2rem', textAlign: 'center'}}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Daily Tiffin Subscriptions</h2>
          <p className={styles.sectionSubtitle} style={{maxWidth: '600px', margin: '0 auto 2rem'}}>
            Get fresh home-cooked meals delivered to your doorstep everyday. Choose from Veg and Non-Veg plans tailored to your cravings.
          </p>
          <Link href="/tiffin" className={styles.primaryBtn} style={{display: 'inline-flex', padding: '1rem 2rem', textDecoration: 'none'}}>
            View Meal Plans <ArrowRight size={20} style={{marginLeft: '0.5rem'}} />
          </Link>
        </div>
      </section>


      {/* Checkout Drawer/Modal - Dynamically Imported */}
      {checkoutModalOpen && (
        <CheckoutModal
          checkoutType={checkoutType}
          selectedTiffinPlan={selectedTiffinPlan}
          setSelectedTiffinPlan={setSelectedTiffinPlan}
          custName={custName} setCustName={setCustName}
          custPhone={custPhone} setCustPhone={setCustPhone}
          custAddress={custAddress} setCustAddress={setCustAddress}
          custDistance={custDistance} setCustDistance={setCustDistance}
          deliveryFee={deliveryFee}
          grandTotal={grandTotal}
          loading={loading}
          handlePlaceOrder={handlePlaceOrder}
          setCheckoutModalOpen={setCheckoutModalOpen}
          styles={styles}
        />
      )}

      {/* Success Modal */}
      {orderSuccess && (
        <div className={styles.successOverlay}>
          <div className={styles.successCard}>
            <div style={{ display: 'inline-flex', background: '#dcfce7', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={48} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              {orderSuccess.title}
            </h3>
            <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '2rem' }}>
              {orderSuccess.desc}
            </p>
            <button onClick={() => setOrderSuccess(null)} className={styles.primaryBtn} style={{ width: '100%', justifyContent: 'center' }}>
              Track My Order
            </button>
          </div>
        </div>
      )}


      {/* Global Footer */}
    </div>
  );
}
