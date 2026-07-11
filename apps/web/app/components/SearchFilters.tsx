import React, { useState } from 'react';
import { Filter, ChevronDown, Clock, MapPin, Star, Banknote, History, Zap } from 'lucide-react';

export default function SearchFilters({ onFilterChange, onSortChange }: { onFilterChange?: (f: any) => void, onSortChange?: (s: string) => void }) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeSort, setActiveSort] = useState<string>('Relevance');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const filters = [
    { id: 'near', label: 'Near Me', icon: <MapPin size={14} /> },
    { id: 'fast', label: 'Fast Delivery', icon: <Zap size={14} /> },
    { id: 'no_packaging', label: 'No Packaging Charges', icon: <Filter size={14} /> },
    { id: 'under_200', label: 'Under ₹200', icon: <Banknote size={14} /> },
    { id: 'rating_4', label: 'Rating 4.0+', icon: <Star size={14} /> },
    { id: 'prev_ordered', label: 'Previously Ordered', icon: <History size={14} /> }
  ];

  const sorts = ['Relevance', 'Delivery Time', 'Rating', 'Offers', 'Price (Low to High)', 'Trust Makers'];

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
    <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', background: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '1rem', alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        
        {/* Sort Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '24px', cursor: 'pointer', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}
          >
            Sort: {activeSort} <ChevronDown size={16} />
          </button>
          
          {showSortDropdown && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', minWidth: '200px', zIndex: 20 }}>
              {sorts.map(s => (
                <div 
                  key={s} 
                  onClick={() => handleSort(s)}
                  style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontWeight: activeSort === s ? 700 : 500, color: activeSort === s ? '#2563eb' : '#475569' }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter Chips */}
        <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 0.5rem' }}></div>

        {filters.map(f => (
          <button 
            key={f.id}
            onClick={() => toggleFilter(f.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
              background: activeFilters.includes(f.id) ? '#dbeafe' : '#f8fafc',
              border: `1px solid ${activeFilters.includes(f.id) ? '#2563eb' : '#cbd5e1'}`,
              color: activeFilters.includes(f.id) ? '#1d4ed8' : '#334155',
              borderRadius: '24px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {f.icon} {f.label}
          </button>
        ))}

      </div>
    </div>
  );
}
