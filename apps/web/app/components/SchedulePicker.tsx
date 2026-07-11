import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

export default function SchedulePicker({ onSchedule }: { onSchedule: (date: string, time: string) => void }) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleConfirm = () => {
    if (date && time) {
      onSchedule(date, time);
      setIsScheduling(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsScheduling(!isScheduling)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'white', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
      >
        <Calendar size={18} color="#2563eb" /> 
        {date && time ? `${date} at ${time}` : 'Schedule Order'}
      </button>

      {isScheduling && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', minWidth: '300px', zIndex: 50 }}>
          <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700, color: '#0f172a' }}>Schedule for later</h4>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Select Date</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
              <Calendar size={16} color="#64748b" style={{ marginRight: '0.5rem' }} />
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', color: '#0f172a', background: 'transparent' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Select Time</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
              <Clock size={16} color="#64748b" style={{ marginRight: '0.5rem' }} />
              <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', color: '#0f172a', background: 'transparent' }} />
            </div>
          </div>

          <button 
            onClick={handleConfirm}
            disabled={!date || !time}
            style={{ width: '100%', padding: '0.75rem', background: (!date || !time) ? '#cbd5e1' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: (!date || !time) ? 'not-allowed' : 'pointer' }}
          >
            Confirm Schedule
          </button>
        </div>
      )}
    </div>
  );
}
