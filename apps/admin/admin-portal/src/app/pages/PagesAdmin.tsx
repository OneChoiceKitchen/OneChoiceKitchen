import React, { useState, useEffect } from 'react';
import { useToast, useConfirm } from '@org/ui-design-system';
import styles from './PagesAdmin.module.css';

interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  section: string;
  isActive: boolean;
  portals: string[];
}

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

const DUMMY_PAGES: StaticPage[] = [
  { id: 'p1', slug: 'about-us', title: 'About Us', content: 'We are a food delivery company dedicated to bringing healthy, home-cooked meals straight to your door.', section: 'Company', isActive: true, portals: ['web'] },
  { id: 'p2', slug: 'privacy-policy', title: 'Privacy Policy', content: 'Your data is safe. We do not sell your personal information to third parties.', section: 'Legal & Compliance', isActive: true, portals: ['web', 'partner', 'rider'] },
  { id: 'p3', slug: 'rider-guidelines', title: 'Rider Guidelines', content: 'Drive safely, always wear your helmet, and deliver the food with a smile!', section: 'Rider Resources', isActive: true, portals: ['rider'] },
  { id: 'p4', slug: 'terms-of-service', title: 'Terms of Service', content: 'By using this app, you agree to our standard terms of service...', section: 'Legal & Compliance', isActive: false, portals: ['web'] }
];

export default function PagesAdmin() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<Partial<StaticPage>>({});
  
  const toast = useToast();
  const confirmDialog = useConfirm();

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/static-pages', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.text().then(t => JSON.parse(t));
      const fetchedPages = Array.isArray(data) ? data : [];
      setPages(fetchedPages.length > 0 ? fetchedPages : DUMMY_PAGES);
    } catch (e) {
      // Fallback on API failure
      setPages(DUMMY_PAGES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = currentEdit.id ? 'PUT' : 'POST';
    const url = currentEdit.id ? `/api/static-pages/${currentEdit.slug}` : '/api/static-pages';
    
    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(currentEdit),
      });
      if (!res.ok) throw new Error();
      toast.success(currentEdit.id ? 'Page updated successfully' : 'Page created successfully');
      setIsEditing(false);
      setCurrentEdit({});
      fetchPages();
    } catch (e) {
      // Mock Save
      const isNew = !currentEdit.id;
      const savedPage: StaticPage = {
        ...currentEdit,
        id: isNew ? `new_${Date.now()}` : (currentEdit.id as string),
        slug: currentEdit.slug || currentEdit.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || '',
      } as StaticPage;
      
      if (isNew) {
        setPages(prev => [savedPage, ...prev]);
      } else {
        setPages(prev => prev.map(p => p.id === currentEdit.id ? savedPage : p));
      }
      toast.success(`(Mocked) Page ${isNew ? 'created' : 'updated'}`);
      setIsEditing(false);
      setCurrentEdit({});
    }
  };

  const handleDelete = async (slug: string) => {
    const ok = await confirmDialog({ title: 'Delete Page', message: 'Are you sure you want to delete this page?', variant: 'danger' });
    if (!ok) return;
    try {
      const res = await fetch(`/api/static-pages/${slug}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error();
      toast.success('Page deleted');
      fetchPages();
    } catch (e) {
      // Mock delete
      setPages(prev => prev.filter(p => p.slug !== slug));
      toast.success('(Mocked) Page deleted');
    }
  };

  const togglePortal = (portal: string) => {
    const portals = currentEdit.portals || ['web'];
    if (portals.includes(portal)) {
      setCurrentEdit({...currentEdit, portals: portals.filter(p => p !== portal)});
    } else {
      setCurrentEdit({...currentEdit, portals: [...portals, portal]});
    }
  };

  if (isEditing) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.editorContainer}>
          <div className={styles.editorHeader}>
            <h2 className={styles.editorTitle}>{currentEdit.id ? 'Edit Static Page' : 'Create New Page'}</h2>
            <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>Cancel</button>
          </div>
          
          <form onSubmit={handleSave} className={styles.formLayout}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Page Title</label>
                <input 
                  required 
                  className={styles.formInput} 
                  value={currentEdit.title || ''} 
                  onChange={e => setCurrentEdit({...currentEdit, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')})} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>URL Slug</label>
                <input 
                  required 
                  disabled={!!currentEdit.id} 
                  className={styles.formInput} 
                  value={currentEdit.slug || ''} 
                  onChange={e => setCurrentEdit({...currentEdit, slug: e.target.value})} 
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Footer Section</label>
                <select 
                  className={styles.formSelect} 
                  value={currentEdit.section || 'Company'} 
                  onChange={e => setCurrentEdit({...currentEdit, section: e.target.value})}
                >
                  <option value="Product">Product</option>
                  <option value="Company">Company</option>
                  <option value="Legal">Legal</option>
                  <option value="Rider Resources">Rider Resources</option>
                  <option value="Support & Help">Support & Help</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Partner Tools">Partner Tools</option>
                  <option value="Legal & Compliance">Legal & Compliance</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Visible in Portals</label>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={(currentEdit.portals || ['web']).includes('web')} onChange={() => togglePortal('web')} style={{ width: '18px', height: '18px' }} /> 
                    Web Frontend
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={(currentEdit.portals || ['web']).includes('partner')} onChange={() => togglePortal('partner')} style={{ width: '18px', height: '18px' }} /> 
                    Partner Portal
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={(currentEdit.portals || ['web']).includes('rider')} onChange={() => togglePortal('rider')} style={{ width: '18px', height: '18px' }} /> 
                    Rider Portal
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Content (HTML/Markdown)</label>
              <textarea 
                required 
                className={styles.formTextarea} 
                style={{ minHeight: '300px' }} 
                value={currentEdit.content || ''} 
                onChange={e => setCurrentEdit({...currentEdit, content: e.target.value})} 
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={currentEdit.isActive !== false} onChange={e => setCurrentEdit({...currentEdit, isActive: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                Active (Show in footer navigation)
              </label>
            </div>

            <div>
              <button type="submit" className={styles.saveBtn}>
                {currentEdit.id ? 'Save Changes' : 'Create Page'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>📄 Static Pages Management</h1>
        <button 
          onClick={() => { setCurrentEdit({ section: 'Company', isActive: true, portals: ['web'] }); setIsEditing(true); }}
          className={styles.createBtn}
        >
          + Create New Page
        </button>
      </div>

      {loading && pages.length === 0 ? (
        <div className={styles.emptyState}>Loading Pages...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Page Details</th>
                <th>Section</th>
                <th>Portals</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page.id}>
                  <td data-label="Page Details">
                    <div className={styles.primaryCell}>{page.title}</div>
                    <div className={styles.secondaryCell}>/p/{page.slug}</div>
                  </td>
                  <td data-label="Section">{page.section}</td>
                  <td data-label="Portals">
                    {(page.portals || ['web']).map(p => (
                      <span key={p} className={styles.portalBadge}>
                        {p}
                      </span>
                    ))}
                  </td>
                  <td data-label="Status">
                    <span className={`${styles.statusBadge} ${page.isActive ? styles.active : styles.draft}`}>
                      {page.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className={styles.actionGroup}>
                      <button onClick={() => { setCurrentEdit(page); setIsEditing(true); }} className={`${styles.actionBtn} ${styles.edit}`}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(page.slug)} className={`${styles.actionBtn} ${styles.delete}`}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    No static pages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
