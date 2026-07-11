import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, MapPin, Users, Image as ImageIcon } from 'lucide-react';

interface Hall {
  id: string;
  name: string;
  capacity: number;
  basePrice: number;
  locationString: string;
  isActive: boolean;
  category?: { name: string };
  restaurant?: { name: string };
}

export default function VenuesAdmin() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/venues');
      setHalls(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) return;
    try {
      await axios.delete(`/api/venues/${id}`);
      fetchHalls();
    } catch (err) {
      console.error(err);
      alert('Failed to delete venue. It may have existing bookings.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a' }}>Global Venues Management</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>Manage all partner halls and venues across the platform</p>
        </div>
        <button 
          style={{ padding: '0.75rem 1.25rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Add New Venue
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Venue Details</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Partner / Category</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Capacity & Pricing</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading venues...</td></tr>
            ) : halls.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No venues registered.</td></tr>
            ) : (
              halls.map(hall => (
                <tr key={hall.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ImageIcon size={16} color="#64748b" /> {hall.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <MapPin size={14} /> {hall.locationString || 'No location set'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500, color: '#334155' }}>{hall.restaurant?.name || 'Unassigned'}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Type: {hall.category?.name || 'General'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                      <Users size={16} /> Max {hall.capacity || 0} Guests
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem', fontWeight: 600 }}>
                      ₹{hall.basePrice?.toLocaleString() || 0} Base Price
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(hall.id)} style={{ background: '#fee2e2', color: '#DC2626', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
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
