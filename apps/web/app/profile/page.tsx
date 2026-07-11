'use client';
import { useState, useEffect } from 'react';
import styles from '../page.module.css';
import Link from 'next/link';

import { BrandHeader, useToast } from '@org/ui-design-system';
import { useGlobalContext } from '../context/GlobalContext';
import { LogIn } from 'lucide-react';

import RequireAuth from '../components/RequireAuth';
import LazyDishCard from '../components/LazyDishCard';

export default function CustomerProfile() {
  const { loggedIn, logout, cart } = useGlobalContext();
  const toast = useToast();
  const [dbFavorites, setDbFavorites] = useState<any[]>([]);
  const [dbReservations, setDbReservations] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const favorites = dbFavorites.map(f => f.menuItemId);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('customer_token')}` }
      });
      if (res.ok) {
        setDbFavorites(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch favorites', err);
      toast.error('Failed to fetch favorites');
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/reservations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('customer_token')}` }
      });
      if (res.ok) {
        setDbReservations(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch reservations', err);
      toast.error('Failed to fetch reservations');
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/branches');
      if (res.ok) {
        setBranches(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch branches', err);
      toast.error('Failed to fetch branches');
    }
  };

  const isFavorite = (id: string) => {
    return dbFavorites.some(f => f.menuItemId === id);
  };

  const toggleFavorite = async (itemId: string) => {
    const fav = dbFavorites.find(f => f.menuItemId === itemId);
    try {
      if (fav) {
        const res = await fetch(`/api/favorites/${fav.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('customer_token')}` }
        });
        if (res.ok) {
          setDbFavorites(prev => prev.filter(f => f.id !== fav.id));
        }
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('customer_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ menuItemId: itemId, type: 'DISCOVERY' })
        });
        if (res.ok) {
          const newFav = await res.json();
          setDbFavorites(prev => [...prev, newFav]);
        }
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
      toast.error('Failed to update favorite status');
    }
  };

  const addToCart = (item: any) => {};
  const updateCartQty = (id: string, delta: number) => {};
  const [activeTab, setActiveTab] = useState('subscription');
  const [tabLoading, setTabLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [restaurantItems, setRestaurantItems] = useState<any[]>([]);

  // Reservation Form State
  const [resBranchId, setResBranchId] = useState('');
  const [resDate, setResDate] = useState('');
  const [resTime, setResTime] = useState('19:00');
  const [resPartySize, setResPartySize] = useState('2');
  const [resRequests, setResRequests] = useState('');
  const [resMessage, setResMessage] = useState<string | null>(null);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resBranchId || !resDate || !resTime || !resPartySize) {
      toast.warning('Please fill in all required fields.');
      return;
    }
    
    const selectedBranch = branches.find(b => b.id === resBranchId);
    if (!selectedBranch) return;

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('customer_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          restaurantId: selectedBranch.restaurantId,
          branchId: resBranchId,
          date: new Date(`${resDate}T${resTime}:00`),
          timeSlot: resTime,
          partySize: parseInt(resPartySize),
          specialRequests: resRequests
        })
      });
      if (res.ok) {
        setResMessage('Reservation booked successfully! 🎉');
        setResBranchId('');
        setResDate('');
        setResRequests('');
        fetchReservations();
        setTimeout(() => setResMessage(null), 3000);
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to book table.');
      }
    } catch {
      toast.error('Connection failed. Please try again.');
    }
  };

  useEffect(() => {
    const localOrders = localStorage.getItem('saas_orders');
    if (localOrders) {
      setOrders(JSON.parse(localOrders));
    }
    const localItems = localStorage.getItem('saas_restaurant_items');
    if (localItems) {
      setRestaurantItems(JSON.parse(localItems));
    }
    if (loggedIn) {
      fetchFavorites();
      fetchReservations();
      fetchBranches();
    }
  }, [loggedIn]);

  const handleTabChange = (tab: string) => {
    setTabLoading(true);
    setActiveTab(tab);
    setTimeout(() => {
      setTabLoading(false);
    }, 450);
  };

  return (
    <RequireAuth>
      <div className={styles.main} style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
      {/* Navbar */}
      <BrandHeader>
        <div className={styles.navLinks}>
          <span style={{color: 'var(--text-secondary)'}}>John Doe (customer@test.com)</span>
          <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gradient)'}}></div>
          <button 
            onClick={logout}
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid var(--card-border)', 
              padding: '0.4rem 0.8rem', 
              borderRadius: '8px', 
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Logout
          </button>
        </div>
      </BrandHeader>

      {/* Dashboard Layout */}
      <div className={styles.profileLayout}>
        
        {/* Sidebar */}
        <aside className={styles.profileSidebar}>
          <div 
            onClick={() => handleTabChange('subscription')}
            style={{ padding: '0.85rem 1rem', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'subscription' ? 'rgba(0, 56, 147, 0.08)' : 'transparent', color: activeTab === 'subscription' ? 'var(--accent-hover)' : 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: activeTab === 'subscription' ? 600 : 500, borderLeft: activeTab === 'subscription' ? '4px solid var(--accent-hover)' : 'none' }}
          >
            📦 My Subscription
          </div>
          <div 
            onClick={() => handleTabChange('favorites')}
            style={{ padding: '0.85rem 1rem', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'favorites' ? 'rgba(0, 56, 147, 0.08)' : 'transparent', color: activeTab === 'favorites' ? 'var(--accent-hover)' : 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: activeTab === 'favorites' ? 600 : 500, borderLeft: activeTab === 'favorites' ? '4px solid var(--accent-hover)' : 'none' }}
          >
            ❤️ My Favorites
          </div>
          <div 
            onClick={() => handleTabChange('reservations')}
            style={{ padding: '0.85rem 1rem', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'reservations' ? 'rgba(0, 56, 147, 0.08)' : 'transparent', color: activeTab === 'reservations' ? 'var(--accent-hover)' : 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: activeTab === 'reservations' ? 600 : 500, borderLeft: activeTab === 'reservations' ? '4px solid var(--accent-hover)' : 'none' }}
          >
            🍽️ Table Reservations
          </div>
          <div 
            onClick={() => handleTabChange('calendar')}
            style={{ padding: '0.85rem 1rem', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'calendar' ? 'rgba(0, 56, 147, 0.08)' : 'transparent', color: activeTab === 'calendar' ? 'var(--accent-hover)' : 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: activeTab === 'calendar' ? 600 : 500, borderLeft: activeTab === 'calendar' ? '4px solid var(--accent-hover)' : 'none' }}
          >
            📅 Meal Calendar
          </div>
          <div 
            onClick={() => handleTabChange('billing')}
            style={{ padding: '0.85rem 1rem', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'billing' ? 'rgba(0, 56, 147, 0.08)' : 'transparent', color: activeTab === 'billing' ? 'var(--accent-hover)' : 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: activeTab === 'billing' ? 600 : 500, borderLeft: activeTab === 'billing' ? '4px solid var(--accent-hover)' : 'none' }}
          >
            💳 Billing & Invoices
          </div>
          <div 
            onClick={() => handleTabChange('orders')}
            style={{ padding: '0.85rem 1rem', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'orders' ? 'rgba(0, 56, 147, 0.08)' : 'transparent', color: activeTab === 'orders' ? 'var(--accent-hover)' : 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: activeTab === 'orders' ? 600 : 500, borderLeft: activeTab === 'orders' ? '4px solid var(--accent-hover)' : 'none' }}
          >
            🛍️ Order History
          </div>
          <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '0.5rem 0' }} className="sidebarDivider"></div>
          <div 
            onClick={() => handleTabChange('profile')}
            style={{ padding: '0.85rem 1rem', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'profile' ? 'rgba(0, 56, 147, 0.08)' : 'transparent', color: activeTab === 'profile' ? 'var(--accent-hover)' : 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: activeTab === 'profile' ? 600 : 500, borderLeft: activeTab === 'profile' ? '4px solid var(--accent-hover)' : 'none' }}
          >
            👤 Profile Settings
          </div>
          <div 
            onClick={() => handleTabChange('security')}
            style={{ padding: '0.85rem 1rem', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'security' ? 'rgba(0, 56, 147, 0.08)' : 'transparent', color: activeTab === 'security' ? 'var(--accent-hover)' : 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: activeTab === 'security' ? 600 : 500, borderLeft: activeTab === 'security' ? '4px solid var(--accent-hover)' : 'none' }}
          >
            🛡️ Security & Verifications
          </div>
          <Link 
            href="/loyalty"
            style={{ padding: '0.85rem 1rem', borderRadius: '8px', color: 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: 500, display: 'block', textDecoration: 'none' }}
          >
            🎁 Loyalty Store
          </Link>
          <Link 
            href="/referral"
            style={{ padding: '0.85rem 1rem', borderRadius: '8px', color: 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: 500, display: 'block', textDecoration: 'none' }}
          >
            🤝 Refer & Earn
          </Link>
          <Link 
            href="/reviews"
            style={{ padding: '0.85rem 1rem', borderRadius: '8px', color: 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: 500, display: 'block', textDecoration: 'none' }}
          >
            ⭐ Write Order Review
          </Link>
          <Link 
            href="/support"
            style={{ padding: '0.85rem 1rem', borderRadius: '8px', color: 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: 500, display: 'block', textDecoration: 'none' }}
          >
            🎟️ Support & Tickets
          </Link>
          <Link 
            href="/blogs"
            style={{ padding: '0.85rem 1rem', borderRadius: '8px', color: 'var(--text-secondary)', transition: 'all 0.2s', fontWeight: 500, display: 'block', textDecoration: 'none' }}
          >
            📖 Culinary Blog
          </Link>
        </aside>

        {/* Main Content Area */}
        <main className="profileMain" style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '2rem', transition: 'all 0.3s' }}>
          
          {tabLoading ? (
            <div className={styles.shimmerLoader}></div>
          ) : (
            <>
              {activeTab === 'subscription' && (
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Active Plan</h2>
                  
                  <div style={{ background: 'rgba(0, 56, 147, 0.05)', border: '1px solid rgba(0, 56, 147, 0.15)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-hover)' }}>Monthly Standard (Veg)</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Expires in 12 days</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>₹3,500/mo</div>
                        <span style={{ fontSize: '0.8rem', color: '#10b981' }}>Active</span>
                      </div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Delivery Address</h3>
                  <div style={{ padding: '1.5rem', border: '1px solid var(--card-border)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                    123 Example Street, Block A<br/>
                    Cityville, State 12345<br/><br/>
                    <strong style={{color: 'var(--text-primary)'}}>Distance tracking:</strong> 2.4 KM from kitchen (Free Delivery applies)
                  </div>
                </div>
              )}

              {activeTab === 'calendar' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>Delivery Calendar</h2>
                    <button className={styles.secondaryBtn} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Pause Next Meal</button>
                  </div>
                  
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', border: '1px solid var(--card-border)', borderRadius: '12px', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>Tomorrow, 1:00 PM</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Standard Lunch Box</div>
                        </div>
                        <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
                          Scheduled
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div style={{ overflowX: 'auto' }}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recent Invoices</h2>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '1rem' }}>Date</th>
                        <th style={{ padding: '1rem' }}>Description</th>
                        <th style={{ padding: '1rem' }}>Amount</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                        <td style={{ padding: '1rem' }}>May 01, 2026</td>
                        <td style={{ padding: '1rem' }}>Monthly Standard Plan</td>
                        <td style={{ padding: '1rem' }}>₹3,500</td>
                        <td style={{ padding: '1rem', color: '#10b981' }}>Paid</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Order History</h2>
                  {orders.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--card-border)', borderRadius: '12px' }}>
                      You haven't placed any orders yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {orders.map((order: any, idx: number) => (
                        <div key={idx} style={{ border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem', background: '#fff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--card-border)', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Order #{order.id}</div>
                              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status: <span style={{ color: order.status === 'Delivered' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{order.status}</span></div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                              ₹{order.total}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {order.cartDetails ? (
                              order.cartDetails.map((item: any, i: number) => {
                                return (
                                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: 60, height: 60, borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                                      <img src={`http://localhost:4208${item.image || '/placeholder-dish.png'}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Qty: {item.qty} × ₹{item.price}</div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{order.items}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'favorites' && (
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Favorite Dishes</h2>
                  {favorites.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--card-border)', borderRadius: '12px' }}>
                      You haven't added any dishes to your favorites yet.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {restaurantItems
                        .filter(item => favorites.includes(item.id))
                        .map(item => (
                          <LazyDishCard 
                            key={item.id} 
                            item={item} 
                            cart={cart} 
                            onAdd={addToCart} 
                            onUpdateQty={updateCartQty}
                            isFavorite={isFavorite(item.id)}
                            onToggleFavorite={toggleFavorite}
                            onCustomize={() => {}} // No customization needed here for now
                          />
                        ))}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'reservations' && (
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Book a Table</h2>
                  {resMessage && (
                    <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 600 }}>
                      {resMessage}
                    </div>
                  )}
                  
                  <form onSubmit={handleCreateReservation} style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Select Branch *</label>
                      <select
                        value={resBranchId}
                        onChange={(e) => setResBranchId(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem' }}
                        required
                      >
                        <option value="">Choose a branch</option>
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Date *</label>
                      <input
                        type="date"
                        value={resDate}
                        onChange={(e) => setResDate(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem' }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Time Slot *</label>
                      <input
                        type="time"
                        value={resTime}
                        onChange={(e) => setResTime(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem' }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Party Size (Guests) *</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={resPartySize}
                        onChange={(e) => setResPartySize(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem' }}
                        required
                      />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Special Requests</label>
                      <textarea
                        value={resRequests}
                        onChange={(e) => setResRequests(e.target.value)}
                        placeholder="Allergies, high chair, window seat..."
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', minHeight: '80px', fontFamily: 'inherit' }}
                      />
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="submit"
                        style={{ background: '#2563EB', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Book Table
                      </button>
                    </div>
                  </form>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#0f172a' }}>My Reservations</h3>
                  {dbReservations.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                      You have no table bookings yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {dbReservations.map(res => {
                        const branch = branches.find(b => b.id === res.branchId);
                        return (
                          <div key={res.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>{branch?.name || 'Restaurant Branch'}</div>
                              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                                📅 {new Date(res.date).toLocaleDateString()} at {res.timeSlot} • 👥 {res.partySize} Guests
                              </div>
                              {res.specialRequests && (
                                <div style={{ fontSize: '0.85rem', color: '#64748b', background: '#f8fafc', padding: '0.5rem', borderRadius: '6px', marginTop: '0.5rem' }}>
                                  ✍️ "{res.specialRequests}"
                                </div>
                              )}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{
                                display: 'inline-block',
                                background: res.status === 'CONFIRMED' ? '#dcfce7' : res.status === 'PENDING' ? '#fef08a' : '#fee2e2',
                                color: res.status === 'CONFIRMED' ? '#166534' : res.status === 'PENDING' ? '#854d0e' : '#991b1b',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}>
                                {res.status}
                              </span>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Code: <strong>{res.confirmationCode}</strong></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'profile' && (
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Profile Settings</h2>
                  
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Profile Info */}
                    <div style={{ border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem', background: '#fff' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Personal Information</h3>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', overflow: 'hidden' }}>
                          <span>JD</span>
                        </div>
                        <div>
                          <input type="file" id="profilePhoto" style={{ display: 'none' }} accept="image/*" />
                          <label htmlFor="profilePhoto" className={styles.secondaryBtn} style={{ padding: '0.5rem 1rem', display: 'inline-block', cursor: 'pointer', marginBottom: '0.5rem' }}>
                            Upload New Photo
                          </label>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>JPG, GIF or PNG. Max size of 800K</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full Name</label>
                          <input type="text" defaultValue="John Doe" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email Address</label>
                          <input type="email" defaultValue="customer@test.com" disabled style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', boxSizing: 'border-box', background: 'rgba(0,0,0,0.02)' }} />
                        </div>
                      </div>
                      <div style={{ marginTop: '1rem' }}>
                        <button className={styles.primaryBtn} style={{ padding: '0.5rem 1.5rem', borderRadius: '8px' }}>Save Changes</button>
                      </div>
                    </div>

                    {/* Address Management */}
                    <div style={{ border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem', background: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.2rem' }}>Saved Addresses</h3>
                        <button className={styles.secondaryBtn} style={{ padding: '0.4rem 1rem' }}>+ Add New</button>
                      </div>
                      
                      <div style={{ border: '1px solid var(--accent-hover)', borderRadius: '8px', padding: '1rem', background: 'rgba(0, 56, 147, 0.02)', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--accent-hover)', color: '#fff', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Default</span>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Home</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>123 Example Street, Block A, Cityville, State 12345</div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--accent-hover)', cursor: 'pointer', fontWeight: 500 }}>Edit</span>
                          <span style={{ color: '#DC2626', cursor: 'pointer', fontWeight: 500 }}>Delete</span>
                        </div>
                      </div>
                    </div>

                    {/* Notification Preferences */}
                    <div style={{ border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem', background: '#fff' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Notification Preferences</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                          <input type="checkbox" defaultChecked style={{ width: '1.2rem', height: '1.2rem' }} />
                          <div>
                            <div style={{ fontWeight: 500 }}>Order Updates</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Get notified about your order status and delivery updates.</div>
                          </div>
                        </label>
                        
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                          <input type="checkbox" defaultChecked style={{ width: '1.2rem', height: '1.2rem' }} />
                          <div>
                            <div style={{ fontWeight: 500 }}>Promotional Offers</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Receive exclusive discounts and special offers.</div>
                          </div>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                          <input type="checkbox" style={{ width: '1.2rem', height: '1.2rem' }} />
                          <div>
                            <div style={{ fontWeight: 500 }}>Newsletter</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Weekly updates on new recipes and culinary tips.</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Security & Verifications</h2>
                  
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Verifications Section */}
                    <div style={{ border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem', background: '#fff' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Verifications</h3>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--card-border)' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>Email Verification</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>customer@test.com</div>
                        </div>
                        <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>✓</span> Verified
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--card-border)' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>Mobile Number (SMS)</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>+91 9876543210</div>
                        </div>
                        <button className={styles.secondaryBtn} style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Verify Now</button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>WhatsApp Verification</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Mandatory for priority alerts</div>
                        </div>
                        <button className={styles.secondaryBtn} style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Connect WhatsApp</button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div style={{ border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem', background: '#fff' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Two-Factor Authentication (2FA)</h3>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Add an extra layer of security to your account. When logging in, you'll need to provide a code generated by your authenticator app.</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>Authenticator App (TOTP)</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status: Not Configured</div>
                        </div>
                        <button className={styles.primaryBtn} style={{ padding: '0.5rem 1.2rem', borderRadius: '8px' }}>Setup 2FA</button>
                      </div>
                    </div>

                    {/* OAuth Connections */}
                    <div style={{ border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem', background: '#fff' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Connected Accounts</h3>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--card-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#DB4437' }}>G</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>Google</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Not connected</div>
                          </div>
                        </div>
                        <button className={styles.secondaryBtn} style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Connect</button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#4267B2' }}>f</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>Facebook</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Not connected</div>
                          </div>
                        </div>
                        <button className={styles.secondaryBtn} style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Connect</button>
                      </div>
                    </div>

                    {/* Account Management */}
                    <div style={{ border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '1.5rem', background: '#fff' }}>
                      <h3 style={{ fontSize: '1.2rem', color: '#DC2626', marginBottom: '1rem' }}>Danger Zone</h3>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Deactivating your account will suspend your subscription. Deleting your account will remove all your data permanently.</p>
                      
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className={styles.secondaryBtn} style={{ borderColor: '#DC2626', color: '#DC2626' }}>Deactivate Account</button>
                        <button style={{ background: '#DC2626', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Delete Account</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .sidebarDivider { display: none; }
          .profileMain { padding: 1rem !important; }
        }
      `}} />
      </div>
    </RequireAuth>
  );
}
