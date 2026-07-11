import { useState } from 'react';
import { Package, Plus, UserX } from 'lucide-react';
import styles from './AssetsAdmin.module.css';
import HRModal from './HRModal';
import modalStyles from './HRModal.module.css';

const INITIAL_ASSETS = [
  { id: 'as1', name: 'Thermal Delivery Bag v2', type: 'Bag', assignedTo: 'Dave Wilson', assignedDate: '2025-11-01', status: 'assigned', condition: 'Good', recoveryCost: 50 },
  { id: 'as2', name: 'Kitchen Uniform (M)', type: 'Uniform', assignedTo: 'Alice Smith', assignedDate: '2026-01-15', status: 'assigned', condition: 'Worn', recoveryCost: 20 },
  { id: 'as3', name: 'MacBook Pro 14"', type: 'Laptop', assignedTo: 'Bob Johnson', assignedDate: '2025-06-10', status: 'assigned', condition: 'Good', recoveryCost: 1500 },
  { id: 'as4', name: 'Thermal Delivery Bag v2', type: 'Bag', assignedTo: '-', assignedDate: '-', status: 'stock', condition: 'New', recoveryCost: 50 },
];

export default function AssetsAdmin() {
  const [filter, setFilter] = useState('all');
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newAsset, setNewAsset] = useState({ name: '', type: 'Bag', assignedTo: '', condition: 'New', recoveryCost: '' });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned': return <span className={`${styles.badge} ${styles.assigned}`}>Assigned</span>;
      case 'stock': return <span className={`${styles.badge} ${styles.stock}`}>In Stock</span>;
      case 'lost': return <span className={`${styles.badge} ${styles.lost}`}>Lost / Deducted</span>;
      default: return null;
    }
  };

  const handleAllocateAsset = () => {
    const isAssigned = newAsset.assignedTo.trim() !== '';
    const entry = {
      id: `as_${Date.now()}`,
      name: newAsset.name,
      type: newAsset.type,
      assignedTo: isAssigned ? newAsset.assignedTo : '-',
      assignedDate: isAssigned ? new Date().toISOString().split('T')[0] : '-',
      status: isAssigned ? 'assigned' : 'stock',
      condition: newAsset.condition,
      recoveryCost: Number(newAsset.recoveryCost) || 0
    };
    setAssets([entry, ...assets]);
    setIsModalOpen(false);
    setNewAsset({ name: '', type: 'Bag', assignedTo: '', condition: 'New', recoveryCost: '' });
  };

  const handleMarkLost = (id: string) => {
    if(confirm("Mark this asset as lost? The recovery cost will be queued for deduction in the next payroll cycle.")) {
      setAssets(assets.map(a => a.id === id ? { ...a, status: 'lost', condition: 'Lost' } : a));
    }
  };

  const currentList = assets.filter(a => filter === 'all' || a.type.toLowerCase().includes(filter));

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Assets & Deductions</h1>
          <p className={styles.pageSubtitle}>Track company laptops, rider bags, and kitchen uniforms.</p>
        </div>
        <button className={styles.primaryButton} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Allocate Asset
        </button>
      </div>

      <div className={styles.toolbar}>
        <select 
          className={styles.filterSelect}
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">All Asset Types</option>
          <option value="bag">Delivery Bags</option>
          <option value="uniform">Uniforms</option>
          <option value="laptop">Electronics (Laptops/Phones)</option>
        </select>
      </div>

      <div className={styles.panel}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Asset / Item</th>
                <th>Assigned To</th>
                <th>Date Assigned</th>
                <th>Condition</th>
                <th>Recovery Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentList.map(asset => (
                <tr key={asset.id}>
                  <td>
                    <p className={styles.assetName}>{asset.name}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{asset.type}</p>
                  </td>
                  <td style={{ fontWeight: 500, color: asset.assignedTo === '-' ? '#94a3b8' : '#0f172a' }}>
                    {asset.assignedTo}
                  </td>
                  <td>{asset.assignedDate}</td>
                  <td>{asset.condition}</td>
                  <td>${asset.recoveryCost}</td>
                  <td>{getStatusBadge(asset.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {asset.status === 'assigned' && (
                        <button className={styles.actionBtn} title="Mark Lost & Deduct from Payroll" onClick={() => handleMarkLost(asset.id)}>
                          <UserX size={16} />
                        </button>
                      )}
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
        title="Allocate New Asset"
        onSubmit={handleAllocateAsset}
      >
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Asset Name / Description</label>
          <input className={modalStyles.input} value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} placeholder="e.g. Thermal Delivery Bag v3" />
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Asset Type</label>
          <select className={modalStyles.input} value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})}>
            <option value="Bag">Delivery Bag</option>
            <option value="Uniform">Uniform / Merch</option>
            <option value="Laptop">Laptop / Hardware</option>
          </select>
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Assign To (Leave blank if keeping in stock)</label>
          <input className={modalStyles.input} value={newAsset.assignedTo} onChange={e => setNewAsset({...newAsset, assignedTo: e.target.value})} placeholder="e.g. Dave Wilson" />
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Recovery Cost ($)</label>
          <input type="number" className={modalStyles.input} value={newAsset.recoveryCost} onChange={e => setNewAsset({...newAsset, recoveryCost: e.target.value})} placeholder="Cost deducted if lost" />
        </div>
        <div className={modalStyles.formGroup}>
          <label className={modalStyles.label}>Condition</label>
          <select className={modalStyles.input} value={newAsset.condition} onChange={e => setNewAsset({...newAsset, condition: e.target.value})}>
            <option value="New">New</option>
            <option value="Good">Good</option>
            <option value="Worn">Worn</option>
          </select>
        </div>
      </HRModal>
    </div>
  );
}
