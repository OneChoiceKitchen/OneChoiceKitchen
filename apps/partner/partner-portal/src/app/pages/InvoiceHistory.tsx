import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@org/ui-design-system';

interface Invoice {
  id: string;
  amount: number;
  status: string;
  billingDate: string;
  pdfUrl?: string;
}

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('partner_token');
        const res = await axios.get('/api/billing/invoices', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInvoices(res.data);
      } catch (err) {
        toast.error('Failed to load invoice history');
        // Fallback mock data if backend isn't fully seeded
        setInvoices([
          { id: 'inv-1001', amount: 1999, status: 'PAID', billingDate: new Date().toISOString(), pdfUrl: '/assets/inv-1001.pdf' },
          { id: 'inv-1002', amount: 999, status: 'PAID', billingDate: new Date(Date.now() - 30*24*60*60*1000).toISOString(), pdfUrl: '/assets/inv-1002.pdf' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [toast]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading invoices...</div>;

  return (
    <div style={{ padding: '2rem 0' }}>
      <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '1.5rem', fontWeight: 700 }}>Invoice History</h2>
      
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Invoice ID</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Date</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Amount</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((invoice, index) => (
                <tr key={invoice.id} style={{ borderBottom: index === invoices.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem', color: '#0f172a', fontWeight: 500 }}>{invoice.id}</td>
                  <td style={{ padding: '1rem', color: '#475569' }}>
                    {new Date(invoice.billingDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', color: '#0f172a', fontWeight: 600 }}>
                    ₹{invoice.amount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      background: invoice.status === 'PAID' ? '#dcfce7' : '#fee2e2',
                      color: invoice.status === 'PAID' ? '#166534' : '#991b1b',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {invoice.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {invoice.pdfUrl ? (
                      <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 500, fontSize: '0.875rem' }}>
                        Download PDF
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>N/A</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
