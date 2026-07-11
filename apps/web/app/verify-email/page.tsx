'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, Shield, ArrowRight, MessageSquare } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [step, setStep] = useState<'verifying_email' | 'email_verified' | 'otp_sent' | 'verified'>('verifying_email');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid verification link. Missing token or email.');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setStep('email_verified');
        } else {
          setError(data.message || 'Email verification failed.');
        }
      } catch (err) {
        setError('Connection failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, email]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setError(null);
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile, channel: 'WHATSAPP' }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('otp_sent');
      } else {
        setError(data.message || 'Failed to send WhatsApp OTP.');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter the verification OTP.');
      return;
    }

    setError(null);
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile, otp }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        localStorage.setItem('customer_token', data.access_token);
        localStorage.setItem('saas_loggedIn', 'true');
        setStep('verified');
        setTimeout(() => {
          router.push('/');
          window.location.reload();
        }, 2000);
      } else {
        setError(data.message || 'Invalid or expired OTP.');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '3rem 2rem',
        width: '100%',
        maxWidth: '460px',
        boxShadow: 'rgba(0, 0, 0, 0.08) 0px 15px 35px',
        border: '1px solid #f1f5f9',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', background: '#2563EB', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>
            O
          </div>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>ONE CHOICE KITCHEN</span>
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: '#64748b' }}>Verifying your email address...</p>
            <style jsx>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '1rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem' }}>{error}</span>
          </div>
        )}

        {!loading && step === 'verifying_email' && error && (
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem' }}>Verification Failed</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>We were unable to verify your email link.</p>
            <button
              onClick={() => router.push('/')}
              style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Back to Home
            </button>
          </div>
        )}

        {step === 'email_verified' && (
          <div>
            <div style={{ color: '#16a34a', marginBottom: '1rem' }}>
              <CheckCircle size={48} style={{ margin: '0 auto' }} />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.5rem' }}>Email Verified!</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Your email has been confirmed. Now complete WhatsApp verification.</p>
            
            <form onSubmit={handleRequestOtp} style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>WhatsApp Mobile Number</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter 10-digit number"
                  style={{ flex: 1, padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem' }}
                  required
                />
                <button
                  type="submit"
                  disabled={otpLoading}
                  style={{
                    background: '#2563EB',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: otpLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  {otpLoading ? 'Sending...' : 'Get OTP'} <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'otp_sent' && (
          <div>
            <div style={{ color: '#2563EB', marginBottom: '1rem' }}>
              <MessageSquare size={48} style={{ margin: '0 auto' }} />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.5rem' }}>WhatsApp OTP Sent</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>We sent a verification code to WhatsApp: <strong>{mobile}</strong></p>
            
            <form onSubmit={handleVerifyOtp} style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Enter Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-Digit OTP"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem', letterSpacing: '2px', textAlign: 'center', marginBottom: '1rem' }}
                required
              />
              <button
                type="submit"
                disabled={otpLoading}
                style={{
                  width: '100%',
                  background: '#2563EB',
                  color: 'white',
                  border: 'none',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: otpLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {otpLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          </div>
        )}

        {step === 'verified' && (
          <div>
            <div style={{ color: '#16a34a', marginBottom: '1.5rem' }}>
              <CheckCircle size={56} style={{ margin: '0 auto' }} />
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.5rem' }}>Account Activated!</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Welcome to One Choice Kitchen. Redirecting you to home page...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
