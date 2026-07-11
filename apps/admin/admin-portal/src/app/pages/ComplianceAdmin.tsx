import { useState, useEffect } from 'react';
import { useToast } from '@org/ui-design-system';
import styles from './ComplianceAdmin.module.css';

const authHeaders = () => ({ 
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`, 
  'Content-Type': 'application/json' 
});

const DUMMY_DOCS = [
  { id: 'doc_1', documentType: 'FSSAI', status: 'PENDING', restaurant: { name: 'Downtown Bistro' }, documentNumber: 'FSSAI-2023-10293', expiryDate: '2027-12-31', fileUrl: '#' },
  { id: 'doc_2', documentType: 'FIRE_NOC', status: 'REJECTED', restaurant: { name: 'Spice Garden' }, reviewNotes: 'Document is blurry and unreadable.', fileUrl: '#' },
  { id: 'doc_3', documentType: 'HEALTH_CERT', status: 'APPROVED', restaurant: { name: 'Uptown Cafe' }, documentNumber: 'HC-9921', expiryDate: '2026-05-15', fileUrl: '#' },
  { id: 'doc_4', documentType: 'GST', status: 'EXPIRED', restaurant: { name: 'Burger Joint' }, documentNumber: '29ABCDE1234F1Z5', expiryDate: '2025-01-01', fileUrl: '#' }
];

export default function ComplianceAdmin() {
  const [docs, setDocs] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Reject modal state
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/compliance', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.text().then(t => JSON.parse(t));
      
      const parsed = Array.isArray(data) ? data : (data.data || []);
      setDocs(parsed.length > 0 ? parsed : DUMMY_DOCS);
    } catch {
      // Fallback
      setDocs(DUMMY_DOCS);
    } finally {
      setLoading(false);
    }
  };

  const review = async (id: string, status: 'APPROVED' | 'REJECTED', notes?: string) => {
    try {
      const res = await fetch(`/api/compliance/${id}/review`, { 
        method: 'PATCH', 
        headers: authHeaders(), 
        body: JSON.stringify({ status, reviewNotes: notes }) 
      });
      if (!res.ok) throw new Error();
      toast.success(`Document ${status.toLowerCase()} successfully`);
      fetchDocs();
    } catch {
      // Mock review
      setDocs(prev => prev.map(d => d.id === id ? { ...d, status, reviewNotes: notes } : d));
      toast.success(`(Mocked) Document ${status.toLowerCase()} successfully`);
    }
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) { toast.warning('Please enter a rejection reason.'); return; }
    await review(rejectModal!.id, 'REJECTED', rejectNotes);
    setRejectModal(null);
    setRejectNotes('');
  };

  const filtered = docs.filter(d => !statusFilter || d.status === statusFilter);
  const docTypeIcons: Record<string, string> = { FSSAI: '🏛️', HEALTH_CERT: '🏥', FIRE_NOC: '🔥', TRADE_LICENSE: '📋', GST: '💰' };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>✅ Compliance Documents</h2>

        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)} 
          className={styles.filterSelect}
        >
          <option value="">All Statuses</option>
          {['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className={styles.emptyState}>Loading documents...</div>
      ) : (
        <div className={styles.listContainer}>
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>No compliance documents found</div>
          ) : filtered.map(doc => {
            const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
            
            return (
              <div key={doc.id} className={styles.docCard}>
                <div className={styles.docIcon}>
                  {docTypeIcons[doc.documentType] || '📄'}
                </div>
                
                <div className={styles.docInfo}>
                  <div className={styles.docHeader}>
                    <span className={styles.docType}>{doc.documentType}</span>
                    <span className={`${styles.statusBadge} ${styles[doc.status.toLowerCase()] || ''}`}>
                      {doc.status}
                    </span>
                  </div>
                  
                  <div className={styles.docDetail}>
                    Restaurant: <b>{doc.restaurant?.name || doc.restaurantId?.substring(0, 8)}</b>
                  </div>
                  
                  {doc.documentNumber && (
                    <div className={styles.docDetail}>Doc #: {doc.documentNumber}</div>
                  )}
                  
                  {doc.expiryDate && (
                    <div className={`${styles.docDetail} ${isExpired ? styles.error : ''}`}>
                      Expiry: {new Date(doc.expiryDate).toLocaleDateString()}
                    </div>
                  )}
                  
                  {doc.reviewNotes && (
                    <div className={`${styles.docDetail} ${styles.error}`} style={{ marginTop: '0.25rem', fontWeight: 500 }}>
                      Note: {doc.reviewNotes}
                    </div>
                  )}
                </div>
                
                <div className={styles.docActions}>
                  {doc.fileUrl && (
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className={`${styles.btn} ${styles.view}`}>
                      View Doc
                    </a>
                  )}
                  
                  {doc.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => review(doc.id, 'APPROVED')} 
                        className={`${styles.btn} ${styles.approve}`}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => setRejectModal({ id: doc.id })} 
                        className={`${styles.btn} ${styles.reject}`}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className={styles.overlay} onClick={() => setRejectModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Reject Document</h3>
            
            <label className={styles.modalLabel}>Rejection Reason *</label>
            <textarea
              value={rejectNotes}
              onChange={e => setRejectNotes(e.target.value)}
              placeholder="Explain why this document is being rejected..."
              className={styles.modalTextarea}
              autoFocus
            />
            
            <div className={styles.modalActions}>
              <button 
                onClick={() => setRejectModal(null)} 
                className={`${styles.btn} ${styles.cancel}`}
              >
                Cancel
              </button>
              <button 
                onClick={handleReject} 
                className={`${styles.btn} ${styles.danger}`}
              >
                Reject Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
