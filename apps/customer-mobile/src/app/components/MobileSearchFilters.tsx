import React, { useState } from 'react';
import { Filter, ChevronDown, MapPin, Star, Banknote, History, Zap } from 'lucide-react';

export default function MobileSearchFilters({ onFilterChange, onSortChange }: { onFilterChange?: (f: any) => void, onSortChange?: (s: string) => void }) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeSort, setActiveSort] = useState<string>('Relevance');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const filters = [
    { id: 'near', label: 'Near Me', icon: <MapPin size={12} /> },
    { id: 'fast', label: 'Fast Delivery', icon: <Zap size={12} /> },
    { id: 'no_packaging', label: 'No Packaging', icon: <Filter size={12} /> },
    { id: 'under_200', label: 'Under ₹200', icon: <Banknote size={12} /> },
    { id: 'rating_4', label: 'Rating 4.0+', icon: <Star size={12} /> },
    { id: 'prev_ordered', label: 'Order Again', icon: <History size={12} /> }
  ];

  const sorts = ['Relevance', 'Time', 'Rating', 'Offers', 'Price', 'Trust Makers'];

  const toggleFilter = (id: string) => {
    const updated = activeFilters.includes(id) 
      ? activeFilters.filter(f => f !== id) 
      : [...activeFilters, id];
    setActiveFilters(updated);
    if (onFilterChange) onFilterChange(updated);
  };

  const handleSort = (s: string) => {
    setActiveSort(s);
    setShowSortDropdown(false);
    if (onSortChange) onSortChange(s);
  };

  return (
    <div style={{ padding: '0.5rem 1.25rem', background: 'white', position: 'sticky', top: 0, zIndex: 10, margin: '0 -1.25rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '0.5rem' }}>
        
        {/* Sort */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', color: '#334155', whiteSpace: 'nowrap' }}
          >
            Sort <ChevronDown size={14} />
          </button>
          
          {showSortDropdown && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', minWidth: '150px', zIndex: 20 }}>
              {sorts.map(s => (
                <div 
                  key={s} 
                  onClick={() => handleSort(s)}
                  style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem', fontWeight: activeSort === s ? 700 : 500, color: activeSort === s ? '#2563eb' : '#475569' }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: '1px', height: '16px', background: '#cbd5e1', margin: '0 0.25rem' }}></div>

        {/* Filters */}
        {filters.map(f => (
          <button 
            key={f.id}
            onClick={() => toggleFilter(f.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem',
              background: activeFilters.includes(f.id) ? '#dbeafe' : '#f8fafc',
              border: `1px solid ${activeFilters.includes(f.id) ? '#2563eb' : '#cbd5e1'}`,
              color: activeFilters.includes(f.id) ? '#1d4ed8' : '#334155',
              borderRadius: '16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap'
            }}
          >
            {f.icon} {f.label}
          </button>
        ))}

      </div>
    </div>
  );
}
