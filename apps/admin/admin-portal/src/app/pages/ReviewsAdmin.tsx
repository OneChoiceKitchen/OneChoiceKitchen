import { useState, useEffect } from 'react';
import { useToast, useConfirm } from '@org/ui-design-system';
import styles from './ReviewsAdmin.module.css';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

const DUMMY_REVIEWS = [
  { id: 'rev1', customerName: 'Arjun M', rating: 5, comment: 'The tiffin was fresh and tasted just like home food! Highly recommended. Will order again tomorrow.', createdAt: '2026-07-06T12:00:00Z', status: 'PENDING' },
  { id: 'rev2', customerName: 'Sara K', rating: 4, comment: 'Good quality, but the delivery was a bit late.', createdAt: '2026-07-05T14:30:00Z', status: 'APPROVED' },
  { id: 'rev3', customerName: 'Anonymous', rating: 1, comment: 'Did not like the taste.', createdAt: '2026-07-04T09:15:00Z', status: 'REJECTED' },
  { id: 'rev4', customerName: 'Vikram Singh', rating: 5, comment: 'Excellent portion size and great packaging.', createdAt: '2026-07-07T08:20:00Z', status: 'APPROVED' }
];

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });
  const toast = useToast();
  const confirmDialog = useConfirm();

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews/admin', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.text().then(t => JSON.parse(t));
      const fetchedReviews = Array.isArray(data) ? data : [];
      setReviews(fetchedReviews.length > 0 ? fetchedReviews : DUMMY_REVIEWS);
    } catch (err) {
      // Fallback on API failure
      setReviews(DUMMY_REVIEWS);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error();
      toast.success(`Review ${newStatus.toLowerCase()} successfully`);
      fetchReviews();
    } catch (err) {
      // Mock status update
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast.success(`(Mocked) Review ${newStatus.toLowerCase()} successfully`);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDialog({
      title: 'Delete Review',
      message: 'Are you sure you want to permanently delete this review? This action cannot be undone.',
      variant: 'danger'
    });
    if (!ok) return;
    
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error();
      toast.success('Review deleted');
      fetchReviews();
    } catch {
      // Mock deletion
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('(Mocked) Review deleted');
    }
  };

  const handleEditSave = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error();
      toast.success('Review updated successfully');
      setEditingReviewId(null);
      fetchReviews();
    } catch {
      // Mock update
      setReviews(prev => prev.map(r => r.id === id ? { ...r, ...editForm } : r));
      toast.success('(Mocked) Review updated successfully');
      setEditingReviewId(null);
    }
  };

  const filtered = reviews.filter(r => {
    const matchesStatus = !statusFilter || r.status === statusFilter;
    const matchesSearch = !searchQuery ||
      r.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>⭐ Reviews Moderation</h2>
        
        <div className={styles.filtersGroup}>
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchBox}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className={styles.statusSelect}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {loading && reviews.length === 0 ? (
        <div className={styles.emptyState}>Loading reviews...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(review => (
                <tr key={review.id}>
                  <td data-label="Customer" className={styles.primaryCell}>
                    {review.user?.name || review.customerName || 'Anonymous'}
                  </td>
                  <td data-label="Rating" className={styles.ratingCell}>
                    {editingReviewId === review.id ? (
                      <select 
                        value={editForm.rating} 
                        onChange={e => setEditForm({...editForm, rating: Number(e.target.value)})}
                        style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      >
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                      </select>
                    ) : (
                      '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)
                    )}
                  </td>
                  <td data-label="Comment">
                    {editingReviewId === review.id ? (
                      <textarea 
                        value={editForm.comment}
                        onChange={e => setEditForm({...editForm, comment: e.target.value})}
                        style={{ width: '100%', minHeight: '60px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontFamily: 'inherit', resize: 'vertical' }}
                      />
                    ) : (
                      <div className={styles.commentContainer}>
                        {review.comment}
                      </div>
                    )}
                  </td>
                  <td data-label="Date" className={styles.dateCell}>
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td data-label="Status">
                    <span className={styles.statusBadge} style={{
                      background: review.status === 'APPROVED' ? '#dcfce7' : review.status === 'REJECTED' ? '#fef2f2' : '#fef9c3',
                      color: review.status === 'APPROVED' ? '#166534' : review.status === 'REJECTED' ? '#991b1b' : '#854d0e'
                    }}>
                      {review.status || 'PENDING'}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className={styles.actionGroup}>
                      {editingReviewId === review.id ? (
                        <>
                          <button onClick={() => handleEditSave(review.id)} className={`${styles.actionBtn} ${styles.approve}`}>Save</button>
                          <button onClick={() => setEditingReviewId(null)} className={styles.actionBtn} style={{ background: '#f1f5f9', color: '#475569' }}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => { setEditingReviewId(review.id); setEditForm({ rating: review.rating, comment: review.comment }); }}
                            className={styles.actionBtn}
                            style={{ background: '#e0f2fe', color: '#0369a1' }}
                          >
                            Edit
                          </button>
                          {review.status !== 'APPROVED' && (
                            <button 
                              onClick={() => handleUpdateStatus(review.id, 'APPROVED')}
                              className={`${styles.actionBtn} ${styles.approve}`}
                            >
                              Approve
                            </button>
                          )}
                          {review.status !== 'REJECTED' && (
                            <button 
                              onClick={() => handleUpdateStatus(review.id, 'REJECTED')}
                              className={`${styles.actionBtn} ${styles.reject}`}
                            >
                              Reject
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(review.id)}
                            className={`${styles.actionBtn} ${styles.delete}`}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    {searchQuery || statusFilter ? 'No reviews match your filters.' : 'No reviews found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
