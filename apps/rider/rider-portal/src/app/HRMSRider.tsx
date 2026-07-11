import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Camera, MapPin, Calendar, DollarSign, Clock, ShieldCheck } from 'lucide-react';
import { useToast } from '@org/ui-design-system';

export default function HRMSRider() {
  const [activeTab, setActiveTab] = useState('attendance');
  
  // Attendance State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [isCheckIn, setIsCheckIn] = useState(true);

  // Leave State
  const [leaves, setLeaves] = useState<any[]>([]);
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Payroll State
  const [payslips, setPayslips] = useState<any[]>([]);
  const toast = useToast();

  useEffect(() => {
    if (activeTab === 'leaves') fetchLeaves();
    if (activeTab === 'payroll') fetchPayroll();
  }, [activeTab]);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get('/api/employees/my-leaves');
      const formatted = res.data.map((r: any) => {
        const d = JSON.parse(r.requestedData);
        return { id: r.id, status: r.status, type: d.leaveType, start: d.startDate, end: d.endDate };
      });
      setLeaves(formatted);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPayroll = async () => {
    try {
      const res = await axios.get('/api/employees/my-payroll');
      setPayslips(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const submitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/employees/leaves', { leaveType, startDate, endDate, comments: '' });
      toast.success('Leave requested successfully');
      setStartDate(''); setEndDate('');
      fetchLeaves();
    } catch (e) {
      toast.error('Error requesting leave');
    }
  };

  const startCamera = async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(ms);
      if (videoRef.current) videoRef.current.srcObject = ms;
    } catch (err) {
      setStatusMsg('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
  };

  const handleAttendance = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const photo = canvasRef.current.toDataURL('image/jpeg');
      stopCamera();
      
      // Get Geolocation
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const ep = isCheckIn ? '/api/employees/attendance/check-in' : '/api/employees/attendance/check-out';
          await axios.post(ep, {
            photoUrl: photo,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            address: 'GPS Location',
            isVerified: true
          });
          setStatusMsg(`Successfully ${isCheckIn ? 'Checked In' : 'Checked Out'}`);
        } catch (e: any) {
          setStatusMsg(e.response?.data?.message || 'Attendance failed');
        }
      }, (err) => {
        setStatusMsg('Location access is required for attendance.');
      });
    }
  };

  return (
    <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '12px', minHeight: '80vh' }}>
      <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '1.5rem' }}>HRMS & Self-Service</h2>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => setActiveTab('attendance')} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: activeTab === 'attendance' ? '#3b82f6' : 'white', color: activeTab === 'attendance' ? 'white' : '#64748b', cursor: 'pointer', fontWeight: 600 }}>Attendance</button>
        <button onClick={() => setActiveTab('leaves')} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: activeTab === 'leaves' ? '#3b82f6' : 'white', color: activeTab === 'leaves' ? 'white' : '#64748b', cursor: 'pointer', fontWeight: 600 }}>Leaves</button>
        <button onClick={() => setActiveTab('payroll')} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: activeTab === 'payroll' ? '#3b82f6' : 'white', color: activeTab === 'payroll' ? 'white' : '#64748b', cursor: 'pointer', fontWeight: 600 }}>Payslips</button>
      </div>

      {activeTab === 'attendance' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem' }}>Biometric Attendance with GPS</h3>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <button onClick={() => { setIsCheckIn(true); startCamera(); }} style={{ padding: '1rem 2rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={20} /> Check In</button>
            <button onClick={() => { setIsCheckIn(false); startCamera(); }} style={{ padding: '1rem 2rem', background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={20} /> Check Out</button>
          </div>

          {stream && (
            <div style={{ margin: '0 auto', maxWidth: '400px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }} />
              <canvas ref={canvasRef} width={640} height={480} style={{ display: 'none' }} />
              <button onClick={handleAttendance} style={{ width: '100%', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Capture & Verify</button>
            </div>
          )}

          {statusMsg && <p style={{ marginTop: '1rem', fontWeight: 'bold', color: '#0f172a' }}>{statusMsg}</p>}
        </div>
      )}

      {activeTab === 'leaves' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px' }}>
            <h3>Apply for Leave</h3>
            <form onSubmit={submitLeave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <select value={leaveType} onChange={e => setLeaveType(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option>Sick Leave</option>
                <option>Casual Leave</option>
                <option>Paid Leave</option>
              </select>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              <button type="submit" style={{ padding: '0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>Submit Request</button>
            </form>
          </div>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px' }}>
            <h3>Leave History</h3>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {leaves.map((l, i) => (
                <div key={i} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{l.type}</strong><br/>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{l.start} to {l.end}</span>
                  </div>
                  <span style={{ padding: '0.25rem 0.75rem', background: '#f1f5f9', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold', alignSelf: 'flex-start' }}>{l.status}</span>
                </div>
              ))}
              {leaves.length === 0 && <p>No leave requests found.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>My Payslips</h3>
          {payslips.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{p.month} {p.year}</strong>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Generated on: {new Date(p.generatedAt).toLocaleDateString()}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ display: 'block', fontSize: '1.1rem', color: '#0f172a' }}>₹{p.netPay}</strong>
                <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Download PDF</button>
              </div>
            </div>
          ))}
          {payslips.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No payslips available yet.</p>}
        </div>
      )}
    </div>
  );
}
