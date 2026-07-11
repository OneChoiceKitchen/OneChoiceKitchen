import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { ContextSelector } from '../components/ContextSelector';
import styles from './MenusAdmin.module.css';
import { useToast, useConfirm } from '@org/ui-design-system';
import { MOCK_MENU_ITEMS, OOS_SKUS, LOW_STOCK_SKUS, getIngredientStatus, STOCK_BADGE } from './mockData';

export default function MenusAdmin() {
  const queryParams = new URLSearchParams(window.location.search);

  const [menus, setMenus] = useState<any[]>([]);
  const [recycledMenus, setRecycledMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Context State
  const [restaurantId, setRestaurantId] = useState<string | null>(queryParams.get('restaurantId'));
  const [branchId, setBranchId] = useState<string | null>(queryParams.get('branchId'));
  const isAdmin = localStorage.getItem('admin_role') === 'SUPER_ADMIN';

  // Form State
  const [viewMode, setViewMode] = useState<'active' | 'recycle'>('active');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<any>({ 
    name: '', description: '', price: 0, category: 'Main', image: '', diet: 'VEG', prepTime: 15, isPopular: false, sortOrder: 0, attributes: [],
    seoTitle: '', seoDescription: '', seoKeywords: '',
    ogTitle: '', ogDescription: '', ogImageUrl: '', twitterTitle: '', twitterDescription: '',
    youtubeUrl: ''
  });
  const [modalTab, setModalTab] = useState<'basic' | 'attributes' | 'seo' | 'smo'>('basic');
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const toast = useToast();
  const confirmDialog = useConfirm();

  useEffect(() => {
    fetchMenus();
    setCurrentPage(1);
  }, [restaurantId, branchId, viewMode]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fd = new FormData();
      fd.append('file', file);
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: {
           ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: fd
      });
      if (response.ok) {
        const data = await response.text().then(t => JSON.parse(t));
        setFormData({ ...formData, image: data.url });
      } else {
        toast.error('Upload failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchMenus = async () => {
    try {
      setLoading(true);
      let url = viewMode === 'recycle' ? '/api/menus/recycle-bin/items' : '/api/menus';
      const params = new URLSearchParams();
      if (restaurantId) params.append('restaurantId', restaurantId);
      if (branchId) params.append('branchId', branchId);
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.text().then(t => JSON.parse(t));
        if (viewMode === 'recycle') {
          setRecycledMenus(data);
        } else {
          setMenus(data);
        }
      }
    } catch (e) {
      // API unavailable — show empty state with error context (no mock injection)
      if (viewMode !== 'recycle') setMenus([]);
      console.warn('[MenusAdmin] API unavailable:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.restaurantId && !editingId) {
      toast.warning('Please select a Restaurant context to add a menu item.');
      return;
    }

    if (isAdmin && editingId && (formData.restaurantId !== formData.originalRestaurantId || formData.branchId !== formData.originalBranchId)) {
      const ok = await confirmDialog({ title: 'Move Menu Item?', message: 'You are about to move this menu item to a completely different restaurant or branch. Are you absolutely sure?', variant: 'warning' });
      if (!ok) {
        return;
      }
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        ...formData,
        restaurantId: formData.restaurantId,
        branchId: formData.branchId
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/menus/${editingId}`, {
          method: 'PUT', headers, body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/menus', {
          method: 'POST', headers, body: JSON.stringify(payload)
        });
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.message || 'Failed to save menu item');
        return;
      }
      toast.success(editingId ? 'Menu item updated!' : 'Menu item created!');
      setShowModal(false);
      fetchMenus();
    } catch (e) {
      console.error(e);
      toast.error('An error occurred while saving.');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDialog({ title: 'Delete Menu Item', message: 'Are you sure you want to delete this menu item?', variant: 'danger' });
    if (!ok) return;
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      const res = await fetch(`/api/menus/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { toast.error('Failed to delete menu item'); return; }
      toast.success('Menu item moved to recycle bin');
      fetchMenus();
    } catch (e) {
      console.error(e);
      toast.error('Error deleting menu item');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await fetch(`/api/menus/recycle-bin/items/${id}/restore`, { method: 'PATCH' });
      fetchMenus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleHardDelete = async (id: string) => {
    const ok = await confirmDialog({ title: 'Permanently Delete?', message: 'This will permanently delete the menu item and cannot be undone.', variant: 'danger', confirmLabel: 'Delete Forever' });
    if (!ok) return;
    try {
      await fetch(`/api/menus/recycle-bin/items/${id}/hard`, { method: 'DELETE' });
      fetchMenus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) {
      toast.warning('Please enter a name first!');
      return;
    }
    setGeneratingDescription(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      const response = await fetch('/api/menus/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name: formData.name })
      });
      const data = await response.text().then(t => JSON.parse(t));
      if (response.ok) {
        setFormData((prev: any) => ({ ...prev, description: data.description }));
      } else {
        toast.error(data.message || 'Failed to generate description. Check your API key.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error connecting to AI service.');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const openAdd = () => {
    if (!restaurantId) {
      toast.warning('Please select a Restaurant context first.');
      return;
    }
    setEditingId(null);
    setFormData({ 
      name: '', description: '', price: 0, category: 'Main', image: '', diet: 'VEG', prepTime: 15, isPopular: false, sortOrder: 0, attributes: [],
      restaurantId, branchId, originalRestaurantId: restaurantId, originalBranchId: branchId,
      seoTitle: '', seoDescription: '', seoKeywords: '',
      ogTitle: '', ogDescription: '', ogImageUrl: '', twitterTitle: '', twitterDescription: '',
      youtubeUrl: ''
    });
    setModalTab('basic');
    setShowModal(true);
  };

  const openEdit = (menu: any) => {
    setEditingId(menu.id);
    setFormData({ 
      ...menu,
      attributes: menu.attributes ? JSON.parse(JSON.stringify(menu.attributes)) : [],
      originalRestaurantId: menu.restaurantId,
      originalBranchId: menu.branchId
    });
    setModalTab('basic');
    setShowModal(true);
  };

  const handleAddAttribute = () => {
    setFormData((prev: any) => ({
      ...prev,
      attributes: [...prev.attributes, { name: '', type: 'SINGLE', isRequired: false, options: [] }]
    }));
  };

  const handleRemoveAttribute = (idx: number) => {
    const newAttrs = [...formData.attributes];
    newAttrs.splice(idx, 1);
    setFormData({ ...formData, attributes: newAttrs });
  };

  const handleUpdateAttribute = (idx: number, field: string, value: any) => {
    const newAttrs = [...formData.attributes];
    newAttrs[idx] = { ...newAttrs[idx], [field]: value };
    setFormData({ ...formData, attributes: newAttrs });
  };

  const handleAddOption = (attrIdx: number) => {
    const newAttrs = [...formData.attributes];
    newAttrs[attrIdx].options.push({ name: '', additionalPrice: 0, isDefault: false });
    setFormData({ ...formData, attributes: newAttrs });
  };

  const handleRemoveOption = (attrIdx: number, optIdx: number) => {
    const newAttrs = [...formData.attributes];
    newAttrs[attrIdx].options.splice(optIdx, 1);
    setFormData({ ...formData, attributes: newAttrs });
  };

  const handleUpdateOption = (attrIdx: number, optIdx: number, field: string, value: any) => {
    const newAttrs = [...formData.attributes];
    newAttrs[attrIdx].options[optIdx] = { ...newAttrs[attrIdx].options[optIdx], [field]: value };
    setFormData({ ...formData, attributes: newAttrs });
  };

  const activeItems = viewMode === 'active' ? menus : recycledMenus;
  const totalPages = Math.max(1, Math.ceil(activeItems.length / itemsPerPage));
  const currentItems = activeItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Menu Management</h2>
          <p className={styles.subtitle}>Manage a la carte menu items and their attributes.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className={styles.addBtn}
            onClick={() => setViewMode(viewMode === 'active' ? 'recycle' : 'active')}
            style={{ backgroundColor: viewMode === 'recycle' ? '#2563EB' : '#e2e8f0', color: viewMode === 'recycle' ? '#fff' : '#334155' }}
          >
            <Trash2 size={18} /> {viewMode === 'active' ? 'Recycle Bin' : 'Back to Active'}
          </button>
          {viewMode === 'active' && (
            <button 
              onClick={openAdd}
              className={styles.addBtn}
            >
              <Plus size={18} /> Add Item
            </button>
          )}
        </div>
      </div>

      <ContextSelector 
        selectedRestaurantId={restaurantId} 
        selectedBranchId={branchId} 
        onChange={(rId, bId) => {
          setRestaurantId(rId);
          setBranchId(bId);
        }} 
      />


      {/* OOS / Critical Stock Alert Banner */}
      {viewMode === 'active' && OOS_SKUS.length > 0 && (
        <div style={{margin:'0 0 1rem',padding:'0.75rem 1rem',background:'#fef2f2',border:'1.5px solid #fca5a5',borderRadius:'var(--r-md,8px)',display:'flex',alignItems:'center',gap:'0.75rem',flexWrap:'wrap'}}>
          <span style={{fontSize:'1rem'}}>🚨</span>
          <div style={{flex:1}}>
            <strong style={{color:'#b91c1c',fontSize:'0.875rem'}}>Inventory Alert:</strong>
            <span style={{color:'#7f1d1d',fontSize:'0.8rem',marginLeft:6}}>
              {OOS_SKUS.length} ingredient(s) are <b>Out of Stock</b> — affected menu items cannot be prepared.
              <a href="/?tab=inventory" style={{color:'#2563EB',fontWeight:600,marginLeft:8,textDecoration:'none'}}>→ View Inventory Management</a>
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Loading menus...
        </div>
      ) : (
        <>
          {(viewMode === 'active' ? menus : recycledMenus).length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No Menu Items Found</h3>
              <p style={{ margin: 0 }}>{viewMode === 'recycle' ? 'Recycle bin is empty.' : 'Add some delicious items to get started.'}</p>
            </div>
          ) : (
            <div className={styles.gridContainer}>
              {currentItems.map((menu, i) => (
                <div key={menu.id} className={styles.menuCard}>
                  <div className={styles.cardImageContainer}>
                    {menu.image ? (
                      <img src={menu.image} alt={menu.name} className={styles.cardImage} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <div className={styles.cardImagePlaceholder}>
                        {menu.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className={`${styles.dietBadge} ${menu.diet === 'VEG' ? styles.dietVeg : styles.dietNonVeg}`}>
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: menu.diet === 'VEG' ? '#16a34a' : '#dc2626' 
                      }}></span>
                      {menu.diet}
                    </div>
                  </div>
                  
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{menu.name}</h3>
                      <div className={styles.cardPrice}>₹{menu.price}</div>
                    </div>
                    
                    <div className={styles.cardCategory}>{menu.category || 'Uncategorized'}</div>
                    
                    <div className={styles.cardDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailIcon}>🏪</span>
                        <span>{menu.restaurant?.name || menu.restaurantName || 'N/A'}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailIcon}>📍</span>
                        <span>{menu.branch?.name || menu.branchName || 'All Branches'}</span>
                      </div>
                    </div>
                    
                    <div className={styles.cardFooter}>
                      <div className={styles.configPill}>
                        ⚙️ {menu.attributes?.length || 0} Configs
                      </div>
                      {/* Ingredient stock badges — cross-link with Inventory Management */}
                      {menu.ingredients && menu.ingredients.length > 0 && (
                        <div style={{marginTop:'0.375rem',display:'flex',flexWrap:'wrap',gap:'4px'}}>
                          {menu.ingredients.map((ing: any) => {
                            const st = getIngredientStatus(ing.sku);
                            const badge = STOCK_BADGE[st];
                            return st !== 'ok' ? (
                              <span key={ing.sku} title={`${ing.name}: ${badge.label}`}
                                style={{fontSize:'0.65rem',fontWeight:700,padding:'2px 6px',borderRadius:999,background:badge.bg,color:badge.color,whiteSpace:'nowrap'}}>
                                {ing.name}: {badge.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                      <div className={styles.cardActions}>
                        {viewMode === 'active' ? (
                          <>
                            <button onClick={() => openEdit(menu)} className={`${styles.actionBtn} ${styles.editBtn}`} title="Edit Item">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(menu.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete Item">
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleRestore(menu.id)} className={`${styles.actionBtn} ${styles.editBtn}`} style={{ color: '#16a34a', background: '#dcfce7', width: 'auto', padding: '0 0.5rem', borderRadius: '6px' }} title="Restore Item">
                              Restore
                            </button>
                            <button onClick={() => handleHardDelete(menu.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} style={{ color: '#dc2626', background: '#fee2e2', width: 'auto', padding: '0 0.5rem', borderRadius: '6px' }} title="Hard Delete Item">
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        
        <div className={styles.pagination}>
          <div className={styles.paginationText}>Showing {activeItems.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, activeItems.length)} of {activeItems.length} items</div>
          <div className={styles.paginationControls}>
            <div className={styles.rowsPerPage}>
              Rows per page
              <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className={styles.pageButtons}>
              <button 
                className={styles.pageBtn} 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >&lt;</button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && <span className={styles.pageEllipsis}>...</span>}
                    <button 
                      className={`${styles.pageBtn} ${currentPage === p ? styles.active : ''}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              
              <button 
                className={styles.pageBtn} 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >&gt;</button>
            </div>
          </div>
        </div>
        </>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div style={{ padding: 'clamp(1rem, 5vw, 2rem)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h3 style={{ margin: 0, color: '#0f172a', fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>{editingId ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
               <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#64748b' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {isAdmin && (
                <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ⚠️ Move Menu Item (Super Admin)
                  </h4>
                  <ContextSelector 
                    selectedRestaurantId={formData.restaurantId} 
                    selectedBranchId={formData.branchId} 
                    onChange={(rId, bId) => setFormData({...formData, restaurantId: rId, branchId: bId})} 
                  />
                </div>
              )}

              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem', gap: '1rem' }}>
                <button type="button" onClick={() => setModalTab('basic')} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: modalTab === 'basic' ? '2px solid #2563EB' : '2px solid transparent', color: modalTab === 'basic' ? '#2563EB' : '#64748b', fontWeight: 600, cursor: 'pointer' }}>Basic Info</button>
                <button type="button" onClick={() => setModalTab('attributes')} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: modalTab === 'attributes' ? '2px solid #2563EB' : '2px solid transparent', color: modalTab === 'attributes' ? '#2563EB' : '#64748b', fontWeight: 600, cursor: 'pointer' }}>Dynamic Attributes</button>
                <button type="button" onClick={() => setModalTab('seo')} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: modalTab === 'seo' ? '2px solid #2563EB' : '2px solid transparent', color: modalTab === 'seo' ? '#2563EB' : '#64748b', fontWeight: 600, cursor: 'pointer' }}>SEO</button>
                <button type="button" onClick={() => setModalTab('smo')} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: modalTab === 'smo' ? '2px solid #2563EB' : '2px solid transparent', color: modalTab === 'smo' ? '#2563EB' : '#64748b', fontWeight: 600, cursor: 'pointer' }}>SMO</button>
              </div>

              {modalTab === 'basic' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Name</label>
                  <input type="text" placeholder="e.g. Cold Coffee" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Base Price (₹)</label>
                  <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Category</label>
                  <input type="text" placeholder="e.g. Beverages" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Diet</label>
                  <select value={formData.diet} onChange={e => setFormData({...formData, diet: e.target.value})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>
                    <option value="VEG">VEG</option>
                    <option value="NON-VEG">NON-VEG</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Prep Time (mins)</label>
                  <input type="number" required value={formData.prepTime} onChange={e => setFormData({...formData, prepTime: Number(e.target.value)})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Sort Order</label>
                  <input type="number" required value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: Number(e.target.value)})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Is Popular</label>
                  <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <input type="checkbox" checked={formData.isPopular} onChange={e => setFormData({...formData, isPopular: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {formData.image && (
                    <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      <img src={formData.image} alt="Menu Item Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }} />
                      <button type="button" onClick={() => setFormData({...formData, image: ''})} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>&times;</button>
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      disabled={uploadingImage}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px dashed #cbd5e1', width: '100%', cursor: 'pointer', background: '#f8fafc' }} 
                    />
                    {uploadingImage && <span style={{ fontSize: '0.8rem', color: '#2563EB', marginTop: '4px', display: 'block' }}>Uploading...</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Description</label>
                  <button 
                    type="button" 
                    onClick={handleGenerateDescription}
                    disabled={generatingDescription}
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.25rem 0.75rem', 
                      background: 'linear-gradient(to right, #a855f7, #ec4899)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: generatingDescription ? 'not-allowed' : 'pointer',
                      opacity: generatingDescription ? 0.7 : 1,
                      fontWeight: 600
                    }}
                  >
                    {generatingDescription ? 'Generating...' : '✨ Auto Generate'}
                  </button>
                </div>
                <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>YouTube Preparation Video Link</label>
                <input type="url" placeholder="https://youtube.com/..." value={formData.youtubeUrl || ''} onChange={e => setFormData({...formData, youtubeUrl: e.target.value})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Allows customers to see how this item is prepared.</p>
              </div>
                </>
              )}

              {modalTab === 'attributes' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Dynamic Attributes / Variants</h4>
                  <button type="button" onClick={handleAddAttribute} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 1rem', background: '#fef2f2', color: '#DC2626', border: '1px solid #DC2626', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                    <Plus size={16} /> Add Attribute
                  </button>
                </div>

                {formData.attributes.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                    No attributes created. Add attributes like "Size", "Spice Level", or "Crust".
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {formData.attributes.map((attr: any, attrIdx: number) => (
                    <div key={attrIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 200px' }}>
                          <input type="text" placeholder="Attribute Name (e.g. Size)" value={attr.name} onChange={e => handleUpdateAttribute(attrIdx, 'name', e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ flex: '1 1 200px' }}>
                          <select value={attr.type} onChange={e => handleUpdateAttribute(attrIdx, 'type', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', boxSizing: 'border-box' }}>
                            <option value="SINGLE">Single Choice (Radio)</option>
                            <option value="MULTIPLE">Multiple Choice (Checkboxes)</option>
                          </select>
                        </div>
                        <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0' }}>
                          <input type="checkbox" id={`req-${attrIdx}`} checked={attr.isRequired} onChange={e => handleUpdateAttribute(attrIdx, 'isRequired', e.target.checked)} />
                          <label htmlFor={`req-${attrIdx}`} style={{ fontSize: '0.875rem', color: '#475569' }}>Required</label>
                        </div>
                        <button type="button" onClick={() => handleRemoveAttribute(attrIdx)} style={{ background: 'transparent', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '0.5rem', marginLeft: 'auto' }}>
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div style={{ marginLeft: '1rem', marginTop: '1rem', paddingLeft: '1rem', borderLeft: '2px solid #cbd5e1' }}>
                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#475569', fontSize: '0.875rem' }}>Options</h5>
                        
                        {attr.options.map((opt: any, optIdx: number) => (
                          <div key={optIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <input type="text" placeholder="Option Name (e.g. Small)" value={opt.name} onChange={e => handleUpdateOption(attrIdx, optIdx, 'name', e.target.value)} required style={{ flex: '1 1 120px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            <input type="number" placeholder="+₹ Price" value={opt.additionalPrice} onChange={e => handleUpdateOption(attrIdx, optIdx, 'additionalPrice', Number(e.target.value))} required style={{ flex: '1 1 80px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: '1 1 auto' }}>
                               <input type="checkbox" title="Default Selection" checked={opt.isDefault} onChange={e => handleUpdateOption(attrIdx, optIdx, 'isDefault', e.target.checked)} /> Default
                            </div>
                            <button type="button" onClick={() => handleRemoveOption(attrIdx, optIdx)} style={{ background: 'transparent', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '0.2rem', marginLeft: 'auto' }}>&times;</button>
                          </div>
                        ))}
                        
                        <button type="button" onClick={() => handleAddOption(attrIdx)} style={{ marginTop: '0.5rem', background: '#e2e8f0', color: '#475569', border: 'none', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                          + Add Option
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {modalTab === 'seo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>SEO Title</label>
                    <input type="text" placeholder="e.g. Delicious Cold Coffee" value={formData.seoTitle || ''} onChange={e => setFormData({...formData, seoTitle: e.target.value})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Meta Description</label>
                    <textarea rows={2} placeholder="Short description for search engines" value={formData.seoDescription || ''} onChange={e => setFormData({...formData, seoDescription: e.target.value})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Meta Keywords</label>
                    <input type="text" placeholder="e.g. coffee, cold brew, cafe" value={formData.seoKeywords || ''} onChange={e => setFormData({...formData, seoKeywords: e.target.value})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>
              )}

              {modalTab === 'smo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Open Graph (OG) Title</label>
                    <input type="text" placeholder="Facebook/LinkedIn Title" value={formData.ogTitle || ''} onChange={e => setFormData({...formData, ogTitle: e.target.value})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Open Graph (OG) Description</label>
                    <textarea rows={2} placeholder="Facebook/LinkedIn Description" value={formData.ogDescription || ''} onChange={e => setFormData({...formData, ogDescription: e.target.value})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Open Graph (OG) Image URL</label>
                    <input type="url" placeholder="https://..." value={formData.ogImageUrl || ''} onChange={e => setFormData({...formData, ogImageUrl: e.target.value})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Twitter Title</label>
                    <input type="text" placeholder="Twitter Card Title" value={formData.twitterTitle || ''} onChange={e => setFormData({...formData, twitterTitle: e.target.value})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Twitter Description</label>
                    <textarea rows={2} placeholder="Twitter Card Description" value={formData.twitterDescription || ''} onChange={e => setFormData({...formData, twitterDescription: e.target.value})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Save Menu Item</button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
