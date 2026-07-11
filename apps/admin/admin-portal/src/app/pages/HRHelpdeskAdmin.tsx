import { useState } from 'react';
import { MessageSquare, Check } from 'lucide-react';
import styles from './HRHelpdeskAdmin.module.css';
import HRModal from './HRModal';
import modalStyles from './HRModal.module.css';

const INITIAL_TICKETS = [
  { id: 'tk1', subject: 'Payslip discrepancy for June', requestedBy: 'Dave Wilson', role: 'Rider', date: '2026-07-07', priority: 'High', status: 'open', messages: [{ sender: 'Dave', text: 'My COD deduction is wrong.' }] },
  { id: 'tk2', subject: 'Leave application rejected automatically', requestedBy: 'Alice Smith', role: 'Head Chef', date: '2026-07-06', priority: 'Medium', status: 'progress', messages: [{ sender: 'Alice', text: 'I applied for sick leave but it auto-rejected.' }] },
  { id: 'tk3', subject: 'New uniform request', requestedBy: 'Charlie Brown', role: 'Packer', date: '2026-07-01', priority: 'Low', status: 'resolved', messages: [{ sender: 'Charlie', text: 'Need a size L uniform.' }, { sender: 'HR', text: 'Allocated in system.' }] },
];

export default function HRHelpdeskAdmin() {
  const [filter, setFilter] = useState('all');
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <span className={`${styles.badge} ${styles.open}`}>Open</span>;
      case 'progress': return <span className={`${styles.badge} ${styles.progress}`}>In Progress</span>;
      case 'resolved': return <span className={`${styles.badge} ${styles.resolved}`}>Resolved</span>;
      default: return null;
    }
  };

  const handleOpenModal = (ticket: any) => {
    setSelectedTicket(ticket);
    setReplyText('');
    setIsModalOpen(true);
  };

  const handleReply = () => {
    if (!replyText.trim()) return;
    
    setTickets(tickets.map(t => {
      if (t.id === selectedTicket.id) {
        const newTicket = { 
          ...t, 
          status: t.status === 'open' ? 'progress' : t.status,
          messages: [...t.messages, { sender: 'HR Admin', text: replyText }] 
        };
        setSelectedTicket(newTicket);
        return newTicket;
      }
      return t;
    }));
    setReplyText('');
  };

  const handleResolve = () => {
    setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'resolved' } : t));
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  const currentList = tickets.filter(t => filter === 'all' || t.status === filter);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>HR Helpdesk</h1>
          <p className={styles.pageSubtitle}>Manage employee queries, grievances, and support tickets.</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <select 
          className={styles.filterSelect}
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">All Tickets</option>
          <option value="open">Open Tickets</option>
          <option value="progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className={styles.panel}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ticket Subject</th>
                <th>Requested By</th>
                <th>Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentList.map(ticket => (
                <tr key={ticket.id}>
                  <td>
                    <p className={styles.ticketSubject}>{ticket.subject}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>#{ticket.id}</p>
                  </td>
                  <td>
                    {ticket.requestedBy}
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8' }}>{ticket.role}</span>
                  </td>
                  <td>{ticket.date}</td>
                  <td style={{ fontWeight: 500 }}>{ticket.priority}</td>
                  <td>{getStatusBadge(ticket.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className={styles.actionBtn} title="View Conversation" onClick={() => handleOpenModal(ticket)}>
                        <MessageSquare size={16} />
                      </button>
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
        title={`Ticket #${selectedTicket?.id}: ${selectedTicket?.subject}`}
      >
        {selectedTicket && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Requested By: {selectedTicket.requestedBy}</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Status: {selectedTicket.status.toUpperCase()}</p>
              </div>
              {selectedTicket.status !== 'resolved' && (
                <button className={modalStyles.btnSubmit} style={{ background: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'center' }} onClick={handleResolve}>
                  <Check size={16} /> Mark Resolved
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
              {selectedTicket.messages.map((msg: any, idx: number) => (
                <div key={idx} style={{ padding: '0.75rem', borderRadius: '8px', background: msg.sender === 'HR Admin' ? '#eff6ff' : '#f1f5f9', alignSelf: msg.sender === 'HR Admin' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', fontSize: '0.8rem', color: msg.sender === 'HR Admin' ? '#1d4ed8' : '#475569' }}>{msg.sender}</p>
                  <p style={{ margin: 0 }}>{msg.text}</p>
                </div>
              ))}
            </div>

            {selectedTicket.status !== 'resolved' && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <input 
                  type="text" 
                  className={modalStyles.input} 
                  placeholder="Type your reply..." 
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />
                <button className={modalStyles.btnSubmit} onClick={handleReply}>Reply</button>
              </div>
            )}
          </div>
        )}
      </HRModal>
    </div>
  );
}
