'use client';
import React, { useState } from 'react';
import { ArrowLeft, Calendar, Users } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export default function BookVenue() {
  const router = useRouter();
  const { id } = useParams();
  
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('');
  const [eventType, setEventType] = useState('Marriage');
  
  const handleBooking = () => {
    // In a real app, this would make an API call to create the booking for venue ID with 'REQUESTED' status
    alert(`Booking request submitted for venue ${id}! Waiting for Partner approval.`);
    router.push('/');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} color="#0f172a" />
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Booking Request</h1>
      </div>

      <div style={{ padding: '1.5rem 1rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Event Details</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Event Type</label>
            <select 
              value={eventType}
              onChange={e => setEventType(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#0f172a', outline: 'none' }}
            >
              <option value="Marriage">Marriage / Reception</option>
              <option value="Birthday">Birthday Party</option>
              <option value="Corporate">Corporate Event</option>
              <option value="Gathering">Family Gathering</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Event Date</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Calendar size={18} />
              </div>
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Expected Guests</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Users size={18} />
              </div>
              <input 
                type="number" 
                placeholder="e.g. 200"
                value={guests}
                onChange={e => setGuests(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '12px', color: '#991b1b', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '2rem' }}>
          <strong>Note:</strong> Submitting this request will notify the venue owner. Once approved, you will be prompted to make the advance payment to confirm your booking.
        </div>

        <button 
          onClick={handleBooking}
          disabled={!date || !guests}
          style={{ 
            width: '100%', background: (!date || !guests) ? '#fca5a5' : '#ef4444', 
            color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', 
            fontWeight: 700, fontSize: '1rem', cursor: (!date || !guests) ? 'not-allowed' : 'pointer' 
          }}
        >
          Submit Request
        </button>
      </div>
    </div>
  );
}
