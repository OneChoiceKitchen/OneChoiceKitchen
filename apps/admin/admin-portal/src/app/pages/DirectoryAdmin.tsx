import { useState } from 'react';
import { Search, Plus, Filter, User, UserX } from 'lucide-react';
import styles from './DirectoryAdmin.module.css';
import HRModal from './HRModal';
import modalStyles from './HRModal.module.css';

const TABS = [
  { id: 'employees', label: 'Kitchen & Corporate' },
  { id: 'riders', label: 'Riders' },
  { id: 'partners', label: 'B2B Partners' }
];

const INITIAL_DATA = [
  { id: 'emp_1', name: 'Alice Smith', role: 'Head Chef', department: 'Kitchen', type: 'employees', status: 'active', joined: '2025-01-15' },
  { id: 'emp_2', name: 'Charlie Brown', role: 'Packer', department: 'Kitchen', type: 'employees', status: 'inactive', joined: '2025-06-20' },
  { id: 'rd_1', name: 'Dave Wilson', role: 'Rider', department: 'Logistics', type: 'riders', status: 'active', joined: '2026-02-10' },
  { id: 'pt_1', name: 'Fresh Farms LLC', role: 'Supplier', department: 'Procurement', type: 'partners', status: 'pending_kyc', joined: '2026-07-01' },
];

export default function DirectoryAdmin() {
  const [activeTab, setActiveTab] = useState('employees');
  const [personnel, setPersonnel] = useState(INITIAL_DATA);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDept, setNewDept] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className={`${styles.badge} ${styles.active}`}>Active</span>;
      case 'inactive': return <span className={`${styles.badge} ${styles.inactive}`}>Inactive</span>;
      case 'pending_kyc': return <span className={`${styles.badge} ${styles.pending_kyc}`}>Pending KYC</span>;
      default: return null;
    }
  };

  const filteredData = personnel.filter(p => 
    p.type === activeTab && 
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.role.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddPersonnel = () => {
    const newItem = {
      id: `new_${Date.now()}`,
      name: newName,
      role: newRole,
      department: newDept,
      type: activeTab,
      status: 'pending_kyc',
      joined: new Date().toISOString().split('T')[0]
    };
    setPersonnel([newItem, ...personnel]);
    setIsModalOpen(false);
    setNewName('');
    setNewRole('');
    setNewDept('');
  };

  const handleSuspend = (id: string) => {
    setPersonnel(personnel.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p));
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Personnel Directory</h1>
          <p className={styles.pageSubtitle}>Manage employees, riders, and partner profiles securely.</p>
        </div>
        <button className={styles.primaryButton} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Add Personnel
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
        <div className={styles.searchBox}>
          <Search size={18} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search by name or role..." 
            className={styles.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className={styles.actionBtn}>
          <Filter size={18} /> Filters
        </button>
      </div>

      <div className={styles.panel}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Personnel</th>
                <th>Role & Dept</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(person => (
                <tr key={person.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className={styles.avatar}><User size={18} /></div>
                      <p className={styles.personName}>{person.name}</p>
                    </div>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontWeight: 500, color: '#334155' }}>{person.role}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{person.department}</p>
                  </td>
                  <td>{person.joined}</td>
                  <td>{getStatusBadge(person.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className={styles.actionBtn} title="View Profile">
                        View
                      </button>
                      <button className={styles.actionBtn} title="Toggle Suspend" onClick={() => handleSuspend(person.id)}>
                        <UserX size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No personnel found in this category.
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
        title={`Add New ${activeTab === 'employees' ? 'Employee' : activeTab === 'riders' ? 'Rider' : 'Partner'}`}
        onSubmit={handleAddPersonnel}
      >
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Full Name / Company Name</label>
          <input className={modalStyles.input} value={newName} onChange={e => setNewName(e.target.value)} placeholder="Enter name" />
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Role</label>
          <input className={modalStyles.input} value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="e.g. Packer, Delivery Rider" />
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Department</label>
          <select className={modalStyles.input} value={newDept} onChange={e => setNewDept(e.target.value)}>
            <option value="">Select Department</option>
            <option value="Kitchen">Kitchen Operations</option>
            <option value="Logistics">Logistics / Delivery</option>
            <option value="Corporate">Corporate / Admin</option>
            <option value="Procurement">Procurement</option>
          </select>
        </div>
      </HRModal>
    </div>
  );
}
