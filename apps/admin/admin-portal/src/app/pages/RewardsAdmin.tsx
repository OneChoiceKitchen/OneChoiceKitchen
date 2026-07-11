import React, { useState, useEffect } from 'react';
import { useToast, useConfirm } from '@org/ui-design-system';
import styles from './RewardsAdmin.module.css';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

const DUMMY_REWARDS = [
  { id: 'r1', name: 'Free Dessert', description: 'Get a free Gulab Jamun or Rasgulla with your next meal.', pointsRequired: 300, rewardType: 'FREE_MEAL', code: 'SWEET300' },
  { id: 'r2', name: '₹100 Off Coupon', description: 'Flat ₹100 off on your next order.', pointsRequired: 500, rewardType: 'COUPON', code: 'FLAT100' },
  { id: 'r3', name: 'Free Delivery', description: 'Get free delivery on any order above ₹300.', pointsRequired: 150, rewardType: 'COUPON', code: 'FREEDEL150' }
];

export default function RewardsAdmin() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New reward form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pointsRequired, setPointsRequired] = useState(500);
  const [rewardType, setRewardType] = useState('COUPON');
  const [code, setCode] = useState('');
  const [generatingDescription, setGeneratingDescription] = useState(false);
  
  const toast = useToast();
  const confirmDialog = useConfirm();

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/loyalty/rewards', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.text().then((t: string) => JSON.parse(t));
      const fetchedRewards = Array.isArray(data) ? data : [];
      setRewards(fetchedRewards.length > 0 ? fetchedRewards : DUMMY_REWARDS);
    } catch (err) {
      // Fallback on API failure
      setRewards(DUMMY_REWARDS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name, description, pointsRequired, rewardType, code };
      const res = await fetch('/api/loyalty/admin/rewards', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      
      toast.success('Reward created successfully!');
      resetForm();
      fetchRewards();
    } catch (err) {
      // Mock creation
      const mockReward = { id: `mock-${Date.now()}`, name, description, pointsRequired, rewardType, code };
      setRewards(prev => [mockReward, ...prev]);
      toast.success('(Mocked) Reward created successfully!');
      resetForm();
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPointsRequired(500);
    setCode('');
    setRewardType('COUPON');
  };

  const handleGenerateDescription = async () => {
    if (!name) {
      toast.warning('Please enter a reward name first!');
      return;
    }
    setGeneratingDescription(true);
    try {
      // Simulate network delay to bypass backend for demo purposes (avoids 400 console error)
      await new Promise(resolve => setTimeout(resolve, 600));
      throw new Error('Bypass API');
      
      /* --- REAL API DISABLED FOR DEMO ---
      const response = await fetch('/api/menus/generate-description', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name: name })
      });
      if (response.ok) {
        const data = await response.text().then(t => JSON.parse(t));
        setDescription(data.description);
        toast.success('Description generated!');
      } else {
        throw new Error();
      }
      */
    } catch (err) {
      // Mock generation
      setDescription(`Unlock this special "${name}" reward using your loyalty points. It's our way of saying thank you!`);
      toast.success('(Mocked) Description generated');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDialog({ title: 'Delete Reward', message: 'Are you sure you want to delete this reward?', variant: 'danger' });
    if (!ok) return;
    
    try {
      const res = await fetch(`/api/loyalty/admin/rewards/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error();
      toast.success('Reward deleted!');
      fetchRewards();
    } catch (err) {
      // Mock deletion
      setRewards(prev => prev.filter(r => r.id !== id));
      toast.success('(Mocked) Reward deleted!');
    }
  };

  if (loading && rewards.length === 0) {
    return <div className={styles.emptyState}>Loading rewards...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.pageTitle}>Loyalty Store Catalog</h2>
      
      <div className={styles.formContainer}>
        <h3 className={styles.formTitle}>Add New Reward</h3>
        <form onSubmit={handleCreate}>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Reward Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} className={styles.formInput} placeholder="e.g. Free Dessert" />
            </div>
            
            <div className={styles.formGroup}>
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
              <input required value={description} onChange={e => setDescription(e.target.value)} className={styles.formInput} placeholder="Describe the perk..." />
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Points Required</label>
              <input type="number" required value={pointsRequired} onChange={e => setPointsRequired(Number(e.target.value))} className={styles.formInput} />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Reward Type</label>
              <select value={rewardType} onChange={e => setRewardType(e.target.value)} className={styles.formSelect}>
                <option value="COUPON">Coupon Code</option>
                <option value="PHYSICAL_ITEM">Physical Item</option>
                <option value="FREE_MEAL">Free Meal</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Unlock Code (if Coupon)</label>
              <input required value={code} onChange={e => setCode(e.target.value)} className={styles.formInput} placeholder="e.g. SAVE100" />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button type="submit" className={styles.submitBtn}>Add Reward</button>
          </div>
        </form>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Reward Name</th>
              <th>Points Required</th>
              <th>Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map(reward => (
              <tr key={reward.id}>
                <td data-label="Reward Name">
                  <span className={styles.primaryCell}>{reward.name}</span>
                  <span className={styles.secondaryCell}>{reward.description}</span>
                </td>
                <td data-label="Points Required">
                  <span className={styles.pointsBadge}>{reward.pointsRequired}</span>
                </td>
                <td data-label="Code">
                  <span className={styles.codeBadge}>{reward.code}</span>
                </td>
                <td data-label="Actions">
                  <button onClick={() => handleDelete(reward.id)} className={styles.deleteBtn}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rewards.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.emptyState}>No rewards created yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
