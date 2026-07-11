import React from 'react';
import { Sparkles, MapPin, Gift, Clock, History, PartyPopper, Train } from 'lucide-react';

export default function MobileExploreSections({ collections }: { collections: any }) {
  if (!collections) return null;

  return (
    <div style={{ margin: '1.5rem 0' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Sparkles size={18} color="#2563eb" /> Explore
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        
        {/* Offers */}
        <div style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', borderRadius: '12px', padding: '1rem', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>Top Offers</h4>
          <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.9 }}>Up to 50% off</p>
          <Gift size={40} color="white" style={{ position: 'absolute', right: '-5px', bottom: '-5px', opacity: 0.2 }} />
        </div>

        {/* Top 10 */}
        <div style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)', borderRadius: '12px', padding: '1rem', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(234, 179, 8, 0.3)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>Top 10 Nearby</h4>
          <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.9 }}>Highest rated spots</p>
          <MapPin size={40} color="white" style={{ position: 'absolute', right: '-5px', bottom: '-5px', opacity: 0.2 }} />
        </div>

        {/* Food on Train */}
        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '12px', padding: '1rem', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>Food on Train</h4>
          <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.9 }}>Delivery at seat</p>
          <Train size={40} color="white" style={{ position: 'absolute', right: '-5px', bottom: '-5px', opacity: 0.2 }} />
        </div>

        {/* Plan a Party */}
        <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', borderRadius: '12px', padding: '1rem', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>Plan a Party</h4>
          <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.9 }}>Bulk catering</p>
          <PartyPopper size={40} color="white" style={{ position: 'absolute', right: '-5px', bottom: '-5px', opacity: 0.2 }} />
        </div>

      </div>

      {/* Previously Ordered (Collections) */}
      {collections.previouslyOrdered && collections.previouslyOrdered.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={16} color="#475569" /> Order Again
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -1.25rem', padding: '0 1.25rem' }}>
            {collections.previouslyOrdered.map((item: any) => (
              <div key={item.id} style={{ minWidth: '140px', background: 'white', padding: '0.75rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '32px', height: '32px', background: '#eff6ff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                  {item.type === 'dish' ? '🍲' : '🏪'}
                </div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b' }}>Last {item.lastOrder}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
