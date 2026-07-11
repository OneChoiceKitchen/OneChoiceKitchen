import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useToast, useConfirm } from '@org/ui-design-system';

export default function TiffinManagementAdmin() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any>({ name: '', description: '', monthlyPrice: 0, pricePerMeal: 0, totalMeals: 30, mealsPerDay: 1, dietType: 'VEG', isActive: true, isBestValue: false });
  const toast = useToast();
  const confirmDialog = useConfirm();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/tiffin/plans');
      if (res.data) setPlans(res.data);
    } catch (err) {
      console.error('Failed to fetch tiffin plans', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentPlan.id) {
        await axios.put(`/api/tiffin/plans/${currentPlan.id}`, currentPlan);
      } else {
        await axios.post('/api/tiffin/plans', currentPlan);
      }
      fetchPlans();
      setIsEditing(false);
      setCurrentPlan({ name: '', description: '', monthlyPrice: 0, pricePerMeal: 0, totalMeals: 30, mealsPerDay: 1, dietType: 'VEG', isActive: true, isBestValue: false });
    } catch (err) {
      console.error('Failed to save tiffin plan', err);
      toast.error('Failed to save tiffin plan');
    }
  };

  const handleEdit = (plan: any) => {
    setCurrentPlan(plan);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDialog({ title: 'Delete Tiffin Plan', message: 'Are you sure you want to delete this tiffin plan?', variant: 'danger' });
    if (!ok) return;
    try {
      await axios.delete(`/api/tiffin/plans/${id}`);
      fetchPlans();
    } catch (err) {
      console.error('Failed to delete', err);
      toast.error('Failed to delete tiffin plan');
    }
  };

  return (
    <div style={{ padding: '2rem', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem' }}>Tiffin Management</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <Plus size={18} /> Add Tiffin Plan
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1e293b' }}>{currentPlan.id ? 'Edit Plan' : 'New Plan'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <input required type="text" placeholder="Plan Name" value={currentPlan.name} onChange={e => setCurrentPlan({...currentPlan, name: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            <input required type="number" placeholder="Monthly Price (₹)" value={currentPlan.monthlyPrice || ''} onChange={e => setCurrentPlan({...currentPlan, monthlyPrice: Number(e.target.value)})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            <input required type="number" placeholder="Meals Per Day" value={currentPlan.mealsPerDay || ''} onChange={e => setCurrentPlan({...currentPlan, mealsPerDay: Number(e.target.value)})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            <select value={currentPlan.dietType} onChange={e => setCurrentPlan({...currentPlan, dietType: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <option value="VEG">VEG</option>
              <option value="NON_VEG">NON-VEG</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={currentPlan.isBestValue} onChange={e => setCurrentPlan({...currentPlan, isBestValue: e.target.checked})} />
              Mark as Best Value
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={currentPlan.isActive} onChange={e => setCurrentPlan({...currentPlan, isActive: e.target.checked})} />
              Active Plan
            </label>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save Plan</button>
            <button type="button" onClick={() => { setIsEditing(false); setCurrentPlan({ name: '', description: '', monthlyPrice: 0, pricePerMeal: 0, totalMeals: 30, mealsPerDay: 1, dietType: 'VEG', isActive: true, isBestValue: false }); }} style={{ padding: '10px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading tiffin plans...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {plans.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>No plans found. Add some to get started.</div>
          ) : (
            plans.map(plan => (
              <div key={plan.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                {plan.isBestValue && (
                  <div style={{ position: 'absolute', top: 0, right: 0, background: '#22c55e', color: 'white', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 'bold', borderBottomLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                    BEST VALUE
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#0f172a' }}>{plan.name}</h3>
                    <span style={{ background: plan.dietType === 'VEG' ? '#dcfce7' : '#fee2e2', color: plan.dietType === 'VEG' ? '#16a34a' : '#DC2626', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{plan.dietType}</span>
                  </div>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#64748b' }}>{plan.mealsPerDay} Meals / Day</p>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#2563EB' }}>₹{plan.monthlyPrice} / Month</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <button onClick={() => handleEdit(plan)} style={{ flex: 1, padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.9rem' }}><Edit3 size={16} /> Edit</button>
                  <button onClick={() => handleDelete(plan.id)} style={{ flex: 1, padding: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.9rem' }}><Trash2 size={16} /> Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
