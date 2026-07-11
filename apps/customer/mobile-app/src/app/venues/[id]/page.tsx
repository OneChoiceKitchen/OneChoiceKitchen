'use client';
import React, { useState } from 'react';
import { ArrowLeft, Star, MapPin, Check, Info } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export default function VenueDetails() {
  const router = useRouter();
  const { id } = useParams();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

  const venue = {
    id,
    name: 'Royal Palace Banquet',
    location: 'Downtown',
    rating: 4.8,
    price: '₹50,000',
    capacity: '100-500 Guests',
    img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
    description: 'A luxurious banquet hall perfect for marriages and grand receptions.',
    packages: [
      { id: 1, name: 'Standard Food Package', price: '₹1,500 / plate', items: '2 Starters, 1 Main Course, 1 Dessert' },
      { id: 2, name: 'Premium Food Package', price: '₹2,500 / plate', items: '4 Starters, 3 Main Course, 2 Desserts' },
    ]
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '90px' }}>
      {/* Hero Image */}
      <div style={{ position: 'relative', height: '250px' }}>
        <button onClick={() => router.back()} style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={24} color="#0f172a" />
        </button>
        <img src={venue.img} alt={venue.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '2rem 1rem 1rem', color: 'white' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{venue.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.9 }}>
            <MapPin size={16} /> {venue.location}
          </div>
        </div>
      </div>

      <div style={{ padding: '1.5rem 1rem' }}>
        {/* Info Cards */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>{venue.rating}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Out of 5</div>
          </div>
          <div style={{ flex: 1, background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{venue.capacity}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Capacity</div>
          </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>About</h3>
        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
          {venue.description}
        </p>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Food Packages</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {venue.packages.map(pkg => (
            <div 
              key={pkg.id} 
              onClick={() => setSelectedPackage(pkg.id)}
              style={{ 
                background: 'white', padding: '1rem', borderRadius: '12px', 
                border: selectedPackage === pkg.id ? '2px solid #ef4444' : '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)', cursor: 'pointer', position: 'relative'
              }}
            >
              {selectedPackage === pkg.id && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#ef4444' }}>
                  <Check size={20} />
                </div>
              )}
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>{pkg.name}</h4>
              <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{pkg.price}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{pkg.items}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Venue Price</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{venue.price}</div>
        </div>
        <button 
          onClick={() => router.push(`/venues/${id}/book`)}
          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700, fontSize: '1rem' }}
        >
          Proceed to Book
        </button>
      </div>
    </div>
  );
}
