import React, { useState, useEffect, FormEvent } from 'react';
import { MOCK_TIFFIN_ITEMS, OOS_SKUS, getIngredientStatus, STOCK_BADGE } from './mockData';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { ContextSelector } from '../components/ContextSelector';
import styles from './TiffinAdmin.module.css';
import { useToast, useConfirm } from '@org/ui-design-system';

import SubscriptionPlansAdmin from './SubscriptionPlansAdmin';
import TiffinTermsAdmin from './TiffinTermsAdmin';

interface TiffinMenu {
  id: string;
  name: string;
  description: string;
  mealType: string;
  dietType: string;
  dayOfWeek: string;
  image: string;
  youtubeUrl?: string;
  price: number;
  isAvailable: boolean;
  restaurantId?: string;
  branchId?: string;
  ingredients?: Array<{ sku: string; name: string; qty: number; unit: string }>;
}

interface TiffinHoliday {
  id: string;
  title: string;
  date: string | null;
  isRecurring: boolean;
  recurringRule: string | null;
  isActive: boolean;
  restaurantId?: string;
  branchId?: string;
}

interface GlobalSettings {
  deliveryIncludedKm: number;
  extraKmCharge: number;
  shopPickupDiscountPct: number;
  notesText: string;
  qrCodeUrl: string;
  breakfastTime: string;
  breakfastYoutubeUrl: string;
  lunchTime: string;
  lunchYoutubeUrl: string;
  dinnerTime: string;
  dinnerYoutubeUrl: string;
  trialDeliveryFee: number;
  trialPackagingFee: number;
  minPauseDays: number;
  upiId: string;
  paymentInstructions: string;
  advancePaymentRequired: boolean;
  businessName: string;
  businessAddress: string;
  contactNumbers: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

export default function TiffinAdmin() {
  const [activeTab, setActiveTab] = useState<'meals' | 'subscriptions' | 'terms' | 'settings' | 'holidays'>('meals');
  
  // Context State
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'active' | 'recycle'>('active');

  const [menus, setMenus] = useState<TiffinMenu[]>([]);
  const [recycledMenus, setRecycledMenus] = useState<TiffinMenu[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [isEditingMeal, setIsEditingMeal] = useState(false);
  const [currentMealEdit, setCurrentMealEdit] = useState<Partial<TiffinMenu>>({});
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [filterDiet, setFilterDiet] = useState('VEG');
  const [filterDay, setFilterDay] = useState('Mon');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Global Settings State
  const [settings, setSettings] = useState<Partial<GlobalSettings>>({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Holidays State
  const [holidays, setHolidays] = useState<TiffinHoliday[]>([]);
  const [recycledHolidays, setRecycledHolidays] = useState<TiffinHoliday[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);
  const [editingHoliday, setEditingHoliday] = useState<Partial<TiffinHoliday> | null>(null);
  const [isNewHoliday, setIsNewHoliday] = useState(false);
  const toast = useToast();
  const confirmDialog = useConfirm();

  const fetchMenus = async () => {
    try {
      setLoadingMeals(true);
      const url = '/api/tiffin/menu';
      const params = new URLSearchParams();
      if (restaurantId) params.append('restaurantId', restaurantId);
      if (branchId) params.append('branchId', branchId);
      const query = params.toString();
      
      const [activeRes, recycledRes] = await Promise.all([
        fetch(`/api/tiffin/menu${query ? `?${query}` : ''}`),
        fetch(`/api/tiffin/menu/recycled${query ? `?${query}` : ''}`)
      ]);
      const activeData = await activeRes.text().then(t => t ? JSON.parse(t) : []);
      const recycledData = await recycledRes.text().then(t => t ? JSON.parse(t) : []);
      
      setMenus(Array.isArray(activeData) ? activeData : []);
      setRecycledMenus(Array.isArray(recycledData) ? recycledData : []);
    } catch (e) {
      // API unavailable — show empty state (no mock injection)
      setMenus([]);
      setRecycledMenus([]);
      console.warn('[TiffinAdmin] API unavailable:', e);
    }
    finally { setLoadingMeals(false); }
  };

  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const url = '/api/tiffin/settings';
      const params = new URLSearchParams();
      if (restaurantId) params.append('restaurantId', restaurantId);
      if (branchId) params.append('branchId', branchId);
      const query = params.toString();
      const res = await fetch(`/api/tiffin/settings${query ? `?${query}` : ''}`);
      const data = await res.text().then(t => t ? JSON.parse(t) : {});
      setSettings(data || {});
    } catch (e) { console.error(e); }
    finally { setLoadingSettings(false); }
  };

  const fetchHolidays = async () => {
    setLoadingHolidays(true);
    try {
      const params = new URLSearchParams();
      if (restaurantId) params.append('restaurantId', restaurantId);
      if (branchId) params.append('branchId', branchId);
      const query = params.toString();
      
      const [activeRes, recycledRes] = await Promise.all([
        fetch(`/api/tiffin/holidays${query ? `?${query}` : ''}`),
        fetch(`/api/tiffin/holidays/recycled${query ? `?${query}` : ''}`)
      ]);
      const activeData = await activeRes.text().then(t => t ? JSON.parse(t) : []);
      const recycledData = await recycledRes.text().then(t => t ? JSON.parse(t) : []);
      setHolidays(Array.isArray(activeData) ? activeData : []);
      setRecycledHolidays(Array.isArray(recycledData) ? recycledData : []);
    } catch (e) { console.error(e); }
    finally { setLoadingHolidays(false); }
  };

  useEffect(() => {
    if (activeTab === 'meals') {
      fetchMenus();
      setCurrentPage(1);
    }
    else if (activeTab === 'settings') fetchSettings();
    else if (activeTab === 'holidays') fetchHolidays();
  }, [activeTab, restaurantId, branchId]);

  const handleSaveMeal = async (e: FormEvent) => {
    e.preventDefault();
    if (!restaurantId && !currentMealEdit.id) {
      toast.warning('Please select a Restaurant context to add a meal.');
      return;
    }
    
    if (localStorage.getItem('admin_role') === 'SUPER_ADMIN' && currentMealEdit.id && (currentMealEdit.restaurantId !== restaurantId || currentMealEdit.branchId !== branchId)) {
      const ok = await confirmDialog({ title: 'Move Meal Item?', message: 'You are about to move this menu item to a completely different restaurant or branch. Are you absolutely sure?', variant: 'warning' });
      if (!ok) {
        return;
      }
    }
    
    const payload = { ...currentMealEdit, restaurantId: currentMealEdit.restaurantId || restaurantId, branchId: currentMealEdit.branchId || branchId };
    
    const method = currentMealEdit.id ? 'PUT' : 'POST';
    const url = currentMealEdit.id ? `/api/tiffin/menu/${currentMealEdit.id}` : '/api/tiffin/menu';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to save menu item');
        return;
      }
      setIsEditingMeal(false);
      setCurrentMealEdit({});
      fetchMenus();
    } catch (e) { 
      console.error(e); 
      toast.error('An error occurred while saving.');
    }
  };

  const handleDeleteMeal = async (id: string) => {
    const isActive = viewMode === 'active';
    const ok = await confirmDialog({
      title: isActive ? 'Move to Recycle Bin' : 'Permanently Delete',
      message: isActive ? 'Move this meal to the Recycle Bin?' : 'Permanently delete this meal item? This cannot be undone.',
      variant: isActive ? 'warning' : 'danger',
      confirmLabel: isActive ? 'Move to Bin' : 'Delete Forever'
    });
    if (!ok) return;
    try {
      if (viewMode === 'active') {
        await fetch(`/api/tiffin/menu/${id}`, { method: 'DELETE' });
      } else {
        await fetch(`/api/tiffin/menu/${id}/hard`, { method: 'DELETE' });
      }
      fetchMenus();
    } catch (e) { console.error(e); }
  };

  const handleRestoreMeal = async (id: string) => {
    try {
      await fetch(`/api/tiffin/menu/${id}/restore`, { method: 'PATCH' });
      fetchMenus();
    } catch (e) { console.error(e); }
  };

  const handleGenerateDescription = async () => {
    if (!currentMealEdit.name) {
      toast.warning('Please enter an item name first!');
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
        body: JSON.stringify({ name: currentMealEdit.name })
      });
      const data = await response.text().then(t => JSON.parse(t));
      if (response.ok) {
        setCurrentMealEdit((prev) => ({ ...prev, description: data.description }));
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

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await fetch('/api/tiffin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, restaurantId, branchId }),
      });
      toast.success('Settings saved successfully!');
    } catch (e) { console.error(e); }
    finally { setSavingSettings(false); }
  };

  const handleSaveHoliday = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingHoliday) return;
    
    if (!restaurantId && !editingHoliday.id) {
      toast.warning('Please select a Restaurant context to add a holiday.');
      return;
    }

    if (localStorage.getItem('admin_role') === 'SUPER_ADMIN' && editingHoliday.id && (editingHoliday.restaurantId !== restaurantId || editingHoliday.branchId !== branchId)) {
      const ok = await confirmDialog({ title: 'Move Holiday?', message: 'You are about to move this holiday to a completely different restaurant or branch. Are you absolutely sure?', variant: 'warning' });
      if (!ok) {
        return;
      }
    }

    const payload = { ...editingHoliday, restaurantId: editingHoliday.restaurantId || restaurantId, branchId: editingHoliday.branchId || branchId };

    try {
      if (isNewHoliday) {
        await fetch('/api/tiffin/holidays', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        await fetch(`/api/tiffin/holidays/${editingHoliday.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      setEditingHoliday(null);
      setIsNewHoliday(false);
      fetchHolidays();
    } catch (e) { console.error(e); }
  };

  const handleDeleteHoliday = async (id: string) => {
    const ok = await confirmDialog({ title: 'Delete Holiday', message: 'Are you sure you want to delete this holiday?', variant: 'danger' });
    if (!ok) return;
    try {
      await fetch(`/api/tiffin/holidays/${id}`, { method: 'DELETE' });
      fetchHolidays();
    } catch (e) { console.error(e); }
  };

  const sourceMenus = viewMode === 'active' ? menus : recycledMenus;
  const filteredMenus = sourceMenus.filter(m => m.dietType === filterDiet && m.dayOfWeek === filterDay);
  const totalPages = Math.max(1, Math.ceil(filteredMenus.length / itemsPerPage));
  const currentFilteredMenus = filteredMenus.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderSettings = () => {
    if (loadingSettings) return <div>Loading Settings...</div>;
    return (
      <form onSubmit={handleSaveSettings} className={styles.card}>
        <h3 className={styles.sectionTitle}>⏰ Meal Timings</h3>
        <div className={styles.grid3}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Breakfast Time</label>
            <input className={styles.input} value={settings.breakfastTime || ''} onChange={e => setSettings({ ...settings, breakfastTime: e.target.value })} placeholder="7 - 10 AM" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Lunch Time</label>
            <input className={styles.input} value={settings.lunchTime || ''} onChange={e => setSettings({ ...settings, lunchTime: e.target.value })} placeholder="12 - 3 PM" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Dinner Time</label>
            <input className={styles.input} value={settings.dinnerTime || ''} onChange={e => setSettings({ ...settings, dinnerTime: e.target.value })} placeholder="7 - 10 PM" />
          </div>
        </div>

        <h3 className={styles.sectionTitle}>🚚 Delivery Settings</h3>
        <div className={styles.grid3}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Free Delivery Distance (KM)</label>
            <input type="number" className={styles.input} value={settings.deliveryIncludedKm ?? 3} onChange={e => setSettings({ ...settings, deliveryIncludedKm: Number(e.target.value) })} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Extra KM Charge (₹)</label>
            <input type="number" className={styles.input} value={settings.extraKmCharge ?? 8} onChange={e => setSettings({ ...settings, extraKmCharge: Number(e.target.value) })} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Shop Pickup Discount (%)</label>
            <input type="number" className={styles.input} value={settings.shopPickupDiscountPct ?? 5} onChange={e => setSettings({ ...settings, shopPickupDiscountPct: Number(e.target.value) })} />
          </div>
        </div>

        <h3 className={styles.sectionTitle}>🍱 Trial Meal Charges</h3>
        <div className={styles.grid2}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Trial Delivery Fee (₹)</label>
            <input type="number" className={styles.input} value={settings.trialDeliveryFee ?? 40} onChange={e => setSettings({ ...settings, trialDeliveryFee: Number(e.target.value) })} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Trial Packaging Fee (₹)</label>
            <input type="number" className={styles.input} value={settings.trialPackagingFee ?? 15} onChange={e => setSettings({ ...settings, trialPackagingFee: Number(e.target.value) })} />
          </div>
        </div>

        <h3 className={styles.sectionTitle}>⏸ Pause Policy</h3>
        <div className={styles.formGroup} style={{ marginBottom: '2rem' }}>
          <label className={styles.label}>Minimum Pause Days (for carry-forward)</label>
          <input type="number" className={styles.input} style={{ maxWidth: '200px' }} value={settings.minPauseDays ?? 5} onChange={e => setSettings({ ...settings, minPauseDays: Number(e.target.value) })} />
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Pauses more than this many days will carry forward the balance to next month.</p>
        </div>

        <h3 className={styles.sectionTitle}>💳 Payment & UPI</h3>
        <div className={styles.grid2}>
          <div className={styles.formGroup}>
            <label className={styles.label}>UPI ID</label>
            <input className={styles.input} value={settings.upiId || ''} onChange={e => setSettings({ ...settings, upiId: e.target.value })} placeholder="yourname@bank" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>QR Code Image URL</label>
            <input className={styles.input} value={settings.qrCodeUrl || ''} onChange={e => setSettings({ ...settings, qrCodeUrl: e.target.value })} placeholder="/images/qr-code.png" />
          </div>
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label className={styles.label}>Payment Instructions</label>
            <textarea className={styles.textarea} value={settings.paymentInstructions || ''} onChange={e => setSettings({ ...settings, paymentInstructions: e.target.value })} placeholder="Please verify name Ms Preety Kumari before paying..." />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" className={styles.checkbox} checked={settings.advancePaymentRequired ?? true} onChange={e => setSettings({ ...settings, advancePaymentRequired: e.target.checked })} />
              Advance Payment Required
            </label>
          </div>
        </div>

        <h3 className={styles.sectionTitle}>📍 Contact Information</h3>
        <div className={styles.grid2}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Business Name</label>
            <input className={styles.input} value={settings.businessName || ''} onChange={e => setSettings({ ...settings, businessName: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Contact Numbers</label>
            <input className={styles.input} value={settings.contactNumbers || ''} onChange={e => setSettings({ ...settings, contactNumbers: e.target.value })} placeholder="6299230165 / 7004838102" />
          </div>
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label className={styles.label}>Business Address</label>
            <input className={styles.input} value={settings.businessAddress || ''} onChange={e => setSettings({ ...settings, businessAddress: e.target.value })} />
          </div>
        </div>

        <h3 className={styles.sectionTitle}>📝 Additional Notes</h3>
        <div className={`${styles.formGroup} ${styles.formGroupFull}`} style={{ marginBottom: '2rem' }}>
          <label className={styles.label}>Notes Text (shown at bottom of pricing)</label>
          <textarea className={styles.textarea} value={settings.notesText || ''} onChange={e => setSettings({ ...settings, notesText: e.target.value })} />
        </div>

        <button type="submit" disabled={savingSettings} className={`${styles.btn} ${styles.primaryBtn}`}>
          {savingSettings ? 'Saving...' : '💾 Save All Settings'}
        </button>
      </form>
    );
  };

  const renderHolidays = () => {
    if (loadingHolidays) return <div>Loading Holidays...</div>;

    if (editingHoliday) {
      return (
        <form onSubmit={handleSaveHoliday} className={styles.card}>
          <h3 className={styles.sectionTitle}>{isNewHoliday ? 'Add Holiday' : 'Edit Holiday'}</h3>
          
          {localStorage.getItem('admin_role') === 'SUPER_ADMIN' && (
            <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚠️ Move Holiday (Super Admin)
              </h4>
              <ContextSelector 
                selectedRestaurantId={editingHoliday.restaurantId || restaurantId} 
                selectedBranchId={editingHoliday.branchId || branchId} 
                onChange={(rId, bId) => setEditingHoliday({...editingHoliday, restaurantId: rId || undefined, branchId: bId || undefined})} 
              />
            </div>
          )}

          <div className={styles.grid2}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Holiday Title</label>
              <input required className={styles.input} value={editingHoliday.title || ''} onChange={e => setEditingHoliday({ ...editingHoliday, title: e.target.value })} placeholder="e.g. Last Sunday of Month Holiday" />
            </div>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" className={styles.checkbox} checked={editingHoliday.isRecurring ?? false} onChange={e => setEditingHoliday({ ...editingHoliday, isRecurring: e.target.checked })} />
                Recurring (repeating rule)
              </label>
            </div>
            
            {editingHoliday.isRecurring ? (
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.label}>Recurring Rule</label>
                <select className={styles.select} value={editingHoliday.recurringRule || 'LAST_SUNDAY_OF_MONTH'} onChange={e => setEditingHoliday({ ...editingHoliday, recurringRule: e.target.value })}>
                  <option value="LAST_SUNDAY_OF_MONTH">Last Sunday of Every Month</option>
                  <option value="EVERY_SUNDAY">Every Sunday</option>
                  <option value="FIRST_SUNDAY_OF_MONTH">First Sunday of Every Month</option>
                </select>
              </div>
            ) : (
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.label}>Specific Date</label>
                <input type="date" className={styles.input} value={editingHoliday.date ? editingHoliday.date.substring(0, 10) : ''} onChange={e => setEditingHoliday({ ...editingHoliday, date: e.target.value })} />
              </div>
            )}
            
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" className={styles.checkbox} checked={editingHoliday.isActive !== false} onChange={e => setEditingHoliday({ ...editingHoliday, isActive: e.target.checked })} />
                Is Active
              </label>
            </div>
          </div>
          
          <div className={styles.btnGroup}>
            <button type="submit" className={`${styles.btn} ${styles.primaryBtn}`}>Save Holiday</button>
            <button type="button" onClick={() => { setEditingHoliday(null); setIsNewHoliday(false); }} className={`${styles.btn} ${styles.secondaryBtn}`}>Cancel</button>
          </div>
        </form>
      );
    }

    const currentHolidays = viewMode === 'active' ? holidays : recycledHolidays;

    return (
      <div>
        <div className={styles.flexBetween}>
          <p style={{ margin: '0', color: '#64748b', fontSize: '0.9rem' }}>Manage holiday rules. Recurring rules (e.g. Last Sunday of month) are auto-applied.</p>
          <button onClick={() => { setEditingHoliday({ isRecurring: false, isActive: true }); setIsNewHoliday(true); }} className={`${styles.btn} ${styles.primaryBtn}`}>
            + Add Holiday
          </button>
        </div>

        <div className={styles.segmentedControl}>
          <button className={`${styles.segmentBtn} ${viewMode === 'active' ? styles.active : ''}`} onClick={() => setViewMode('active')}>
            Active Holidays
          </button>
          <button className={`${styles.segmentBtn} ${viewMode === 'recycle' ? styles.active : ''}`} onClick={() => setViewMode('recycle')}>
            <Trash2 size={16} /> Recycle Bin
          </button>
        </div>

        <div className={styles.tipBox}>
          💡 <strong>Tip:</strong> Add "Last Sunday of Every Month" as a recurring rule to automatically make the last Sunday of each month a no-service day.
        </div>

        {currentHolidays.length === 0 && <p style={{ color: '#64748b' }}>No holidays found.</p>}
        <div>
          {currentHolidays.map(holiday => (
            <div key={holiday.id} className={styles.listItem}>
              <div>
                <div className={styles.listItemTitle}>{holiday.title}</div>
                <div className={styles.listItemMeta}>
                  {holiday.isRecurring ? `🔄 Recurring: ${holiday.recurringRule?.replace(/_/g, ' ')}` : `📅 ${holiday.date ? new Date(holiday.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No date'}`}
                  {' · '}
                  <span className={`${styles.badge} ${holiday.isActive ? styles.active : styles.inactive}`}>{holiday.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div className={styles.btnGroup} style={{ marginTop: 0 }}>
                {viewMode === 'active' ? (
                  <>
                    <button onClick={() => { setEditingHoliday(holiday); setIsNewHoliday(false); }} className={`${styles.actionBtn} ${styles.edit}`}>Edit</button>
                    <button onClick={() => handleDeleteHoliday(holiday.id)} className={`${styles.actionBtn} ${styles.delete}`}>Delete</button>
                  </>
                ) : (
                  <>
                    <button onClick={async () => { await fetch(`/api/tiffin/holidays/${holiday.id}/restore`, { method: 'PATCH' }); fetchHolidays(); }} className={`${styles.actionBtn} ${styles.edit}`}>Restore</button>
                    <button onClick={async () => { const ok = await confirmDialog({ title: 'Hard Delete Holiday', message: 'Permanently delete this holiday? This cannot be undone.', variant: 'danger' }); if (ok) { await fetch(`/api/tiffin/holidays/${holiday.id}/hard`, { method: 'DELETE' }); fetchHolidays(); } }} className={`${styles.actionBtn} ${styles.delete}`}>Hard Delete</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Tiffin Management</h2>
          <p className={styles.pageSubtitle}>Configure your tiffin subscription meals, plans, holidays, and global settings.</p>
        </div>
        {activeTab === 'meals' && !isEditingMeal && (
          <button 
            onClick={() => { setCurrentMealEdit({ dayOfWeek: filterDay, dietType: filterDiet, mealType: 'Lunch', isAvailable: true, restaurantId: restaurantId || undefined, branchId: branchId || undefined }); setIsEditingMeal(true); }} 
            className={`${styles.btn} ${styles.primaryBtn}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Add Menu Item
          </button>
        )}
      </div>

      <ContextSelector 
        selectedRestaurantId={restaurantId} 
        selectedBranchId={branchId} 
        onChange={(rId, bId) => {
          setRestaurantId(rId);
          setBranchId(bId);
        }} 
      />


      {/* OOS / Critical Stock Alert — cross-link to Inventory Management */}
      {OOS_SKUS.length > 0 && (
        <div style={{margin:'0.5rem 0 1rem',padding:'0.75rem 1rem',background:'#fef2f2',border:'1.5px solid #fca5a5',borderRadius:'8px',display:'flex',alignItems:'center',gap:'0.75rem',flexWrap:'wrap'}}>
          <span style={{fontSize:'1rem'}}>🚨</span>
          <div style={{flex:1}}>
            <strong style={{color:'#b91c1c',fontSize:'0.875rem'}}>Inventory Alert:</strong>
            <span style={{color:'#7f1d1d',fontSize:'0.8rem',marginLeft:6}}>
              {OOS_SKUS.length} ingredient(s) <b>Out of Stock</b> — some tiffin meals cannot be prepared today.
              <a href="/?tab=inventory" style={{color:'#2563EB',fontWeight:600,marginLeft:8,textDecoration:'none'}}>→ View Inventory Management</a>
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <button className={`${styles.tabBtn} ${activeTab === 'meals' ? styles.activeTab : ''}`} onClick={() => setActiveTab('meals')}>Daily Menu Items</button>
        <button className={`${styles.tabBtn} ${activeTab === 'subscriptions' ? styles.activeTab : ''}`} onClick={() => setActiveTab('subscriptions')}>Plans & Pricing</button>
        <button className={`${styles.tabBtn} ${activeTab === 'terms' ? styles.activeTab : ''}`} onClick={() => setActiveTab('terms')}>Terms & Conditions</button>
        <button className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.activeTab : ''}`} onClick={() => setActiveTab('settings')}>Timings & Rules</button>
        <button className={`${styles.tabBtn} ${activeTab === 'holidays' ? styles.activeTab : ''}`} onClick={() => setActiveTab('holidays')}>Holidays</button>
      </div>

      {activeTab === 'subscriptions' && <SubscriptionPlansAdmin restaurantId={restaurantId} branchId={branchId} />}
      {activeTab === 'terms' && <TiffinTermsAdmin restaurantId={restaurantId} branchId={branchId} />}
      {activeTab === 'settings' && renderSettings()}
      {activeTab === 'holidays' && renderHolidays()}

      {activeTab === 'meals' && (
        <>
          {isEditingMeal ? (
            <form onSubmit={handleSaveMeal} className={styles.card}>
              <h3 className={styles.sectionTitle}>{currentMealEdit.id ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>

              {localStorage.getItem('admin_role') === 'SUPER_ADMIN' && (
                <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ⚠️ Move Menu Item (Super Admin)
                  </h4>
                  <ContextSelector 
                    selectedRestaurantId={currentMealEdit.restaurantId || restaurantId} 
                    selectedBranchId={currentMealEdit.branchId || branchId} 
                    onChange={(rId, bId) => setCurrentMealEdit({...currentMealEdit, restaurantId: rId || undefined, branchId: bId || undefined})} 
                  />
                </div>
              )}

              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Item Name</label>
                  <input required className={styles.input} value={currentMealEdit.name || ''} onChange={e => setCurrentMealEdit({ ...currentMealEdit, name: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className={styles.label} style={{ marginBottom: 0 }}>Description (Optional)</label>
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
                  <input className={styles.input} value={currentMealEdit.description || ''} onChange={e => setCurrentMealEdit({ ...currentMealEdit, description: e.target.value })} />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Day of Week</label>
                  <select className={styles.select} value={currentMealEdit.dayOfWeek || 'Mon'} onChange={e => setCurrentMealEdit({ ...currentMealEdit, dayOfWeek: e.target.value })}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Meal Type</label>
                  <select className={styles.select} value={currentMealEdit.mealType || 'Lunch'} onChange={e => setCurrentMealEdit({ ...currentMealEdit, mealType: e.target.value })}>
                    {MEALS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Diet Type</label>
                  <select className={styles.select} value={currentMealEdit.dietType || 'VEG'} onChange={e => setCurrentMealEdit({ ...currentMealEdit, dietType: e.target.value })}>
                    <option value="VEG">Vegetarian</option>
                    <option value="NON_VEG">Non-Vegetarian</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Image URL</label>
                  <input className={styles.input} value={currentMealEdit.image || ''} onChange={e => setCurrentMealEdit({ ...currentMealEdit, image: e.target.value })} placeholder="/images/dish.jpg" />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>YouTube Preparation Video URL</label>
                  <input className={styles.input} value={currentMealEdit.youtubeUrl || ''} onChange={e => setCurrentMealEdit({ ...currentMealEdit, youtubeUrl: e.target.value })} placeholder="https://youtube.com/watch?..." />
                </div>
                
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" className={styles.checkbox} checked={currentMealEdit.isAvailable !== false} onChange={e => setCurrentMealEdit({ ...currentMealEdit, isAvailable: e.target.checked })} />
                    Is Available
                  </label>
                </div>
              </div>

              <div className={styles.btnGroup}>
                <button type="submit" className={`${styles.btn} ${styles.primaryBtn}`}>Save Menu Item</button>
                <button type="button" onClick={() => setIsEditingMeal(false)} className={`${styles.btn} ${styles.secondaryBtn}`}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              {loadingMeals ? <div>Loading Tiffin Menus...</div> : (
                <div className={styles.card}>
                  <div className={styles.segmentedControl}>
                    <button className={`${styles.segmentBtn} ${viewMode === 'active' ? styles.active : ''}`} onClick={() => setViewMode('active')}>
                      Active Menus
                    </button>
                    <button className={`${styles.segmentBtn} ${viewMode === 'recycle' ? styles.active : ''}`} onClick={() => setViewMode('recycle')}>
                      <Trash2 size={16} /> Recycle Bin
                    </button>
                  </div>
                  
                  <div className={styles.flexBetween}>
                    <div className={styles.filterBar} style={{ marginBottom: 0 }}>
                      <select className={styles.select} style={{ width: 'auto' }} value={filterDiet} onChange={e => setFilterDiet(e.target.value)}>
                        <option value="VEG">Vegetarian Plan</option>
                        <option value="NON_VEG">Non-Vegetarian Plan</option>
                      </select>
                      <select className={styles.select} style={{ width: 'auto' }} value={filterDay} onChange={e => setFilterDay(e.target.value)}>
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <button onClick={() => { setCurrentMealEdit({ dayOfWeek: filterDay, dietType: filterDiet, mealType: 'Lunch', isAvailable: true, restaurantId: restaurantId || undefined, branchId: branchId || undefined }); setIsEditingMeal(true); }} className={`${styles.btn} ${styles.secondaryBtn}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid #cbd5e1' }}>
                      <Plus size={16} /> Add Menu Item
                    </button>
                  </div>

                  <div className={styles.tableContainer} style={{ marginTop: '1.5rem' }}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Meal Slot</th>
                          <th>Items</th>
                          <th style={{ width: '100px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentFilteredMenus.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: '#64748b' }}>No menu items for this day.</td></tr>}
                        {currentFilteredMenus.map(m => (
                          <tr key={m.id}>
                            <td data-label="Meal Slot" style={{ fontWeight: 500, color: '#334155' }}>
                              <div className={styles.mealSlotWrapper}>
                                {m.mealType === 'Breakfast' ? '🌅' : m.mealType === 'Lunch' ? '☀️' : '🌙'} {m.mealType}
                              </div>
                            </td>
                            <td data-label="Items">
                              <div className={styles.mealInfo}>
                                <div>
                                  <div className={styles.mealTitle}>{m.name}</div>
                                  {m.description && <div className={styles.mealDesc}>{m.description}</div>}
                                  {/* Ingredient stock badges */}
                                  {m.ingredients && m.ingredients.length > 0 && (
                                    <div style={{marginTop:'4px',display:'flex',flexWrap:'wrap',gap:'3px'}}>
                                      {m.ingredients.map((ing: any) => {
                                        const st = getIngredientStatus(ing.sku);
                                        if (st === 'ok') return null;
                                        const b = STOCK_BADGE[st];
                                        return <span key={ing.sku} style={{fontSize:'0.62rem',fontWeight:700,padding:'1px 5px',borderRadius:999,background:b.bg,color:b.color,whiteSpace:'nowrap'}}>{ing.name}: {b.label}</span>;
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td data-label="Actions">
                              <div className={styles.btnGroup} style={{ marginTop: 0 }}>
                                {viewMode === 'active' ? (
                                  <>
                                    <button onClick={() => { setCurrentMealEdit(m); setIsEditingMeal(true); }} className={`${styles.actionBtn} ${styles.edit}`} title="Edit">
                                      <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteMeal(m.id)} className={`${styles.actionBtn} ${styles.delete}`} title="Delete">
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => handleRestoreMeal(m.id)} className={`${styles.actionBtn} ${styles.edit}`}>Restore</button>
                                    <button onClick={() => handleDeleteMeal(m.id)} className={`${styles.actionBtn} ${styles.delete}`}>Hard Delete</button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.pagination}>
                    <div className={styles.paginationText}>Showing {filteredMenus.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredMenus.length)} of {filteredMenus.length} items</div>
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
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
