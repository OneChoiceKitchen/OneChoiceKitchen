'use client';
import React from 'react';
import Link from 'next/link';
import { Tag, ArrowRight, Clock } from 'lucide-react';

export default function HomeOffers() {
  const offers = [
    {
      id: 1,
      title: "First Order Discount",
      discount: "50% OFF",
      description: "Get 50% off your very first order up to ₹150.",
      code: "WELCOME50",
      expires: "Valid for new users only",
      bgColor: "#fff1f2",
      borderColor: "#fecdd3",
      textColor: "#e11d48",
      gradient: "linear-gradient(135deg, #fb7185 0%, #e11d48 100%)"
    },
    {
      id: 2,
      title: "Weekend Special",
      discount: "FLAT ₹100",
      description: "Flat ₹100 off on premium menu items this weekend.",
      code: "WEEKEND100",
      expires: "Expires in 2 days",
      bgColor: "#eff6ff",
      borderColor: "#bfdbfe",
      textColor: "#2563eb",
      gradient: "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)"
    },
    {
      id: 3,
      title: "Free Delivery",
      discount: "₹0 FEE",
      description: "Enjoy zero delivery fees on orders above ₹499.",
      code: "FREEDEL",
      expires: "Limited time offer",
      bgColor: "#ecfdf5",
      borderColor: "#a7f3d0",
      textColor: "#059669",
      gradient: "linear-gradient(135deg, #34d399 0%, #059669 100%)"
    }
  ];

  return (
    <section style={{ padding: '4rem 1.5rem', background: '#ffffff' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              <Tag size={20} /> Latest Deals
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a' }}>
              Deals You Can&apos;t Miss
            </h2>
          </div>
          <Link href="/menu" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontWeight: '600', textDecoration: 'none' }}>
            View All Offers <ArrowRight size={18} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {offers.map(offer => (
            <div 
              key={offer.id}
              style={{
                borderRadius: '16px',
                border: `2px dashed ${offer.borderColor}`,
                background: offer.bgColor,
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Decorative gradient corner */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '150px',
                height: '150px',
                background: offer.gradient,
                clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                opacity: 0.1
              }} />

              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: offer.textColor, marginBottom: '0.5rem' }}>
                {offer.title}
              </h3>
              
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem', lineHeight: '1' }}>
                {offer.discount}
              </div>
              
              <p style={{ color: '#475569', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                {offer.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ 
                  background: 'white', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '8px', 
                  border: `1px solid ${offer.borderColor}`,
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  color: '#0f172a'
                }}>
                  {offer.code}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b', fontSize: '0.9rem' }}>
                  <Clock size={14} /> {offer.expires}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}