'use client';
import React from 'react';
import { Tag } from 'lucide-react';

interface TiffinOffer {
  id: string;
  title: string;
  description: string;
  discountPct: number;
  minBookings: number;
  imageUrl: string;
  appliesToTiffin: boolean;
  appliesToMenu: boolean;
  isHero?: boolean;
}

interface GlobalOffersDisplayProps {
  offers: TiffinOffer[];
}

export default function GlobalOffersDisplay({ offers }: GlobalOffersDisplayProps) {
  if (!offers || offers.length === 0) return null;

  const heroOffers = offers.filter(o => o.isHero);
  const regularOffers = offers.filter(o => !o.isHero);

  const getFallbackColor = (idx: number) => {
    const colors = [
      { bg: 'linear-gradient(135deg, #FF6B6B 0%, #C92A2A 100%)', text: 'white' },
      { bg: 'linear-gradient(135deg, #4DABF7 0%, #1864AB 100%)', text: 'white' },
      { bg: 'linear-gradient(135deg, #FFD43B 0%, #E67700 100%)', text: '#212529' },
      { bg: 'linear-gradient(135deg, #69DB7C 0%, #2B8A3E 100%)', text: 'white' },
    ];
    return colors[idx % colors.length];
  };

  const renderOfferCard = (offer: TiffinOffer, idx: number, isHero: boolean) => {
    const color = getFallbackColor(idx);

    if (isHero && offer.imageUrl) {
      return (
        <div
          key={offer.id}
          style={{
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            width: '100%',
            display: 'block',
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: '1px solid #e2e8f0',
            background: 'white',
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
        >
          <img
            src={offer.imageUrl}
            alt={offer.title}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </div>
      );
    }

    return (
      <div
        key={offer.id}
        style={{
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          border: offer.imageUrl ? '1px solid #e2e8f0' : 'none',
          background: offer.imageUrl ? 'white' : color.bg,
          color: offer.imageUrl ? 'inherit' : color.text,
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: offer.imageUrl ? '0' : '2rem',
          textAlign: offer.imageUrl ? 'left' : 'center',
          aspectRatio: offer.imageUrl ? '16 / 9' : 'auto',
          minHeight: offer.imageUrl ? 'auto' : '200px',
          width: '100%',
        }}
        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
      >
        {offer.imageUrl ? (
          <img
            src={offer.imageUrl}
            alt={offer.title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
              background: 'white',
            }}
          />
        ) : (
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Tag size={isHero ? 64 : 48} style={{ margin: '0 auto 1rem auto', opacity: 0.8 }} />
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: isHero ? '2rem' : '1.5rem', fontWeight: 800 }}>
              {offer.title}
            </h3>
            {offer.description && (
              <p style={{ margin: '0 0 1rem 0', opacity: 0.9, fontSize: isHero ? '1.2rem' : '1rem' }}>
                {offer.description}
              </p>
            )}
            {offer.discountPct > 0 && (
              <div style={{ 
                display: 'inline-block', 
                background: 'rgba(255,255,255,0.2)', 
                padding: '0.5rem 1rem', 
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                border: '1px solid rgba(255,255,255,0.4)'
              }}>
                Save {offer.discountPct}%
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      <style>{`
        .responsive-offers-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .responsive-offers-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .responsive-offers-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1440px) {
          .responsive-offers-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      {/* Hero Offers Section */}
      {heroOffers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: regularOffers.length > 0 ? '1.5rem' : '0' }}>
          {heroOffers.map((offer, idx) => renderOfferCard(offer, idx, true))}
        </div>
      )}

      {/* Regular Offers Section */}
      {regularOffers.length > 0 && (
        <div className="responsive-offers-grid">
          {regularOffers.map((offer, idx) => renderOfferCard(offer, idx + heroOffers.length, false))}
        </div>
      )}
    </div>
  );
}
