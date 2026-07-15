import React, { useState } from 'react';
import { useInventoryManagement } from '../hooks/useInventoryManagement';
import { PreviewGuard } from '@org/frontend-platform';

export function InventoryManager() {
  const {
    inventory,
    menuItems,
    loading,
    error,
    createItem,
    deleteItem,
    mapToMenu
  } = useInventoryManagement();

  const [newItemName, setNewItemName] = useState('');
  const [newItemSku, setNewItemSku] = useState('');
  
  const [mapMenuItemId, setMapMenuItemId] = useState('');
  const [mapInventoryItemId, setMapInventoryItemId] = useState('');
  const [mapQuantity, setMapQuantity] = useState(1);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;
    try {
      await createItem({ name: newItemName, sku: newItemSku });
      setNewItemName('');
      setNewItemSku('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMapToMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapMenuItemId || !mapInventoryItemId) return;
    try {
      await mapToMenu(mapMenuItemId, mapInventoryItemId, mapQuantity);
      setMapMenuItemId('');
      setMapInventoryItemId('');
      setMapQuantity(1);
      alert('Mapping created successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to create mapping');
    }
  };

  return (
    <PreviewGuard moduleId="inventory" requiredEntitlement="WRITE">
      <div className="page-container" style={{ padding: '2rem' }}>
        <div className="page-header">
          <div className="page-title-block">
            <h1 className="page-title">📦 Inventory & Recipe Management</h1>
            <p className="page-subtitle">Manage inventory stock and map to menu items</p>
          </div>
        </div>

        {error && <div style={{ color: 'var(--brand-red)', marginBottom: '1rem' }}>{error}</div>}
        {loading && <div style={{ marginBottom: '1rem' }}>Loading...</div>}

        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Inventory Items Section */}
          <div style={{ flex: 1, background: 'var(--surf)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--bdr)' }}>
            <h2>Inventory Items</h2>
            <form onSubmit={handleCreateItem} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="New Item Name"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--bdr)', borderRadius: '4px' }}
              />
              <input
                type="text"
                placeholder="SKU"
                value={newItemSku}
                onChange={e => setNewItemSku(e.target.value)}
                style={{ width: '80px', padding: '0.5rem', border: '1px solid var(--bdr)', borderRadius: '4px' }}
              />
              <button type="submit" disabled={loading} style={{ background: 'var(--brand-blue)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                Add Item
              </button>
            </form>

            <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '2px solid var(--bdr)', padding: '0.5rem' }}>Name</th>
                  <th style={{ borderBottom: '2px solid var(--bdr)', padding: '0.5rem' }}>SKU</th>
                  <th style={{ borderBottom: '2px solid var(--bdr)', padding: '0.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.id}>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--bdr)' }}>{item.name}</td>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--bdr)' }}>{item.sku}</td>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--bdr)' }}>
                      <button onClick={() => deleteItem(item.id)} disabled={loading} style={{ background: 'var(--brand-red)', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: '1rem', textAlign: 'center' }}>No inventory items found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Recipe Builder Section */}
          <div style={{ flex: 1, background: 'var(--surf)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--bdr)' }}>
            <h2>Recipe Builder / Menu Mapper</h2>
            <form onSubmit={handleMapToMenu} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Menu Item</label>
                <select
                  value={mapMenuItemId}
                  onChange={e => setMapMenuItemId(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--bdr)', borderRadius: '4px' }}
                >
                  <option value="">Select Menu Item</option>
                  {menuItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Inventory Item</label>
                <select
                  value={mapInventoryItemId}
                  onChange={e => setMapInventoryItemId(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--bdr)', borderRadius: '4px' }}
                >
                  <option value="">Select Inventory Item</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Quantity Required</label>
                <input
                  type="number"
                  min="1"
                  value={mapQuantity}
                  onChange={e => setMapQuantity(parseInt(e.target.value) || 1)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--bdr)', borderRadius: '4px' }}
                />
              </div>

              <button type="submit" disabled={loading} style={{ background: 'var(--brand-blue)', color: 'white', border: 'none', padding: '0.75rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                Save Mapping
              </button>
            </form>
          </div>
        </div>
      </div>
    </PreviewGuard>
  );
}

export default InventoryManager;
