import { useState } from 'react';
import { Shield, AlertCircle, FileWarning, CheckCircle, Plus } from 'lucide-react';
import styles from './HRComplianceAdmin.module.css';
import HRModal from './HRModal';
import modalStyles from './HRModal.module.css';

const TABS = [
  { id: 'training', label: 'LMS & Training' },
  { id: 'disciplinary', label: 'Disciplinary Actions' },
  { id: 'health', label: 'Health & Visas' }
];

const INITIAL_TRAINING = [
  { id: 't1', name: 'Dave Wilson', role: 'Rider', module: 'Safe Riding v2', dueDate: '2026-07-15', status: 'pending' },
  { id: 't2', name: 'Alice Smith', role: 'Head Chef', module: 'Kitchen Hygiene 101', dueDate: '2026-06-01', status: 'completed' },
];

const INITIAL_DISCIPLINE = [
  { id: 'd1', name: 'Eve Davis', role: 'Rider', issue: 'Customer Complaint - Rude Behavior', date: '2026-07-05', action: 'Written Warning', status: 'active' },
  { id: 'd2', name: 'Charlie Brown', role: 'Packer', issue: 'Tardiness (3x)', date: '2026-06-20', action: 'Verbal Warning', status: 'completed' },
];

export default function HRComplianceAdmin() {
  const [activeTab, setActiveTab] = useState('training');
  
  const [training, setTraining] = useState(INITIAL_TRAINING);
  const [discipline, setDiscipline] = useState(INITIAL_DISCIPLINE);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({ name: '', role: '', module: '', dueDate: '', status: 'pending', issue: '', action: '', date: '' });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className={`${styles.badge} ${styles.completed}`}><CheckCircle size={14}/> Completed</span>;
      case 'pending': return <span className={`${styles.badge} ${styles.pending}`}><AlertCircle size={14}/> Pending</span>;
      case 'expired': return <span className={`${styles.badge} ${styles.expired}`}><FileWarning size={14}/> Expired</span>;
      case 'active': return <span className={`${styles.badge} ${styles.active}`}><AlertCircle size={14}/> Active Record</span>;
      default: return null;
    }
  };

  const handleAddRecord = () => {
    if (activeTab === 'training') {
      const entry = {
        id: `t_${Date.now()}`,
        name: newRecord.name,
        role: newRecord.role,
        module: newRecord.module,
        dueDate: newRecord.dueDate,
        status: newRecord.status
      };
      setTraining([entry, ...training]);
    } else if (activeTab === 'disciplinary') {
      const entry = {
        id: `d_${Date.now()}`,
        name: newRecord.name,
        role: newRecord.role,
        issue: newRecord.issue,
        date: newRecord.date,
        action: newRecord.action,
        status: newRecord.status === 'pending' ? 'active' : newRecord.status
      };
      setDiscipline([entry, ...discipline]);
    }
    setIsModalOpen(false);
    setNewRecord({ name: '', role: '', module: '', dueDate: '', status: 'pending', issue: '', action: '', date: '' });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Training & Disciplinary</h1>
          <p className={styles.pageSubtitle}>Manage mandatory training completion and log disciplinary actions.</p>
        </div>
        {activeTab !== 'health' && (
          <button className={styles.primaryButton} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            {activeTab === 'training' ? 'Assign Training' : 'Log Disciplinary Action'}
          </button>
        )}
      </div>

      <div className={styles.tabsContainer}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.panel}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              {activeTab === 'training' ? (
                <tr>
                  <th>Personnel</th>
                  <th>Training Module</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              ) : activeTab === 'disciplinary' ? (
                <tr>
                  <th>Personnel</th>
                  <th>Reported Issue</th>
                  <th>Date</th>
                  <th>Action Taken</th>
                  <th>Status</th>
                </tr>
              ) : (
                <tr>
                  <th colSpan={5}>Health & Visa tracking module under development.</th>
                </tr>
              )}
            </thead>
            <tbody>
              {activeTab === 'training' && training.map(record => (
                <tr key={record.id}>
                  <td>
                    <p className={styles.personName}>{record.name}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{record.role}</p>
                  </td>
                  <td>{record.module}</td>
                  <td>{record.dueDate}</td>
                  <td>{getStatusBadge(record.status)}</td>
                </tr>
              ))}

              {activeTab === 'disciplinary' && discipline.map(record => (
                <tr key={record.id}>
                  <td>
                    <p className={styles.personName}>{record.name}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{record.role}</p>
                  </td>
                  <td>{record.issue}</td>
                  <td>{record.date}</td>
                  <td style={{ fontWeight: 500, color: '#334155' }}>{record.action}</td>
                  <td>{getStatusBadge(record.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <HRModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={activeTab === 'training' ? "Assign Training Module" : "Log Disciplinary Action"}
        onSubmit={handleAddRecord}
      >
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Employee Name</label>
          <input className={modalStyles.input} value={newRecord.name} onChange={e => setNewRecord({...newRecord, name: e.target.value})} placeholder="e.g. Alice Smith" />
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Role</label>
          <input className={modalStyles.input} value={newRecord.role} onChange={e => setNewRecord({...newRecord, role: e.target.value})} placeholder="e.g. Chef" />
        </div>
        
        {activeTab === 'training' ? (
          <>
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Training Module</label>
              <input className={modalStyles.input} value={newRecord.module} onChange={e => setNewRecord({...newRecord, module: e.target.value})} placeholder="e.g. Fire Safety 101" />
            </div>
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Due Date</label>
              <input type="date" className={modalStyles.input} value={newRecord.dueDate} onChange={e => setNewRecord({...newRecord, dueDate: e.target.value})} />
            </div>
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Status</label>
              <select className={modalStyles.input} value={newRecord.status} onChange={e => setNewRecord({...newRecord, status: e.target.value})}>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Reported Issue</label>
              <input className={modalStyles.input} value={newRecord.issue} onChange={e => setNewRecord({...newRecord, issue: e.target.value})} placeholder="e.g. No Call No Show" />
            </div>
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Date of Incident</label>
              <input type="date" className={modalStyles.input} value={newRecord.date} onChange={e => setNewRecord({...newRecord, date: e.target.value})} />
            </div>
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Action Taken</label>
              <input className={modalStyles.input} value={newRecord.action} onChange={e => setNewRecord({...newRecord, action: e.target.value})} placeholder="e.g. Verbal Warning" />
            </div>
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Status</label>
              <select className={modalStyles.input} value={newRecord.status} onChange={e => setNewRecord({...newRecord, status: e.target.value})}>
                <option value="active">Active</option>
                <option value="completed">Resolved</option>
              </select>
            </div>
          </>
        )}
      </HRModal>
    </div>
  );
}
