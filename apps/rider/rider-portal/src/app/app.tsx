import styles from './app.module.css';
import React, { useState, useEffect } from 'react';
import { GlobalMetadataInjector, useToast } from '@org/ui-design-system';
import { BrandFooter } from '@org/ui-design-system';
import axios from 'axios';
import PortalCards from './PortalCards';
import HowItWorks from './HowItWorks';
import StaticPageViewer from './StaticPageViewer';
import EarningsRider from './EarningsRider';
import HRMSRider from './HRMSRider';
import InternalChatPanel from './InternalChatPanel';
import { DownloadPage } from './DownloadPage';
import { Dashboard } from './components/Dashboard';

export function MainApp({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'deliveries' | 'staff' | 'howItWorks' | 'earnings' | 'chat' | 'page' | 'downloads'>('deliveries');
  const [activeDeliveryId, setActiveDeliveryId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [pageSlug, setPageSlug] = useState('');
  
  const [riderStatus, setRiderStatus] = useState<string>('PENDING'); // Default to restricted
  const [riderId, setRiderId] = useState('');

  useEffect(() => {
    // Read the status set during login
    const storedStatus = localStorage.getItem('rider_status');
    if (storedStatus) setRiderStatus(storedStatus);
  }, []);
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState<{ riderId?: string; pin?: string; general?: string; mobile?: string; otp?: string }>({});
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [riderLoading, setRiderLoading] = useState(true);

  useEffect(() => {
    setRiderLoading(true);
    const timer = setTimeout(() => {
      setRiderLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Synchronized Shared Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const toast = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/api/orders');
        if (res.data && res.data.length > 0) {
          const formatted = res.data.map((o: any) => ({
            id: o.id,
            customer: o.user?.name || 'Guest User',
            items: o.items?.map((i: any) => `${i.quantity}x ${i.menuItem?.name || 'Item'}`).join(', ') || 'Various Items',
            total: o.totalAmount,
            status: o.status,
            rider: o.rider?.name || 'Unassigned',
            address: o.user?.address || '123 Main St',
            paymentMethod: o.paymentMethod || 'ONLINE',
            codAmount: o.codAmount || o.totalAmount,
            codCollected: o.codCollected || false,
            itemsVerified: o.itemsVerified || false
          }));
          setOrders(formatted);
        } else {
          const initial = [
            { id: '4829', customer: 'Amit Kumar', address: 'B-102, Shanti Vihar', status: 'Ready', rider: 'Unassigned', total: 520, paymentMethod: 'COD', codAmount: 520, codCollected: false, itemsVerified: false },
            { id: '4830', customer: 'Sneha Patel', address: '45, Ring Road', status: 'Picked up', rider: 'Ravi Kumar', total: 390, paymentMethod: 'ONLINE', codAmount: 0, codCollected: false, itemsVerified: true }
          ];
          setOrders(initial);
        }
      } catch (err) {
        console.error('Failed to fetch orders for rider', err);
      }
    };
    fetchOrders();
    
    let socket: any;
    import('socket.io-client').then(({ io }) => {
      socket = io((window as any).__VITE_API_URL__ || 'http://localhost:3000');

      socket.on('newOrder', (order: any) => {
        fetchOrders(); // refresh on new order
      });

      socket.on('orderStatusChanged', (data: any) => {
        setOrders(prev => prev.map(ord => ord.id === data.orderId ? { ...ord, status: data.status } : ord));
      });
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  // --- TOP-LEVEL STAFF STATES & HANDLERS ---
  const [clockedIn, setClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState<string | null>(null);
  
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [comments, setComments] = useState('');

  const [reqs, setReqs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const res = await axios.get('/api/employees/my-leaves');
        const formatted = res.data.map((r: any) => {
          const data = JSON.parse(r.requestedData);
          return {
            id: r.id,
            employeeName: 'Current User', // we don't have name without fetching user, but rider portal only shows own
            leaveType: data.leaveType,
            startDate: data.startDate,
            endDate: data.endDate,
            status: r.status,
            comments: data.comments
          };
        });
        setReqs(formatted);
      } catch (err) {
        console.error('Failed to fetch leave requests', err);
      }
    };
    fetchLeaveRequests();
  }, []);

  const handleRequestLeave = async (e: any) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.warning('Please select start and end dates.');
      return;
    }
    try {
      await axios.post('/api/employees/leaves', {
        leaveType, startDate, endDate, comments
      });
      toast.success('Leave request logged successfully! Transferred to Admin moderation roster.');
      setStartDate('');
      setEndDate('');
      setComments('');
      
      // refetch
      const res = await axios.get('/api/employees/my-leaves');
      const formatted = res.data.map((r: any) => {
        const data = JSON.parse(r.requestedData);
        return {
          id: r.id,
          employeeName: 'Current User',
          leaveType: data.leaveType,
          startDate: data.startDate,
          endDate: data.endDate,
          status: r.status,
          comments: data.comments
        };
      });
      setReqs(formatted);
    } catch (err) {
      console.error('Failed to request leave', err);
      toast.error('Failed to submit leave request');
    }
  };


  const handleClaimOrder = async (id: string) => {
    const verifyCheckbox = document.getElementById(`verify-${id}`) as HTMLInputElement;
    if (verifyCheckbox && !verifyCheckbox.checked) {
      toast.warning('Please check the verification box to confirm you have verified all items in the order.');
      return;
    }
    try {
      if (id === '4829' || id === '4830') {
        const nextOrders = orders.map(ord => ord.id === id ? { ...ord, rider: 'Ravi Kumar', status: 'Picked up', itemsVerified: true } : ord);
        setOrders(nextOrders);
        setActiveDeliveryId(id);
        toast.success(`Order #${id} has been claimed successfully and marked Picked up!`);
        return;
      }
      await axios.patch(`/api/orders/${id}`, { status: 'Picked up', itemsVerified: true, riderId: 'current-rider-id' });
      const nextOrders = orders.map(ord => ord.id === id ? { ...ord, rider: 'Ravi Kumar', status: 'Picked up', itemsVerified: true } : ord);
      setOrders(nextOrders);
      setActiveDeliveryId(id);
      toast.success(`Order #${id} has been claimed successfully and marked Picked up!`);
    } catch (err) {
      console.error('Failed to claim order', err);
    }
  };

  const handleDeliverOrder = async (id: string) => {
    const ord = orders.find(o => o.id === id);
    let codCollected = false;
    if (ord && ord.paymentMethod === 'COD') {
      const codCheckbox = document.getElementById(`cod-${id}`) as HTMLInputElement;
      if (!codCheckbox || !codCheckbox.checked) {
        toast.warning('Please confirm that you have collected the cash before marking as delivered.');
        return;
      }
      codCollected = true;
    }
    try {
      if (id === '4829' || id === '4830') {
        const nextOrders = orders.map(o => o.id === id ? { ...o, status: 'Delivered', codCollected } : o);
        setOrders(nextOrders);
        setActiveDeliveryId(null);
        toast.success(`Order #${id} marked as DELIVERED! Status synced across Admin and Partner portals.`);
        return;
      }
      await axios.patch(`/api/orders/${id}`, { status: 'Delivered', codCollected });
      const nextOrders = orders.map(o => o.id === id ? { ...o, status: 'Delivered', codCollected } : o);
      setOrders(nextOrders);
      setActiveDeliveryId(null);
      toast.success(`Order #${id} marked as DELIVERED! Status synced across Admin and Partner portals.`);
    } catch (err) {
      console.error('Failed to deliver order', err);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName || !mobile || mobile.length < 10) {
      setErrors({ general: 'Please provide Name and a valid 10-digit Mobile number' });
      return;
    }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      toast.info('OTP sent! (Use 1234 for testing)');
    }, 800);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      if (isRegister && !otpSent) {
        // Step 1: Request OTP for registration
        const checkRes = await axios.post('/api/auth/request-otp', { phone: mobile });
        setOtpSent(true);
        setLoading(false);
        return;
      }

      if (isRegister && otpSent) {
        // Step 2: Verify OTP and Register
        const verRes = await axios.post('/api/auth/verify-otp', { phone: mobile, otp });
        if (!verRes.data.success) {
           setErrors({ general: 'Invalid OTP' });
           return;
        }

        await axios.post('/api/riders/register', {
          fullName: loginName,
          mobile: mobile,
          vehicleType: 'Bike'
        });
        toast.success('Registration request submitted! Please wait for Admin approval.');
        setIsRegister(false); // send back to login
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: riderId, password: pin })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      
      const meRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      });
      if (!meRes.ok) throw new Error('Failed to load profile');
      const meData = await meRes.json();

      if (meData.role !== 'RIDER' && meData.role !== 'SUPER_ADMIN') {
        throw new Error('Unauthorized: Rider access required');
      }

      localStorage.setItem("rider_token", data.access_token);
      localStorage.setItem("rider_role", meData.role);
      // Store their status so we can block/allow them in the main app
      if (meData.status) {
         localStorage.setItem("rider_status", meData.status);
      }
      
      window.location.reload();

    } catch (err: any) {
      setErrors({ general: err.message || err.response?.data?.message || 'An error occurred during the process.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (item: any) => {
    setSelectedCard(item);
    setActiveTab('howItWorks');
  };

  const myActiveDeliveries = orders.filter(ord => ord.rider === 'Ravi Kumar' && ord.status !== 'Delivered');
  const claimableDeliveries = orders.filter(ord => ord.rider === 'Unassigned' && ord.status === 'Ready');

  return (
    <div className={styles.dashboardWrapper}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src="/Logo.webp" alt="One Choice Kitchen" style={{ height: '40px' }} />
          <div>
            <div style={{ fontWeight: 'bold', color: '#2563EB', lineHeight: 1.2 }}>ONE CHOICE KITCHEN</div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.5px' }}>ALL YOUR CRAVINGS. ONE KITCHEN</div>
          </div>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${activeTab === 'deliveries' ? styles.activeTab : ''}`} onClick={() => setActiveTab('deliveries')}>
              <span>🛵</span> Deliveries
            </button>
            <button className={`${styles.tab} ${activeTab === 'earnings' ? styles.activeTab : ''}`} onClick={() => setActiveTab('earnings')}>
              <span>💰</span> Earnings
            </button>
            <button className={`${styles.tab} ${activeTab === 'staff' ? styles.activeTab : ''}`} onClick={() => setActiveTab('staff')}>
              <span>👨‍🍳</span> Staff Hub
            </button>
            <button className={`${styles.tab} ${activeTab === 'howItWorks' ? styles.activeTab : ''}`} onClick={() => { setSelectedCard(null); setActiveTab('howItWorks'); }}>
              <span>ℹ️</span> How It Works
            </button>
            <button className={`${styles.tab} ${activeTab === 'chat' ? styles.activeTab : ''}`} onClick={() => setActiveTab('chat')}>
              <span>💬</span> Team Chat
            </button>
            <button className={`${styles.tab} ${activeTab === 'downloads' ? styles.activeTab : ''}`} onClick={() => setActiveTab('downloads')}>
              <span>📲</span> Download Apps
            </button>
          </div>
          <span className={styles.onlineBadge}>● Online: Ravi Kumar</span>
          <button className={styles.logoutBtn} onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
        
        {/* Render Deliveries Tab */}
        {activeTab === 'deliveries' && (
          <>
            {/* Show Portal Cards only in Dashboard / Deliveries view */}
            <PortalCards portalName="rider" onCardClick={handleCardClick} />

            <Dashboard />
          </>
        )}

        {activeTab === 'earnings' && <EarningsRider />}

        {/* Render Staff Tab */}
        {activeTab === 'staff' && <HRMSRider />}

        {/* Internal Chat Tab */}
        {activeTab === 'chat' && (
          <div style={{ padding: '0.5rem 0' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>💬 Team Communication</h2>
            <InternalChatPanel tokenKey="rider_token" userIdKey="rider_user_id" userNameKey="rider_name" />
          </div>
        )}

        {/* Render How It Works Tab */}
        {activeTab === 'howItWorks' && (
          <HowItWorks activeCard={selectedCard} onBack={() => setActiveTab('deliveries')} />
        )}

        {/* Render Static Page */}
        {activeTab === 'page' && (
          <StaticPageViewer slug={pageSlug} onBack={() => setActiveTab('deliveries')} />
        )}

        {/* Download Apps */}
        {activeTab === 'downloads' && (
          <div style={{ padding: '1.5rem 0' }}>
            <DownloadPage />
          </div>
        )}

      </div>

      <div style={{ marginTop: 'auto', padding: '0 2rem' }}>
        <BrandFooter portalType="rider" onFooterLinkClick={(slug) => { setPageSlug(slug); setActiveTab('page'); }} />
      </div>
      <GlobalMetadataInjector portalName="Rider Portal" />
    </div>
  );
}

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [riderId, setRiderId] = useState('');
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState<{ riderId?: string; pin?: string; general?: string; mobile?: string; otp?: string }>({});
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const toast = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName || !mobile || mobile.length < 10) {
      setErrors({ general: 'Please provide Name and a valid 10-digit Mobile number' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await axios.post('/api/auth/request-otp', { phone: mobile });
      setOtpSent(true);
      toast.info('OTP sent! (Use 1234 for testing)');
    } catch (err: any) {
      setErrors({ general: err.response?.data?.message || 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (isRegister) {
      setLoading(true);
      try {
        const verRes = await axios.post('/api/auth/verify-otp', { phone: mobile, otp });
        if (!verRes.data.success) {
           setErrors({ general: 'Invalid OTP' });
           setLoading(false);
           return;
        }
        await axios.post('/api/riders/register', {
          fullName: loginName,
          mobile: mobile,
          vehicleType: 'Bike'
        });
        toast.success('Registration request submitted! Please wait for Admin approval.');
        setIsRegister(false); // send back to login
      } catch (err: any) {
        setErrors({ general: err.response?.data?.message || 'Failed to register' });
      } finally {
        setLoading(false);
      }
      return;
    }

    let hasError = false;
    const newErrors: { riderId?: string; pin?: string; general?: string } = {};

    if (!riderId.trim()) {
      newErrors.riderId = 'Email / Rider ID is required';
      hasError = true;
    }

    if (!pin) {
      newErrors.pin = 'Password / PIN code is required';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Automatically map their mobile number Rider ID to the backend email format
      const formattedEmail = riderId.includes('@') ? riderId : `${riderId}@rider.com`;
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formattedEmail, password: pin })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      
      const meRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      });
      if (!meRes.ok) throw new Error('Failed to load profile');
      const meData = await meRes.json();

      if (meData.role !== 'RIDER' && meData.role !== 'SUPER_ADMIN') {
        throw new Error('Unauthorized: Rider access required');
      }

      localStorage.setItem("rider_token", data.access_token);
      localStorage.setItem("rider_role", meData.role);
      
      onLogin();
    } catch (err: any) {
      setErrors({ general: err.message || 'Incorrect credentials.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
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
        {/* Logo / Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <img src="/Logo.webp" alt="Logo Icon" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
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
          {isRegister ? 'Register as a delivery partner' : 'Login to start your delivery shift'}
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

          {isRegister ? (
            <>
              {!otpSent ? (
                <>
                  <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rahul Sharma" 
                      value={loginName}
                      onChange={(e: any) => setLoginName(e.target.value)}
                      style={{ width: '100%', padding: '0.9rem 1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }} 
                    />
                  </div>
                  <div style={{ marginBottom: '1.75rem', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Mobile Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. 9876543210" 
                      value={mobile}
                      onChange={(e: any) => setMobile(e.target.value)}
                      style={{ width: '100%', padding: '0.9rem 1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }} 
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleSendOtp}
                    disabled={loading}
                    style={{ width: '100%', background: '#2563EB', color: 'white', padding: '1rem', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 84, 166, 0.2)', marginBottom: '1rem' }}
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '1.75rem', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Enter OTP</label>
                    <input 
                      type="text" 
                      placeholder="••••••" 
                      maxLength={6}
                      value={otp}
                      onChange={(e: any) => setOtp(e.target.value)}
                      style={{ width: '100%', padding: '0.9rem 1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }} 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    style={{ width: '100%', background: '#10b981', color: 'white', padding: '1rem', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)', marginBottom: '1rem' }}
                  >
                    {loading ? 'Verifying...' : 'Verify & Sign Up'}
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Email / Rider ID</label>
                <input 
                  type="text" 
                  placeholder="rider@test.com" 
                  value={riderId}
                  onChange={(e: any) => setRiderId(e.target.value)}
                  style={{ width: '100%', padding: '0.9rem 1.1rem', borderRadius: '12px', border: errors.riderId ? '1.5px solid #DC2626' : '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }} 
                />
                {errors.riderId && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem' }}>{errors.riderId}</p>}
              </div>

              <div style={{ marginBottom: '1.75rem', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Password / PIN</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={pin}
                  onChange={(e: any) => setPin(e.target.value)}
                  style={{ width: '100%', padding: '0.9rem 1.1rem', borderRadius: '12px', border: errors.pin ? '1.5px solid #DC2626' : '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }} 
                />
                {errors.pin && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem' }}>{errors.pin}</p>}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ width: '100%', background: '#2563EB', color: 'white', padding: '1rem', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 84, 166, 0.2)', marginBottom: '1rem' }}
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </>
          )}

          <div style={{ textAlign: 'center' }}>
            <button 
              type="button" 
              onClick={() => setIsRegister(!isRegister)}
              style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
            >
              {isRegister ? 'Already a rider? Sign In' : "Want to deliver? Sign Up"}
            </button>
          </div>
        </form>

        {/* Test Credentials Helper Box */}
        <div style={{ marginTop: '1.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', textAlign: 'left' }}>
          <h4 style={{ color: '#2563EB', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', marginTop: 0 }}>🛵 Test Rider Credentials</h4>
          <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 0.25rem' }}>
            <strong>Email:</strong> <span style={{ fontFamily: 'monospace', color: '#334155' }}>rider@test.com</span>
          </p>
          <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0' }}>
            <strong>Password:</strong> <span style={{ fontFamily: 'monospace', color: '#334155' }}>test123</span>
          </p>
        </div>
      </div>
      <GlobalMetadataInjector portalName="Rider Portal" />
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const logged = localStorage.getItem("rider_token");
    if (logged) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("rider_token");
    localStorage.removeItem("rider_role");
    localStorage.removeItem("rider_status");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <>
      <GlobalMetadataInjector portalName="Rider Portal" />
      <MainApp onLogout={handleLogout} />
    </>
  );
}
