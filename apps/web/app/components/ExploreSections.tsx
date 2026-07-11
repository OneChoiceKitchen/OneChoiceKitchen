import React from 'react';
import { Sparkles, Gift, History, PartyPopper, Train, Star } from 'lucide-react';

export default function ExploreSections({ collections }: { collections: any }) {
  if (!collections) return null;

  return (
    <div style={{ padding: '2rem 1.5rem', background: '#f8fafc', margin: '2rem 0', borderRadius: '16px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles color="#2563eb" /> Explore What's Hot
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          {/* Offers */}
          <div style={{ background: 'linear-gradient(135deg, #DC2626, #b91c1c)', borderRadius: '16px', padding: '1.5rem', color: 'white', position: 'relative', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Top Offers</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>Grab up to 50% off</p>
            <Gift size={80} color="white" style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.2 }} />
          </div>

          {/* Top 10 */}
          <div style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)', borderRadius: '16px', padding: '1.5rem', color: 'white', position: 'relative', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(234, 179, 8, 0.3)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Top 10 Nearby</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>Highest rated spots</p>
            <Star size={80} color="white" style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.2 }} />
          </div>

          {/* Food on Train */}
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '16px', padding: '1.5rem', color: 'white', position: 'relative', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Food on Train</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>Delivery at your seat</p>
            <Train size={80} color="white" style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.2 }} />
          </div>

          {/* Plan a Party */}
          <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', borderRadius: '16px', padding: '1.5rem', color: 'white', position: 'relative', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Plan a Party</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>Bulk catering made easy</p>
            <PartyPopper size={80} color="white" style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.2 }} />
          </div>

        </div>

        {/* Previously Ordered (Collections) */}
        {collections.previouslyOrdered && collections.previouslyOrdered.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History color="#475569" /> Order Again
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {collections.previouslyOrdered.map((item: any) => (
                <div key={item.id} style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    {item.type === 'dish' ? '🍲' : '🏪'}
                  </div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 700, color: '#0f172a' }}>{item.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Last ordered {item.lastOrder}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
