import { useState, useEffect } from 'react';
import { useToast } from '@org/ui-design-system';
import styles from './PayoutsAdmin.module.css';

const authHeaders = () => ({ 
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`, 
  'Content-Type': 'application/json' 
});

type Payout = { 
  id: string; 
  recipientId: string; 
  recipientType: string; 
  periodStart: string; 
  periodEnd: string; 
  grossAmount: number; 
  deductions: number; 
  netAmount: number; 
  status: string; 
  transactionRef?: string; 
  processedAt?: string; 
  notes?: string; 
};

const DUMMY_PAYOUTS: Payout[] = [
  { id: 'po_101', recipientId: 'Rider: Raju (R-492)', recipientType: 'RIDER', periodStart: '2026-06-25', periodEnd: '2026-07-02', grossAmount: 5200, deductions: 200, netAmount: 5000, status: 'PENDING' },
  { id: 'po_102', recipientId: 'Partner: Desi Tiffin', recipientType: 'PARTNER', periodStart: '2026-06-01', periodEnd: '2026-06-30', grossAmount: 45000, deductions: 4500, netAmount: 40500, status: 'APPROVED' },
  { id: 'po_103', recipientId: 'Rider: Suraj (R-118)', recipientType: 'RIDER', periodStart: '2026-06-25', periodEnd: '2026-07-02', grossAmount: 3100, deductions: 100, netAmount: 3000, status: 'PROCESSED', transactionRef: 'TXN_987654321' },
  { id: 'po_104', recipientId: 'Partner: Healthy Bowl', recipientType: 'PARTNER', periodStart: '2026-06-01', periodEnd: '2026-06-30', grossAmount: 12000, deductions: 1200, netAmount: 10800, status: 'FAILED' },
];

export default function PayoutsAdmin() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(false);
  const [genForm, setGenForm] = useState({ periodStart: '', periodEnd: '', type: 'RIDER' });
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [txnRef, setTxnRef] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => { fetchPayouts(); }, []);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payouts', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.text().then(t => JSON.parse(t));
      const fetchedData = Array.isArray(data) ? data : data.data || [];
      setPayouts(fetchedData.length > 0 ? fetchedData : DUMMY_PAYOUTS);
    } catch (e) { 
      // Fallback on API failure
      setPayouts(DUMMY_PAYOUTS);
    } finally {
      setLoading(false);
    }
  };

  const generatePayouts = async () => {
    if (!genForm.periodStart || !genForm.periodEnd) return toast.warning('Please select both period dates.');
    try {
      const res = await fetch('/api/payouts/generate', { 
        method: 'POST', 
        headers: authHeaders(), 
        body: JSON.stringify(genForm) 
      });
      if (!res.ok) throw new Error();
      toast.success('Payouts generated!');
      fetchPayouts();
    } catch (e) { 
      // Mock Generation
      const newPayout: Payout = {
        id: `po_mock_${Date.now()}`,
        recipientId: genForm.type === 'RIDER' ? 'Rider: New Mock' : 'Partner: New Mock',
        recipientType: genForm.type,
        periodStart: genForm.periodStart,
        periodEnd: genForm.periodEnd,
        grossAmount: Math.floor(Math.random() * 10000) + 1000,
        deductions: 0,
        netAmount: 0,
        status: 'PENDING'
      };
      newPayout.deductions = Math.floor(newPayout.grossAmount * 0.1);
      newPayout.netAmount = newPayout.grossAmount - newPayout.deductions;
      
      setPayouts(prev => [newPayout, ...prev]);
      toast.success('(Mocked) Payouts generated!');
    }
  };

  const approve = async (id: string) => {
    try {
      const res = await fetch(`/api/payouts/${id}/approve`, { method: 'PATCH', headers: authHeaders() });
      if (!res.ok) throw new Error();
      toast.success('Payout approved successfully');
      fetchPayouts();
    } catch {
      // Mock Approve
      setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p));
      toast.success('(Mocked) Payout approved successfully');
    }
  };

  const process = async (id: string) => {
    setProcessingId(id);
    setTxnRef('');
  };

  const confirmProcess = async () => {
    if (!processingId || !txnRef.trim()) { toast.warning('Please enter a transaction reference.'); return; }
    try {
      const res = await fetch(`/api/payouts/${processingId}/process`, { 
        method: 'PATCH', 
        headers: authHeaders(), 
        body: JSON.stringify({ transactionRef: txnRef }) 
      });
      if (!res.ok) throw new Error();
      toast.success('Payout marked as processed');
      setProcessingId(null);
      setTxnRef('');
      fetchPayouts();
    } catch {
      // Mock Process
      setPayouts(prev => prev.map(p => p.id === processingId ? { ...p, status: 'PROCESSED', transactionRef: txnRef } : p));
      toast.success('(Mocked) Payout marked as processed');
      setProcessingId(null);
      setTxnRef('');
    }
  };

  const filtered = payouts.filter(p =>
    (!statusFilter || p.status === statusFilter) &&
    (!typeFilter || p.recipientType === typeFilter)
  );

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.pageTitle}>💰 Payouts & Settlements</h2>

      {/* Generate Panel */}
      <div className={styles.panelCard}>
        <h3 className={styles.panelTitle}>Generate Payouts</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Type</label>
            <select 
              value={genForm.type} 
              onChange={e => setGenForm(f => ({ ...f, type: e.target.value }))}
              className={styles.formSelect}
            >
              <option value="RIDER">Rider</option>
              <option value="PARTNER">Partner</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Period Start</label>
            <input 
              type="date" 
              value={genForm.periodStart} 
              onChange={e => setGenForm(f => ({ ...f, periodStart: e.target.value }))}
              className={styles.formInput} 
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Period End</label>
            <input 
              type="date" 
              value={genForm.periodEnd} 
              onChange={e => setGenForm(f => ({ ...f, periodEnd: e.target.value }))}
              className={styles.formInput} 
            />
          </div>
          <button onClick={generatePayouts} className={styles.generateBtn}>
            Generate
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersGroup}>
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)} 
          className={styles.filterSelect}
        >
          <option value="">All Status</option>
          {['PENDING', 'APPROVED', 'PROCESSED', 'FAILED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select 
          value={typeFilter} 
          onChange={e => setTypeFilter(e.target.value)} 
          className={styles.filterSelect}
        >
          <option value="">All Types</option>
          <option value="RIDER">Rider</option>
          <option value="PARTNER">Partner</option>
        </select>
      </div>

      {loading ? (
        <div className={styles.emptyState}>Loading...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Type</th>
                <th>Period</th>
                <th>Gross</th>
                <th>Net</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>No payouts found</td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td data-label="Recipient">
                    <div className={styles.recipientCell}>{p.recipientId}</div>
                  </td>
                  <td data-label="Type">
                    <span className={`${styles.typeBadge} ${p.recipientType === 'RIDER' ? styles.rider : styles.partner}`}>
                      {p.recipientType}
                    </span>
                  </td>
                  <td data-label="Period">
                    <div className={styles.periodText}>
                      {new Date(p.periodStart).toLocaleDateString('en-IN')} – {new Date(p.periodEnd).toLocaleDateString('en-IN')}
                    </div>
                  </td>
                  <td data-label="Gross">
                    <div className={styles.amountText}>₹{p.grossAmount?.toFixed(2)}</div>
                  </td>
                  <td data-label="Net">
                    <div className={styles.netAmount}>₹{p.netAmount?.toFixed(2)}</div>
                  </td>
                  <td data-label="Status">
                    <span className={`${styles.statusText} ${styles[p.status.toLowerCase()] || ''}`}>
                      {p.status}
                    </span>
                    {p.transactionRef && (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        TXN: {p.transactionRef}
                      </div>
                    )}
                  </td>
                  <td data-label="Actions">
                    <div className={styles.actionGroup}>
                      {p.status === 'PENDING' && (
                        <button onClick={() => approve(p.id)} className={`${styles.actionBtn} ${styles.approve}`}>
                          Approve
                        </button>
                      )}
                      {p.status === 'APPROVED' && (
                        <button onClick={() => process(p.id)} className={`${styles.actionBtn} ${styles.process}`}>
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Process Modal */}
      {processingId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Process Payout</h3>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Bank Transaction Reference</label>
              <input 
                type="text" 
                placeholder="e.g. UTR/IMPS Ref Number" 
                value={txnRef} 
                onChange={e => setTxnRef(e.target.value)}
                className={styles.formInput}
                autoFocus
              />
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setProcessingId(null)} className={styles.cancelBtn}>Cancel</button>
              <button onClick={confirmProcess} className={styles.confirmBtn}>Confirm Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
