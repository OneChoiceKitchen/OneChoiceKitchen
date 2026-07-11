import { useState, useEffect } from 'react';
import { Store, Building2 } from 'lucide-react';

interface ContextSelectorProps {
  selectedRestaurantId: string | null;
  selectedBranchId: string | null;
  onChange: (restaurantId: string | null, branchId: string | null) => void;
}

export function ContextSelector({ selectedRestaurantId, selectedBranchId, onChange }: ContextSelectorProps) {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      const rest = restaurants.find(r => r.id === selectedRestaurantId);
      setBranches(rest?.branches || []);
      // If selected branch doesn't belong to this restaurant, clear it
      if (restaurants.length > 0 && selectedBranchId && !rest?.branches?.find((b: any) => b.id === selectedBranchId)) {
        onChange(selectedRestaurantId, null);
      }
    } else {
      setBranches([]);
      if (selectedBranchId) {
        onChange(null, null);
      }
    }
  }, [selectedRestaurantId, restaurants]);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch('/api/branches/restaurants/all');
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data);
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.5rem', marginBottom: '2rem', padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', flexShrink: 0 }}>
          <Store size={24} color="#0f172a" strokeWidth={1.5} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem', whiteSpace: 'nowrap' }}>Restaurant Context</label>
          <select 
            value={selectedRestaurantId || ''} 
            onChange={(e) => onChange(e.target.value || null, null)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', textOverflow: 'ellipsis' }}
          >
            <option value="">All Restaurants</option>
            {restaurants.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', flexShrink: 0 }}>
          <Building2 size={24} color="#0f172a" strokeWidth={1.5} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem', whiteSpace: 'nowrap' }}>Branch Context</label>
          <select 
            value={selectedBranchId || ''} 
            onChange={(e) => onChange(selectedRestaurantId, e.target.value || null)}
            disabled={!selectedRestaurantId || branches.length === 0}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: (!selectedRestaurantId || branches.length === 0) ? '#f8fafc' : 'white', textOverflow: 'ellipsis' }}
          >
            <option value="">All Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
