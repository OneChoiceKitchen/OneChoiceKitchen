'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Search, Grid, List, Heart, Clock, Star, ChevronLeft, ChevronRight, ChevronDown, Zap, PackageX, Banknote, RotateCcw, Calendar, LayoutGrid, Coffee, Utensils, Pizza, Soup, Salad, Flame, ShoppingCart } from 'lucide-react';
import LocationMapModal from '../components/LocationMapModal';
import ClearCartModal from '../components/ClearCartModal';
import StickyCartSummary from '../components/StickyCartSummary';
import { useGlobalContext } from '../context/GlobalContext';
import styles from './menu.module.css';

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeSort, setActiveSort] = useState<string>('Relevance');
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All Categories');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Cart & single restaurant rule state
  const [clearCartModalOpen, setClearCartModalOpen] = useState(false);
  const [pendingDishToAdd, setPendingDishToAdd] = useState<any>(null);
  
  // Pagination (For the "All Dishes" section at the bottom)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const { cart, setCart, cartDrawerOpen, setCartDrawerOpen, deliveryLocation, setDeliveryLocation, deliveryAddress, setDeliveryAddress, clearCart } = useGlobalContext();
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    if (navigator.geolocation && !deliveryLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDeliveryLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          if (!deliveryAddress) setDeliveryAddress('Current Location');
        },
        (error) => {
          console.error("Geolocation error:", error);
          if (!deliveryAddress) setDeliveryAddress('Location Unknown');
        }
      );
    } else if (!navigator.geolocation && !deliveryAddress) {
      setDeliveryAddress('Location not supported');
    }
  }, [deliveryLocation, deliveryAddress, setDeliveryLocation, setDeliveryAddress]);

  useEffect(() => {
    const fetchSearch = async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);
        if (activeFilters.length > 0) params.append('filters', activeFilters.join(','));
        if (activeSort) params.append('sort', activeSort);
        if (deliveryLocation) {
          params.append('lat', deliveryLocation.lat.toString());
          params.append('lng', deliveryLocation.lng.toString());
          params.append('radius', '10');
        }
        
        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();
        setSearchResults(data);
        setCurrentPage(1); // Reset page on new search
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilters, activeSort, deliveryLocation]);

  // Derived state for categories and filtering
  const allDishes = searchResults?.dishes || [];
  const allRestaurants = searchResults?.restaurants || [];

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    allDishes.forEach((dish: any) => {
      const cat = dish.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
      total++;
    });
    
    const catArray = Object.entries(counts).map(([name, count]) => ({ name, count }));
    catArray.sort((a, b) => b.count - a.count);
    return [{ name: 'All Categories', count: total }, ...catArray];
  }, [allDishes]);

  const filteredDishes = useMemo(() => {
    if (activeCategory === 'All Categories') return allDishes;
    return allDishes.filter((d: any) => (d.category || 'Other') === activeCategory);
  }, [allDishes, activeCategory]);

  const totalPages = Math.ceil(filteredDishes.length / itemsPerPage);
  const currentDishes = filteredDishes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddToCart = (dish: any) => {
    const restaurantId = dish.restaurantId || dish.restaurant?.id || 'unknown';
    
    // Enforce single restaurant rule
    const cartItems = Object.values(cart);
    if (cartItems.length > 0) {
      const existingItem = cartItems[0].item;
      const existingRestaurantId = existingItem.restaurantId || existingItem.restaurant?.id || 'unknown';
      
      if (existingRestaurantId !== 'unknown' && restaurantId !== 'unknown' && existingRestaurantId !== restaurantId) {
        setPendingDishToAdd(dish);
        setClearCartModalOpen(true);
        return;
      }
    }
    addToCartDirectly(dish);
  };

  const addToCartDirectly = (dish: any) => {
    const cartKey = `dish_${dish.id}`;
    setCart((prev: any) => {
      const existing = prev[cartKey];
      return {
        ...prev,
        [cartKey]: {
          item: dish,
          qty: (existing?.qty || 0) + 1
        }
      };
    });
    // Let's not open the drawer every time, let the sticky cart do its job
  };

  const handleClearAndAdd = () => {
    clearCart();
    if (pendingDishToAdd) {
      setTimeout(() => {
        addToCartDirectly(pendingDishToAdd);
        setPendingDishToAdd(null);
      }, 0);
    }
    setClearCartModalOpen(false);
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
  };

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('all')) return <LayoutGrid size={16} color="#2563eb" />;
    if (lower.includes('special')) return <Flame size={16} color="#DC2626" />;
    if (lower.includes('beverage')) return <Coffee size={16} color="#ec4899" />;
    if (lower.includes('dessert')) return <Pizza size={16} color="#ec4899" />;
    if (lower.includes('main')) return <Utensils size={16} color="#f97316" />;
    if (lower.includes('snack')) return <LayoutGrid size={16} color="#f97316" />;
    if (lower.includes('combo')) return <PackageX size={16} color="#f97316" />;
    if (lower.includes('salad')) return <Salad size={16} color="#22c55e" />;
    if (lower.includes('soup')) return <Soup size={16} color="#f97316" />;
    return <LayoutGrid size={16} color="#64748b" />;
  };

  // Reusable rendering functions
  const renderRestaurantCard = (restaurant: any, inlineStyle = {}) => (
    <div key={restaurant.id} className={styles.dishCard} style={{ cursor: 'pointer', ...inlineStyle }}>
      <div className={styles.imageContainer}>
        <div className={styles.imageWrapper}>
          {restaurant.image || restaurant.brandLogoUrl || restaurant.logoUrl || restaurant.logo || restaurant.branches?.[0]?.brandLogoUrl ? (
            <img src={restaurant.image || restaurant.brandLogoUrl || restaurant.logoUrl || restaurant.logo || restaurant.branches?.[0]?.brandLogoUrl} alt={restaurant.name} className={styles.cardImage} style={{ objectFit: 'contain', padding: '1rem' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LayoutGrid size={48} color="#cbd5e1" />
            </div>
          )}
          <div className={styles.vegBadge} style={{ background: '#2563eb', color: 'white' }}>
            <Star size={12} fill="white" />
            <span style={{ color: 'white' }}>{restaurant.rating || '4.5'}</span>
          </div>
          {restaurant.offerText && (
            <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', color: 'white', padding: '2rem 1rem 0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold' }}>
              <div style={{ background: '#2563eb', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>%</div>
              {restaurant.offerText}
            </div>
          )}
        </div>
      </div>
      <div className={styles.dishContent}>
        <h4 className={styles.dishTitle}>{restaurant.name}</h4>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
          {restaurant.cuisines?.join(', ') || restaurant.cuisine || restaurant.restaurant?.cuisine || 'Multi-Cuisine'}
        </p>
        <div className={styles.dishMeta}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.85rem' }}>
            <MapPin size={14} /> {restaurant.address || restaurant.city || restaurant.branches?.[0]?.address || 'Location'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.85rem' }}>
            <Clock size={14} /> {restaurant.deliveryTime || restaurant.operatingHours || restaurant.branches?.[0]?.operatingHours || '30-40 min'}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDishCard = (dish: any, inlineStyle = {}) => (
    <div key={dish.id} className={styles.dishCard} style={inlineStyle}>
      <div className={styles.imageContainer}>
        <div className={styles.imageWrapper}>
          {dish.image && (
            <img 
              src={dish.image} 
              alt={dish.name} 
              className={styles.cardImage}
            />
          )}
          
          <div className={styles.vegBadge}>
            {dish.isVeg ? (
              <div className={styles.vegDot}></div>
            ) : (
              <div className={styles.nonVegTriangle}></div>
            )}
            <span style={{ color: dish.isVeg ? '#16a34a' : '#dc2626' }}>{dish.isVeg ? 'VEG' : 'NON-VEG'}</span>
          </div>
          
          <button className={styles.heartBtn} onClick={(e) => { e.stopPropagation(); toggleWishlist(dish.id); }}>
            <Heart size={16} fill={wishlist.has(dish.id) ? '#DC2626' : 'transparent'} color={wishlist.has(dish.id) ? '#DC2626' : 'white'} />
          </button>
        </div>
      </div>
      
      <div className={styles.dishContent}>
        <h4 className={styles.dishTitle}>{dish.name}</h4>
        <div className={styles.dishPrice}>₹{dish.price}</div>
        
        <div className={styles.dishMeta}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>4.4 (128)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.85rem' }}>
            <Clock size={14} /> 25-30 min
          </div>
        </div>

        <button onClick={(e) => { e.stopPropagation(); handleAddToCart(dish); }} className={styles.addToCartBtn}>
          <ShoppingCart size={16} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      
      {/* 1. Global Search Section */}
      <div className={styles.heroSection}>
        <div className={styles.searchBarContainer}>
          <button onClick={() => setShowLocationModal(true)} className={styles.locationBtn}>
            <MapPin size={20} color="#DC2626" />
            <div className={styles.locationText}>
              <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Current Location
                <ChevronDown size={14} color="#64748b" />
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {deliveryAddress ? (deliveryAddress.length > 25 ? deliveryAddress.substring(0, 25) + '...' : deliveryAddress) : 'Patna, Bihar 800001'}
              </span>
            </div>
          </button>
          
          <div className={styles.searchInputWrapper}>
            <Search size={20} color="#94a3b8" />
            <input 
              type="text"
              placeholder="Search for restaurants, cuisines, or dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className={styles.searchBtn}>
            <span>Search</span>
          </button>
        </div>
      </div>

      {showLocationModal && (
        <LocationMapModal 
          onClose={() => setShowLocationModal(false)}
          onSave={(lat, lng, address, placeName) => {
            setDeliveryLocation({ lat, lng });
            setDeliveryAddress(placeName || address);
            setShowLocationModal(false);
          }}
          initialLat={deliveryLocation?.lat}
          initialLng={deliveryLocation?.lng}
        />
      )}

      {/* 2. Sticky Quick Filters Bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className={styles.quickFilters}>
          <button className={styles.filterBtn} onClick={() => setActiveSort(activeSort === 'Relevance' ? 'Price: Low to High' : 'Relevance')}>
            Sort by: {activeSort} <ChevronDown size={14} />
          </button>
          <button className={`${styles.filterBtn} ${activeFilters.includes('Near Me') ? styles.activeFilter : ''}`} onClick={() => toggleFilter('Near Me')}>
            <MapPin size={14} /> Near Me
          </button>
          <button className={`${styles.filterBtn} ${activeFilters.includes('Fast Delivery') ? styles.activeFilter : ''}`} onClick={() => toggleFilter('Fast Delivery')}>
            <Zap size={14} /> Fast Delivery
          </button>
          <button className={`${styles.filterBtn} ${activeFilters.includes('Veg') ? styles.activeFilter : ''}`} onClick={() => toggleFilter('Veg')}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a' }}></div> Veg Only
          </button>
          <button className={`${styles.filterBtn} ${activeFilters.includes('Non Veg') ? styles.activeFilter : ''}`} onClick={() => toggleFilter('Non Veg')}>
            <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '10px solid #dc2626' }}></div> Non Veg
          </button>
          <button className={`${styles.filterBtn} ${activeFilters.includes('Under ₹200') ? styles.activeFilter : ''}`} onClick={() => toggleFilter('Under ₹200')}>
            <Banknote size={14} /> Under ₹200
          </button>
          <button className={`${styles.filterBtn} ${activeFilters.includes('50% Off') ? styles.activeFilter : ''}`} onClick={() => toggleFilter('50% Off')}>
            <div style={{ background: '#2563eb', color: 'white', padding: '2px 4px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>%</div> 50% Off
          </button>
          <button className={`${styles.filterBtn} ${activeFilters.includes('30% Off') ? styles.activeFilter : ''}`} onClick={() => toggleFilter('30% Off')}>
            <div style={{ background: '#2563eb', color: 'white', padding: '2px 4px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>%</div> 30% Off
          </button>
          <button className={`${styles.filterBtn} ${activeFilters.includes('Rating 4.0+') ? styles.activeFilter : ''}`} onClick={() => toggleFilter('Rating 4.0+')}>
            <Star size={14} /> Rating 4.0+
          </button>
        </div>
      </div>

      {/* 3. Main Discovery Layout */}
      <div className={styles.mainLayout}>
        
        {/* Promotional Carousel */}
        <div className={styles.bannerCarousel}>
          <div className={styles.bannerText}>
            <span style={{ background: '#fef08a', color: '#854d0e', padding: '4px 12px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px', display: 'inline-block' }}>LIMITED TIME</span>
            <h2>Get 50% OFF<br/>on your first order!</h2>
            <p style={{ margin: '0', fontSize: '1.1rem', opacity: 0.9 }}>Use code: <strong style={{ background: 'white', color: '#2563eb', padding: '4px 8px', borderRadius: '6px' }}>WELCOME50</strong></p>
          </div>
          <div style={{ height: '100%', width: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/restaurant.jpg" alt="Pizza" style={{ width: '180px', height: '180px', borderRadius: '50%', objectFit: 'cover', border: '6px solid rgba(255,255,255,0.2)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop")} />
          </div>
        </div>

        {/* Horizontal Category Chips */}
        <div className={styles.chipContainer}>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => { setActiveCategory(cat.name); setCurrentPage(1); }}
              className={`${styles.categoryChip} ${activeCategory === cat.name ? styles.active : ''}`}
            >
              {getCategoryIcon(cat.name)}
              {cat.name}
            </button>
          ))}
        </div>

        {isSearching ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b' }}>
              <div style={{ width: '24px', height: '24px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <span>Loading results...</span>
            </div>
          </div>
        ) : currentDishes.length === 0 && allRestaurants.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'white', borderRadius: '16px', marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>No items found</h3>
            <p style={{ color: '#64748b' }}>Try changing your search, filters, or category.</p>
          </div>
        ) : (
          <>
            {/* Top Offers (Restaurants) */}
            {allRestaurants.length > 0 && (
              <>
                <h3 className={styles.sectionTitle}>🎉 Top Offers Near You</h3>
                <div className={styles.dishGrid}>
                  {allRestaurants.filter((r: any) => r.offerText).slice(0, 5).map((r: any) => renderRestaurantCard(r))}
                </div>
              </>
            )}

            {/* Recommended Dishes */}
            {currentDishes.length > 0 && (
              <>
                <h3 className={styles.sectionTitle}>🌟 Recommended For You</h3>
                <div className={styles.dishGrid}>
                  {currentDishes.slice(0, 6).map((d: any) => renderDishCard(d))}
                </div>
              </>
            )}

            {/* Popular Restaurants */}
            {allRestaurants.length > 5 && (
              <>
                <h3 className={styles.sectionTitle}>🏪 Restaurants Near You</h3>
                <div className={styles.dishGrid}>
                  {allRestaurants.slice(0, 12).map((r: any) => renderRestaurantCard(r))}
                </div>
              </>
            )}

            {/* Fast Delivery */}
            {currentDishes.length > 6 && (
              <>
                <h3 className={styles.sectionTitle}>⚡ Fast Delivery</h3>
                <div className={styles.dishGrid}>
                  {currentDishes.slice(6, 12).map((d: any) => renderDishCard(d))}
                </div>
              </>
            )}

            {/* All Dishes Section (For browsing/infinite scroll) */}
            {currentDishes.length > 0 && (
              <>
                <h3 className={styles.sectionTitle}>Explore All Dishes</h3>
                <div className={styles.dishGrid}>
                  {currentDishes.map((d: any) => renderDishCard(d))}
                </div>

                {/* Pagination (To be replaced with Infinite Scroll later) */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '3rem' }}>
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      style={{ background: 'white', border: '1px solid #e2e8f0', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                      <ChevronLeft size={18} color="#64748b" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button 
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{ 
                          background: currentPage === page ? '#2563eb' : 'white', 
                          color: currentPage === page ? 'white' : '#64748b',
                          border: currentPage === page ? 'none' : '1px solid #e2e8f0', 
                          width: '36px', height: '36px', borderRadius: '8px', 
                          fontWeight: 600, cursor: 'pointer' 
                        }}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      style={{ background: 'white', border: '1px solid #e2e8f0', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                    >
                      <ChevronRight size={18} color="#64748b" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <StickyCartSummary />
      <ClearCartModal 
        isOpen={clearCartModalOpen} 
        onClose={() => setClearCartModalOpen(false)} 
        onClearAndAdd={handleClearAndAdd} 
      />
    </div>
  );
}