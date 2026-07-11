import { useState, useEffect, FormEvent } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import styles from './TiffinAdmin.module.css';
import { ContextSelector } from '../components/ContextSelector';
import { useToast, useConfirm } from '@org/ui-design-system';

interface TiffinTerm {
  id: string;
  title: string;
  contentEn: string;
  contentHi: string;
  order: number;
  isActive: boolean;
  restaurantId?: string;
  branchId?: string;
}

interface TiffinTermsAdminProps {
  restaurantId?: string | null;
  branchId?: string | null;
}

export default function TiffinTermsAdmin({ restaurantId, branchId }: TiffinTermsAdminProps) {
  const [viewMode, setViewMode] = useState<'active' | 'recycle'>('active');
  const [terms, setTerms] = useState<TiffinTerm[]>([]);
  const [recycledTerms, setRecycledTerms] = useState<TiffinTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTerm, setEditingTerm] = useState<Partial<TiffinTerm> | null>(null);
  const [isNewTerm, setIsNewTerm] = useState(false);
  const toast = useToast();
  const confirmDialog = useConfirm();

  const fetchTerms = async () => {
    try {
      const params = new URLSearchParams();
      if (restaurantId) params.append('restaurantId', restaurantId);
      if (branchId) params.append('branchId', branchId);
      const query = params.toString();

      const [activeRes, recycledRes] = await Promise.all([
        fetch(`/api/tiffin/terms${query ? `?${query}` : ''}`),
        fetch(`/api/tiffin/terms/recycled${query ? `?${query}` : ''}`)
      ]);
      const activeData = await activeRes.text().then(t => t ? JSON.parse(t) : []);
      const recycledData = await recycledRes.text().then(t => t ? JSON.parse(t) : []);
      setTerms(Array.isArray(activeData) ? activeData : []);
      setRecycledTerms(Array.isArray(recycledData) ? recycledData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, [restaurantId, branchId]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingTerm) return;

    if (!restaurantId && !editingTerm.id) {
      toast.warning('Please select a Restaurant context to add a term.');
      return;
    }

    if (localStorage.getItem('admin_role') === 'SUPER_ADMIN' && editingTerm.id && (editingTerm.restaurantId !== restaurantId || editingTerm.branchId !== branchId)) {
      const ok = await confirmDialog({ title: 'Move Term?', message: 'You are about to move this term to a completely different restaurant or branch. Are you absolutely sure?', variant: 'warning' });
      if (!ok) {
        return;
      }
    }

    const payload = { ...editingTerm, restaurantId: editingTerm.restaurantId || restaurantId, branchId: editingTerm.branchId || branchId };

    const method = editingTerm.id ? 'PUT' : 'POST';
    const url = editingTerm.id ? `/api/tiffin/terms/${editingTerm.id}` : '/api/tiffin/terms';
    
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setEditingTerm(null);
      setIsNewTerm(false);
      fetchTerms();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    const isActive = viewMode === 'active';
    const ok = await confirmDialog({
      title: isActive ? 'Move to Recycle Bin' : 'Permanently Delete',
      message: isActive ? 'Move this term to the Recycle Bin?' : 'Permanently delete this term? This cannot be undone.',
      variant: isActive ? 'warning' : 'danger',
      confirmLabel: isActive ? 'Move to Bin' : 'Delete Forever'
    });
    if (!ok) return;
    try {
      if (viewMode === 'active') {
        await fetch(`/api/tiffin/terms/${id}`, { method: 'DELETE' });
      } else {
        await fetch(`/api/tiffin/terms/${id}/hard`, { method: 'DELETE' });
      }
      fetchTerms();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await fetch(`/api/tiffin/terms/${id}/restore`, { method: 'PATCH' });
      fetchTerms();
    } catch (e) { console.error(e); }
  };

  const currentTerms = viewMode === 'active' ? terms : recycledTerms;

  if (loading) return <div>Loading terms...</div>;

  return (
    <div>
      {/* TERM EDIT MODAL */}
      {editingTerm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className={styles.card} style={{ width: '700px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', margin: 0 }}>
            <h3 className={styles.sectionTitle}>{isNewTerm ? 'Add Term' : 'Edit Term'}</h3>

            {localStorage.getItem('admin_role') === 'SUPER_ADMIN' && (
              <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ⚠️ Move Term (Super Admin)
                </h4>
                <ContextSelector 
                  selectedRestaurantId={editingTerm.restaurantId || restaurantId || null} 
                  selectedBranchId={editingTerm.branchId || branchId || null} 
                  onChange={(rId, bId) => setEditingTerm({...editingTerm, restaurantId: rId || undefined, branchId: bId || undefined})} 
                />
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className={styles.grid2}>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label className={styles.label}>Title (e.g. 1. Title EN | Title HI)</label>
                  <input required type="text" className={styles.input} value={editingTerm.title || ''} onChange={e => setEditingTerm({ ...editingTerm, title: e.target.value })} />
                </div>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label className={styles.label}>English Content (Markdown allowed)</label>
                  <textarea required rows={4} className={styles.textarea} value={editingTerm.contentEn || ''} onChange={e => setEditingTerm({ ...editingTerm, contentEn: e.target.value })} />
                </div>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label className={styles.label}>Hindi Content (Markdown allowed)</label>
                  <textarea required rows={4} className={styles.textarea} value={editingTerm.contentHi || ''} onChange={e => setEditingTerm({ ...editingTerm, contentHi: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Order</label>
                  <input required type="number" className={styles.input} value={editingTerm.order || 0} onChange={e => setEditingTerm({ ...editingTerm, order: parseInt(e.target.value) })} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" className={styles.checkbox} checked={editingTerm.isActive !== false} onChange={e => setEditingTerm({ ...editingTerm, isActive: e.target.checked })} />
                    Active (Visible to users)
                  </label>
                </div>
              </div>
              <div className={styles.btnGroup}>
                <button type="submit" className={`${styles.btn} ${styles.primaryBtn}`}>Save Term</button>
                <button type="button" onClick={() => { setEditingTerm(null); setIsNewTerm(false); }} className={`${styles.btn} ${styles.secondaryBtn}`}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.flexBetween}>
        <div className={styles.segmentedControl}>
          <button className={`${styles.segmentBtn} ${viewMode === 'active' ? styles.active : ''}`} onClick={() => setViewMode('active')}>
            Active Terms
          </button>
          <button className={`${styles.segmentBtn} ${viewMode === 'recycle' ? styles.active : ''}`} onClick={() => setViewMode('recycle')}>
            <Trash2 size={16} /> Recycle Bin
          </button>
        </div>
        <button 
          onClick={() => { setEditingTerm({ order: terms.length + 1, isActive: true, restaurantId: restaurantId || undefined, branchId: branchId || undefined }); setIsNewTerm(true); }}
          className={`${styles.btn} ${styles.primaryBtn}`}
        >
          <Plus size={16} /> Add Term
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {currentTerms.map(term => (
          <div key={term.id} className={styles.listItem} style={{ alignItems: 'flex-start' }}>
            <div style={{ flexGrow: 1 }}>
              <div className={styles.listItemTitle}>
                {term.title} <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>· Order {term.order}</span>
                {!term.isActive && <span className={`${styles.badge} ${styles.inactive}`} style={{ marginLeft: '0.5rem' }}>Inactive</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>English</div>
                  <div style={{ fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{term.contentEn}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Hindi</div>
                  <div style={{ fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{term.contentHi}</div>
                </div>
              </div>
            </div>
            <div className={styles.btnGroup} style={{ marginTop: 0, marginLeft: '1.5rem' }}>
              {viewMode === 'active' ? (
                <>
                  <button onClick={() => { setEditingTerm(term); setIsNewTerm(false); }} className={`${styles.actionBtn} ${styles.edit}`} title="Edit"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(term.id)} className={`${styles.actionBtn} ${styles.delete}`} title="Delete"><Trash2 size={16} /></button>
                </>
              ) : (
                <>
                  <button onClick={() => handleRestore(term.id)} className={`${styles.actionBtn} ${styles.edit}`}>Restore</button>
                  <button onClick={() => handleDelete(term.id)} className={`${styles.actionBtn} ${styles.delete}`}>Hard Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
        {currentTerms.length === 0 && <p style={{ color: '#64748b' }}>No terms found.</p>}
      </div>
    </div>
  );
}
