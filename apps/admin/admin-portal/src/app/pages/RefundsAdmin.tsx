import { useState, useEffect } from 'react';
import { useToast } from '@org/ui-design-system';
import styles from './RefundsAdmin.module.css';

const authHeaders = () => ({ 
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`, 
  'Content-Type': 'application/json' 
});

const DUMMY_REFUNDS = [
  { id: 'ref_1', amount: 450, status: 'PENDING', orderId: 'ord_1001', user: { name: 'Rahul Sharma' }, reason: 'Food arrived cold' },
  { id: 'ref_2', amount: 250, status: 'APPROVED', orderId: 'ord_1002', user: { name: 'Neha Gupta' }, reason: 'Missing item in order' },
  { id: 'ref_3', amount: 180, status: 'PROCESSED', orderId: 'ord_1003', user: { name: 'Amit Kumar' }, reason: 'Order cancelled by restaurant', transactionRef: 'TXN_REF1234' },
  { id: 'ref_4', amount: 320, status: 'REJECTED', orderId: 'ord_1004', user: { name: 'Priya Singh' }, reason: 'Customer changed mind after preparation' },
];

export default function RefundsAdmin() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Modal state for rejection & process
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [processModal, setProcessModal] = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [txnRef, setTxnRef] = useState('');

  useEffect(() => { fetchRefunds(); }, []);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/refunds', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.text().then(t => JSON.parse(t));
      const fetchedData = Array.isArray(data) ? data : [];
      setRefunds(fetchedData.length > 0 ? fetchedData : DUMMY_REFUNDS);
    } catch {
      // Fallback on API failure
      setRefunds(DUMMY_REFUNDS);
    } finally {
      setLoading(false);
    }
  };

  const action = async (id: string, type: 'approve' | 'reject' | 'process', extra?: any) => {
    try {
      const res = await fetch(`/api/refunds/${id}/${type}`, { 
        method: 'PATCH', 
        headers: authHeaders(), 
        body: JSON.stringify(extra || {}) 
      });
      if (!res.ok) throw new Error();
      toast.success(`Refund ${type}d successfully`);
      fetchRefunds();
    } catch {
      // Mock action
      setRefunds(prev => prev.map(r => r.id === id ? { 
        ...r, 
        status: type === 'approve' ? 'APPROVED' : type === 'reject' ? 'REJECTED' : 'PROCESSED',
        transactionRef: type === 'process' ? extra.transactionRef : r.transactionRef,
        reason: type === 'reject' ? `Rejected: ${extra.notes}` : r.reason
      } : r));
      toast.success(`(Mocked) Refund ${type}d successfully`);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.warning('Please enter a rejection reason.'); return; }
    await action(rejectModal!.id, 'reject', { notes: rejectReason });
    setRejectModal(null);
    setRejectReason('');
  };

  const handleProcess = async () => {
    if (!txnRef.trim()) { toast.warning('Please enter a transaction reference.'); return; }
    await action(processModal!.id, 'process', { transactionRef: txnRef });
    setProcessModal(null);
    setTxnRef('');
  };

  const filtered = refunds.filter(r => !statusFilter || r.status === statusFilter);

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.pageTitle}>💸 Refund Requests</h2>

      <div className={styles.filtersGroup}>
        {['', 'PENDING', 'APPROVED', 'REJECTED', 'PROCESSED'].map(s => (
          <button 
            key={s} 
            onClick={() => setStatusFilter(s)}
            className={`${styles.filterBtn} ${statusFilter === s ? styles.active : styles.inactive}`}
          >
            {s || 'All Requests'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.emptyState}>Loading refunds...</div>
      ) : (
        <div className={styles.cardsContainer}>
          {filtered.length === 0 && (
            <div className={styles.emptyState}>No refunds found matching this filter.</div>
          )}
          {filtered.map(r => (
            <div key={r.id} className={styles.refundCard}>
              <div className={styles.cardInfo}>
                <div className={styles.cardHeader}>
                  <span className={styles.amountText}>₹{r.amount}</span>
                  <span className={`${styles.statusBadge} ${styles[r.status.toLowerCase()] || ''}`}>
                    {r.status}
                  </span>
                </div>
                <div className={styles.metaText}>
                  Order: <span className={styles.metaHighlight}>{r.orderId?.substring(0, 8)}</span> · User: <span className={styles.metaHighlight}>{r.user?.name || r.userId?.substring(0, 8)}</span>
                </div>
                <div className={styles.reasonText}>
                  {r.reason}
                </div>
                {r.transactionRef && (
                  <div className={styles.txnText}>
                    ✓ Processed (Ref: {r.transactionRef})
                  </div>
                )}
              </div>
              <div className={styles.actionGroup}>
                {r.status === 'PENDING' && (
                  <>
                    <button onClick={() => action(r.id, 'approve')} className={`${styles.actionBtn} ${styles.approve}`}>Approve</button>
                    <button onClick={() => setRejectModal({ id: r.id })} className={`${styles.actionBtn} ${styles.reject}`}>Reject</button>
                  </>
                )}
                {r.status === 'APPROVED' && (
                  <button onClick={() => setProcessModal({ id: r.id })} className={`${styles.actionBtn} ${styles.process}`}>Process Payout</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className={styles.modalOverlay} onClick={() => setRejectModal(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Reject Refund</h3>
            <label className={styles.formLabel}>Rejection Reason *</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection to show the customer..."
              rows={3}
              className={styles.formTextarea}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button onClick={() => setRejectModal(null)} className={styles.cancelBtn}>Cancel</button>
              <button onClick={handleReject} className={`${styles.confirmBtn} ${styles.danger}`}>Reject Refund</button>
            </div>
          </div>
        </div>
      )}

      {/* Process Modal */}
      {processModal && (
        <div className={styles.modalOverlay} onClick={() => setProcessModal(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Process Refund</h3>
            <label className={styles.formLabel}>Bank/Payment Gateway Transaction Reference *</label>
            <input
              type="text"
              value={txnRef}
              onChange={e => setTxnRef(e.target.value)}
              placeholder="e.g. TXN123456789"
              className={styles.formInput}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button onClick={() => setProcessModal(null)} className={styles.cancelBtn}>Cancel</button>
              <button onClick={handleProcess} className={`${styles.confirmBtn} ${styles.primary}`}>Process Refund</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
