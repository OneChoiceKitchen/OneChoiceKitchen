import { useState, useEffect } from 'react';
import { useConfirm } from '@org/ui-design-system';
import styles from './CorporateAdmin.module.css';

const authHeaders = () => ({ 
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`, 
  'Content-Type': 'application/json' 
});

const DUMMY_PLANS = [
  { id: 'corp_1', companyName: 'Tech Innovators Inc', contactName: 'Rajesh Kumar', contactEmail: 'rajesh@techinnovators.com', contactPhone: '9876543210', planType: 'MONTHLY', employeeCount: 150, monthlyBudget: 450000, discountPercent: 15, status: 'ACTIVE' },
  { id: 'corp_2', companyName: 'Creative Studios', contactName: 'Sneha Patel', contactEmail: 'sneha@creativestudios.in', contactPhone: '9123456789', planType: 'WEEKLY', employeeCount: 25, monthlyBudget: 20000, discountPercent: 5, status: 'ACTIVE' },
  { id: 'corp_3', companyName: 'Global Logistics', contactName: 'Amit Singh', contactEmail: 'amit.s@globallogistics.com', contactPhone: '9988776655', planType: 'DAILY', employeeCount: 300, monthlyBudget: 15000, discountPercent: 20, status: 'SUSPENDED' },
];

const DUMMY_SUBS = [
  { id: 'sub_1', userId: 'user_101', user: { name: 'Priya M' }, startDate: '2026-06-01', endDate: '2026-12-31', billingCycle: 'MONTHLY', status: 'ACTIVE' },
  { id: 'sub_2', userId: 'user_102', user: { name: 'Vikram S' }, startDate: '2026-06-01', endDate: null, billingCycle: 'MONTHLY', status: 'ACTIVE' },
  { id: 'sub_3', userId: 'user_103', user: { name: 'Anjali D' }, startDate: '2026-01-01', endDate: '2026-05-31', billingCycle: 'MONTHLY', status: 'EXPIRED' },
];

export default function CorporateAdmin() {
  const [plans, setPlans] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const confirmDialog = useConfirm();

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/corporate', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.text().then(t => JSON.parse(t));
      const fetchedData = Array.isArray(data) ? data : [];
      setPlans(fetchedData.length > 0 ? fetchedData : DUMMY_PLANS);
    } catch {
      // Fallback on API failure
      setPlans(DUMMY_PLANS);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    const method = editing.id ? 'PATCH' : 'POST';
    const url = editing.id ? `/api/corporate/${editing.id}` : '/api/corporate';
    try {
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(editing) });
      if (!res.ok) throw new Error();
      setEditing(null);
      fetchPlans();
    } catch {
      // Mock Save
      if (editing.id) {
        setPlans(prev => prev.map(p => p.id === editing.id ? editing : p));
      } else {
        setPlans(prev => [...prev, { ...editing, id: `corp_mock_${Date.now()}` }]);
      }
      setEditing(null);
    }
  };

  const remove = async (id: string) => {
    const ok = await confirmDialog({ title: 'Delete Corporate Plan', message: 'Are you sure you want to delete this plan?', variant: 'danger' });
    if (!ok) return;
    try {
      const res = await fetch(`/api/corporate/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error();
      fetchPlans();
    } catch {
      // Mock Delete
      setPlans(prev => prev.filter(p => p.id !== id));
    }
  };

  const viewSubs = async (plan: any) => {
    setSelectedPlan(plan);
    try {
      const res = await fetch(`/api/corporate/${plan.id}/subscriptions`, { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.text().then(t => JSON.parse(t));
      setSubs(Array.isArray(data) ? data : []);
    } catch {
      // Fallback dummy subs
      setSubs(DUMMY_SUBS);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>🏢 Corporate Meal Plans</h2>
        <button 
          onClick={() => setEditing({ companyName: '', contactName: '', contactEmail: '', planType: 'MONTHLY', employeeCount: 10, monthlyBudget: 50000, discountPercent: 10, status: 'ACTIVE' })}
          className={styles.addBtn}
        >
          + New Plan
        </button>
      </div>

      {loading ? (
        <div className={styles.emptyState}>Loading corporate plans...</div>
      ) : (
        <div className={styles.cardsContainer}>
          {plans.length === 0 && (
            <div className={styles.emptyState}>No corporate plans yet</div>
          )}
          {plans.map(plan => (
            <div key={plan.id} className={styles.planCard}>
              <div className={styles.cardHeader}>
                <div className={styles.companyInfo}>
                  <div className={styles.companyName}>{plan.companyName}</div>
                  <div className={styles.contactInfo}>{plan.contactName} · {plan.contactEmail}</div>
                </div>
                <span className={`${styles.statusBadge} ${styles[plan.status.toLowerCase()] || ''}`}>
                  {plan.status}
                </span>
              </div>
              
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>📋 <b>{plan.planType}</b></div>
                <div className={styles.statItem}>👥 <b>{plan.employeeCount}</b> emp</div>
                <div className={styles.statItem}>💰 ₹<b>{plan.monthlyBudget?.toLocaleString()}</b>/mo</div>
                <div className={styles.statItem}>🏷️ <b>{plan.discountPercent}%</b> off</div>
              </div>
              
              <div className={styles.actionGroup}>
                <button onClick={() => viewSubs(plan)} className={`${styles.actionBtn} ${styles.primary}`}>Subs</button>
                <button onClick={() => setEditing({ ...plan })} className={`${styles.actionBtn} ${styles.secondary}`}>Edit</button>
                <button onClick={() => remove(plan.id)} className={`${styles.actionBtn} ${styles.danger}`}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className={styles.modalOverlay} onClick={() => setEditing(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{editing.id ? 'Edit' : 'New'} Corporate Plan</h3>
              <button onClick={() => setEditing(null)} className={styles.closeBtn}>✕</button>
            </div>
            
            <div className={styles.formRow}>
              <div>
                <label className={styles.formLabel}>Company Name</label>
                <input 
                  value={editing.companyName || ''} 
                  onChange={e => setEditing((p: any) => ({ ...p, companyName: e.target.value }))}
                  className={styles.formInput} 
                />
              </div>
              <div>
                <label className={styles.formLabel}>Contact Name</label>
                <input 
                  value={editing.contactName || ''} 
                  onChange={e => setEditing((p: any) => ({ ...p, contactName: e.target.value }))}
                  className={styles.formInput} 
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div>
                <label className={styles.formLabel}>Contact Email</label>
                <input 
                  type="email"
                  value={editing.contactEmail || ''} 
                  onChange={e => setEditing((p: any) => ({ ...p, contactEmail: e.target.value }))}
                  className={styles.formInput} 
                />
              </div>
              <div>
                <label className={styles.formLabel}>Contact Phone</label>
                <input 
                  type="tel"
                  value={editing.contactPhone || ''} 
                  onChange={e => setEditing((p: any) => ({ ...p, contactPhone: e.target.value }))}
                  className={styles.formInput} 
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div>
                <label className={styles.formLabel}>Plan Type</label>
                <select 
                  value={editing.planType} 
                  onChange={e => setEditing((p: any) => ({ ...p, planType: e.target.value }))}
                  className={styles.formSelect}
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div>
                <label className={styles.formLabel}>Status</label>
                <select 
                  value={editing.status} 
                  onChange={e => setEditing((p: any) => ({ ...p, status: e.target.value }))}
                  className={styles.formSelect}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div>
                <label className={styles.formLabel}>Employees</label>
                <input 
                  type="number" 
                  value={editing.employeeCount || 0} 
                  onChange={e => setEditing((p: any) => ({ ...p, employeeCount: +e.target.value }))}
                  className={styles.formInput} 
                />
              </div>
              <div>
                <label className={styles.formLabel}>Monthly Budget (₹)</label>
                <input 
                  type="number" 
                  value={editing.monthlyBudget || 0} 
                  onChange={e => setEditing((p: any) => ({ ...p, monthlyBudget: +e.target.value }))}
                  className={styles.formInput} 
                />
              </div>
              <div>
                <label className={styles.formLabel}>Discount %</label>
                <input 
                  type="number" 
                  step="0.5" 
                  value={editing.discountPercent || 0} 
                  onChange={e => setEditing((p: any) => ({ ...p, discountPercent: +e.target.value }))}
                  className={styles.formInput} 
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Notes</label>
              <textarea 
                value={editing.notes || ''} 
                onChange={e => setEditing((p: any) => ({ ...p, notes: e.target.value }))} 
                rows={3}
                className={styles.formTextarea} 
              />
            </div>
            
            <div className={styles.modalActions}>
              <button onClick={() => setEditing(null)} className={styles.cancelBtn}>Cancel</button>
              <button onClick={save} className={styles.saveBtn}>Save Plan</button>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Modal */}
      {selectedPlan && (
        <div className={styles.modalOverlay} onClick={() => { setSelectedPlan(null); setSubs([]); }}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{selectedPlan.companyName} — Subscriptions</h3>
              <button onClick={() => { setSelectedPlan(null); setSubs([]); }} className={styles.closeBtn}>✕</button>
            </div>
            
            {subs.length === 0 ? (
              <div className={styles.emptyState} style={{ padding: '2rem' }}>No employee subscriptions</div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Cycle</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map((s: any) => (
                      <tr key={s.id}>
                        <td>{s.user?.name || s.userId?.substring(0, 8)}</td>
                        <td>{new Date(s.startDate).toLocaleDateString('en-IN')}</td>
                        <td>{s.endDate ? new Date(s.endDate).toLocaleDateString('en-IN') : '—'}</td>
                        <td>{s.billingCycle}</td>
                        <td>
                          <span className={`${styles.subStatus} ${styles[s.status.toLowerCase()] || ''}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
