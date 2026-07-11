import { useState } from 'react';
import { UserMinus, CheckSquare, FileText, Check } from 'lucide-react';
import styles from './OffboardingAdmin.module.css';
import HRModal from './HRModal';
import modalStyles from './HRModal.module.css';

const INITIAL_OFFBOARDING = [
  { id: 'ob1', name: 'Frank Castle', role: 'Rider', date: '2026-06-30', reason: 'Resigned', assetStatus: 'pending', payrollStatus: 'cleared', overallStatus: 'pending' },
  { id: 'ob2', name: 'Grace Hopper', role: 'Sous Chef', date: '2026-06-15', reason: 'Terminated', assetStatus: 'cleared', payrollStatus: 'cleared', overallStatus: 'cleared' },
];

export default function OffboardingAdmin() {
  const [filter, setFilter] = useState('all');
  const [records, setRecords] = useState(INITIAL_OFFBOARDING);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({ name: '', role: '', date: '', reason: 'Resigned' });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className={`${styles.badge} ${styles.pending}`}>Pending Clearance</span>;
      case 'cleared': return <span className={`${styles.badge} ${styles.cleared}`}>Cleared</span>;
      case 'blocked': return <span className={`${styles.badge} ${styles.blocked}`}>Blocked / Hold</span>;
      default: return null;
    }
  };

  const handleInitiateOffboarding = () => {
    const entry = {
      id: `ob_${Date.now()}`,
      name: newRecord.name,
      role: newRecord.role,
      date: newRecord.date,
      reason: newRecord.reason,
      assetStatus: 'pending',
      payrollStatus: 'pending',
      overallStatus: 'pending'
    };
    setRecords([entry, ...records]);
    setIsModalOpen(false);
    setNewRecord({ name: '', role: '', date: '', reason: 'Resigned' });
  };

  const handleToggleClearance = (id: string, type: 'asset' | 'payroll') => {
    setRecords(records.map(r => {
      if (r.id === id) {
        const newAssetStatus = type === 'asset' ? 'cleared' : r.assetStatus;
        const newPayrollStatus = type === 'payroll' ? 'cleared' : r.payrollStatus;
        const overallStatus = (newAssetStatus === 'cleared' && newPayrollStatus === 'cleared') ? 'cleared' : 'pending';
        return { ...r, assetStatus: newAssetStatus, payrollStatus: newPayrollStatus, overallStatus };
      }
      return r;
    }));
  };

  const currentList = records.filter(r => filter === 'all' || r.overallStatus === filter);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Offboarding & FNF</h1>
          <p className={styles.pageSubtitle}>Manage final settlements, asset recovery, and exit processing.</p>
        </div>
        <button className={styles.primaryButton} onClick={() => setIsModalOpen(true)}>
          <UserMinus size={18} />
          Initiate Offboarding
        </button>
      </div>

      <div className={styles.toolbar}>
        <select 
          className={styles.filterSelect}
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">All Offboarding Records</option>
          <option value="pending">Pending Final Settlement</option>
          <option value="cleared">Completed</option>
        </select>
      </div>

      <div className={styles.panel}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Personnel</th>
                <th>Exit Date & Reason</th>
                <th>Asset Recovery</th>
                <th>Payroll FNF</th>
                <th>Overall Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentList.map(record => (
                <tr key={record.id}>
                  <td>
                    <p className={styles.personName}>{record.name}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{record.role}</p>
                  </td>
                  <td>
                    {record.date}
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8' }}>{record.reason}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getStatusBadge(record.assetStatus)}
                      {record.assetStatus === 'pending' && (
                        <button className={styles.actionBtn} onClick={() => handleToggleClearance(record.id, 'asset')} title="Mark Assets Cleared">
                          <Check size={14} color="green" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getStatusBadge(record.payrollStatus)}
                      {record.payrollStatus === 'pending' && (
                        <button className={styles.actionBtn} onClick={() => handleToggleClearance(record.id, 'payroll')} title="Mark Payroll Cleared">
                          <Check size={14} color="green" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td>{getStatusBadge(record.overallStatus)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className={styles.actionBtn} title="View Checklist">
                        <CheckSquare size={16} />
                      </button>
                      <button className={styles.actionBtn} title="Download Clearance Letter" disabled={record.overallStatus !== 'cleared'} style={{ opacity: record.overallStatus !== 'cleared' ? 0.5 : 1 }}>
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <HRModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Initiate Offboarding"
        onSubmit={handleInitiateOffboarding}
      >
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Employee Name</label>
          <input className={modalStyles.input} value={newRecord.name} onChange={e => setNewRecord({...newRecord, name: e.target.value})} placeholder="e.g. Frank Castle" />
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Role</label>
          <input className={modalStyles.input} value={newRecord.role} onChange={e => setNewRecord({...newRecord, role: e.target.value})} placeholder="e.g. Rider" />
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Exit Date</label>
          <input type="date" className={modalStyles.input} value={newRecord.date} onChange={e => setNewRecord({...newRecord, date: e.target.value})} />
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Reason for Exit</label>
          <select className={modalStyles.input} value={newRecord.reason} onChange={e => setNewRecord({...newRecord, reason: e.target.value})}>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
            <option value="Contract Ended">Contract Ended</option>
          </select>
        </div>
      </HRModal>
    </div>
  );
}
