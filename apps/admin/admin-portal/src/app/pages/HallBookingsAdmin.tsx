import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, DollarSign, User, FileText, CheckCircle, XCircle } from 'lucide-react';

interface HallBooking {
  id: string;
  customer?: { name: string; email: string; mobile: string };
  hall?: { name: string; restaurant?: { name: string } };
  eventDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  status: string;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
}

export default function HallBookingsAdmin() {
  const [bookings, setBookings] = useState<HallBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const url = filterStatus === 'ALL' ? '/api/hall-bookings' : `/api/hall-bookings?status=${filterStatus}`;
      const res = await axios.get(url);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to change booking status to ${newStatus}?`)) return;
    try {
      await axios.patch(`/api/hall-bookings/${id}/status`, { status: newStatus });
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert('Failed to update booking status.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return { bg: '#dcfce7', text: '#166534' };
      case 'PENDING': return { bg: '#fef9c3', text: '#854d0e' };
      case 'CANCELLED': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a' }}>Hall & Event Bookings</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>Monitor and manage all party and function bookings</p>
        </div>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
        >
          <option value="ALL">All Bookings</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Event Info</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Customer</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Financials</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading bookings...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No bookings found for the selected filter.</td></tr>
            ) : (
              bookings.map(booking => (
                <tr key={booking.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                      {booking.hall?.name || 'Unknown Hall'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} /> {new Date(booking.eventDate).toLocaleDateString()} ({booking.startTime} - {booking.endTime})
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontWeight: 500 }}>
                      <User size={16} /> {booking.customer?.name || 'Guest User'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {booking.customer?.email || booking.customer?.mobile || 'No contact details'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#0f172a', fontWeight: 600 }}>
                      <DollarSign size={16} /> {booking.totalAmount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Adv: ₹{booking.advanceAmount.toLocaleString()} | Bal: ₹{booking.balanceAmount.toLocaleString()}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      background: getStatusColor(booking.status).bg, 
                      color: getStatusColor(booking.status).text, 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600 
                    }}>
                      {booking.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <FileText size={16} /> Details
                      </button>
                      {booking.status === 'PENDING' && (
                        <button onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')} style={{ background: '#dcfce7', color: '#166534', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {booking.status !== 'CANCELLED' && (
                        <button onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
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
