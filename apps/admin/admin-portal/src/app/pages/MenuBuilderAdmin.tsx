import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Tag, Utensils, IndianRupee } from 'lucide-react';

interface FoodPackage {
  id: string;
  name: string;
  description: string;
  type: string;
  mealType: string;
  pricePerPlate: number;
  minGuests: number;
  isActive: boolean;
  restaurant?: { name: string };
}

export default function MenuBuilderAdmin() {
  const [packages, setPackages] = useState<FoodPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/event-packages/food');
      setPackages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this food package?')) return;
    try {
      await axios.delete(`/api/event-packages/food/${id}`);
      fetchPackages();
    } catch (err) {
      console.error(err);
      alert('Cannot delete this package. It may be linked to active bookings.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a' }}>Menu Builder & Food Packages</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>Manage catering packages and per-plate pricing across all venues</p>
        </div>
        <button 
          style={{ padding: '0.75rem 1.25rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Create New Package
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Package Details</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Restaurant / Provider</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Pricing & Rules</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading food packages...</td></tr>
            ) : packages.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No food packages found.</td></tr>
            ) : (
              packages.map(pkg => (
                <tr key={pkg.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#0f172a' }}>
                      <Utensils size={16} color="#3b82f6" /> {pkg.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {pkg.type} • {pkg.mealType}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#475569' }}>
                    {pkg.restaurant?.name || 'Global Provider'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 600 }}>
                      <IndianRupee size={16} /> {pkg.pricePerPlate} / plate
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Min: {pkg.minGuests} guests
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(pkg.id)} style={{ background: '#fee2e2', color: '#DC2626', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
