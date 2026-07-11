'use client';
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Package, Clock, Bell, User, IndianRupee, History, ChevronRight, LogOut, Settings, CheckCircle } from 'lucide-react';
import { apiFetch, riderLogin } from '../lib/api';

const TasksTab = ({ isOnline, orders, loading }: { isOnline: boolean; orders: any[]; loading: boolean }) => (
  <>
    {/* Map Placeholder */}
    <div style={{ 
      height: '250px', background: '#334155', borderRadius: '24px', position: 'relative', overflow: 'hidden', marginBottom: '2rem',
      backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")', border: '2px solid #475569'
    }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(15, 23, 42, 0.8)', padding: '0.5rem 1rem', borderRadius: '999px', color: 'white', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Navigation size={14} color="#3b82f6" /> Navigating to Pickup
      </div>
      <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: '#3b82f6', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
        <Navigation size={20} color="white" fill="white" />
      </div>
    </div>

    {/* Current Active Order */}
    {isOnline ? (
      <div>
        {loading && <p style={{ color: '#94a3b8' }}>Loading orders...</p>}
        {!loading && orders.length === 0 && (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No active deliveries right now.</p>
        )}
        {orders.filter(o => ['READY', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(o.status)).slice(0, 1).map((order) => (
          <div key={order.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'white' }}>Current Order</h3>
              <span style={{ color: '#3b82f6', fontSize: '0.875rem', fontWeight: 700, background: '#1e3a8a', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>#{order.id?.slice(0, 8)}</span>
            </div>
            <div style={{ background: '#0f172a', borderRadius: '20px', padding: '1.5rem', border: '1px solid #334155' }}>
              <p style={{ color: '#94a3b8', margin: 0 }}>Status: <strong style={{ color: 'white' }}>{order.status}</strong></p>
              <p style={{ color: '#94a3b8', margin: '0.5rem 0 0' }}>Total: ₹{order.totalAmount}</p>
              <p style={{ color: '#94a3b8', margin: '0.5rem 0 0', fontSize: '0.85rem' }}>{order.deliveryAddress}</p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ background: '#0f172a', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '2px solid #334155' }}>
          <Clock size={32} color="#64748b" />
        </div>
        <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '0.5rem' }}>You are currently Offline</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>Go online to start receiving tiffin and food delivery requests in your area.</p>
      </div>
    )}
  </>
);

const EarningsTab = () => (
  <div>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem' }}>Earnings</h2>
    <div style={{ background: '#0f172a', borderRadius: '20px', padding: '1.5rem', border: '1px solid #334155', marginBottom: '1.5rem' }}>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Today's Earnings</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', margin: 0 }}>₹840.50</h3>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
        <div>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.25rem 0' }}>Deliveries</p>
          <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>12</p>
        </div>
        <div>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.25rem 0' }}>Online Time</p>
          <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>5h 30m</p>
        </div>
        <div>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.25rem 0' }}>Tips</p>
          <p style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>₹120</p>
        </div>
      </div>
    </div>
    
    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>Recent Transactions</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[
        { id: "#ORD-0924", amount: "+₹65.00", time: "1:45 PM", status: "Completed" },
        { id: "#ORD-0923", amount: "+₹85.50", time: "12:30 PM", status: "Completed", tip: "₹20" },
        { id: "#ORD-0922", amount: "+₹50.00", time: "11:15 AM", status: "Completed" }
      ].map((txn, idx) => (
        <div key={idx} style={{ background: '#0f172a', padding: '1rem', borderRadius: '16px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#1e293b', padding: '0.6rem', borderRadius: '10px' }}>
              <CheckCircle size={20} color="#10b981" />
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 600, margin: '0 0 0.2rem 0' }}>{txn.id}</p>
              <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>{txn.time}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#10b981', fontWeight: 700, margin: '0 0 0.2rem 0' }}>{txn.amount}</p>
            {txn.tip && <p style={{ color: '#f59e0b', fontSize: '0.75rem', margin: 0 }}>Incl. {txn.tip} tip</p>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AlertsTab = () => (
  <div>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem' }}>Alerts</h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '16px', border: '1px solid #3b82f6', borderLeft: '4px solid #3b82f6' }}>
        <h4 style={{ color: 'white', fontWeight: 700, margin: '0 0 0.5rem 0', fontSize: '1.05rem' }}>Surge Pricing Active</h4>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>Earn 1.5x on all deliveries in Sector 14 and Sector 15 for the next 2 hours.</p>
        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>10 mins ago</span>
      </div>
      
      <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '16px', border: '1px solid #1e293b' }}>
        <h4 style={{ color: 'white', fontWeight: 700, margin: '0 0 0.5rem 0', fontSize: '1.05rem' }}>Weekly Bonus Achieved</h4>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>Congratulations! You've completed 50 deliveries this week. ₹500 bonus added to your earnings.</p>
        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Yesterday, 9:00 PM</span>
      </div>

      <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '16px', border: '1px solid #1e293b' }}>
        <h4 style={{ color: 'white', fontWeight: 700, margin: '0 0 0.5rem 0', fontSize: '1.05rem' }}>New Tiffin Hub Added</h4>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>'Punjabi Rasoi' is now live on OneChoice. Expect more orders from Sector 21.</p>
        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>2 days ago</span>
      </div>
    </div>
  </div>
);

const ProfileTab = () => (
  <div>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem' }}>Profile</h2>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
      <div style={{ width: '80px', height: '80px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 700 }}>
        R
      </div>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', margin: '0 0 0.25rem 0' }}>Ravi Kumar</h2>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Rider ID: RID-77382</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div style={{ background: '#10b981', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
            ★ 4.9
          </div>
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>1.2k deliveries</span>
        </div>
      </div>
    </div>

    <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', overflow: 'hidden' }}>
      {[
        { icon: User, label: "Personal Info" },
        { icon: Package, label: "Vehicle Details" },
        { icon: History, label: "Delivery History" },
        { icon: IndianRupee, label: "Bank Account" },
        { icon: Settings, label: "Settings" }
      ].map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '1.25rem', borderBottom: idx !== 4 ? '1px solid #1e293b' : 'none',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: '#1e293b', padding: '0.5rem', borderRadius: '8px' }}>
                <Icon size={20} color="#94a3b8" />
              </div>
              <span style={{ fontWeight: 600, color: 'white' }}>{item.label}</span>
            </div>
            <ChevronRight size={20} color="#475569" />
          </div>
        );
      })}
    </div>

    <button style={{ 
      width: '100%', marginTop: '2rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
      border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '16px', fontWeight: 700, 
      fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'
    }}>
      <LogOut size={20} /> Log Out
    </button>
  </div>
);

export default function RiderMobileApp() {
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [riderName, setRiderName] = useState('Rider');

  useEffect(() => {
    const init = async () => {
      try {
        if (!localStorage.getItem('rider_token')) {
          await riderLogin('rider@test.com', 'test123');
        }
        const profile = await apiFetch<any>('/auth/me');
        setRiderName(profile.email?.split('@')[0] || 'Rider');
        const data = await apiFetch<any[]>('/orders');
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <div style={{ 
      background: '#1e293b', 
      minHeight: '100vh',
      maxWidth: '480px',
      margin: '0 auto',
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      boxShadow: '0 0 40px rgba(0,0,0,0.5)',
      overflowX: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        background: '#0f172a', 
        padding: '1.25rem 1.25rem 1rem', 
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} color="#cbd5e1" />
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', background: isOnline ? '#10b981' : '#ef4444', border: '2px solid #0f172a' }}></div>
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: '0 0 0.1rem 0' }}>{riderName}</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>4.9 ★ Rating</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsOnline(!isOnline)}
            style={{ 
              background: isOnline ? '#ef4444' : '#10b981', 
              color: 'white', border: 'none', padding: '0.6rem 1.25rem', 
              borderRadius: '999px', fontWeight: 700, fontSize: '0.875rem',
              boxShadow: isOnline ? '0 4px 10px rgba(239, 68, 68, 0.3)' : '0 4px 10px rgba(16, 185, 129, 0.3)', cursor: 'pointer'
          }}>
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      <main style={{ padding: '1.5rem 1.25rem 6rem' }}>
        {activeTab === 'home' && <TasksTab isOnline={isOnline} orders={orders} loading={loading} />}
        {activeTab === 'earnings' && <EarningsTab />}
        {activeTab === 'alerts' && <AlertsTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>

      {/* Bottom Navigation */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '480px', background: '#0f172a', borderTop: '1px solid #1e293b',
        display: 'flex', justifyContent: 'space-around', padding: '1rem 0.5rem 1.5rem',
        zIndex: 50
      }}>
        {[
          { id: 'home', icon: MapPin, label: 'Tasks' },
          { id: 'earnings', icon: IndianRupee, label: 'Earnings' },
          { id: 'alerts', icon: Bell, label: 'Alerts' },
          { id: 'profile', icon: User, label: 'Profile' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
              color: isActive ? '#3b82f6' : '#64748b', cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <Icon size={24} fill={isActive ? '#3b82f6' : 'none'} strokeWidth={isActive ? 2 : 2} color={isActive ? '#3b82f6' : '#64748b'} />
              <span style={{ fontSize: '0.7rem', fontWeight: isActive ? 700 : 500 }}>{tab.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
