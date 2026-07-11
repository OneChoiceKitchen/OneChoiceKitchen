import { useState } from 'react';
import { Calendar, MapPin, CheckCircle, Clock, AlertTriangle, Plus, Edit } from 'lucide-react';
import styles from './AttendanceAdmin.module.css';
import HRModal from './HRModal';
import modalStyles from './HRModal.module.css';

const TABS = [
  { id: 'daily', label: 'Daily Logs' },
  { id: 'geo', label: 'Rider Geo-logs' },
  { id: 'regularization', label: 'Regularization Requests' }
];

const INITIAL_ATTENDANCE = [
  { id: 'a1', name: 'Alice Smith', role: 'Head Chef', date: '2026-07-08', checkIn: '08:50 AM', checkOut: '05:10 PM', status: 'present' },
  { id: 'a2', name: 'Charlie Brown', role: 'Packer', date: '2026-07-08', checkIn: '09:15 AM', checkOut: '-', status: 'late' },
  { id: 'a3', name: 'Bob Johnson', role: 'HR Manager', date: '2026-07-08', checkIn: '-', checkOut: '-', status: 'absent' },
];

const INITIAL_GEO = [
  { id: 'g1', name: 'Dave Wilson', role: 'Rider', date: '2026-07-08', checkIn: '10:00 AM', location: 'Zone A Hub', geofenceMatch: true },
  { id: 'g2', name: 'Eve Davis', role: 'Rider', date: '2026-07-08', checkIn: '10:30 AM', location: 'Outside Zone B', geofenceMatch: false },
];

export default function AttendanceAdmin() {
  const [activeTab, setActiveTab] = useState('daily');
  const [dateFilter, setDateFilter] = useState('2026-07-08');
  
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [geoLogs, setGeoLogs] = useState(INITIAL_GEO);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLog, setNewLog] = useState({ name: '', role: '', checkIn: '', checkOut: '', status: 'present' });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present': return <span className={`${styles.badge} ${styles.present}`}><CheckCircle size={14}/> Present</span>;
      case 'absent': return <span className={`${styles.badge} ${styles.absent}`}><AlertTriangle size={14}/> Absent</span>;
      case 'late': return <span className={`${styles.badge} ${styles.late}`}><Clock size={14}/> Late</span>;
      default: return null;
    }
  };

  const handleMarkAttendance = () => {
    const newEntry = {
      id: `a_${Date.now()}`,
      name: newLog.name,
      role: newLog.role,
      date: dateFilter,
      checkIn: newLog.checkIn,
      checkOut: newLog.checkOut || '-',
      status: newLog.status
    };
    setAttendance([newEntry, ...attendance]);
    setIsModalOpen(false);
    setNewLog({ name: '', role: '', checkIn: '', checkOut: '', status: 'present' });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Attendance & Time Tracking</h1>
          <p className={styles.pageSubtitle}>Monitor daily check-ins, geo-fenced logs, and approve timesheets.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className={styles.primaryButton} onClick={() => setIsModalOpen(true)} style={{ background: 'white', color: '#3b82f6', border: '1px solid #3b82f6' }}>
            <Plus size={18} /> Mark Attendance
          </button>
          <button className={styles.primaryButton}>
            <Calendar size={18} />
            Export Timesheets
          </button>
        </div>
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
          <option value="all">All Roles</option>
          <option value="kitchen">Kitchen Staff</option>
          <option value="corporate">Corporate</option>
          <option value="rider">Riders</option>
        </select>
      </div>

      <div className={styles.panel}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              {activeTab === 'geo' ? (
                <tr>
                  <th>Rider Name</th>
                  <th>Check-In Time</th>
                  <th>Location</th>
                  <th>Geofence Status</th>
                </tr>
              ) : (
                <tr>
                  <th>Employee Name</th>
                  <th>Role</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              )}
            </thead>
            <tbody>
              {activeTab === 'geo' ? (
                geoLogs.map(log => (
                  <tr key={log.id}>
                    <td><p className={styles.personName}>{log.name}</p></td>
                    <td>{log.checkIn}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} color="#64748b"/> {log.location}
                      </div>
                    </td>
                    <td>
                      {log.geofenceMatch ? 
                        <span className={`${styles.badge} ${styles.present}`}>Match</span> : 
                        <span className={`${styles.badge} ${styles.absent}`}>Out of Bounds</span>
                      }
                    </td>
                  </tr>
                ))
              ) : (
                attendance.map(log => (
                  <tr key={log.id}>
                    <td><p className={styles.personName}>{log.name}</p></td>
                    <td>{log.role}</td>
                    <td>{log.checkIn}</td>
                    <td>{log.checkOut}</td>
                    <td>{getStatusBadge(log.status)}</td>
                    <td>
                      <button className={styles.actionBtn} title="Edit Record"><Edit size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <HRModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Mark Manual Attendance"
        onSubmit={handleMarkAttendance}
      >
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Employee Name</label>
          <input className={modalStyles.input} value={newLog.name} onChange={e => setNewLog({...newLog, name: e.target.value})} placeholder="e.g. Alice Smith" />
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Role</label>
          <input className={modalStyles.input} value={newLog.role} onChange={e => setNewLog({...newLog, role: e.target.value})} placeholder="e.g. Head Chef" />
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Check-In Time</label>
          <input type="time" className={modalStyles.input} value={newLog.checkIn} onChange={e => setNewLog({...newLog, checkIn: e.target.value})} />
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Status</label>
          <select className={modalStyles.input} value={newLog.status} onChange={e => setNewLog({...newLog, status: e.target.value})}>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
          </select>
        </div>
      </HRModal>
    </div>
  );
}
