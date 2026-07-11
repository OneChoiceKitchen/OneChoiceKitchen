import { useState, useEffect, FormEvent } from 'react';
import { useToast, useConfirm } from '@org/ui-design-system';
import styles from './OffersAdmin.module.css';

interface TiffinOffer {
  id: string;
  title: string;
  description: string;
  discountPct: number;
  minBookings: number;
  imageUrl: string;
  appliesToTiffin: boolean;
  appliesToMenu: boolean;
  appliesToHome: boolean;
  isHero: boolean;
  isActive: boolean;
  restaurantId?: string | null;
  branchId?: string | null;
}

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

const DUMMY_OFFERS: TiffinOffer[] = [
  { id: 'o1', title: 'Weekend Special: 15% Off All Tiffins', description: 'Enjoy our delicious meals this weekend at a special discounted price. Applies automatically at checkout.', discountPct: 15, minBookings: 2, imageUrl: '/discounts/weekend_tiffin_discount.png', appliesToTiffin: true, appliesToMenu: false, appliesToHome: true, isHero: true, isActive: true },
  { id: 'o2', title: 'Buy 5, Get 1 Free (20% Off)', description: 'Book a full week of meals and get your 6th meal absolutely free!', discountPct: 20, minBookings: 5, imageUrl: '/discounts/buy_5_get_1_free.png', appliesToTiffin: true, appliesToMenu: false, appliesToHome: false, isHero: false, isActive: true },
  { id: 'o3', title: 'Inactive Winter Promo', description: 'Old promotion from last winter.', discountPct: 10, minBookings: 0, imageUrl: '/discounts/winter_promo_discount.png', appliesToTiffin: true, appliesToMenu: true, appliesToHome: false, isHero: false, isActive: false },
  { id: 'o4', title: 'Family Feast: 25% Off', description: 'Perfect for large gatherings! Get a massive 25% discount when you order our premium family feast combos.', discountPct: 25, minBookings: 0, imageUrl: '/discounts/family_feast_offer.png', appliesToTiffin: false, appliesToMenu: true, appliesToHome: true, isHero: false, isActive: true },
  { id: 'o5', title: 'Healthy Start: Free Salad', description: 'Start your healthy lifestyle today. Get a free organic green salad with every new tiffin subscription!', discountPct: 0, minBookings: 1, imageUrl: '/discounts/healthy_start_offer.png', appliesToTiffin: true, appliesToMenu: false, appliesToHome: false, isHero: false, isActive: true },
  { id: 'o6', title: 'Midnight Cravings: 10% Off', description: 'Late night hunger? Enjoy a 10% discount on all orders placed between 10 PM and 2 AM.', discountPct: 10, minBookings: 0, imageUrl: '/discounts/midnight_cravings_offer.png', appliesToTiffin: false, appliesToMenu: true, appliesToHome: false, isHero: false, isActive: true }
];

export default function OffersAdmin() {
  const [offers, setOffers] = useState<TiffinOffer[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [editingOffer, setEditingOffer] = useState<Partial<TiffinOffer> | null>(null);
  const [isNewOffer, setIsNewOffer] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const toast = useToast();
  const confirmDialog = useConfirm();

  const fetchData = async () => {
    try {
      const [restRes, branchRes] = await Promise.all([
        fetch('/api/branches/restaurants/all', { headers: authHeaders() }).then(r => r.json()),
        fetch('/api/branches', { headers: authHeaders() }).then(r => r.json())
      ]);
      setRestaurants(Array.isArray(restRes) ? restRes : []);
      setBranches(Array.isArray(branchRes) ? branchRes : []);
    } catch (err) {
      console.error('Failed to fetch filter data', err);
    }
  };

  const fetchOffers = async () => {
    setLoadingOffers(true);
    try {
      // Simulate network delay to bypass backend for demo purposes
      await new Promise(resolve => setTimeout(resolve, 500));
      setOffers(DUMMY_OFFERS);
      
      /* --- REAL API DISABLED FOR DEMO ---
      const res = await fetch('/api/tiffin/offers/all', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.text().then(t => JSON.parse(t));
      const fetchedOffers = Array.isArray(data) ? data : [];
      setOffers(fetchedOffers.length > 0 ? fetchedOffers : DUMMY_OFFERS);
      */
    } catch (e) {
      // Fallback to dummy data
      setOffers(DUMMY_OFFERS);
    } finally { 
      setLoadingOffers(false); 
    }
  };

  useEffect(() => {
    fetchData();
    fetchOffers();
  }, []);

  const handleSaveOffer = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;
    try {
      if (isNewOffer) {
        const res = await fetch('/api/tiffin/offers', { method: 'POST', headers: authHeaders(), body: JSON.stringify(editingOffer) });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch(`/api/tiffin/offers/${editingOffer.id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(editingOffer) });
        if (!res.ok) throw new Error();
      }
      setEditingOffer(null);
      setIsNewOffer(false);
      fetchOffers();
      toast.success(isNewOffer ? 'Offer created' : 'Offer updated');
    } catch (e) {
      // Mock local state update if API fails
      if (isNewOffer) {
        setOffers(prev => [{ ...editingOffer, id: `mock-${Date.now()}` } as TiffinOffer, ...prev]);
      } else {
        setOffers(prev => prev.map(o => o.id === editingOffer.id ? { ...o, ...editingOffer } as TiffinOffer : o));
      }
      setEditingOffer(null);
      setIsNewOffer(false);
      toast.success(`(Mocked) Offer ${isNewOffer ? 'created' : 'updated'}`);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    const ok = await confirmDialog({ title: 'Delete Offer', message: 'Are you sure you want to delete this offer?', variant: 'danger' });
    if (!ok) return;
    try {
      const res = await fetch(`/api/tiffin/offers/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error();
      fetchOffers();
      toast.success('Offer deleted');
    } catch (e) {
      // Mock deletion
      setOffers(prev => prev.filter(o => o.id !== id));
      toast.success('(Mocked) Offer deleted');
    }
  };

  const handleGenerateDescription = async () => {
    if (!editingOffer?.title) {
      toast.warning('Please enter an offer title first!');
      return;
    }
    setGeneratingDescription(true);
    try {
      const response = await fetch('/api/menus/generate-description', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name: editingOffer.title })
      });
      if (response.ok) {
        const data = await response.text().then(t => JSON.parse(t));
        setEditingOffer((prev) => prev ? { ...prev, description: data.description } : null);
        toast.success('Description generated!');
      } else {
        throw new Error();
      }
    } catch (err) {
      // Mock generation if API is down
      setEditingOffer((prev) => prev ? { ...prev, description: `Enjoy an amazing discount on our freshly prepared meals. This is an auto-generated description for "${prev.title}". Don't miss out on this fantastic offer!` } : null);
      toast.success('(Mocked) Description generated');
    } finally {
      setGeneratingDescription(false);
    }
  };

  if (loadingOffers && offers.length === 0) {
    return <div className={styles.emptyState}>Loading Offers...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h2>Global Offers & Discounts</h2>
          <p className={styles.pageSubtitle}>Manage promotional banners and discounts across your site.</p>
        </div>
        {!editingOffer && (
          <button 
            onClick={() => { setEditingOffer({ discountPct: 0, minBookings: 0, isActive: true, appliesToTiffin: true, appliesToMenu: false, appliesToHome: false, isHero: false }); setIsNewOffer(true); }} 
            className={styles.primaryActionBtn}
          >
            + Add Offer
          </button>
        )}
      </div>

      {/* Editing Form */}
      {editingOffer && (
        <div className={styles.formContainer}>
          <h3 className={styles.formTitle}>{isNewOffer ? '✨ Add New Offer' : '✏️ Edit Offer'}</h3>
          <form onSubmit={handleSaveOffer}>
            
            <div className={styles.formGroupFull} style={{ marginBottom: '1.25rem' }}>
              <label className={styles.formLabel}>Offer Title</label>
              <input required className={styles.formInput} value={editingOffer.title || ''} onChange={e => setEditingOffer({ ...editingOffer, title: e.target.value })} placeholder="e.g. 10% Off Monthly Booking" />
            </div>

            <div className={styles.formGroupFull} style={{ marginBottom: '1.25rem' }}>
              <label className={styles.formLabel}>
                Description
                <button 
                  type="button" 
                  onClick={handleGenerateDescription}
                  disabled={generatingDescription}
                  className={styles.aiBtn}
                >
                  {generatingDescription ? 'Generating...' : '✨ Auto Generate'}
                </button>
              </label>
              <textarea rows={2} className={styles.formTextarea} value={editingOffer.description || ''} onChange={e => setEditingOffer({ ...editingOffer, description: e.target.value })} placeholder="Describe the offer details..." />
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Discount % (0 if no auto-discount)</label>
                <input type="number" className={styles.formInput} value={editingOffer.discountPct ?? 0} onChange={e => setEditingOffer({ ...editingOffer, discountPct: Number(e.target.value) })} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Min Bookings to Qualify (0 = all)</label>
                <input type="number" className={styles.formInput} value={editingOffer.minBookings ?? 0} onChange={e => setEditingOffer({ ...editingOffer, minBookings: Number(e.target.value) })} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Offer Banner Image URL</label>
                <input className={styles.formInput} value={editingOffer.imageUrl || ''} onChange={e => setEditingOffer({ ...editingOffer, imageUrl: e.target.value })} placeholder="/images/offer.jpg" />
                {editingOffer.imageUrl && <img src={editingOffer.imageUrl} alt="preview" style={{ marginTop: '0.5rem', maxHeight: '100px', borderRadius: '6px', objectFit: 'cover' }} />}
              </div>
            </div>

            <div className={styles.formGrid} style={{ marginTop: '1.25rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Target Restaurant (Optional)</label>
                <select 
                  className={styles.formInput}
                  value={editingOffer.restaurantId || ''}
                  onChange={e => setEditingOffer({ ...editingOffer, restaurantId: e.target.value, branchId: '' })}
                >
                  <option value="">All Restaurants (Global)</option>
                  {restaurants.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Target Branch (Optional)</label>
                <select 
                  className={styles.formInput}
                  value={editingOffer.branchId || ''}
                  onChange={e => setEditingOffer({ ...editingOffer, branchId: e.target.value })}
                  disabled={!editingOffer.restaurantId}
                >
                  <option value="">All Branches</option>
                  {branches.filter(b => b.restaurantId === editingOffer.restaurantId).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.checkboxGrid}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={editingOffer.isActive !== false} onChange={e => setEditingOffer({ ...editingOffer, isActive: e.target.checked })} />
                Is Active (Visible)
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={editingOffer.appliesToTiffin !== false} onChange={e => setEditingOffer({ ...editingOffer, appliesToTiffin: e.target.checked })} />
                Show on Tiffin Page
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={editingOffer.appliesToMenu === true} onChange={e => setEditingOffer({ ...editingOffer, appliesToMenu: e.target.checked })} />
                Show on Menu Page
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={editingOffer.appliesToHome === true} onChange={e => setEditingOffer({ ...editingOffer, appliesToHome: e.target.checked })} />
                Show on Home Page
              </label>
            </div>

            <div className={styles.heroCheckbox}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={editingOffer.isHero === true} onChange={e => setEditingOffer({ ...editingOffer, isHero: e.target.checked })} />
                <span>⭐ Show as Full-Width Hero Banner</span>
              </label>
              <p style={{ margin: '0.25rem 0 0 1.5rem', fontSize: '0.75rem', color: '#92400e' }}>Check this to stretch the banner across the entire screen instead of a standard card.</p>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.saveBtn}>Save Offer</button>
              <button type="button" onClick={() => { setEditingOffer(null); setIsNewOffer(false); }} className={styles.cancelBtn}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Offers Display */}
      {!editingOffer && offers.length === 0 && (
        <div className={styles.emptyState}>No offers added yet. Click "+ Add Offer" to create promotional banners.</div>
      )}

      {!editingOffer && (
        <div className={styles.offersGrid}>
          {offers.map(offer => (
            <div key={offer.id} className={styles.offerCard}>
              <div className={styles.offerImageContainer}>
                {offer.imageUrl ? (
                  <img 
                    src={offer.imageUrl} 
                    alt={offer.title} 
                    className={styles.offerImage}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/branding/transparent-logo.png";
                      target.style.objectFit = "contain";
                      target.style.padding = "1.5rem";
                      target.style.opacity = "0.2";
                    }}
                  />
                ) : (
                  <img src="/branding/transparent-logo.png" alt="No Image" className={styles.offerImage} style={{ objectFit: 'contain', padding: '1.5rem', opacity: 0.2 }} />
                )}
              </div>
              <div className={styles.offerContent}>
                <div className={styles.tagGroup}>
                  <span className={`${styles.tag} ${offer.isActive ? styles.active : styles.hidden}`}>
                    {offer.isActive ? 'Active' : 'Hidden'}
                  </span>
                  {offer.discountPct > 0 && <span className={`${styles.tag} ${styles.discount}`}>{offer.discountPct}% OFF</span>}
                  {offer.appliesToTiffin !== false && <span className={`${styles.tag} ${styles.tiffin}`}>Tiffin</span>}
                  {offer.appliesToMenu && <span className={`${styles.tag} ${styles.menu}`}>Menu</span>}
                  {offer.appliesToHome && <span className={`${styles.tag} ${styles.home}`}>Home</span>}
                  {offer.isHero && <span className={`${styles.tag} ${styles.hero}`}>Hero Banner</span>}
                </div>
                
                <h4 className={styles.offerTitle}>{offer.title}</h4>
                {offer.description && <p className={styles.offerDesc}>{offer.description}</p>}
                
                <div className={styles.offerActions}>
                  <button 
                    onClick={() => { setEditingOffer(offer); setIsNewOffer(false); }} 
                    className={`${styles.offerActionBtn} ${styles.edit}`}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteOffer(offer.id)} 
                    className={`${styles.offerActionBtn} ${styles.delete}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
