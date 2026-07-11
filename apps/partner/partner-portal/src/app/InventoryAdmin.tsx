import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Minus, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function InventoryAdmin() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/inventory');
      setInventory(res.data);
    } catch (error) {
      console.error('Failed to load inventory', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const updateStock = async (id: string, currentQuantity: number, delta: number) => {
    try {
      const newQuantity = Math.max(0, currentQuantity + delta);
      await axios.patch(`/api/inventory/${id}`, { quantity: newQuantity });
      fetchInventory();
    } catch (err) {
      console.error('Failed to update stock', err);
    }
  };

  const createDemoItems = async () => {
    try {
      await axios.post('/api/inventory', { name: 'Premium Veg Tiffin', sku: 'PVT-01', quantity: 15, threshold: 5, warehouse: 'Main Kitchen' });
      await axios.post('/api/inventory', { name: 'Paneer Butter Masala', sku: 'PBM-02', quantity: 12, threshold: 3, warehouse: 'Main Kitchen' });
      fetchInventory();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.8rem' }}>Inventory Management</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Manage your kitchen stock and availability.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {inventory.length === 0 && (
            <button onClick={createDemoItems} style={{ 
              background: '#10b981', color: 'white', border: 'none', 
              padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
            }}>
              Generate Demo Items
            </button>
          )}
          <button onClick={fetchInventory} style={{ 
            background: '#2563EB', color: 'white', border: 'none', 
            padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search inventory items..." 
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
            <Filter size={18} />
            Filter
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600 }}>Item Name</th>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600 }}>SKU</th>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, textAlign: 'center' }}>Stock Count</th>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
              ) : inventory.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>No inventory items found.</td></tr>
              ) : inventory.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem 1.5rem', color: '#0f172a', fontWeight: 500 }}>{item.name}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{item.sku}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                      <button onClick={() => updateStock(item.id, item.quantity, -1)} style={{ background: '#f1f5f9', border: 'none', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}>
                        <Minus size={16} />
                      </button>
                      <span style={{ width: '30px', textAlign: 'center', fontWeight: 600, color: '#0f172a' }}>{item.quantity}</span>
                      <button onClick={() => updateStock(item.id, item.quantity, 1)} style={{ background: '#f1f5f9', border: 'none', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}>
                        <Plus size={16} />
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    <span style={{ 
                      background: item.quantity > item.threshold ? '#dcfce7' : '#fee2e2',
                      color: item.quantity > item.threshold ? '#166534' : '#991b1b',
                      padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600 
                    }}>
                      {item.quantity > item.threshold ? 'In Stock' : 'Low Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
