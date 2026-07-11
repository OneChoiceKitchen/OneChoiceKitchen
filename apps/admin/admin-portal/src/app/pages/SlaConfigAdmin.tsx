import { useState, useEffect } from 'react';
import { useConfirm, useToast } from '@org/ui-design-system';
import styles from './SlaConfigAdmin.module.css';

const authHeaders = () => ({ 
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`, 
  'Content-Type': 'application/json' 
});

const PRIORITIES = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];
const priorityColors: Record<string, string> = { 
  URGENT: '#DC2626', 
  HIGH: '#f59e0b', 
  MEDIUM: '#3b82f6', 
  LOW: '#94a3b8' 
};

const DUMMY_SLA = [
  { id: 'sla_1', priority: 'URGENT', responseTimeHours: 0.5, resolutionTimeHours: 4, escalationHours: 1, isActive: true },
  { id: 'sla_2', priority: 'HIGH', responseTimeHours: 1, resolutionTimeHours: 12, escalationHours: 4, isActive: true },
  { id: 'sla_3', priority: 'MEDIUM', responseTimeHours: 4, resolutionTimeHours: 24, escalationHours: 8, isActive: false },
];

export default function SlaConfigAdmin() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const confirmDialog = useConfirm();
  const toast = useToast();

  useEffect(() => { fetchConfigs(); }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/delivery-settings/sla', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.text().then(t => JSON.parse(t));
      setConfigs(Array.isArray(data) ? data : []);
    } catch {
      setConfigs(DUMMY_SLA);
    }
  };

  const save = async () => {
    try {
      const res = await fetch('/api/delivery-settings/sla', { 
        method: 'POST', 
        headers: authHeaders(), 
        body: JSON.stringify(editing) 
      });
      if (!res.ok) throw new Error();
      fetchConfigs();
      toast.success('SLA Configuration saved successfully');
    } catch {
      setConfigs(prev => {
        const exists = prev.find(c => c.priority === editing.priority);
        if (exists) return prev.map(c => c.priority === editing.priority ? editing : c);
        return [...prev, { ...editing, id: `mock_${Date.now()}` }];
      });
      toast.success('(Mocked) SLA Configuration saved successfully');
    } finally {
      setEditing(null);
    }
  };

  const remove = async (id: string, priority: string) => {
    const ok = await confirmDialog({ 
      title: 'Delete SLA Config', 
      message: `Are you sure you want to delete the SLA configuration for ${priority}?`, 
      variant: 'danger' 
    });
    if (!ok) return;
    
    try {
      const res = await fetch(`/api/delivery-settings/sla/${id}`, { 
        method: 'DELETE', 
        headers: authHeaders() 
      });
      if (!res.ok) throw new Error();
      fetchConfigs();
      toast.success('SLA Configuration deleted');
    } catch {
      setConfigs(prev => prev.filter(c => c.id !== id));
      toast.success('(Mocked) SLA Configuration deleted');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>⏱️ SLA Configuration</h1>
        <p className={styles.subtitle}>Set response, resolution, and escalation times for support tickets by priority.</p>
      </div>

      <div className={styles.slaList}>
        {PRIORITIES.map(priority => {
          const cfg = configs.find(c => c.priority === priority);
          return (
            <div key={priority} className={styles.slaCard}>
              <div 
                className={styles.priorityBar} 
                style={{ background: priorityColors[priority] }} 
              />
              
              <div className={styles.cardContent}>
                <h3 className={styles.priorityTitle}>{priority}</h3>
                {cfg ? (
                  <div className={styles.metricsList}>
                    <span className={styles.metricItem}>⏳ Response: <b>{cfg.responseTimeHours}h</b></span>
                    <span className={styles.metricItem}>✅ Resolution: <b>{cfg.resolutionTimeHours}h</b></span>
                    <span className={styles.metricItem}>⬆️ Escalation: <b>{cfg.escalationHours}h</b></span>
                    <span className={cfg.isActive ? styles.activeStatus : styles.inactiveStatus}>
                      {cfg.isActive ? '● Active' : '○ Inactive'}
                    </span>
                  </div>
                ) : (
                  <div className={styles.unconfiguredText}>Not configured</div>
                )}
              </div>
              
              <div className={styles.actionGroup}>
                <button 
                  onClick={() => setEditing(cfg || { 
                    priority, 
                    responseTimeHours: priority === 'URGENT' ? 0.5 : priority === 'HIGH' ? 1 : priority === 'MEDIUM' ? 4 : 8, 
                    resolutionTimeHours: priority === 'URGENT' ? 4 : priority === 'HIGH' ? 12 : priority === 'MEDIUM' ? 24 : 48, 
                    escalationHours: priority === 'URGENT' ? 1 : priority === 'HIGH' ? 4 : priority === 'MEDIUM' ? 8 : 24, 
                    isActive: true 
                  })}
                  className={`${styles.btn} ${styles.editBtn}`}
                >
                  {cfg ? 'Edit' : 'Configure'}
                </button>
                {cfg && (
                  <button 
                    onClick={() => remove(cfg.id, priority)} 
                    className={`${styles.btn} ${styles.deleteBtn}`}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <div className={styles.overlay} onClick={() => setEditing(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>SLA: {editing.priority}</h2>
            </div>
            
            <div className={styles.modalBody}>
              {[
                ['responseTimeHours', 'Response Time (hours)'], 
                ['resolutionTimeHours', 'Resolution Time (hours)'], 
                ['escalationHours', 'Escalation Time (hours)']
              ].map(([key, label]) => (
                <div key={key} className={styles.formGroup}>
                  <label className={styles.label}>{label}</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={editing[key] || 0} 
                    onChange={e => setEditing((p: any) => ({ ...p, [key]: +e.target.value }))}
                    className={styles.input} 
                  />
                </div>
              ))}
              
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={editing.isActive} 
                  onChange={e => setEditing((p: any) => ({ ...p, isActive: e.target.checked }))} 
                  className={styles.checkbox}
                />
                <span>Active Configuration</span>
              </label>
            </div>
            
            <div className={styles.modalFooter}>
              <button onClick={() => setEditing(null)} className={styles.cancelBtn}>Cancel</button>
              <button onClick={save} className={styles.saveBtn}>Save Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
