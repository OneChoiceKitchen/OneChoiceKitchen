import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { useToast, useConfirm } from '@org/ui-design-system';

export default function MenuBuilderAdmin() {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<any>({ name: '', description: '', price: 0, category: 'Main Course', diet: 'VEG', isVisible: true });
  const toast = useToast();
  const confirmDialog = useConfirm();

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/menus');
      if (res.data) setMenus(res.data);
    } catch (err) {
      console.error('Failed to fetch menus', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentMenu.id) {
        await axios.put(`/api/menus/${currentMenu.id}`, currentMenu);
      } else {
        await axios.post('/api/menus', currentMenu);
      }
      fetchMenus();
      setIsEditing(false);
      setCurrentMenu({ name: '', description: '', price: 0, category: 'Main Course', diet: 'VEG', isVisible: true });
    } catch (err) {
      console.error('Failed to save menu', err);
      toast.error('Failed to save menu item');
    }
  };

  const handleEdit = (menu: any) => {
    setCurrentMenu(menu);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDialog({ title: 'Delete Menu Item', message: 'Are you sure you want to delete this menu item?', variant: 'danger' });
    if (!ok) return;
    try {
      await axios.delete(`/api/menus/${id}`);
      fetchMenus();
    } catch (err) {
      console.error('Failed to delete', err);
      toast.error('Failed to delete menu item');
    }
  };

  return (
    <div style={{ padding: '2rem', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem' }}>Menu Builder</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <Plus size={18} /> Add Menu Item
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1e293b' }}>{currentMenu.id ? 'Edit Item' : 'New Item'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <input required type="text" placeholder="Item Name" value={currentMenu.name} onChange={e => setCurrentMenu({...currentMenu, name: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            <input required type="number" placeholder="Price (₹)" value={currentMenu.price || ''} onChange={e => setCurrentMenu({...currentMenu, price: Number(e.target.value)})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            <select value={currentMenu.category} onChange={e => setCurrentMenu({...currentMenu, category: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <option value="Main Course">Main Course</option>
              <option value="North Indian">North Indian</option>
              <option value="Chinese">Chinese</option>
              <option value="Beverages">Beverages</option>
              <option value="Desserts">Desserts</option>
              <option value="Extras">Extras</option>
            </select>
            <select value={currentMenu.diet} onChange={e => setCurrentMenu({...currentMenu, diet: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <option value="VEG">VEG</option>
              <option value="NON-VEG">NON-VEG</option>
            </select>
          </div>
          <textarea placeholder="Description" value={currentMenu.description} onChange={e => setCurrentMenu({...currentMenu, description: e.target.value})} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '1rem', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save Item</button>
            <button type="button" onClick={() => { setIsEditing(false); setCurrentMenu({ name: '', description: '', price: 0, category: 'Main Course', diet: 'VEG', isVisible: true }); }} style={{ padding: '10px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading menu items...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {menus.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>No menu items found. Add some to get started.</div>
          ) : (
            menus.map(menu => (
              <div key={menu.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#0f172a' }}>{menu.name}</h3>
                    <span style={{ background: menu.diet === 'VEG' ? '#dcfce7' : '#fee2e2', color: menu.diet === 'VEG' ? '#16a34a' : '#DC2626', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{menu.diet}</span>
                  </div>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#64748b' }}>{menu.category}</p>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#2563EB' }}>₹{menu.price}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <button onClick={() => handleEdit(menu)} style={{ flex: 1, padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.9rem' }}><Edit3 size={16} /> Edit</button>
                  <button onClick={() => handleDelete(menu.id)} style={{ flex: 1, padding: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.9rem' }}><Trash2 size={16} /> Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
