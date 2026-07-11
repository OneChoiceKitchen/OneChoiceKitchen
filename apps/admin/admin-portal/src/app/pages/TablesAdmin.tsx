import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, QrCode, Download, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ContextSelector } from '../components/ContextSelector';
import { useToast, useConfirm } from '@org/ui-design-system';
import styles from './TablesAdmin.module.css';

export default function TablesAdmin() {
  const queryParams = new URLSearchParams(window.location.search);

  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Context State
  const [restaurantId, setRestaurantId] = useState<string | null>(queryParams.get('restaurantId'));
  const [branchId, setBranchId] = useState<string | null>(queryParams.get('branchId'));

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({ 
    tableNumber: '', capacity: 4, isAvailable: true
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [qrModalTable, setQrModalTable] = useState<any>(null);
  const [qrTargetPlatform, setQrTargetPlatform] = useState<'web' | 'mobile'>('web');
  const toast = useToast();
  const confirmDialog = useConfirm();

  const getTableQrUrl = (table: any) => {
    const baseUrl = qrTargetPlatform === 'web' ? 'http://localhost:4208' : 'http://localhost:4210';
    return `${baseUrl}/branch/${table.branchId || branchId}?tableId=${table.id}`;
  };

  const downloadQR = (table: any) => {
    const svg = document.getElementById(`qr-code-${table.id}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40; // Add padding
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20); // Draw image with padding
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `Table-${table.tableNumber}-QR.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  useEffect(() => {
    fetchTables();
  }, [restaurantId, branchId]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      let url = '/api/tables';
      const params = new URLSearchParams();
      if (restaurantId) params.append('restaurantId', restaurantId);
      if (branchId) params.append('branchId', branchId);
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.text().then(t => JSON.parse(t));
        setTables(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId && !editingId) {
      toast.warning('Please select a Restaurant context to add a table.');
      return;
    }

    try {
      const payload = {
        ...formData,
        restaurantId,
        branchId
      };

      const endpoint = editingId ? `/api/tables/${editingId}` : '/api/tables';
      const method = editingId ? 'PUT' : 'POST';

      const token = localStorage.getItem('admin_token');
      const response = await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text().then(t => JSON.parse(t));
        setErrorMsg(errorData.message || 'An error occurred while saving the table.');
        return;
      }

      setShowModal(false);
      fetchTables();
    } catch (e) {
      console.error(e);
      setErrorMsg('An unexpected error occurred.');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDialog({ title: 'Delete Table', message: 'Are you sure you want to delete this table?', variant: 'danger' });
    if (!ok) return;
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`/api/tables/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      fetchTables();
    } catch (e) {
      console.error(e);
    }
  };

  const openAdd = () => {
    if (!restaurantId) {
      toast.warning('Please select a Restaurant context first.');
      return;
    }
    setEditingId(null);
    setFormData({ tableNumber: '', capacity: 4, isAvailable: true });
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEdit = (table: any) => {
    setEditingId(table.id);
    setFormData({ 
      tableNumber: table.tableNumber, 
      capacity: table.capacity, 
      isAvailable: table.isAvailable
    });
    setErrorMsg(null);
    setShowModal(true);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Table Management</h2>
          <p className={styles.pageSubtitle}>Manage physical dining tables and their QR codes.</p>
        </div>
        <button 
          onClick={openAdd}
          className={styles.primaryBtn}
        >
          <Plus size={18} /> Add Table
        </button>
      </div>

      <ContextSelector 
        selectedRestaurantId={restaurantId} 
        selectedBranchId={branchId} 
        onChange={(rId, bId) => {
          setRestaurantId(rId);
          setBranchId(bId);
        }} 
      />

      {loading ? (
        <div className={styles.loadingState}>Loading tables...</div>
      ) : tables.length === 0 ? (
        <div className={styles.emptyState}>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>No tables found for this selection.</p>
          <button onClick={openAdd} className={styles.secondaryBtn}>
            Add First Table
          </button>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {tables.map(table => (
            <div key={table.id} className={styles.tableCard} style={{ borderTop: `4px solid ${table.isAvailable ? '#10b981' : '#f43f5e'}` }}>
              
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.tableName}>Table {table.tableNumber}</h3>
                  <div className={styles.badgeGroup}>
                    <span className={`${styles.badge} ${table.isAvailable ? styles.badgeAvailable : styles.badgeOccupied}`}>
                      {table.isAvailable ? 'Available' : 'Occupied'}
                    </span>
                    {table.reservations && table.reservations.length > 0 && (
                      <span className={`${styles.badge} ${styles.badgeReservation}`}>
                        Active Reservation
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.actionGroup}>
                  <button onClick={() => openEdit(table)} className={`${styles.actionBtn} ${styles.edit}`} title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(table.id)} className={`${styles.actionBtn} ${styles.delete}`} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.cardDetails}>
                <div className={styles.detailRow}>
                  <span>Capacity:</span>
                  <span className={styles.detailValue}>{table.capacity} Persons</span>
                </div>
                <div className={styles.detailRow} style={{ marginTop: '0.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><QrCode size={14} /> Digital Menu:</span>
                  <button 
                    onClick={() => setQrModalTable(table)} 
                    className={styles.qrBtn}
                  >
                    View QR
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>
              {editingId ? 'Edit Table' : 'Add New Table'}
            </h3>
            
            {errorMsg && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', border: '1px solid #fca5a5', fontSize: '0.875rem' }}>
                {errorMsg}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Table Number/Name</label>
                <input 
                  type="text" 
                  value={formData.tableNumber} 
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({...formData, tableNumber: val});
                    
                    if (val.trim() !== '') {
                      const exists = tables.some(t => t.tableNumber.toLowerCase() === val.trim().toLowerCase() && t.id !== editingId);
                      if (exists) {
                        setErrorMsg(`Table with number/name '${val}' already exists in this branch.`);
                      } else {
                        setErrorMsg(null);
                      }
                    } else {
                      setErrorMsg(null);
                    }
                  }}
                  className={styles.formInput}
                  required
                  placeholder="e.g. 12 or Patio-1"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Capacity (Persons)</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.capacity} 
                  onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.infoBox}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                  <QrCode size={16} color="#0ea5e9" /> Automatic QR Code
                </span>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  A unique digital menu QR code will be generated for this table automatically once saved.
                </p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={formData.isAvailable} 
                    onChange={e => setFormData({...formData, isAvailable: e.target.checked})}
                    style={{ width: '1.25rem', height: '1.25rem', accentColor: '#0ea5e9' }}
                  />
                  <span>Table is Available</span>
                </label>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.secondaryBtn}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!!errorMsg}
                  className={styles.primaryBtn}
                >
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Viewer Modal */}
      {qrModalTable && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.qrModalContent}`}>
            
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className={styles.modalTitle} style={{ marginBottom: 0 }}>Table {qrModalTable.tableNumber} QR</h3>
              <button onClick={() => setQrModalTable(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.formGroup} style={{ width: '100%' }}>
              <label className={styles.formLabel}>Generate QR For:</label>
              <select 
                value={qrTargetPlatform}
                onChange={(e) => setQrTargetPlatform(e.target.value as 'web' | 'mobile')}
                className={styles.formSelect}
              >
                <option value="web">Customer Web Portal (http://localhost:4208)</option>
                <option value="mobile">Customer Mobile App (http://localhost:4210)</option>
              </select>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <QRCodeSVG 
                id={`qr-code-${qrModalTable.id}`}
                value={getTableQrUrl(qrModalTable)} 
                size={220} 
                level="H" 
                includeMargin={true}
                fgColor="#0f172a"
              />
            </div>

            <div style={{ width: '100%', textAlign: 'center', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#64748b' }}>Branch Landing Page URL:</p>
              <a href={getTableQrUrl(qrModalTable)} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#0ea5e9', wordBreak: 'break-all' }}>
                {getTableQrUrl(qrModalTable)}
              </a>
            </div>

            <button 
              onClick={() => downloadQR(qrModalTable)}
              className={styles.primaryBtn}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Download size={18} /> Download QR Code PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
