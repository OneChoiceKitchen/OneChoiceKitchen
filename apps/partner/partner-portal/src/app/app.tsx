import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserCog } from 'lucide-react';
import styles from './app.module.css';
import { GlobalMetadataInjector, useToast } from '@org/ui-design-system';
import { BrandFooter } from '@org/ui-design-system';
import PortalCards from './PortalCards';
import AnalyticsAdmin from './AnalyticsAdmin';
import InventoryManager from './pages/InventoryManager';
import StaticPageViewer from './StaticPageViewer';
import MenuManager from './pages/MenuManager';
import TiffinManagementAdmin from './TiffinManagementAdmin';
import EarningsPartner from './pages/EarningsPartner';
import BranchesPartner from './pages/BranchesPartner';
import CompliancePartner from './pages/CompliancePartner';
import ReservationsPartner from './pages/ReservationsPartner';
import StaffManagementAdmin from './StaffManagementAdmin';
import { TenantUserManager } from './components/TenantUserManager';
import ESSKioskAdmin from './ESSKioskAdmin';
import VenuesPartner from './pages/VenuesPartner';
import PackagesPartner from './pages/PackagesPartner';
import BookingsPartner from './pages/BookingsPartner';
import InternalChatPanel from './pages/InternalChatPanel';
import { DownloadPage } from './DownloadPage';
import BillingDashboard from './pages/BillingDashboard';
import KitchenBoard from './pages/KitchenBoard';
import PromotionsManager from './pages/PromotionsManager';
import { WebhooksManager } from './pages/WebhooksManager';
import { WebhookAuditLog } from './pages/WebhookAuditLog';
import { EventBookingManager } from './pages/events/EventBookingManager';

export function MainApp({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'staff' | 'tenant_users' | 'analytics' | 'inventory' | 'page' | 'menu' | 'tiffin' | 'earnings' | 'kiosk' | 'branches' | 'compliance' | 'reservations' | 'venues' | 'packages' | 'hall_bookings' | 'chat' | 'orders' | 'downloads' | 'billing' | 'kds' | 'promotions' | 'webhooks' | 'events'>('dashboard');
  const [pageSlug, setPageSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string; name?: string }>({});
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [loginName, setLoginName] = useState('');

  // ── Partner RBAC — load feature permissions on mount ──────────────────────
  const [permissions, setPermissions] = useState<Array<{ module: string; feature: string; isEnabled: boolean }>>([]);

  useEffect(() => {
    const token = localStorage.getItem('partner_token');
    if (token) {
      fetch('/api/partner/my-permissions', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
        .then(r => r.ok ? r.json() : [])
        .catch(() => [])
        .then(d => setPermissions(Array.isArray(d) ? d : []));
    }
  }, []);

  // Helper: check if this partner has access to a specific feature
  // Usage: can('food_ordering', 'fo_orders'), can('marketing', 'mk_coupons')
  const can = (module: string, feature: string): boolean =>
    permissions.some(p => p.module === module && p.feature === feature && p.isEnabled);

  // Helper: check if any feature in a module is enabled (show module nav item)
  const canModule = (module: string): boolean =>
    permissions.some(p => p.module === module && p.isEnabled);

  // ── Registration Flow state ────────────────────────────────────────────────
  const [restaurantName, setRestaurantName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);

  // Dynamic shared database state synchronizer
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
            rider: o.rider?.name || 'Unassigned'
          }));
          setOrders(formatted);
        } else {
          const initial = [
            { id: '4829', customer: 'Amit Kumar', items: '2x Paneer Tikka, Garlic Naan', total: 520, status: 'Preparing', rider: 'Ravi Kumar' },
            { id: '4830', customer: 'Sneha Patel', items: '1x Veg Noodles, Manchurian', total: 390, status: 'New', rider: 'Unassigned' }
          ];
          setOrders(initial);
        }
      } catch (err) {
        console.error('Failed to fetch orders', err);
      }
    };
    fetchOrders();

    let socket: any;
    // Use a runtime-safe API URL (import.meta.env is not available in CJS tsconfig)
    const apiUrl: string = (typeof window !== 'undefined' && (window as any).__VITE_API_URL__)
      ? (window as any).__VITE_API_URL__
      : 'http://localhost:3000';
    import('socket.io-client').then(({ io }) => {
      socket = io(apiUrl);

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
            employeeName: 'Current User', // local to this user
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


  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      // If it's a dummy ID, just update UI
      if (id === '4829' || id === '4830') {
        setOrders(orders.map(ord => ord.id === id ? { ...ord, status: newStatus } : ord));
        return;
      }
      await axios.patch(`/api/orders/${id}`, { status: newStatus });
      setOrders(orders.map(ord => ord.id === id ? { ...ord, status: newStatus } : ord));
    } catch (err) {
      console.error('Failed to update order status');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    let hasError = false;
    const newErrors: { email?: string; password?: string; general?: string; name?: string; mobile?: string; restaurantName?: string; otp?: string } = {};

    if (isRegister) {
      if (!loginName) {
        newErrors.name = 'Full Name is required for registration';
        hasError = true;
      }
      if (!restaurantName) {
        newErrors.restaurantName = 'Restaurant Name is required';
        hasError = true;
      }
      if (!mobile) {
        newErrors.mobile = 'Mobile Number is required';
        hasError = true;
      }
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

    if (otpSent && !otp) {
      newErrors.otp = 'OTP is required';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      if (isRegister && !otpSent) {
        // Step 1: Request OTP for registration
        const checkRes = await axios.post('/api/auth/request-otp', { phone: mobile, email });
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

        await axios.post('/api/partners/register', {
          restaurantName,
          ownerName: loginName,
          email,
          mobile,
          businessDetails: 'Registered via Partner Portal'
        });

        setRegistrationStatus('Your registration request has been submitted successfully and is awaiting Admin approval.');
        setIsRegister(false);
        setOtpSent(false);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      
      const meRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      });
      if (!meRes.ok) throw new Error('Failed to load profile');
      const meData = await meRes.json();

      if (meData.role !== 'PARTNER' && meData.role !== 'SUPER_ADMIN') {
        throw new Error('Unauthorized: Partner access required');
      }

      localStorage.setItem("partner_token", data.access_token);
      localStorage.setItem("partner_role", meData.role);
      if (meData.restaurantId) {
         localStorage.setItem("partner_restaurant_id", meData.restaurantId);
      }
      
      // Reload to activate main app
      window.location.reload();

    } catch (err: any) {
      setErrors({ general: err.message || err.response?.data?.message || 'An error occurred during the process.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (item: any) => {
    const title = item.title.toLowerCase();
    if (title.includes('analytics')) setActiveTab('analytics');
    else if (title.includes('inventory') || title.includes('stock')) setActiveTab('inventory');
    else if (title.includes('support')) setActiveTab('staff');
    else if (title.includes('earnings') || title.includes('revenue')) setActiveTab('earnings');
    else setActiveTab('orders'); // fallback
  };

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
            <button className={`${styles.tab} ${activeTab === 'orders' ? styles.activeTab : ''} ${!canModule('food_ordering') ? styles.lockedTab : ''}`} onClick={() => setActiveTab('orders')}>
              <span>{!canModule('food_ordering') ? '🔒' : '🥣'}</span> Live Orders
            </button>
            <button className={`${styles.tab} ${activeTab === 'kds' ? styles.activeTab : ''} ${!canModule('food_ordering') ? styles.lockedTab : ''}`} onClick={() => setActiveTab('kds')}>
              <span>{!canModule('food_ordering') ? '🔒' : '👨‍🍳'}</span> Kitchen Board
            </button>
            <button className={`${styles.tab} ${activeTab === 'menu' ? styles.activeTab : ''} ${!canModule('food_ordering') ? styles.lockedTab : ''}`} onClick={() => setActiveTab('menu')}>
              <span>{!canModule('food_ordering') ? '🔒' : '📋'}</span> Menu Builder
            </button>
            <button className={`${styles.tab} ${activeTab === 'inventory' ? styles.activeTab : ''} ${!canModule('food_ordering') ? styles.lockedTab : ''}`} onClick={() => setActiveTab('inventory')}>
              <span>{!canModule('food_ordering') ? '🔒' : '📦'}</span> Inventory
            </button>
            <button className={`${styles.tab} ${activeTab === 'promotions' ? styles.activeTab : ''} ${!canModule('food_ordering') ? styles.lockedTab : ''}`} onClick={() => setActiveTab('promotions')}>
              <span>{!canModule('food_ordering') ? '🔒' : '🏷️'}</span> Promotions
            </button>

            <button className={`${styles.tab} ${activeTab === 'reservations' ? styles.activeTab : ''} ${!canModule('dining') ? styles.lockedTab : ''}`} onClick={() => setActiveTab('reservations')}>
              <span>{!canModule('dining') ? '🔒' : '🍽️'}</span> Reservations
            </button>

            <button className={`${styles.tab} ${activeTab === 'venues' ? styles.activeTab : ''} ${!canModule('hall_party') ? styles.lockedTab : ''}`} onClick={() => setActiveTab('venues')}>
              <span>{!canModule('hall_party') ? '🔒' : '🏰'}</span> My Venues
            </button>
            <button className={`${styles.tab} ${activeTab === 'packages' ? styles.activeTab : ''} ${!canModule('hall_party') ? styles.lockedTab : ''}`} onClick={() => setActiveTab('packages')}>
              <span>{!canModule('hall_party') ? '🔒' : '🎉'}</span> Packages
            </button>
            <button className={`${styles.tab} ${activeTab === 'hall_bookings' ? styles.activeTab : ''} ${!canModule('hall_party') ? styles.lockedTab : ''}`} onClick={() => setActiveTab('hall_bookings')}>
              <span>{!canModule('hall_party') ? '🔒' : '📅'}</span> Bookings
            </button>

            <button className={`${styles.tab} ${activeTab === 'tiffin' ? styles.activeTab : ''} ${!canModule('tiffin') ? styles.lockedTab : ''}`} onClick={() => setActiveTab('tiffin')}>
              <span>{!canModule('tiffin') ? '🔒' : '🍱'}</span> Tiffin Plans
            </button>

            <button className={`${styles.tab} ${activeTab === 'staff' ? styles.activeTab : ''} ${!canModule('hrms') ? styles.lockedTab : ''}`} onClick={() => setActiveTab('staff')}>
              <Users size={18} />
              <span>Staff (HRMS)</span>
            </button>
            <button className={`${styles.tab} ${activeTab === 'tenant_users' ? styles.activeTab : ''} ${!canModule('users') ? styles.lockedTab : ''}`} onClick={() => setActiveTab('tenant_users')}>
              <UserCog size={18} />
              <span>Tenant Users</span>
            </button>
            <button className={`${styles.tab} ${activeTab === 'kiosk' ? styles.activeTab : ''} ${!canModule('hrms') ? styles.lockedTab : ''}`} onClick={() => setActiveTab('kiosk')}>
              <span>{!canModule('hrms') ? '🔒' : '📸'}</span> Staff Kiosk
            </button>

            <button className={`${styles.tab} ${activeTab === 'analytics' ? styles.activeTab : ''} ${!canModule('analytics') ? styles.lockedTab : ''}`} onClick={() => setActiveTab('analytics')}>
              <span>{!canModule('analytics') ? '🔒' : '📈'}</span> Analytics
            </button>

            <button className={`${styles.tab} ${activeTab === 'earnings' ? styles.activeTab : ''} ${!canModule('finance') ? styles.lockedTab : ''}`} onClick={() => setActiveTab('earnings')}>
              <span>{!canModule('finance') ? '🔒' : '💰'}</span> Earnings
            </button>

            <button className={`${styles.tab} ${activeTab === 'billing' ? styles.activeTab : ''}`} onClick={() => setActiveTab('billing')}>
              <span>💳</span> Billing & Subscriptions
            </button>

            {/* Core features that don't require specific module subscriptions */}
            <button className={`${styles.tab} ${activeTab === 'branches' ? styles.activeTab : ''}`} onClick={() => setActiveTab('branches')}>
              <span>🏢</span> Branches
            </button>
            <button className={`${styles.tab} ${activeTab === 'compliance' ? styles.activeTab : ''}`} onClick={() => setActiveTab('compliance')}>
              <span>✅</span> Compliance
            </button>
            <button className={`${styles.tab} ${activeTab === 'chat' ? styles.activeTab : ''}`} onClick={() => setActiveTab('chat')}>
              <span>💬</span> Team Chat
            </button>
            <button className={`${styles.tab} ${activeTab === 'downloads' ? styles.activeTab : ''}`} onClick={() => setActiveTab('downloads')}>
              <span>📲</span> Download Apps
            </button>
            <button className={`${styles.tab} ${activeTab === 'webhooks' ? styles.activeTab : ''}`} onClick={() => setActiveTab('webhooks')}>
              <span>🔗</span> Webhooks
            </button>
            <button className={`${styles.tab} ${activeTab === 'events' ? styles.activeTab : ''}`} onClick={() => setActiveTab('events')}>
              <span>📅</span> Event Engine
            </button>
          </div>
          <button className={styles.logoutBtn} onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <div style={{ padding: '0 2rem', flex: 1 }}>
        <PortalCards portalName="partner" onCardClick={handleCardClick} />

        {/* Helper function to wrap locked modules */}
        {(() => {
          const checkAccess = (module: string) => {
            if (canModule(module)) return true;
            return false;
          };

          const LockedScreen = ({ moduleName }: { moduleName: string }) => (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
              <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '0.5rem', fontWeight: 800 }}>Subscription Required</h2>
              <p style={{ color: '#64748b', maxWidth: '400px', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Your current plan does not include access to the <strong>{moduleName}</strong> module. Please upgrade your subscription via the Admin to unlock these features.
              </p>
              <button onClick={() => setActiveTab('dashboard')} style={{ background: '#2563EB', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                Return to Dashboard
              </button>
            </div>
          );

          if (activeTab === 'orders' && !checkAccess('food_ordering')) return <LockedScreen moduleName="Food Ordering" />;
          if (activeTab === 'kds' && !checkAccess('food_ordering')) return <LockedScreen moduleName="Food Ordering" />;
          if (activeTab === 'menu' && !checkAccess('food_ordering')) return <LockedScreen moduleName="Food Ordering" />;
          if (activeTab === 'inventory' && !checkAccess('food_ordering')) return <LockedScreen moduleName="Food Ordering" />;
          if (activeTab === 'promotions' && !checkAccess('food_ordering')) return <LockedScreen moduleName="Food Ordering" />;
          if (activeTab === 'reservations' && !checkAccess('dining')) return <LockedScreen moduleName="Dining Management" />;
          if ((activeTab === 'venues' || activeTab === 'packages' || activeTab === 'hall_bookings') && !checkAccess('hall_party')) return <LockedScreen moduleName="Hall & Party Booking" />;
          if (activeTab === 'tiffin' && !checkAccess('tiffin')) return <LockedScreen moduleName="Tiffin Subscriptions" />;
          if ((activeTab === 'staff' || activeTab === 'kiosk') && !checkAccess('hrms')) return <LockedScreen moduleName="HRMS" />;
          if (activeTab === 'analytics' && !checkAccess('analytics')) return <LockedScreen moduleName="Advanced Analytics" />;
          if (activeTab === 'earnings' && !checkAccess('finance')) return <LockedScreen moduleName="Finance" />;

          return null; // Return null if accessed properly, so the standard components render below
        })()}

        {/* Render Orders Tab */}
        {activeTab === 'orders' && canModule('food_ordering') && (
          <div className={styles.ordersGrid}>
            {orders.length > 0 ? (
              orders.map((ord: any) => (
                <div key={ord.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Order <strong>#{ord.id}</strong></span>
                    <span style={{ 
                      background: ord.status === 'Preparing' ? '#fef08a' : ord.status === 'Ready' ? '#dcfce7' : ord.status === 'New' ? '#eff6ff' : '#f1f5f9',
                      color: ord.status === 'Preparing' ? '#854d0e' : ord.status === 'Ready' ? '#166534' : ord.status === 'New' ? '#2563eb' : '#475569',
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '8px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600 
                    }}>{ord.status}</span>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.1rem' }}>{ord.customer}</h3>
                    <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>{ord.items}</p>
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{ord.total}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {ord.status === 'New' && <button onClick={() => handleUpdateStatus(ord.id, 'Preparing')} style={{ background: '#2563EB', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Accept</button>}
                      {ord.status === 'Preparing' && <button onClick={() => handleUpdateStatus(ord.id, 'Ready')} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Mark Ready</button>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: '#64748b' }}>No active orders.</div>
            )}
          </div>
        )}

        {/* Render Kitchen Board Tab */}
        {activeTab === 'kds' && canModule('food_ordering') && <KitchenBoard />}

        {/* Render Staff Tab */}
        {activeTab === 'staff' && canModule('hrms') && <StaffManagementAdmin />}
        {activeTab === 'tenant_users' && canModule('users') && <TenantUserManager />}

        {/* Render Analytics Tab */}
        {activeTab === 'analytics' && canModule('analytics') && <AnalyticsAdmin />}
        {/* Render Inventory Tab */}
        {activeTab === 'inventory' && canModule('food_ordering') && <InventoryManager />}
        {/* Render Promotions Tab */}
        {activeTab === 'promotions' && canModule('food_ordering') && <PromotionsManager />}
        {/* Render Menu Tab */}
        {activeTab === 'menu' && canModule('food_ordering') && <MenuManager />}
        {/* Render Tiffin Tab */}
        {activeTab === 'tiffin' && canModule('tiffin') && <TiffinManagementAdmin />}
        {/* Render Earnings Tab */}
        {activeTab === 'earnings' && canModule('finance') && <EarningsPartner />}
        
        {/* Core modules always available */}
        {activeTab === 'branches' && <BranchesPartner />}
        {activeTab === 'compliance' && <CompliancePartner />}
        
        {/* Render Reservations Tab */}
        {activeTab === 'reservations' && canModule('dining') && <ReservationsPartner />}
        {/* Render Kiosk Tab */}
        {activeTab === 'kiosk' && canModule('hrms') && <ESSKioskAdmin />}
        {/* Render Party Booking Tabs */}
        {activeTab === 'venues' && canModule('hall_party') && <VenuesPartner />}
        {activeTab === 'packages' && canModule('hall_party') && <PackagesPartner />}
        {activeTab === 'hall_bookings' && canModule('hall_party') && <BookingsPartner />}
        {/* Internal Chat */}
        {activeTab === 'chat' && (
          <div style={{ padding: '1.5rem 0' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>💬 Internal Team Chat</h2>
            <InternalChatPanel tokenKey="partner_token" userIdKey="partner_user_id" userNameKey="partner_name" />
          </div>
        )}
        {activeTab === 'page' && <StaticPageViewer slug={pageSlug} onBack={() => setActiveTab('dashboard')} />}
        {activeTab === 'downloads' && (
          <div style={{ padding: '1.5rem 0' }}>
            <DownloadPage />
          </div>
        )}
        {activeTab === 'billing' && (
          <div style={{ padding: '1.5rem 0' }}>
            <BillingDashboard />
          </div>
        )}
        {activeTab === 'webhooks' && (
          <div style={{ padding: '1.5rem 0' }}>
            <WebhooksManager />
            <WebhookAuditLog />
          </div>
        )}
        {activeTab === 'events' && (
          <div style={{ padding: '1.5rem 0' }}>
            <EventBookingManager />
          </div>
        )}

      </div>

      <div style={{ marginTop: 'auto', padding: '0 2rem' }}>
        <BrandFooter portalType="partner" onFooterLinkClick={(slug) => { setPageSlug(slug); setActiveTab('page'); }} />
      </div>
      <GlobalMetadataInjector portalName="Partner Portal" />
    </div>
  );
}

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string; name?: string }>({});
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [loginName, setLoginName] = useState('');
  
  // Registration Flow state
  const [restaurantName, setRestaurantName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    let hasError = false;
    const newErrors: { email?: string; password?: string; general?: string; name?: string; mobile?: string; restaurantName?: string; otp?: string } = {};

    if (isRegister) {
      if (!loginName) {
        newErrors.name = 'Full Name is required for registration';
        hasError = true;
      }
      if (!restaurantName) {
        newErrors.restaurantName = 'Restaurant Name is required';
        hasError = true;
      }
      if (!mobile) {
        newErrors.mobile = 'Mobile Number is required';
        hasError = true;
      }
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
    }

    if (otpSent && !otp) {
      newErrors.otp = 'OTP is required';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      if (isRegister && !otpSent) {
        // Step 1: Request OTP for registration
        await axios.post('/api/auth/request-otp', { phone: mobile, email });
        setOtpSent(true);
        setLoading(false);
        return;
      }

      if (isRegister && otpSent) {
        // Step 2: Verify OTP and Register
        const verRes = await axios.post('/api/auth/verify-otp', { phone: mobile, otp });
        if (!verRes.data.success) {
           setErrors({ general: 'Invalid OTP' });
           setLoading(false);
           return;
        }

        await axios.post('/api/partners/register', {
          restaurantName,
          ownerName: loginName,
          email,
          mobile,
          businessDetails: 'Registered via Partner Portal'
        });

        setRegistrationStatus('Your registration request has been submitted successfully and is awaiting Admin approval.');
        setIsRegister(false);
        setOtpSent(false);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      
      const meRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      });
      if (!meRes.ok) throw new Error('Failed to load profile');
      const meData = await meRes.json();

      if (meData.role !== 'PARTNER' && meData.role !== 'SUPER_ADMIN') {
        throw new Error('Unauthorized: Partner access required');
      }

      localStorage.setItem("partner_token", data.access_token);
      localStorage.setItem("partner_role", meData.role);
      if (meData.restaurantId) {
         localStorage.setItem("partner_restaurant_id", meData.restaurantId);
      }
      
      onLogin();

    } catch (err: any) {
      setErrors({ general: err.message || err.response?.data?.message || 'An error occurred during the process.' });
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
          {isRegister ? 'Create a new partner account' : 'Access your Partner Portal dashboard'}
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

          {registrationStatus && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              color: '#16a34a',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              ✅ {registrationStatus}
            </div>
          )}

          {isRegister && !otpSent && (
            <>
              <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Rahul Sharma" 
                  value={loginName}
                  onChange={(e: any) => setLoginName(e.target.value)}
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
                    transition: 'border-color 0.2s'
                  }} 
                />
                {errors.name && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem' }}>{errors.name}</p>}
              </div>
              
              <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Restaurant Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Spice Route" 
                  value={restaurantName}
                  onChange={(e: any) => setRestaurantName(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '0.9rem 1.1rem', 
                    borderRadius: '12px', 
                    border: (errors as any).restaurantName ? '1.5px solid #DC2626' : '1px solid #e2e8f0', 
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '0.95rem', 
                    boxSizing: 'border-box',
                    outline: 'none'
                  }} 
                />
                {(errors as any).restaurantName && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem' }}>{(errors as any).restaurantName}</p>}
              </div>

              <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Mobile Number</label>
                <input 
                  type="tel" 
                  placeholder="e.g. +91 9876543210" 
                  value={mobile}
                  onChange={(e: any) => setMobile(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '0.9rem 1.1rem', 
                    borderRadius: '12px', 
                    border: (errors as any).mobile ? '1.5px solid #DC2626' : '1px solid #e2e8f0', 
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '0.95rem', 
                    boxSizing: 'border-box',
                    outline: 'none'
                  }} 
                />
                {(errors as any).mobile && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem' }}>{(errors as any).mobile}</p>}
              </div>
            </>
          )}

          {!otpSent && (
            <>
              <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Email Address</label>
                <input 
                  type="email" 
                  placeholder="partner@test.com" 
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
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
                    transition: 'border-color 0.2s'
                  }} 
                />
                {errors.email && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem' }}>{errors.email}</p>}
              </div>

              <div style={{ marginBottom: '1.75rem', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
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
                    transition: 'border-color 0.2s'
                  }} 
                />
                {errors.password && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem' }}>{errors.password}</p>}
              </div>
            </>
          )}

          {isRegister && otpSent && (
            <div style={{ marginBottom: '1.75rem', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Enter OTP sent to {mobile || email}</label>
              <input 
                type="text" 
                placeholder="Enter 1234 for testing" 
                value={otp}
                onChange={(e: any) => setOtp(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.9rem 1.1rem', 
                  borderRadius: '12px', 
                  border: (errors as any).otp ? '1.5px solid #DC2626' : '1px solid #e2e8f0', 
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontSize: '0.95rem', 
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }} 
              />
              {(errors as any).otp && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem' }}>{(errors as any).otp}</p>}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              background: '#2563EB', 
              color: 'white', 
              padding: '1rem', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              fontSize: '1rem', 
              boxShadow: '0 4px 6px -1px rgba(0, 84, 166, 0.2)', 
              marginBottom: '1rem' 
            }}
          >
            {loading ? (isRegister ? (otpSent ? 'Verifying...' : 'Sending OTP...') : 'Logging in...') : (isRegister ? (otpSent ? 'Verify OTP & Register' : 'Request OTP') : 'Sign In')}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button 
              type="button" 
              onClick={() => setIsRegister(!isRegister)}
              style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>

        {/* Test Credentials Helper Box */}
        <div style={{ marginTop: '1.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', textAlign: 'left' }}>
          <h4 style={{ color: '#2563EB', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', marginTop: 0 }}>🔑 Test Partner Credentials</h4>
          <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 0.25rem' }}>
            <strong>Email:</strong> <span style={{ fontFamily: 'monospace', color: '#334155' }}>partner@test.com</span>
          </p>
          <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0' }}>
            <strong>Password:</strong> <span style={{ fontFamily: 'monospace', color: '#334155' }}>test123</span>
          </p>
        </div>
      </div>
      <GlobalMetadataInjector portalName="Partner Portal" />
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const logged = localStorage.getItem("partner_token");
    if (logged) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("partner_token");
    localStorage.removeItem("partner_role");
    localStorage.removeItem("partner_restaurant_id");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <>
      <GlobalMetadataInjector portalName="Partner Portal" />
      <MainApp onLogout={handleLogout} />
    </>
  );
}
