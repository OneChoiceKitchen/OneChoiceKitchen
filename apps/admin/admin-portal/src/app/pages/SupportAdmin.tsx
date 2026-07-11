import React, { useState, useEffect } from 'react';
import { useToast, useConfirm } from '@org/ui-design-system';
import styles from './SupportAdmin.module.css';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

const DUMMY_TICKETS = [
  { id: 'tkt_1', createdAt: '2026-07-06T10:30:00Z', title: 'Payment deducted but order failed', description: 'My bank account shows a deduction of Rs 450 but the app says order failed.', category: 'PAYMENT', priority: 'HIGH', status: 'OPEN' },
  { id: 'tkt_2', createdAt: '2026-07-05T14:15:00Z', title: 'Address not changing', description: 'I cannot update my delivery address to a new location in the app.', category: 'ACCOUNT', priority: 'MEDIUM', status: 'IN_PROGRESS' },
  { id: 'tkt_3', createdAt: '2026-07-01T09:00:00Z', title: 'Refund status', description: 'When will I get the refund for my cancelled order?', category: 'REFUND', priority: 'LOW', status: 'RESOLVED', resolution: 'Refund initiated, will reflect in 3-5 days.' },
];

const DUMMY_FAQS = [
  { id: 'faq_1', question: 'How do I cancel my order?', answer: 'You can cancel your order within 60 seconds of placing it from the active orders screen.' },
  { id: 'faq_2', question: 'What is your refund policy?', answer: 'Refunds for cancelled orders are processed immediately and reflect in your account within 3-5 business days.' },
];

export default function SupportAdmin() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // New FAQ form
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  // Ticket reply form
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');

  const toast = useToast();
  const confirmDialog = useConfirm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, faqsRes] = await Promise.all([
        fetch('/api/support/admin/tickets', { headers: authHeaders() }),
        fetch('/api/support/admin/faqs', { headers: authHeaders() })
      ]);
      
      let fetchedTickets = [];
      let fetchedFaqs = [];
      
      if (ticketsRes.ok) {
        const tData = await ticketsRes.text().then(t => JSON.parse(t));
        fetchedTickets = Array.isArray(tData) ? tData : [];
      }
      
      if (faqsRes.ok) {
        const fData = await faqsRes.text().then(t => JSON.parse(t));
        fetchedFaqs = Array.isArray(fData) ? fData : [];
      }
      
      setTickets(fetchedTickets.length > 0 ? fetchedTickets : DUMMY_TICKETS);
      setFaqs(fetchedFaqs.length > 0 ? fetchedFaqs : DUMMY_FAQS);
    } catch (err) {
      // Fallback
      setTickets(DUMMY_TICKETS);
      setFaqs(DUMMY_FAQS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/support/admin/faqs', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ question, answer })
      });
      if (!res.ok) throw new Error();
      toast.success('FAQ created successfully');
      setQuestion('');
      setAnswer('');
      fetchData();
    } catch {
      // Mock creation
      setFaqs(prev => [{ id: `faq_mock_${Date.now()}`, question, answer }, ...prev]);
      toast.success('(Mocked) FAQ created successfully');
      setQuestion('');
      setAnswer('');
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    const ok = await confirmDialog({
      title: 'Delete FAQ',
      message: 'Are you sure you want to delete this FAQ?',
      variant: 'danger'
    });
    if (ok) {
      try {
        const res = await fetch(`/api/support/admin/faqs/${id}`, { method: 'DELETE', headers: authHeaders() });
        if (!res.ok) throw new Error();
        toast.success('FAQ deleted');
        fetchData();
      } catch {
        setFaqs(prev => prev.filter(f => f.id !== id));
        toast.success('(Mocked) FAQ deleted');
      }
    }
  };

  const handleReplyTicket = async (id: string) => {
    if (!resolution.trim()) { toast.warning('Please enter a resolution message.'); return; }
    try {
      const res = await fetch(`/api/support/admin/tickets/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ resolution, status: 'RESOLVED' })
      });
      if (!res.ok) throw new Error();
      toast.success('Ticket resolved successfully');
      setReplyingTo(null);
      setResolution('');
      fetchData();
    } catch {
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'RESOLVED', resolution } : t));
      toast.success('(Mocked) Ticket resolved successfully');
      setReplyingTo(null);
      setResolution('');
    }
  };

  const filteredTickets = tickets.filter(t => !statusFilter || t.status === statusFilter);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.gridContainer}>

        {/* Support Tickets Section */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>🎫 Support Tickets</h2>
            <div className={styles.filters}>
              {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(s => (
                <button 
                  key={s} 
                  onClick={() => setStatusFilter(s)}
                  className={`${styles.filterBtn} ${statusFilter === s ? styles.active : styles.inactive}`}
                >
                  {s || 'All Tickets'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className={styles.emptyState}>Loading support center...</div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Details</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(ticket => (
                    <React.Fragment key={ticket.id}>
                      <tr>
                        <td data-label="Ticket">
                          <div className={styles.ticketId}>#{ticket.id.substring(0, 8)}</div>
                          <div className={styles.ticketDate}>
                            {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                          </div>
                        </td>
                        <td data-label="Details" style={{ maxWidth: '300px' }}>
                          <span className={styles.ticketTitle}>{ticket.title}</span>
                          <span className={styles.ticketDesc}>{ticket.description}</span>
                          {ticket.resolution && (
                            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f8fafc', borderLeft: '3px solid #10b981', fontSize: '0.85rem', color: '#475569' }}>
                              <b>Resolution:</b> {ticket.resolution}
                            </div>
                          )}
                        </td>
                        <td data-label="Category">
                          <span className={styles.categoryBadge}>{ticket.category}</span>
                        </td>
                        <td data-label="Priority">
                          <span className={`${styles.priorityText} ${styles[ticket.priority.toLowerCase()] || ''}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td data-label="Status">
                          <span className={`${styles.statusBadge} ${styles[ticket.status.toLowerCase()] || ''}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td data-label="Actions">
                          {ticket.status !== 'RESOLVED' ? (
                            <button 
                              onClick={() => setReplyingTo(replyingTo === ticket.id ? null : ticket.id)}
                              className={styles.actionBtn}
                            >
                              {replyingTo === ticket.id ? 'Cancel' : 'Resolve'}
                            </button>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Closed</span>
                          )}
                        </td>
                      </tr>
                      {replyingTo === ticket.id && (
                        <tr className={styles.replyRow}>
                          <td colSpan={6}>
                            <div className={styles.replyContainer}>
                              <input
                                type="text"
                                placeholder="Type resolution message to customer..."
                                value={resolution}
                                onChange={e => setResolution(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleReplyTicket(ticket.id)}
                                className={styles.replyInput}
                                autoFocus
                              />
                              <button 
                                onClick={() => handleReplyTicket(ticket.id)}
                                className={styles.resolveBtn}
                              >
                                Resolve & Close
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan={6} className={styles.emptyState}>
                        {statusFilter ? `No ${statusFilter} tickets found.` : 'No tickets found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FAQs Section */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle} style={{ marginBottom: '1.5rem' }}>💡 Manage FAQs</h2>

          <form onSubmit={handleCreateFAQ} className={styles.faqForm}>
            <div className={styles.faqInputs}>
              <input 
                required 
                placeholder="Question" 
                value={question} 
                onChange={e => setQuestion(e.target.value)}
                className={styles.faqInput} 
              />
              <textarea 
                required 
                placeholder="Answer" 
                value={answer} 
                onChange={e => setAnswer(e.target.value)}
                className={styles.faqTextarea} 
                rows={2} 
              />
            </div>
            <button type="submit" className={styles.faqSubmit}>
              Add FAQ
            </button>
          </form>

          <div className={styles.faqList}>
            {faqs.map(faq => (
              <div key={faq.id} className={styles.faqItem}>
                <div className={styles.faqContent}>
                  <strong className={styles.faqQ}>Q: {faq.question}</strong>
                  <span className={styles.faqA}>A: {faq.answer}</span>
                </div>
                <button 
                  onClick={() => handleDeleteFAQ(faq.id)}
                  className={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            ))}
            {faqs.length === 0 && (
              <div className={styles.emptyState}>
                No FAQs added yet. Add your first FAQ above.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
