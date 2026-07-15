import React, { useState } from 'react';
import { useMenuManagement } from '../hooks/useMenuManagement';
import { PreviewGuard } from '@org/frontend-platform';

export function MenuManager() {
  const {
    categories,
    items,
    loading,
    error,
    createCategory,
    deleteCategory,
    createItem,
    deleteItem
  } = useMenuManagement();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategoryId, setNewItemCategoryId] = useState('');

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      await createCategory({ name: newCategoryName });
      setNewCategoryName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemCategoryId) return;
    try {
      await createItem({ name: newItemName, categoryId: newItemCategoryId });
      setNewItemName('');
      setNewItemCategoryId('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PreviewGuard moduleId="menu" requiredEntitlement="WRITE">
      <div className="page-container" style={{ padding: '2rem' }}>
        <div className="page-header">
          <div className="page-title-block">
            <h1 className="page-title">🍽️ Menu Management</h1>
            <p className="page-subtitle">Manage your categories and menu items</p>
          </div>
        </div>

        {error && <div style={{ color: 'var(--brand-red)', marginBottom: '1rem' }}>{error}</div>}
        {loading && <div style={{ marginBottom: '1rem' }}>Loading...</div>}

        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Categories Section */}
          <div style={{ flex: 1, background: 'var(--surf)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--bdr)' }}>
            <h2>Categories</h2>
            <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="New Category Name"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--bdr)', borderRadius: '4px' }}
              />
              <button type="submit" disabled={loading} style={{ background: 'var(--brand-blue)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                Add Category
              </button>
            </form>

            <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '2px solid var(--bdr)', padding: '0.5rem' }}>Name</th>
                  <th style={{ borderBottom: '2px solid var(--bdr)', padding: '0.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--bdr)' }}>{cat.name}</td>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--bdr)' }}>
                      <button onClick={() => deleteCategory(cat.id)} disabled={loading} style={{ background: 'var(--brand-red)', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ padding: '1rem', textAlign: 'center' }}>No categories found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Items Section */}
          <div style={{ flex: 2, background: 'var(--surf)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--bdr)' }}>
            <h2>Menu Items</h2>
            <form onSubmit={handleCreateItem} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="New Item Name"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--bdr)', borderRadius: '4px' }}
              />
              <select
                value={newItemCategoryId}
                onChange={e => setNewItemCategoryId(e.target.value)}
                style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--bdr)', borderRadius: '4px' }}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button type="submit" disabled={loading} style={{ background: 'var(--brand-blue)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                Add Item
              </button>
            </form>

            <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '2px solid var(--bdr)', padding: '0.5rem' }}>Name</th>
                  <th style={{ borderBottom: '2px solid var(--bdr)', padding: '0.5rem' }}>Category</th>
                  <th style={{ borderBottom: '2px solid var(--bdr)', padding: '0.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--bdr)' }}>{item.name}</td>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--bdr)' }}>
                      {categories.find(c => c.id === item.categoryId)?.name || 'Unknown'}
                    </td>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--bdr)' }}>
                      <button onClick={() => deleteItem(item.id)} disabled={loading} style={{ background: 'var(--brand-red)', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: '1rem', textAlign: 'center' }}>No items found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PreviewGuard>
  );
}

export default MenuManager;
