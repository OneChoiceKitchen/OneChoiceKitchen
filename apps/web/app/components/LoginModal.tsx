'use client';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';

export default function LoginModal() {
  const { setLoggedIn, isLoginModalOpen, setLoginModalOpen } = useGlobalContext();
  
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const persistSession = (accessToken: string) => {
    localStorage.setItem('customer_token', accessToken);
    localStorage.setItem('saas_loggedIn', 'true');
    setLoggedIn(true);
    setLoginModalOpen(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    let hasError = false;
    const newErrors: { name?: string; email?: string; password?: string; general?: string } = {};

    if (isRegister && !name) {
      newErrors.name = 'Full name is required';
      hasError = true;
    }

    if (!email) {
      newErrors.email = 'Email address is required';
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      hasError = true;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister ? { name, email, password: password } : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrors({ general: err.message || 'Invalid email or password. Please try again.' });
        return;
      }

      const data = await res.json();
      if (data.access_token) {
        persistSession(data.access_token);
      } else {
        setErrors({ general: 'Authentication failed. Please try again.' });
      }
    } catch {
      setErrors({ general: 'Unable to reach the server. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #fff)',
        borderRadius: '24px',
        padding: '2rem 1.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: 'rgba(0, 0, 0, 0.3) 0px 25px 50px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <button 
          onClick={() => setLoginModalOpen(false)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <img src="/branding/logo-icon.png" alt="Logo Icon" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontFamily: '"Oswald", sans-serif', fontSize: '24px', lineHeight: 1, margin: 0, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#2563EB' }}>ONE</span> <span style={{ color: '#ED1C24' }}>CHOICE</span> <span style={{ color: '#2563EB' }}>KITCHEN</span>
            </span>
            <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#2563EB', marginTop: '4px' }}>
              ALL YOUR CRAVINGS. ONE KITCHEN
            </span>
          </div>
        </div>
        <p style={{ color: 'rgb(100, 116, 139)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          {isRegister ? 'Create a new account' : 'Access your One Choice Kitchen subscription'}
        </p>

        <form onSubmit={handleLogin} noValidate>
          {errors.general && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#DC2626',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              ⚠️ {errors.general}
            </div>
          )}

          {isRegister && (
            <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.9rem 1.1rem', 
                  borderRadius: '12px', 
                  border: errors.name ? '1.5px solid #DC2626' : '1px solid #e2e8f0', 
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontSize: '0.95rem', 
                  boxSizing: 'border-box',
                  outline: 'none',
                }} 
              />
              {errors.name && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem' }}>{errors.name}</p>}
            </div>
          )}

          <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Email Address</label>
            <input 
              type="email" 
              placeholder="customer@test.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.9rem 1.1rem', 
                borderRadius: '12px', 
                border: errors.email ? '1.5px solid #DC2626' : '1px solid #e2e8f0', 
                background: '#f8fafc',
                color: '#0f172a',
                fontSize: '0.95rem', 
                boxSizing: 'border-box',
                outline: 'none',
              }} 
            />
            {errors.email && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem' }}>{errors.email}</p>}
          </div>

          <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.9rem 1.1rem', 
                borderRadius: '12px', 
                border: errors.password ? '1.5px solid #DC2626' : '1px solid #e2e8f0', 
                background: '#f8fafc',
                color: '#0f172a',
                fontSize: '0.95rem', 
                boxSizing: 'border-box',
                outline: 'none',
              }} 
            />
            {errors.password && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem' }}>{errors.password}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              background: 'linear-gradient(135deg, #2563EB 0%, #2563EB 100%)', 
              color: 'white', 
              padding: '1rem', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: 600, 
              cursor: loading ? 'not-allowed' : 'pointer', 
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(0, 56, 147, 0.25)',
            }}
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
          
          <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <span 
              onClick={() => { setIsRegister(!isRegister); setErrors({}); }}
              style={{ color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </span>
          </div>
        </form>

        <div style={{
          marginTop: '2rem',
          background: 'rgba(0, 56, 147, 0.05)',
          border: '1px solid rgba(0, 56, 147, 0.15)',
          borderRadius: '12px',
          padding: '1rem',
          textAlign: 'left'
        }}>
          <h4 style={{ color: '#2563EB', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>🔑 Test Account Credentials</h4>
          <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 0.25rem' }}>
            <strong>Email:</strong> <span style={{ fontFamily: 'monospace', color: '#0f172a' }}>customer@test.com</span>
          </p>
          <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0' }}>
            <strong>Password:</strong> <span style={{ fontFamily: 'monospace', color: '#0f172a' }}>test123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
