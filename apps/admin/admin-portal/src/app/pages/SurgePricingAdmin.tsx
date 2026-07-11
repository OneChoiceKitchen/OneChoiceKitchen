import { useState, useEffect } from 'react';
import { useConfirm } from '@org/ui-design-system';
import styles from './SurgePricingAdmin.module.css';

const authHeaders = () => ({ 
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`, 
  'Content-Type': 'application/json' 
});

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DUMMY_RULES = [
  { id: 'sp_1', name: 'Weekend Dinner Rush', startTime: '19:00', endTime: '22:00', multiplier: 1.5, zone: 'Koramangala', isActive: true, daysOfWeek: '6,7' },
  { id: 'sp_2', name: 'Monsoon Heavy Rain', startTime: '00:00', endTime: '23:59', multiplier: 2.0, zone: 'All Regions', isActive: false, daysOfWeek: '1,2,3,4,5,6,7' },
  { id: 'sp_3', name: 'Weekday Lunch Hour', startTime: '12:30', endTime: '14:30', multiplier: 1.2, zone: 'HSR Layout', isActive: true, daysOfWeek: '1,2,3,4,5' },
];

export default function SurgePricingAdmin() {
  const [rules, setRules] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const confirmDialog = useConfirm();
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchRules(); }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/delivery-settings/surge-pricing', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.text().then(t => JSON.parse(t));
      const fetchedData = Array.isArray(data) ? data : [];
      setRules(fetchedData.length > 0 ? fetchedData : DUMMY_RULES);
    } catch {
      // Fallback on API failure
      setRules(DUMMY_RULES);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    const method = editing.id ? 'PATCH' : 'POST';
    const url = editing.id ? `/api/delivery-settings/surge-pricing/${editing.id}` : '/api/delivery-settings/surge-pricing';
    try {
      const res = await fetch(url, { 
        method, 
        headers: authHeaders(), 
        body: JSON.stringify(editing) 
      });
      if (!res.ok) throw new Error();
      setEditing(null);
      fetchRules();
    } catch {
      // Mock Save
      if (editing.id) {
        setRules(prev => prev.map(r => r.id === editing.id ? editing : r));
      } else {
        setRules(prev => [...prev, { ...editing, id: `sp_mock_${Date.now()}` }]);
      }
      setEditing(null);
    }
  };

  const remove = async (id: string) => {
    const ok = await confirmDialog({ 
      title: 'Delete Surge Rule', 
      message: 'Are you sure you want to delete this surge pricing rule?', 
      variant: 'danger' 
    });
    if (!ok) return;
    
    try {
      const res = await fetch(`/api/delivery-settings/surge-pricing/${id}`, { 
        method: 'DELETE', 
        headers: authHeaders() 
      });
      if (!res.ok) throw new Error();
      fetchRules();
    } catch {
      // Mock Delete
      setRules(prev => prev.filter(r => r.id !== id));
    }
  };

  const toggleDay = (day: number) => {
    const days = (editing.daysOfWeek || '').split(',').filter(Boolean).map(Number);
    const updated = days.includes(day) ? days.filter((d: number) => d !== day) : [...days, day];
    setEditing((p: any) => ({ ...p, daysOfWeek: updated.sort().join(',') }));
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>⚡ Surge Pricing Rules</h2>
        <button 
          onClick={() => setEditing({ name: '', startTime: '18:00', endTime: '21:00', multiplier: 1.5, zone: '', isActive: true, daysOfWeek: '1,2,3,4,5,6,7' })}
          className={styles.addBtn}
        >
          + Add Rule
        </button>
      </div>

      {loading ? (
        <div className={styles.emptyState}>Loading surge rules...</div>
      ) : (
        <div className={styles.cardsContainer}>
          {rules.length === 0 && (
            <div className={styles.emptyState}>No surge pricing rules. Add one to increase rates during peak hours.</div>
          )}
          {rules.map(rule => (
            <div key={rule.id} className={styles.ruleCard}>
              <div className={styles.cardInfo}>
                <div className={styles.cardHeader}>
                  <span className={styles.ruleName}>{rule.name}</span>
                  <span className={styles.multiplierBadge}>×{rule.multiplier}</span>
                  <span className={`${styles.statusBadge} ${rule.isActive ? styles.active : styles.inactive}`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className={styles.timeText}>
                  {rule.startTime} – {rule.endTime} {rule.zone ? `· ${rule.zone}` : ''}
                </div>
                <div className={styles.daysContainer}>
                  {DAYS.map((d, i) => {
                    const active = rule.daysOfWeek?.split(',').includes(String(i + 1));
                    return (
                      <span key={d} className={`${styles.dayPill} ${active ? styles.active : styles.inactive}`}>
                        {d}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className={styles.actionGroup}>
                <button onClick={() => setEditing({ ...rule })} className={`${styles.actionBtn} ${styles.edit}`}>Edit</button>
                <button onClick={() => remove(rule.id)} className={`${styles.actionBtn} ${styles.delete}`}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className={styles.modalOverlay} onClick={() => setEditing(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editing.id ? 'Edit' : 'Add'} Surge Rule</h3>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Rule Name</label>
              <input 
                value={editing.name || ''} 
                onChange={e => setEditing((p: any) => ({ ...p, name: e.target.value }))}
                className={styles.formInput} 
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Zone / City (optional)</label>
              <input 
                value={editing.zone || ''} 
                onChange={e => setEditing((p: any) => ({ ...p, zone: e.target.value }))}
                className={styles.formInput} 
              />
            </div>

            <div className={styles.formRow}>
              <div>
                <label className={styles.formLabel}>Start Time</label>
                <input 
                  type="time" 
                  value={editing.startTime || ''} 
                  onChange={e => setEditing((p: any) => ({ ...p, startTime: e.target.value }))}
                  className={styles.formInput} 
                />
              </div>
              <div>
                <label className={styles.formLabel}>End Time</label>
                <input 
                  type="time" 
                  value={editing.endTime || ''} 
                  onChange={e => setEditing((p: any) => ({ ...p, endTime: e.target.value }))}
                  className={styles.formInput} 
                />
              </div>
              <div>
                <label className={styles.formLabel}>Multiplier</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={editing.multiplier || ''} 
                  onChange={e => setEditing((p: any) => ({ ...p, multiplier: +e.target.value }))}
                  className={styles.formInput} 
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Active Days</label>
              <div className={styles.daysContainer}>
                {DAYS.map((d, i) => {
                  const active = (editing.daysOfWeek || '').split(',').includes(String(i + 1));
                  return (
                    <button 
                      key={d} 
                      type="button" 
                      onClick={() => toggleDay(i + 1)}
                      className={`${styles.dayBtn} ${active ? styles.active : styles.inactive}`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className={styles.toggleLabel}>
              <input 
                type="checkbox" 
                checked={editing.isActive} 
                onChange={e => setEditing((p: any) => ({ ...p, isActive: e.target.checked }))} 
                style={{ accentColor: '#0ea5e9', transform: 'scale(1.2)' }} 
              />
              Rule is Currently Active
            </label>

            <div className={styles.modalActions}>
              <button onClick={() => setEditing(null)} className={styles.cancelBtn}>Cancel</button>
              <button onClick={save} className={styles.saveBtn}>Save Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
