'use client';
import React, { useEffect, useState } from 'react';
import { Search, MapPin, Bell, User, Home, Receipt, Grid } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function MobileApp() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [tiffinPlans, setTiffinPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<any[]>('/menus').catch(() => []),
      apiFetch<any[]>('/tiffin/plans').catch(() => []),
    ]).then(([menus, plans]) => {
      setMenuItems(menus.slice(0, 4));
      setTiffinPlans(plans.slice(0, 4));
      setLoading(false);
    });
  }, []);
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header / Location */}
      <div style={{ background: 'white', padding: '1.25rem 1rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: '#fef2f2', padding: '0.5rem', borderRadius: '50%', color: '#ef4444' }}>
            <MapPin size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivering to</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Home - 123 Main St
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <button style={{ background: 'none', border: 'none', padding: '0.5rem', color: '#0f172a' }}>
            <Bell size={22} />
          </button>
          <div style={{ position: 'absolute', top: '8px', right: '10px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} />
        </div>
      </div>

      {/* Main Content Scrollable Area */}
      <div style={{ padding: '1rem', paddingBottom: '90px' }}>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }}>
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search for 'Biryani' or 'Tiffin'" 
            style={{ 
              width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '16px', 
              border: 'none', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              fontSize: '0.95rem', color: '#0f172a', boxSizing: 'border-box', outline: 'none'
            }} 
          />
        </div>

        {/* Banners */}
        <div style={{ 
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
          borderRadius: '20px', padding: '1.5rem', color: 'white', marginBottom: '2rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)'
        }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>50% OFF</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '1rem' }}>Up to ₹100 on your first order</div>
            <button style={{ background: 'white', color: '#ef4444', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
              Order Now
            </button>
          </div>
          <div style={{ fontSize: '4rem' }}>🥗</div>
        </div>

        {/* Categories */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { name: 'Tiffins', icon: '🍱', color: '#fef2f2' },
            { name: 'Healthy', icon: '🥗', color: '#f0fdf4' },
            { name: 'Biryani', icon: '🍚', color: '#fffbeb' },
            { name: 'Venues', icon: '🏰', color: '#fdf4ff', href: '/venues' }
          ].map((cat, i) => (
            <a key={i} href={cat.href || '#'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                {cat.icon}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{cat.name}</span>
            </a>
          ))}
        </div>

        {/* Featured Restaurants */}
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0' }}>
            {loading ? 'Loading...' : 'Menu & Tiffin'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...menuItems, ...tiffinPlans].map((item, i) => (
              <div key={item.id || i} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ height: '120px', width: '100%', background: item.image ? `url(${item.image}) center/cover` : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                  {!item.image && '🍽️'}
                </div>
                <div style={{ padding: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</h4>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {item.category || item.mealType || item.dietType || 'Food'} • ₹{item.price || item.basePrice || '—'}
                  </div>
                </div>
              </div>
            ))}
            {!loading && menuItems.length === 0 && tiffinPlans.length === 0 && (
              <p style={{ color: '#64748b', textAlign: 'center' }}>No items available. Start the API server.</p>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Navigation */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        background: 'white', borderTop: '1px solid #f1f5f9',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0.75rem 0 1.5rem', zIndex: 100,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#ef4444' }}>
          <Home size={24} fill="currentColor" />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Home</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#94a3b8' }}>
          <Grid size={24} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Browse</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#94a3b8' }}>
          <Receipt size={24} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Orders</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#94a3b8' }}>
          <User size={24} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Profile</span>
        </div>
      </div>
    </div>
  );
}
