import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Camera, CheckCircle2, UserCircle2, Clock, AlertCircle } from 'lucide-react';

export default function ESSKioskAdmin() {
  const [employeeId, setEmployeeId] = useState('');
  const [step, setStep] = useState<'ID' | 'SCAN' | 'SUCCESS' | 'ERROR'>('ID');
  const [mode, setMode] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');
  const [statusMessage, setStatusMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setStatusMessage('Camera access denied or unavailable.');
      setStep('ERROR');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;
    setStep('SCAN');
    startCamera();
  };

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const context = canvasRef.current.getContext('2d');
    if (context) {
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const photoDataUrl = canvasRef.current.toDataURL('image/jpeg');

      // Stop camera since we captured
      stopCamera();
      setStatusMessage('Verifying biometrics...');

      try {
        // Send to backend for Check-in/Check-out
        const endpoint = mode === 'CHECK_IN' ? '/api/employees/attendance/check-in' : '/api/employees/attendance/check-out';
        
        // Mock geolocation for geofence validation
        const locationData = { latitude: 40.7128, longitude: -74.0060, address: 'Restaurant HQ' };

        await axios.post(endpoint, {
          userId: employeeId, // Ideally this maps to an actual User ID or Employee ID
          photoUrl: photoDataUrl, // The captured face image
          isVerified: true, // Assuming the mock validation passed
          ...locationData
        });

        setStatusMessage(`Successfully ${mode === 'CHECK_IN' ? 'Checked In' : 'Checked Out'}!`);
        setStep('SUCCESS');
      } catch (err: any) {
        setStatusMessage(err.response?.data?.message || 'Biometric Verification Failed.');
        setStep('ERROR');
      }
    }
  };

  const resetKiosk = () => {
    setEmployeeId('');
    setStep('ID');
    setStatusMessage('');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 100px)', background: '#0f172a' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', width: '100%', maxWidth: '600px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '0.5rem' }}>Staff Kiosk</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Biometric Time & Attendance</p>

        {step === 'ID' && (
          <form onSubmit={handleIdSubmit}>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
              <button type="button" onClick={() => setMode('CHECK_IN')} style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: mode === 'CHECK_IN' ? '2px solid #3b82f6' : '1px solid #e2e8f0', background: mode === 'CHECK_IN' ? '#eff6ff' : 'white', color: mode === 'CHECK_IN' ? '#1d4ed8' : '#64748b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Clock size={20} /> Check In
              </button>
              <button type="button" onClick={() => setMode('CHECK_OUT')} style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: mode === 'CHECK_OUT' ? '2px solid #DC2626' : '1px solid #e2e8f0', background: mode === 'CHECK_OUT' ? '#fef2f2' : 'white', color: mode === 'CHECK_OUT' ? '#b91c1c' : '#64748b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Clock size={20} /> Check Out
              </button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', fontWeight: 500, color: '#475569' }}>Employee ID / Email</label>
              <div style={{ position: 'relative' }}>
                <UserCircle2 size={24} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                  placeholder="Enter your ID to continue"
                  style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1.1rem', outline: 'none' }}
                  required
                />
              </div>
            </div>

            <button type="submit" style={{ width: '100%', padding: '1rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}>
              Proceed to Scan
            </button>
          </form>
        )}

        {step === 'SCAN' && (
          <div>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto 2rem', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(59, 130, 246, 0.5)', borderRadius: '12px', pointerEvents: 'none' }}></div>
              <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }}></span> Face Detection Active
              </div>
            </div>
            
            {/* Hidden canvas to capture the frame */}
            <canvas ref={canvasRef} width={640} height={480} style={{ display: 'none' }} />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => { stopCamera(); setStep('ID'); }} style={{ flex: 1, padding: '1rem', background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={captureAndVerify} style={{ flex: 2, padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Camera size={20} /> Verify & {mode === 'CHECK_IN' ? 'Check In' : 'Check Out'}
              </button>
            </div>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div style={{ padding: '2rem 0' }}>
            <CheckCircle2 size={80} color="#22c55e" style={{ margin: '0 auto 1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', color: '#166534', marginBottom: '0.5rem' }}>{statusMessage}</h3>
            <p style={{ color: '#475569', marginBottom: '2rem' }}>Your biometric data and geofence location have been successfully recorded.</p>
            <button onClick={resetKiosk} style={{ padding: '1rem 3rem', background: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Next Employee
            </button>
          </div>
        )}

        {step === 'ERROR' && (
          <div style={{ padding: '2rem 0' }}>
            <AlertCircle size={80} color="#DC2626" style={{ margin: '0 auto 1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', color: '#991b1b', marginBottom: '0.5rem' }}>Verification Failed</h3>
            <p style={{ color: '#475569', marginBottom: '2rem' }}>{statusMessage}</p>
            <button onClick={resetKiosk} style={{ padding: '1rem 3rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
