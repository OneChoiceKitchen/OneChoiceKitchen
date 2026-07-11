import React, { useState, useEffect } from 'react';
import { 
  Monitor, Smartphone, Bike, Plus, Trash2, Edit3, 
  Eye, EyeOff, Save, X, Image as ImageIcon, Link as LinkIcon 
} from 'lucide-react';
import { useToast, useConfirm } from '@org/ui-design-system';
import styles from './SlidersAdmin.module.css';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

const DUMMY_SLIDERS = [
  // WEB PORTAL (10)
  { id: 'w1', portal: 'web', title: 'Summer Special', description: 'Get 20% off on all Tiffin subscriptions this summer.', buttonText: 'Claim Offer', link: '/tiffin', bgColor: 'linear-gradient(135deg, #f59e0b, #DC2626)', fontColor: '#ffffff', btnColor: 'rgba(0,0,0,0.3)', imageUrl: '/slider_background_image/ai_summer.png', isActive: true, orderIndex: 1, pageScope: 'all' },
  { id: 'w2', portal: 'web', title: 'Healthy Salads', description: 'Fresh, organic salads delivered straight to your door.', buttonText: 'View Menu', link: '/menu', bgColor: 'linear-gradient(135deg, #10b981, #059669)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_salad.png', isActive: true, orderIndex: 2, pageScope: 'home' },
  { id: 'w3', portal: 'web', title: 'Weekend Feast', description: 'Enjoy our signature thali at a discounted price.', buttonText: 'Order Now', link: '/offers', bgColor: 'linear-gradient(135deg, #ec4899, #be185d)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_family.png', isActive: true, orderIndex: 3, pageScope: 'all' },
  { id: 'w4', portal: 'web', title: 'New Arrival', description: 'Try our brand new vegan wraps and smoothies.', buttonText: 'Explore', link: '/menu', bgColor: 'linear-gradient(135deg, #84cc16, #4d7c0f)', fontColor: '#ffffff', btnColor: 'rgba(0,0,0,0.2)', imageUrl: '/slider_background_image/food_veg_noodles.png', isActive: true, orderIndex: 4, pageScope: 'home' },
  { id: 'w5', portal: 'web', title: 'Family Combo', description: 'Perfect meal for a family of 4, with free dessert.', buttonText: 'View Combo', link: '/tiffin', bgColor: 'linear-gradient(135deg, #f97316, #c2410c)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_family.png', isActive: true, orderIndex: 5, pageScope: 'all' },
  { id: 'w6', portal: 'web', title: 'Detox Diet', description: 'Cleanse your body with our 7-day detox plan.', buttonText: 'Join Plan', link: '/plan', bgColor: 'linear-gradient(135deg, #14b8a6, #0f766e)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_healthy.png', isActive: true, orderIndex: 6, pageScope: 'home' },
  { id: 'w7', portal: 'web', title: 'Midnight Cravings', description: 'Late night delivery is now open until 2 AM.', buttonText: 'Order Now', link: '/menu', bgColor: 'linear-gradient(135deg, #6366f1, #4338ca)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_midnight.png', isActive: false, orderIndex: 7, pageScope: 'all' },
  { id: 'w8', portal: 'web', title: 'Student Discount', description: 'Verify your ID and get 15% off forever.', buttonText: 'Verify ID', link: '/profile', bgColor: 'linear-gradient(135deg, #eab308, #a16207)', fontColor: '#ffffff', btnColor: 'rgba(0,0,0,0.2)', imageUrl: '/slider_background_image/food_butter_chicken.png', isActive: true, orderIndex: 8, pageScope: 'all' },
  { id: 'w9', portal: 'web', title: 'Loyalty Points', description: 'Earn double points on all orders this month.', buttonText: 'View Points', link: '/rewards', bgColor: 'linear-gradient(135deg, #a855f7, #7e22ce)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_buy5.png', isActive: true, orderIndex: 9, pageScope: 'home' },
  { id: 'w10', portal: 'web', title: 'Corporate Lunch', description: 'Bulk ordering made easy for your entire office.', buttonText: 'Contact Us', link: '/contact', bgColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_tiffin.png', isActive: true, orderIndex: 10, pageScope: 'all' },

  // PARTNER PORTAL (10)
  { id: 'p1', portal: 'partner', title: 'New Partner Perks', description: 'Check out the new rewards program for top performing partners.', buttonText: 'View Perks', link: '/rewards', bgColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_partner.png', isActive: true, orderIndex: 1, pageScope: 'all' },
  { id: 'p2', portal: 'partner', title: 'Grow Your Kitchen', description: 'Tips and tricks to increase your daily order volume.', buttonText: 'Read Guide', link: '/guide', bgColor: 'linear-gradient(135deg, #10b981, #059669)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_tiffin.png', isActive: true, orderIndex: 2, pageScope: 'home' },
  { id: 'p3', portal: 'partner', title: 'Lower Commissions', description: 'Reach Platinum tier to unlock 0% commission on weekends.', buttonText: 'View Tiers', link: '/tiers', bgColor: 'linear-gradient(135deg, #f59e0b, #b45309)', fontColor: '#ffffff', btnColor: 'rgba(0,0,0,0.2)', imageUrl: '/slider_background_image/ai_partner.png', isActive: true, orderIndex: 3, pageScope: 'all' },
  { id: 'p4', portal: 'partner', title: 'Packaging Supplies', description: 'Order branded packaging at wholesale rates directly from us.', buttonText: 'Shop Now', link: '/shop', bgColor: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_tiffin.png', isActive: true, orderIndex: 4, pageScope: 'home' },
  { id: 'p5', portal: 'partner', title: 'Refer a Kitchen', description: 'Refer another restaurant and earn a ₹5000 bonus.', buttonText: 'Refer Now', link: '/refer', bgColor: 'linear-gradient(135deg, #ec4899, #be185d)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_partner.png', isActive: true, orderIndex: 5, pageScope: 'all' },
  { id: 'p6', portal: 'partner', title: 'Holiday Schedule', description: 'Set your kitchen availability for the upcoming festive season.', buttonText: 'Set Schedule', link: '/calendar', bgColor: 'linear-gradient(135deg, #14b8a6, #0f766e)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_winter.png', isActive: true, orderIndex: 6, pageScope: 'all' },
  { id: 'p7', portal: 'partner', title: 'Menu Optimization', description: 'Let our AI analyze your menu for better conversion rates.', buttonText: 'Analyze Menu', link: '/ai', bgColor: 'linear-gradient(135deg, #6366f1, #4338ca)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/food_paneer_tikka.png', isActive: false, orderIndex: 7, pageScope: 'all' },
  { id: 'p8', portal: 'partner', title: 'Fast Payouts', description: 'Enable Next-Day payouts for better cash flow.', buttonText: 'Enable', link: '/finance', bgColor: 'linear-gradient(135deg, #84cc16, #4d7c0f)', fontColor: '#ffffff', btnColor: 'rgba(0,0,0,0.2)', imageUrl: '/slider_background_image/ai_partner.png', isActive: true, orderIndex: 8, pageScope: 'home' },
  { id: 'p9', portal: 'partner', title: 'Customer Feedback', description: 'You received 50 new positive reviews this week!', buttonText: 'Read Reviews', link: '/reviews', bgColor: 'linear-gradient(135deg, #eab308, #a16207)', fontColor: '#ffffff', btnColor: 'rgba(0,0,0,0.2)', imageUrl: '/slider_background_image/food_chocolate_brownie.png', isActive: true, orderIndex: 9, pageScope: 'all' },
  { id: 'p10', portal: 'partner', title: 'Partner Meetup', description: 'Join us for the annual top partners summit in Mumbai.', buttonText: 'Register', link: '/events', bgColor: 'linear-gradient(135deg, #f43f5e, #be123c)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/food_cold_coffee.png', isActive: true, orderIndex: 10, pageScope: 'home' },

  // RIDER PORTAL (10)
  { id: 'r1', portal: 'rider', title: 'Bonus Deliveries', description: 'Complete 10 deliveries this weekend and earn a ₹500 bonus.', buttonText: 'Opt In', link: '/bonus', bgColor: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_rider.png', isActive: true, orderIndex: 1, pageScope: 'all' },
  { id: 'r2', portal: 'rider', title: 'Rain Surge', description: 'Heavy rain expected. Earn 2x surge pricing on all orders.', buttonText: 'Go Online', link: '/dashboard', bgColor: 'linear-gradient(135deg, #0ea5e9, #0369a1)', fontColor: '#ffffff', btnColor: 'rgba(0,0,0,0.2)', imageUrl: '/slider_background_image/ai_rider.png', isActive: true, orderIndex: 2, pageScope: 'home' },
  { id: 'r3', portal: 'rider', title: 'Refer a Friend', description: 'Bring a friend to the fleet and earn ₹1000 after their 10th trip.', buttonText: 'Get Code', link: '/refer', bgColor: 'linear-gradient(135deg, #f59e0b, #b45309)', fontColor: '#ffffff', btnColor: 'rgba(0,0,0,0.2)', imageUrl: '/slider_background_image/ai_rider.png', isActive: true, orderIndex: 3, pageScope: 'all' },
  { id: 'r4', portal: 'rider', title: 'Free Health Check', description: 'Annual free health checkup for all Gold tier riders.', buttonText: 'Book Slot', link: '/health', bgColor: 'linear-gradient(135deg, #10b981, #059669)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_healthy.png', isActive: true, orderIndex: 4, pageScope: 'home' },
  { id: 'r5', portal: 'rider', title: 'New Zone Open', description: 'We are now delivering in South City! Huge demand expected.', buttonText: 'View Map', link: '/map', bgColor: 'linear-gradient(135deg, #DC2626, #b91c1c)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_rider.png', isActive: true, orderIndex: 5, pageScope: 'all' },
  { id: 'r6', portal: 'rider', title: 'EV Subsidy', description: 'Switch to an Electric Vehicle and get a ₹10,000 subsidy.', buttonText: 'Apply Now', link: '/ev', bgColor: 'linear-gradient(135deg, #14b8a6, #0f766e)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_rider.png', isActive: true, orderIndex: 6, pageScope: 'all' },
  { id: 'r7', portal: 'rider', title: 'Safety Training', description: 'Complete the new safety module to unlock priority orders.', buttonText: 'Start Training', link: '/training', bgColor: 'linear-gradient(135deg, #6366f1, #4338ca)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_rider.png', isActive: true, orderIndex: 7, pageScope: 'home' },
  { id: 'r8', portal: 'rider', title: 'Top Rider', description: 'Congrats to Rahul for completing 500 trips with 5-star ratings!', buttonText: 'View Leaderboard', link: '/leaderboard', bgColor: 'linear-gradient(135deg, #eab308, #a16207)', fontColor: '#ffffff', btnColor: 'rgba(0,0,0,0.2)', imageUrl: '/slider_background_image/ai_rider.png', isActive: true, orderIndex: 8, pageScope: 'all' },
  { id: 'r9', portal: 'rider', title: 'Discount on Spares', description: 'Show your Rider ID at partner garages for 20% off.', buttonText: 'Find Garage', link: '/perks', bgColor: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_rider.png', isActive: false, orderIndex: 9, pageScope: 'home' },
  { id: 'r10', portal: 'rider', title: 'Instant Cashout', description: 'Need cash fast? You can now withdraw earnings 3x a day.', buttonText: 'Withdraw', link: '/wallet', bgColor: 'linear-gradient(135deg, #10b981, #059669)', fontColor: '#ffffff', btnColor: 'rgba(255,255,255,0.2)', imageUrl: '/slider_background_image/ai_rider.png', isActive: true, orderIndex: 10, pageScope: 'all' }
];

export default function SlidersAdmin() {
  const [activePortal, setActivePortal] = useState('web');
  const [allSliders, setAllSliders] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const confirmDialog = useConfirm();

  useEffect(() => {
    loadSliders();
  }, []);

  const loadSliders = async () => {
    setIsLoading(true);
    try {
      // Simulate network delay to bypass backend for demo purposes
      await new Promise(resolve => setTimeout(resolve, 500));
      setAllSliders(DUMMY_SLIDERS);
      
      /* --- REAL API DISABLED FOR DEMO ---
      const res = await fetch(`/api/sliders`, { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.text().then(t => JSON.parse(t));
      const fetchedSliders = Array.isArray(data) ? data : [];
      setAllSliders(fetchedSliders.length > 0 ? fetchedSliders : DUMMY_SLIDERS);
      */
    } catch (err) {
      // Fallback on API failure
      setAllSliders(DUMMY_SLIDERS);
    } finally {
      setIsLoading(false);
    }
  };

  const sliderItems = allSliders.filter(s => s.portal === activePortal).sort((a, b) => a.orderIndex - b.orderIndex);

  const handleAddNew = () => {
    setEditingItem({
      id: `new_${Date.now()}`,
      title: 'New Promotional Offer',
      description: 'Highlight your latest promotion, feature, or announcement here with a compelling message.',
      buttonText: 'Learn More',
      link: '/',
      bgColor: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
      fontColor: '#ffffff',
      btnColor: 'rgba(255, 255, 255, 0.2)',
      imageUrl: '',
      isActive: true,
      orderIndex: sliderItems.length,
      pageScope: 'all'
    });
    setIsEditing(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isNew = editingItem.id.startsWith('new_');
      const payload = { ...editingItem, portal: activePortal };
      if (isNew) {
        delete payload.id;
      }

      const res = await fetch(isNew ? '/api/sliders' : `/api/sliders/${editingItem.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save slider');
      await loadSliders();
      toast.success(isNew ? 'Slider created' : 'Slider updated');
      setIsEditing(false);
      setEditingItem(null);
    } catch (err) {
      // Mock save
      const isNew = editingItem.id.startsWith('new_');
      if (isNew) {
        setAllSliders(prev => [...prev, { ...editingItem, portal: activePortal }]);
      } else {
        setAllSliders(prev => prev.map(s => s.id === editingItem.id ? { ...editingItem, portal: activePortal } : s));
      }
      toast.success(`(Mocked) Slider ${isNew ? 'created' : 'updated'}`);
      setIsEditing(false);
      setEditingItem(null);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDialog({ title: 'Delete Slider', message: 'Are you sure you want to delete this slider card?', variant: 'danger' });
    if (ok) {
      try {
        const res = await fetch(`/api/sliders/${id}`, { method: 'DELETE', headers: authHeaders() });
        if (!res.ok) throw new Error('Failed to delete slider');
        toast.success('Slider deleted');
        await loadSliders();
      } catch (err) {
        // Mock delete
        setAllSliders(prev => prev.filter(s => s.id !== id));
        toast.success('(Mocked) Slider deleted');
      }
    }
  };

  const toggleActive = async (item: any) => {
    try {
      const res = await fetch(`/api/sliders/${item.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ ...item, isActive: !item.isActive })
      });
      if (!res.ok) throw new Error();
      await loadSliders();
    } catch (err) {
      // Mock toggle
      setAllSliders(prev => prev.map(s => s.id === item.id ? { ...s, isActive: !s.isActive } : s));
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Dynamic Sliders</h1>
            <p className={styles.pageSubtitle}>Curate and design premium promotional cards across all your platform portals.</p>
          </div>
          {!isEditing && (
            <button onClick={handleAddNew} className={styles.createBtn}>
              <Plus size={20} strokeWidth={3} />
              Create New Card
            </button>
          )}
        </div>

        {/* Portals Navigation */}
        {!isEditing && (
          <div className={styles.portalTabs}>
            {[
              { id: 'web', icon: Monitor, label: 'Web Portal' }, 
              { id: 'partner', icon: Smartphone, label: 'Partner App' }, 
              { id: 'rider', icon: Bike, label: 'Rider App' }
            ].map(portal => (
              <button
                key={portal.id}
                onClick={() => setActivePortal(portal.id)}
                className={`${styles.tabBtn} ${activePortal === portal.id ? styles.active : styles.inactive}`}
              >
                <portal.icon size={18} />
                {portal.label}
              </button>
            ))}
          </div>
        )}

        {isEditing ? (
          <div className={styles.editorLayout}>
            {/* Editor Form */}
            <form onSubmit={handleSaveItem} className={styles.editorForm}>
              <div className={styles.editorFormHeader}>
                <h2 className={styles.editorFormTitle}>
                  {editingItem.id.startsWith('new_') ? 'Craft New Card' : 'Refine Design'}
                </h2>
                <p style={{ color: '#64748b', marginTop: '0.5rem', marginBottom: 0 }}>Adjust content, colors, and layouts to perfect your promotional card.</p>
              </div>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Headline</label>
                  <input required value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Button Label</label>
                  <input required value={editingItem.buttonText} onChange={e => setEditingItem({...editingItem, buttonText: e.target.value})} className={styles.formInput} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Engaging Description</label>
                <textarea required value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} rows={3} className={styles.formTextarea} style={{ resize: 'none' }} />
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}><LinkIcon size={16} /> Destination URL</label>
                  <input required value={editingItem.link} onChange={e => setEditingItem({...editingItem, link: e.target.value})} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}><ImageIcon size={16} /> Background Image (Optional)</label>
                  <input value={editingItem.imageUrl || ''} onChange={e => setEditingItem({...editingItem, imageUrl: e.target.value})} placeholder="https://..." className={styles.formInput} />
                </div>
              </div>

              <div className={styles.formGrid3}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Background Color/Gradient</label>
                  <input required value={editingItem.bgColor} onChange={e => setEditingItem({...editingItem, bgColor: e.target.value})} placeholder="e.g. #3b82f6 or linear-gradient(...)" className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Text Color</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="color" value={editingItem.fontColor.startsWith('#') ? editingItem.fontColor.slice(0, 7) : '#ffffff'} onChange={e => setEditingItem({...editingItem, fontColor: e.target.value})} style={{ width: '48px', height: '48px', padding: 0, border: 'none', borderRadius: '12px', cursor: 'pointer' }} />
                    <input required value={editingItem.fontColor} onChange={e => setEditingItem({...editingItem, fontColor: e.target.value})} className={styles.formInput} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Button Color</label>
                  <input required value={editingItem.btnColor} onChange={e => setEditingItem({...editingItem, btnColor: e.target.value})} placeholder="e.g. rgba(0,0,0,0.2)" className={styles.formInput} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', padding: '1rem 0', flexWrap: 'wrap', gap: '1rem' }}>
                <label className={styles.statusToggle}>
                  <div className={`${styles.toggleSwitch} ${editingItem.isActive ? styles.active : styles.inactive}`}>
                    <div className={`${styles.toggleKnob} ${editingItem.isActive ? styles.active : styles.inactive}`} />
                    <input type="checkbox" checked={editingItem.isActive} onChange={e => setEditingItem({...editingItem, isActive: e.target.checked})} style={{ opacity: 0, width: 0, height: 0 }} />
                  </div>
                  <span className={`${styles.statusText} ${editingItem.isActive ? styles.active : styles.inactive}`}>
                    {editingItem.isActive ? 'Status: Active & Visible' : 'Status: Hidden'}
                  </span>
                </label>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Page Scope:</span>
                  <select 
                    value={editingItem.pageScope || 'all'}
                    onChange={(e) => setEditingItem({...editingItem, pageScope: e.target.value})}
                    className={styles.formSelect}
                    style={{ width: 'auto' }}
                  >
                    <option value="all">All Pages</option>
                    <option value="home">Home Page Only</option>
                    <option value="menu">Menu Page Only</option>
                    <option value="tiffin">Tiffin Page Only</option>
                    <option value="dining">Dining Page Only</option>
                  </select>

                  <span style={{ fontWeight: 600, color: '#334155', marginLeft: '0.5rem' }}>Order:</span>
                  <input type="number" value={editingItem.orderIndex} onChange={e => setEditingItem({...editingItem, orderIndex: parseInt(e.target.value) || 0})} className={styles.formInput} style={{ width: '80px', textAlign: 'center' }} />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={() => setIsEditing(false)} className={styles.discardBtn}>
                  <X size={20} /> Discard
                </button>
                <button type="submit" className={styles.saveBtn}>
                  <Save size={20} /> Save Card Design
                </button>
              </div>
            </form>

            {/* Live Preview Pane */}
            <div className={styles.previewPane}>
              <h3 className={styles.previewHeader}>
                <Monitor size={16} /> Live Frontend Preview
              </h3>
              
              <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className={styles.previewCard} style={{ background: editingItem.bgColor }}>
                  {editingItem.imageUrl && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundImage: `url(${editingItem.imageUrl})`, backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                      opacity: 0.5, zIndex: 0, mixBlendMode: 'overlay'
                    }} />
                  )}

                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div>
                      <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 1rem 0', lineHeight: 1.1, letterSpacing: '-0.03em', color: editingItem.fontColor || '#ffffff' }}>
                        {editingItem.title || 'Exceptional Quality'}
                      </h3>
                      <p style={{ fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 500, margin: 0, color: editingItem.fontColor || '#ffffff', opacity: 0.9 }}>
                        {editingItem.description || 'Description text that engages users and drives clicks.'}
                      </p>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '3rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '100%', padding: '1.25rem', borderRadius: '16px', fontWeight: 700, fontSize: '1.1rem',
                        background: editingItem.btnColor, color: editingItem.fontColor,
                        backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)',
                        boxSizing: 'border-box'
                      }}>
                        {editingItem.buttonText || 'Discover Now'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className={styles.slidersGrid}>
            {isLoading && sliderItems.length === 0 ? (
              <div className={styles.emptyStateContainer} style={{ fontSize: '1.25rem', fontWeight: 600, color: '#94a3b8' }}>Loading stunning designs...</div>
            ) : sliderItems.length === 0 ? (
              <div className={styles.emptyStateContainer}>
                <ImageIcon size={48} color="#cbd5e1" />
                <h3 style={{ color: '#0f172a', margin: 0, fontSize: '1.5rem' }}>No Cards Yet</h3>
                <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem', maxWidth: '400px' }}>Your {activePortal} portal is looking a bit empty. Create a beautiful promotional card to engage your users.</p>
                <button onClick={handleAddNew} style={{ marginTop: '1rem', background: '#0f172a', color: 'white', border: 'none', padding: '0.875rem 2rem', borderRadius: '999px', fontWeight: 700, cursor: 'pointer' }}>Create First Card</button>
              </div>
            ) : (
              sliderItems.map((item) => (
                <div key={item.id} className={`${styles.sliderCard} ${item.isActive ? styles.active : styles.inactive}`}>
                  {/* Miniature Visual */}
                  <div className={styles.miniatureVisual} style={{ background: item.bgColor }}>
                    {item.imageUrl && (
                       <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url(${item.imageUrl})`, backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', opacity: 0.4, mixBlendMode: 'overlay' }} />
                    )}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <h3 style={{ color: item.fontColor || 'white', margin: 0, fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em' }}>{item.title}</h3>
                      <p style={{ color: item.fontColor || 'white', margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</p>
                    </div>
                  </div>
                  
                  {/* Card Controls */}
                  <div className={styles.cardControls}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className={styles.orderBadge}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order</span>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{item.orderIndex}</span>
                      </div>
                      
                      <button 
                        onClick={() => toggleActive(item)}
                        className={`${styles.visibilityToggle} ${item.isActive ? styles.active : styles.inactive}`}
                      >
                        {item.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                        {item.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button 
                        onClick={() => { setEditingItem(item); setIsEditing(true); }}
                        className={styles.editBtn}
                      >
                        <Edit3 size={18} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className={styles.delBtn}
                        title="Delete Card"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
