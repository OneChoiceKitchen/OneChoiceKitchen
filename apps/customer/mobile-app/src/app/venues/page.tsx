'use client';
import React, { useState } from 'react';
import { Search, MapPin, Star, Filter, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VenuesSearch() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const mockVenues = [
    { id: 1, name: 'Royal Palace Banquet', location: 'Downtown', rating: 4.8, price: '₹50,000 / day', capacity: '100-500', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500' },
    { id: 2, name: 'Green Garden Outdoors', location: 'West End', rating: 4.5, price: '₹30,000 / day', capacity: '50-200', img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500' },
  ];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} color="#0f172a" />
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Book a Venue</h1>
      </div>

      <div style={{ padding: '1rem' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }}>
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search halls, outdoors..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ 
                width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', 
                border: '1px solid #e2e8f0', background: 'white',
                fontSize: '0.95rem', color: '#0f172a', boxSizing: 'border-box', outline: 'none'
              }} 
            />
          </div>
          <button style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', width: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <Filter size={20} />
          </button>
        </div>

        {/* Venues List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mockVenues.map(v => (
            <div key={v.id} onClick={() => router.push(`/venues/${v.id}`)} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
              <img src={v.img} alt={v.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{v.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#fef3c7', padding: '0.25rem 0.5rem', borderRadius: '8px', color: '#d97706', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Star size={14} fill="currentColor" /> {v.rating}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <MapPin size={14} /> {v.location}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Capacity</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{v.capacity}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Starting at</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>{v.price}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
