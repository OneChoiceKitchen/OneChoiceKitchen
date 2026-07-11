import { useState, useEffect, FormEvent } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import styles from './TiffinAdmin.module.css';
import { ContextSelector } from '../components/ContextSelector';
import { useToast, useConfirm } from '@org/ui-design-system';

interface TiffinPlan {
  id: string;
  name: string;
  dietType: string;
  mealsPerDay: number;
  totalMeals: number;
  monthlyPrice: number;
  pricePerMeal: number;
  isBestValue: boolean;
  isActive: boolean;
  restaurantId?: string;
  branchId?: string;
}

interface TiffinGlobalSetting {
  id: string;
  deliveryIncludedKm: number;
  extraKmCharge: number;
  shopPickupDiscountPct: number;
  notesText: string;
  qrCodeUrl: string;
  breakfastYoutubeUrl?: string | null;
  lunchYoutubeUrl?: string | null;
  dinnerYoutubeUrl?: string | null;
}

interface SubscriptionPlansAdminProps {
  restaurantId?: string | null;
  branchId?: string | null;
}

export default function SubscriptionPlansAdmin({ restaurantId, branchId }: SubscriptionPlansAdminProps) {
  const [viewMode, setViewMode] = useState<'active' | 'recycle'>('active');
  const [plans, setPlans] = useState<TiffinPlan[]>([]);
  const [recycledPlans, setRecycledPlans] = useState<TiffinPlan[]>([]);
  const [settings, setSettings] = useState<TiffinGlobalSetting | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editingPlan, setEditingPlan] = useState<Partial<TiffinPlan> | null>(null);
  const [isNewPlan, setIsNewPlan] = useState(false);
  const [editingSettings, setEditingSettings] = useState<Partial<TiffinGlobalSetting> | null>(null);
  const toast = useToast();
  const confirmDialog = useConfirm();

  useEffect(() => {
    fetchData();
  }, [restaurantId, branchId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = '/api/tiffin/plans';
      const params = new URLSearchParams();
      if (restaurantId) params.append('restaurantId', restaurantId);
      if (branchId) params.append('branchId', branchId);
      const query = params.toString();
      
      const activeUrl = query ? `${url}?${query}` : url;
      const recycleUrl = query ? `/api/tiffin/plans/recycled?${query}` : '/api/tiffin/plans/recycled';

      const [plansRes, recycledRes, settingsRes] = await Promise.all([
        fetch(activeUrl),
        fetch(recycleUrl),
        fetch('/api/tiffin/settings')
      ]);
      const plansData = await plansRes.text().then(t => t ? JSON.parse(t) : []);
      const recycledData = await recycledRes.text().then(t => t ? JSON.parse(t) : []);
      const settingsData = await settingsRes.text().then(t => t ? JSON.parse(t) : []);
      
      setPlans(Array.isArray(plansData) ? plansData : []);
      setRecycledPlans(Array.isArray(recycledData) ? recycledData : []);
      setSettings(settingsData);
    } catch (e) {
      console.error('Failed to fetch subscription data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async (e: FormEvent) => {
    e.preventDefault();
    if (!restaurantId && !editingPlan?.id) {
      toast.warning('Please select a Restaurant context to add a plan.');
      return;
    }

    if (localStorage.getItem('admin_role') === 'SUPER_ADMIN' && editingPlan?.id && (editingPlan.restaurantId !== restaurantId || editingPlan.branchId !== branchId)) {
      const ok = await confirmDialog({ title: 'Move Plan?', message: 'You are about to move this plan to a completely different restaurant or branch. Are you absolutely sure?', variant: 'warning' });
      if (!ok) {
        return;
      }
    }

    const payload = { ...editingPlan, restaurantId: editingPlan?.restaurantId || restaurantId, branchId: editingPlan?.branchId || branchId };

    const method = editingPlan?.id ? 'PUT' : 'POST';
    const url = editingPlan?.id ? `/api/tiffin/plans/${editingPlan.id}` : '/api/tiffin/plans';
    
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setEditingPlan(null);
      setIsNewPlan(false);
      fetchData();
    } catch (e) {
      toast.error('Failed to save plan');
    }
  };

  const handleDeletePlan = async (id: string) => {
    const isActive = viewMode === 'active';
    const ok = await confirmDialog({
      title: isActive ? 'Move to Recycle Bin' : 'Permanently Delete',
      message: isActive ? 'Move this plan to the Recycle Bin?' : 'Permanently delete this plan? This cannot be undone.',
      variant: isActive ? 'warning' : 'danger',
      confirmLabel: isActive ? 'Move to Bin' : 'Delete Forever'
    });
    if (!ok) return;
    try {
      if (viewMode === 'active') {
        await fetch(`/api/tiffin/plans/${id}`, { method: 'DELETE' });
      } else {
        await fetch(`/api/tiffin/plans/${id}/hard`, { method: 'DELETE' });
      }
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleRestorePlan = async (id: string) => {
    try {
      await fetch(`/api/tiffin/plans/${id}/restore`, { method: 'PATCH' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingSettings) return;

    try {
      await fetch(`/api/tiffin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingSettings, restaurantId, branchId })
      });
      setEditingSettings(null);
      fetchData();
    } catch (e) {
      toast.error('Failed to save settings');
    }
  };

  const currentPlans = viewMode === 'active' ? plans : recycledPlans;

  if (loading) return <div>Loading subscription data...</div>;

  return (
    <div>
      {/* GLOBAL SETTINGS MODAL */}
      {editingSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className={styles.card} style={{ width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', margin: 0 }}>
            <h3 className={styles.sectionTitle}>Edit Global Settings</h3>
            <form onSubmit={handleSaveSettings}>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Included Delivery Distance (KM)</label>
                  <input type="number" className={styles.input} value={editingSettings.deliveryIncludedKm || ''} onChange={e => setEditingSettings({...editingSettings, deliveryIncludedKm: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Extra KM Charge (₹)</label>
                  <input type="number" className={styles.input} value={editingSettings.extraKmCharge || ''} onChange={e => setEditingSettings({...editingSettings, extraKmCharge: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Shop Pickup Discount (%)</label>
                  <input type="number" className={styles.input} value={editingSettings.shopPickupDiscountPct || ''} onChange={e => setEditingSettings({...editingSettings, shopPickupDiscountPct: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>QR Code URL</label>
                  <input type="text" className={styles.input} value={editingSettings.qrCodeUrl || ''} onChange={e => setEditingSettings({...editingSettings, qrCodeUrl: e.target.value})} />
                </div>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label className={styles.label}>Disclaimer Notes</label>
                  <textarea rows={4} className={styles.textarea} value={editingSettings.notesText || ''} onChange={e => setEditingSettings({...editingSettings, notesText: e.target.value})} />
                </div>
                
                <h4 style={{ gridColumn: '1 / -1', margin: '1rem 0 0 0', color: '#1e293b' }}>Slot-wise Preparation Videos (YouTube)</h4>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Breakfast Video URL</label>
                  <input type="url" className={styles.input} placeholder="https://youtube.com/..." value={editingSettings.breakfastYoutubeUrl || ''} onChange={e => setEditingSettings({...editingSettings, breakfastYoutubeUrl: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Lunch Video URL</label>
                  <input type="url" className={styles.input} placeholder="https://youtube.com/..." value={editingSettings.lunchYoutubeUrl || ''} onChange={e => setEditingSettings({...editingSettings, lunchYoutubeUrl: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Dinner Video URL</label>
                  <input type="url" className={styles.input} placeholder="https://youtube.com/..." value={editingSettings.dinnerYoutubeUrl || ''} onChange={e => setEditingSettings({...editingSettings, dinnerYoutubeUrl: e.target.value})} />
                </div>
              </div>
              <div className={styles.btnGroup}>
                <button type="submit" className={`${styles.btn} ${styles.primaryBtn}`}>Save Settings</button>
                <button type="button" onClick={() => setEditingSettings(null)} className={`${styles.btn} ${styles.secondaryBtn}`}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PLAN EDIT MODAL */}
      {editingPlan && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className={styles.card} style={{ width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', margin: 0 }}>
            <h3 className={styles.sectionTitle}>{isNewPlan ? 'Add Plan' : `Edit Plan: ${editingPlan.name}`}</h3>

            {localStorage.getItem('admin_role') === 'SUPER_ADMIN' && (
              <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ⚠️ Move Plan (Super Admin)
                </h4>
                <ContextSelector 
                  selectedRestaurantId={editingPlan.restaurantId || restaurantId || null} 
                  selectedBranchId={editingPlan.branchId || branchId || null} 
                  onChange={(rId, bId) => setEditingPlan({...editingPlan, restaurantId: rId || undefined, branchId: bId || undefined})} 
                />
              </div>
            )}

            <form onSubmit={handleSavePlan}>
              <div className={styles.grid2}>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label className={styles.label}>Plan Name</label>
                  <input required type="text" className={styles.input} value={editingPlan.name || ''} onChange={e => setEditingPlan({...editingPlan, name: e.target.value})} placeholder="e.g. 2 TIMES DAILY" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Diet Type</label>
                  <select className={styles.select} value={editingPlan.dietType || 'VEG'} onChange={e => setEditingPlan({...editingPlan, dietType: e.target.value})}>
                    <option value="VEG">Vegetarian</option>
                    <option value="NON_VEG">Non-Vegetarian</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Meals Per Day</label>
                  <input required type="number" className={styles.input} value={editingPlan.mealsPerDay || ''} onChange={e => setEditingPlan({...editingPlan, mealsPerDay: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Total Meals in Month</label>
                  <input required type="number" className={styles.input} value={editingPlan.totalMeals || ''} onChange={e => setEditingPlan({...editingPlan, totalMeals: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Monthly Price (₹)</label>
                  <input required type="number" className={styles.input} value={editingPlan.monthlyPrice || ''} onChange={e => setEditingPlan({...editingPlan, monthlyPrice: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Price Per Meal (₹)</label>
                  <input required type="number" className={styles.input} value={editingPlan.pricePerMeal || ''} onChange={e => setEditingPlan({...editingPlan, pricePerMeal: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" className={styles.checkbox} checked={editingPlan.isBestValue || false} onChange={e => setEditingPlan({...editingPlan, isBestValue: e.target.checked})} />
                    Mark as "BEST VALUE"
                  </label>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" className={styles.checkbox} checked={editingPlan.isActive !== false} onChange={e => setEditingPlan({...editingPlan, isActive: e.target.checked})} />
                    Active (Visible on frontend)
                  </label>
                </div>
              </div>
              <div className={styles.btnGroup}>
                <button type="submit" className={`${styles.btn} ${styles.primaryBtn}`}>Save Plan</button>
                <button type="button" onClick={() => { setEditingPlan(null); setIsNewPlan(false); }} className={`${styles.btn} ${styles.secondaryBtn}`}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.flexBetween}>
        <div className={styles.segmentedControl}>
          <button className={`${styles.segmentBtn} ${viewMode === 'active' ? styles.active : ''}`} onClick={() => setViewMode('active')}>
            Active Plans
          </button>
          <button className={`${styles.segmentBtn} ${viewMode === 'recycle' ? styles.active : ''}`} onClick={() => setViewMode('recycle')}>
            <Trash2 size={16} /> Recycle Bin
          </button>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setEditingSettings(settings || {})} className={`${styles.btn} ${styles.secondaryBtn}`}>
            Edit Global Settings
          </button>
          <button onClick={() => { setEditingPlan({ isActive: true, dietType: 'VEG', mealsPerDay: 2, totalMeals: 60, restaurantId: restaurantId || undefined, branchId: branchId || undefined }); setIsNewPlan(true); }} className={`${styles.btn} ${styles.primaryBtn}`}>
            <Plus size={16} /> Add Plan
          </button>
        </div>
      </div>

      {currentPlans.length === 0 && <p style={{ color: '#64748b' }}>No plans found.</p>}

      {/* PLANS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {currentPlans.map(plan => (
          <div key={plan.id} className={styles.card} style={{ 
            border: `1px solid ${plan.dietType === 'VEG' ? '#bbf7d0' : '#fecaca'}`,
            position: 'relative',
            opacity: plan.isActive ? 1 : 0.6,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {plan.isBestValue && (
              <div style={{ position: 'absolute', top: 0, right: 0, background: plan.dietType === 'VEG' ? '#22c55e' : '#DC2626', color: 'white', padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderBottomLeftRadius: '8px', borderTopRightRadius: '12px' }}>
                BEST VALUE
              </div>
            )}
            <h4 style={{ margin: '0 0 1rem 0', color: plan.dietType === 'VEG' ? '#166534' : '#991b1b', fontSize: '1.25rem' }}>
              {plan.dietType} - {plan.name}
            </h4>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              ₹{plan.monthlyPrice} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>/ Month</span>
            </div>
            <div style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem', flexGrow: 1 }}>
              {plan.mealsPerDay} Meal(s) × 30 Days = <strong>{plan.totalMeals} Meals</strong><br/>
              Only ₹{plan.pricePerMeal} Per Meal
            </div>
            <div className={styles.btnGroup} style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              {viewMode === 'active' ? (
                <>
                  <button onClick={() => { setEditingPlan(plan); setIsNewPlan(false); }} className={`${styles.actionBtn} ${styles.edit}`}>Edit</button>
                  <button onClick={() => handleDeletePlan(plan.id)} className={`${styles.actionBtn} ${styles.delete}`}>Delete</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleRestorePlan(plan.id)} className={`${styles.actionBtn} ${styles.edit}`}>Restore</button>
                  <button onClick={() => handleDeletePlan(plan.id)} className={`${styles.actionBtn} ${styles.delete}`}>Hard Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
