import { useState } from 'react';
import { CalendarDays, Edit, Trash2, Plus } from 'lucide-react';
import styles from './ShiftsAdmin.module.css';
import HRModal from './HRModal';
import modalStyles from './HRModal.module.css';

const TABS = [
  { id: 'kitchen', label: 'Branch & Kitchen Shifts' },
  { id: 'riders', label: 'Rider Rosters' },
  { id: 'swaps', label: 'Shift Swap Requests' }
];

const INITIAL_SHIFTS = [
  { id: 's1', name: 'Alice Smith', role: 'Head Chef', date: '2026-07-08', shiftTime: '08:00 AM - 04:00 PM', type: 'morning', branch: 'Downtown Bistro', category: 'kitchen' },
  { id: 's2', name: 'Charlie Brown', role: 'Packer', date: '2026-07-08', shiftTime: '04:00 PM - 12:00 AM', type: 'evening', branch: 'Uptown Cafe', category: 'kitchen' },
  { id: 's3', name: 'David Lee', role: 'Sous Chef', date: '2026-07-08', shiftTime: '10:00 AM - 02:00 PM, 06:00 PM - 10:00 PM', type: 'split', branch: 'Downtown Bistro', category: 'kitchen' },
  { id: 'rs1', name: 'Dave Wilson', role: 'Rider', date: '2026-07-08', shiftTime: '11:00 AM - 03:00 PM (Lunch Rush)', type: 'split', branch: 'Zone A', category: 'riders' },
  { id: 'rs2', name: 'Eve Davis', role: 'Rider', date: '2026-07-08', shiftTime: '06:00 PM - 11:00 PM (Dinner Rush)', type: 'evening', branch: 'Zone B', category: 'riders' },
];

export default function ShiftsAdmin() {
  const [activeTab, setActiveTab] = useState('kitchen');
  const [dateFilter, setDateFilter] = useState('2026-07-08');
  const [shifts, setShifts] = useState(INITIAL_SHIFTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newShift, setNewShift] = useState({ name: '', role: '', shiftTime: '', type: 'morning', branch: '' });

  const getShiftBadge = (type: string) => {
    switch (type) {
      case 'morning': return <span className={`${styles.badge} ${styles.morning}`}>Morning Shift</span>;
      case 'evening': return <span className={`${styles.badge} ${styles.evening}`}>Evening Shift</span>;
      case 'split': return <span className={`${styles.badge} ${styles.split}`}>Split Shift</span>;
      default: return null;
    }
  };

  const handleAddShift = () => {
    const entry = {
      id: `sh_${Date.now()}`,
      name: newShift.name,
      role: newShift.role,
      date: dateFilter,
      shiftTime: newShift.shiftTime,
      type: newShift.type,
      branch: newShift.branch,
      category: activeTab === 'riders' ? 'riders' : 'kitchen'
    };
    setShifts([entry, ...shifts]);
    setIsModalOpen(false);
    setNewShift({ name: '', role: '', shiftTime: '', type: 'morning', branch: '' });
  };

  const handleDelete = (id: string) => {
    if(confirm("Are you sure you want to remove this shift?")) {
      setShifts(shifts.filter(s => s.id !== id));
    }
  };

  const currentList = shifts.filter(s => s.category === activeTab);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Shifts & Roster Management</h1>
          <p className={styles.pageSubtitle}>Assign branch shifts, manage rider zones, and handle swap requests.</p>
        </div>
        <button className={styles.primaryButton} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Assign New Shift
        </button>
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

      <div className={styles.toolbar}>
        <input 
          type="date" 
          className={styles.filterSelect}
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
        />
        <select className={styles.filterSelect}>
          <option value="all">All Branches / Zones</option>
          <option value="downtown">Downtown Bistro</option>
          <option value="zoneA">Zone A (Riders)</option>
        </select>
      </div>

      <div className={styles.panel}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Personnel</th>
                <th>Branch / Zone</th>
                <th>Shift Timings</th>
                <th>Shift Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'swaps' ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No pending shift swap requests.
                  </td>
                </tr>
              ) : currentList.map(shift => (
                <tr key={shift.id}>
                  <td>
                    <p className={styles.personName}>{shift.name}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{shift.role}</p>
                  </td>
                  <td>{shift.branch}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CalendarDays size={14} color="#64748b"/> {shift.shiftTime}
                    </div>
                  </td>
                  <td>{getShiftBadge(shift.type)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className={styles.actionBtn} title="Edit Shift">
                        <Edit size={16} />
                      </button>
                      <button className={styles.actionBtn} title="Remove Shift" onClick={() => handleDelete(shift.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {activeTab !== 'swaps' && currentList.length === 0 && (
                 <tr>
                 <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                   No shifts found for this category and date.
                 </td>
               </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <HRModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Assign New Shift"
        onSubmit={handleAddShift}
      >
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Employee Name</label>
          <input className={modalStyles.input} value={newShift.name} onChange={e => setNewShift({...newShift, name: e.target.value})} placeholder="e.g. Alice Smith" />
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Role</label>
          <input className={modalStyles.input} value={newShift.role} onChange={e => setNewShift({...newShift, role: e.target.value})} placeholder="e.g. Chef" />
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Branch / Zone</label>
          <input className={modalStyles.input} value={newShift.branch} onChange={e => setNewShift({...newShift, branch: e.target.value})} placeholder="e.g. Downtown Bistro" />
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Shift Timings (Text)</label>
          <input className={modalStyles.input} value={newShift.shiftTime} onChange={e => setNewShift({...newShift, shiftTime: e.target.value})} placeholder="08:00 AM - 04:00 PM" />
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Shift Type</label>
          <select className={modalStyles.input} value={newShift.type} onChange={e => setNewShift({...newShift, type: e.target.value})}>
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
            <option value="split">Split Shift</option>
          </select>
        </div>
      </HRModal>
    </div>
  );
}
