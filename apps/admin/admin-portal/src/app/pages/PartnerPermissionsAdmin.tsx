import React, { useState, useEffect } from 'react';

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}`, 'Content-Type': 'application/json' });

// All available modules and their granular features
export const PARTNER_MODULES = [
  {
    id: 'food_ordering', label: 'Food Ordering', icon: '🛍️', color: '#EA580C',
    features: [
      { id: 'fo_orders',   label: 'View Orders' },
      { id: 'fo_menu',     label: 'Menu Builder' },
      { id: 'fo_inventory',label: 'Inventory' },
      { id: 'fo_delivery', label: 'Delivery Settings' },
      { id: 'fo_offers',   label: 'Offers & Discounts' },
      { id: 'fo_coupons',  label: 'Coupons' },
    ],
  },
  {
    id: 'tiffin', label: 'Mess / Tiffin', icon: '🍱', color: '#16A34A',
    features: [
      { id: 'tf_subs',     label: 'Subscriptions' },
      { id: 'tf_delivery', label: 'Delivery Tracking' },
      { id: 'tf_plans',    label: 'Meal Plans' },
      { id: 'tf_terms',    label: 'Terms & Policies' },
    ],
  },
  {
    id: 'dining', label: 'Dining', icon: '🍽️', color: '#2563EB',
    features: [
      { id: 'di_tables',       label: 'Tables' },
      { id: 'di_reservations', label: 'Reservations' },
      { id: 'di_waitlist',     label: 'Waitlist' },
    ],
  },
  {
    id: 'hall_party', label: 'Hall / Party', icon: '🎉', color: '#7C3AED',
    features: [
      { id: 'hp_venues',   label: 'Venues' },
      { id: 'hp_packages', label: 'Packages' },
      { id: 'hp_bookings', label: 'Bookings' },
    ],
  },
  {
    id: 'hrms', label: 'HRMS', icon: '👔', color: '#6D28D9',
    features: [
      { id: 'hr_staff',      label: 'Staff Management' },
      { id: 'hr_attendance', label: 'Attendance' },
      { id: 'hr_kiosk',      label: 'ESS Kiosk' },
    ],
  },
  {
    id: 'marketing', label: 'Marketing', icon: '🎯', color: '#DB2777',
    features: [
      { id: 'mk_offers',  label: 'Own Offers' },
      { id: 'mk_coupons', label: 'Own Coupons' },
      { id: 'mk_rewards', label: 'Rewards' },
    ],
  },
  {
    id: 'analytics', label: 'Analytics', icon: '📊', color: '#0891B2',
    features: [
      { id: 'an_revenue', label: 'Revenue Reports' },
      { id: 'an_orders',  label: 'Order Analytics' },
      { id: 'an_customer',label: 'Customer Insights' },
    ],
  },
  {
    id: 'finance', label: 'Finance', icon: '💰', color: '#059669',
    features: [
      { id: 'fi_earnings', label: 'Earnings View' },
      { id: 'fi_payouts',  label: 'Payout History' },
    ],
  },
];

interface Partner { 
  id: string; 
  name: string; 
  email: string; 
  role: string; 
  isActive: boolean;
  subscriptionPlan?: 'MONTHLY' | 'YEARLY' | 'NONE';
  subscriptionStatus?: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  subscriptionExpiry?: string;
}
interface Permission { module: string; feature: string; isEnabled: boolean; }
interface DeleteRequest { id: string; partnerId: string; module: string; entity: string; entityId: string; status: string; requestedAt: string; }

export default function PartnerPermissionsAdmin() {
  const [partners,      setPartners]      = useState<Partner[]>([]);
  const [selectedP,     setSelectedP]     = useState<Partner | null>(null);
  const [permissions,   setPermissions]   = useState<Permission[]>([]);
  
  // Local state for editing subscriptions
  const [subPlan, setSubPlan] = useState<'MONTHLY' | 'YEARLY' | 'NONE'>('NONE');
  const [subStatus, setSubStatus] = useState<'ACTIVE' | 'EXPIRED' | 'PENDING'>('PENDING');
  const [subExpiry, setSubExpiry] = useState<string>('');
  const [deleteReqs,    setDeleteReqs]    = useState<DeleteRequest[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [tab,           setTab]           = useState<'permissions'|'approvals'>('permissions');
  const [search,        setSearch]        = useState('');
  const [toast,         setToast]         = useState('');

  // Load partners (PARTNER role users)
  useEffect(() => {
    fetch('/api/users?role=PARTNER', { headers: authH() })
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setPartners(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));

    // Load pending delete requests
    fetch('/api/partner-permissions/delete-requests', { headers: authH() })
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setDeleteReqs(Array.isArray(d) ? d : []));
  }, []);

  // Load permissions when partner selected
  useEffect(() => {
    if (!selectedP) { 
      setPermissions([]); 
      return; 
    }
    
    // Set local subscription state from selected partner
    setSubPlan(selectedP.subscriptionPlan || 'NONE');
    setSubStatus(selectedP.subscriptionStatus || 'PENDING');
    setSubExpiry(selectedP.subscriptionExpiry ? new Date(selectedP.subscriptionExpiry).toISOString().split('T')[0] : '');

    setLoading(true);
    fetch(`/api/partner-permissions/${selectedP.id}`, { headers: authH() })
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setPermissions(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [selectedP]);

  const isEnabled = (module: string, feature: string) =>
    permissions.some(p => p.module === module && p.feature === feature && p.isEnabled);

  const isModuleEnabled = (module: string) =>
    PARTNER_MODULES.find(m => m.id === module)?.features.some(f => isEnabled(module, f.id)) ?? false;

  const toggleFeature = (module: string, feature: string) => {
    const enabled = isEnabled(module, feature);
    setPermissions(prev => {
      const filtered = prev.filter(p => !(p.module === module && p.feature === feature));
      return [...filtered, { module, feature, isEnabled: !enabled }];
    });
  };

  const toggleModule = (module: string, enable: boolean) => {
    const mod = PARTNER_MODULES.find(m => m.id === module);
    if (!mod) return;
    setPermissions(prev => {
      const filtered = prev.filter(p => p.module !== module);
      return [...filtered, ...mod.features.map(f => ({ module, feature: f.id, isEnabled: enable }))];
    });
  };

  const savePermissions = async () => {
    if (!selectedP) return;
    setSaving(true);
    try {
      await fetch(`/api/partner-permissions/${selectedP.id}`, {
        method: 'POST',
        headers: authH(),
        body: JSON.stringify({ 
          permissions,
          subscription: {
            plan: subPlan,
            status: subStatus,
            expiryDate: subExpiry
          }
        }),
      });

      // Update the local list so the UI reflects changes instantly
      setPartners(prev => prev.map(p => p.id === selectedP.id ? {
        ...p,
        subscriptionPlan: subPlan,
        subscriptionStatus: subStatus,
        subscriptionExpiry: subExpiry
      } : p));

      setToast(`✅ Settings saved for ${selectedP.name}`);
      setTimeout(() => setToast(''), 3000);
    } catch {
      setToast('❌ Failed to save permissions');
      setTimeout(() => setToast(''), 3000);
    } finally { setSaving(false); }
  };

  const approveDelete = async (reqId: string) => {
    try {
      await fetch(`/api/partner-permissions/delete-requests/${reqId}/approve`, { method: 'POST', headers: authH() });
      setDeleteReqs(prev => prev.map(r => r.id === reqId ? { ...r, status: 'APPROVED' } : r));
      setToast('✅ Delete request approved');
      setTimeout(() => setToast(''), 3000);
    } catch {
      setToast('❌ Failed to approve');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const rejectDelete = async (reqId: string) => {
    try {
      await fetch(`/api/partner-permissions/delete-requests/${reqId}/reject`, { method: 'POST', headers: authH() });
      setDeleteReqs(prev => prev.map(r => r.id === reqId ? { ...r, status: 'REJECTED' } : r));
      setToast('✅ Delete request rejected');
      setTimeout(() => setToast(''), 3000);
    } catch {
      setToast('❌ Failed to reject');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const filteredPartners = partners.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = deleteReqs.filter(r => r.status === 'PENDING').length;

  return (
    <div className="page-container">
      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:80, right:24, background:'#0f172a', color:'#fff', padding:'.75rem 1.25rem', borderRadius:10, zIndex:9999, fontSize:'.875rem', boxShadow:'0 8px 32px rgba(0,0,0,.2)' }}>
          {toast}
        </div>
      )}

      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">🔐 Partner Module Permissions</h1>
          <p className="page-subtitle">Grant granular feature-level access to each partner. Partners see only their own data. Deletions require admin approval.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'.5rem', marginBottom:'1.25rem', borderBottom:'1px solid #e2e8f0', paddingBottom:'.5rem' }}>
        {[
          { key:'permissions', label:'🔐 Module Permissions' },
          { key:'approvals',   label:`📋 Delete Approvals${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            style={{ padding:'.5rem 1rem', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontSize:'.85rem', fontWeight:600, transition:'all .18s',
              background: tab === t.key ? '#2563EB' : 'transparent',
              color:      tab === t.key ? '#fff' : '#64748b' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'permissions' && (
        <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'1.5rem', alignItems:'start' }}>
          {/* Partner List */}
          <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'.75rem 1rem', borderBottom:'1px solid #e2e8f0' }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search partners…"
                style={{ width:'100%', padding:'.5rem .75rem', border:'1.5px solid #e2e8f0', borderRadius:6, fontSize:'.82rem', outline:'none', fontFamily:'inherit' }}
              />
            </div>
            <div style={{ maxHeight:'70vh', overflowY:'auto' }}>
              {loading && !selectedP ? (
                <div style={{ padding:'1.5rem', textAlign:'center', color:'#94a3b8' }}>Loading partners…</div>
              ) : filteredPartners.length === 0 ? (
                <div style={{ padding:'1.5rem', textAlign:'center', color:'#94a3b8' }}>No partners found</div>
              ) : filteredPartners.map(p => (
                <div key={p.id} onClick={() => setSelectedP(p)}
                  style={{ padding:'.875rem 1rem', cursor:'pointer', borderBottom:'1px solid #f1f5f9', transition:'background .15s',
                    background: selectedP?.id === p.id ? '#EFF6FF' : 'transparent',
                    borderLeft: selectedP?.id === p.id ? '3px solid #2563EB' : '3px solid transparent' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'.875rem', color:'#0f172a' }}>{p.name || 'Unknown Partner'}</div>
                      <div style={{ fontSize:'.72rem', color:'#64748b' }}>{p.email}</div>
                    </div>
                    <span style={{ fontSize:'.65rem', fontWeight:700, padding:'.15rem .4rem', borderRadius:4,
                      background: p.isActive ? '#dcfce7' : '#f1f5f9',
                      color:      p.isActive ? '#166534' : '#64748b' }}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {/* Mini permission summary */}
                  <div style={{ display:'flex', gap:'.25rem', flexWrap:'wrap', marginTop:'.375rem' }}>
                    {PARTNER_MODULES.filter(m => isModuleEnabled(m.id)).map(m => (
                      <span key={m.id} style={{ fontSize:'.6rem', background:m.color+'15', color:m.color, padding:'.1rem .3rem', borderRadius:3, fontWeight:600 }}>{m.label}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permission Matrix */}
          <div>
            {!selectedP ? (
              <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'3rem', textAlign:'center' }}>
                <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>👈</div>
                <p style={{ color:'#64748b', fontSize:'.95rem' }}>Select a partner from the list to configure their module access</p>
              </div>
            ) : (
              <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' }}>
                <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'space-between', background: '#f8fafc' }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:'1.1rem', color:'#0f172a' }}>{selectedP.name}</div>
                    <div style={{ fontSize:'.8rem', color:'#64748b' }}>{selectedP.email}</div>
                  </div>
                  <button onClick={savePermissions} disabled={saving}
                    style={{ padding:'.5rem 1.25rem', background:'#2563EB', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontSize:'.85rem', fontWeight:600, opacity: saving ? .7 : 1 }}>
                    {saving ? 'Saving…' : '💾 Save Changes'}
                  </button>
                </div>
                
                <div style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'1.5rem', maxHeight:'72vh', overflowY:'auto' }}>
                  
                  {/* Subscription Control Panel */}
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '1rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                      💳 Partner Subscription Assignment
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#15803d', marginBottom: 4 }}>Plan Type</label>
                        <select 
                          value={subPlan} 
                          onChange={(e) => setSubPlan(e.target.value as any)}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #86efac', outline: 'none' }}
                        >
                          <option value="NONE">No Subscription</option>
                          <option value="MONTHLY">Monthly Billing</option>
                          <option value="YEARLY">Annual Billing</option>
                        </select>
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#15803d', marginBottom: 4 }}>Status</label>
                        <select 
                          value={subStatus} 
                          onChange={(e) => setSubStatus(e.target.value as any)}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #86efac', outline: 'none' }}
                        >
                          <option value="PENDING">Pending Payment</option>
                          <option value="ACTIVE">Active & Allowed</option>
                          <option value="EXPIRED">Expired / Locked</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#15803d', marginBottom: 4 }}>Expiry Date</label>
                        <input 
                          type="date" 
                          value={subExpiry} 
                          onChange={(e) => setSubExpiry(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #86efac', outline: 'none' }}
                        />
                      </div>
                    </div>
                    {subStatus !== 'ACTIVE' && subPlan !== 'NONE' && (
                      <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>
                        ⚠️ Warning: If status is not ACTIVE, the partner will only have read-only access to their assigned modules.
                      </p>
                    )}
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: 0 }} />

                  {/* Module Access Panel */}
                  <h3 style={{ margin: '0 0 -0.5rem 0', fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
                    🔧 Granular Module Access Control
                  </h3>
                  {PARTNER_MODULES.map(mod => {
                    const modEnabled = isModuleEnabled(mod.id);
                    return (
                      <div key={mod.id} style={{ border:'1px solid #e2e8f0', borderRadius:10, overflow:'hidden' }}>
                        {/* Module header */}
                        <div style={{ padding:'.75rem 1rem', background: modEnabled ? mod.color+'10' : '#f8fafc',
                          display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #e2e8f0' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                            <span style={{ fontSize:'1.1rem' }}>{mod.icon}</span>
                            <span style={{ fontWeight:700, fontSize:'.875rem', color: modEnabled ? mod.color : '#0f172a' }}>{mod.label}</span>
                          </div>
                          <label style={{ display:'flex', alignItems:'center', gap:'.5rem', cursor:'pointer' }}>
                            <span style={{ fontSize:'.72rem', color:'#64748b', fontWeight:500 }}>{modEnabled ? 'Module On' : 'Module Off'}</span>
                            <div onClick={() => toggleModule(mod.id, !modEnabled)}
                              style={{ width:36, height:20, background: modEnabled ? mod.color : '#cbd5e1', borderRadius:999, position:'relative', cursor:'pointer', transition:'background .18s' }}>
                              <div style={{ position:'absolute', top:2, left: modEnabled ? 18 : 2, width:16, height:16, background:'#fff', borderRadius:'50%', transition:'left .18s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }} />
                            </div>
                          </label>
                        </div>
                        {/* Feature grid */}
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'.625rem', padding:'.875rem 1rem' }}>
                          {mod.features.map(feat => {
                            const featEnabled = isEnabled(mod.id, feat.id);
                            return (
                              <label key={feat.id} style={{ display:'flex', alignItems:'center', gap:'.5rem', cursor:'pointer',
                                padding:'.5rem .75rem', background: featEnabled ? mod.color+'10' : '#f8fafc',
                                borderRadius:6, border:`1px solid ${featEnabled ? mod.color+'40' : '#e2e8f0'}`, transition:'all .15s' }}>
                                <input type="checkbox" checked={featEnabled}
                                  onChange={() => toggleFeature(mod.id, feat.id)}
                                  style={{ accentColor: mod.color, width:14, height:14 }} />
                                <span style={{ fontSize:'.8rem', fontWeight:featEnabled?600:400, color: featEnabled ? mod.color : '#64748b' }}>{feat.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'approvals' && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Partner</th>
                <th>Module</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>Requested</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deleteReqs.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:'2.5rem', color:'#94a3b8' }}>No pending delete requests</td></tr>
              ) : deleteReqs.map(req => {
                const partner = partners.find(p => p.id === req.partnerId);
                return (
                  <tr key={req.id}>
                    <td>{partner?.name || req.partnerId}</td>
                    <td><span style={{ padding:'.2rem .5rem', background:'#EFF6FF', color:'#2563EB', borderRadius:4, fontSize:'.72rem', fontWeight:600 }}>{req.module}</span></td>
                    <td>{req.entity}</td>
                    <td><code style={{ fontSize:'.72rem', background:'#f1f5f9', padding:'.1rem .3rem', borderRadius:3 }}>{req.entityId}</code></td>
                    <td style={{ fontSize:'.75rem', color:'#64748b' }}>{new Date(req.requestedAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span style={{ padding:'.2rem .6rem', borderRadius:999, fontSize:'.72rem', fontWeight:600,
                        background: req.status==='PENDING'?'#FFFBEB':req.status==='APPROVED'?'#F0FDF4':'#FEF2F2',
                        color:      req.status==='PENDING'?'#D97706':req.status==='APPROVED'?'#16A34A':'#DC2626' }}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {req.status === 'PENDING' && (
                        <div style={{ display:'flex', gap:'.375rem' }}>
                          <button onClick={() => approveDelete(req.id)}
                            style={{ padding:'.3rem .75rem', background:'#16A34A', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:'.75rem', fontWeight:600, fontFamily:'inherit' }}>
                            ✅ Approve
                          </button>
                          <button onClick={() => rejectDelete(req.id)}
                            style={{ padding:'.3rem .75rem', background:'#DC2626', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:'.75rem', fontWeight:600, fontFamily:'inherit' }}>
                            ❌ Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
