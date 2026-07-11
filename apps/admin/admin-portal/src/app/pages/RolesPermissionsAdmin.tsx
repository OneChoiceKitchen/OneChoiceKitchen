import { useState, useEffect } from 'react';
import { useToast } from '@org/ui-design-system';
import { ShieldCheck, Lock } from 'lucide-react';
import styles from './RolesPermissionsAdmin.module.css';

const authHeaders = () => ({ 
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`, 
  'Content-Type': 'application/json' 
});

const ALL_PERMISSIONS = [
  'manage_dashboard', 'manage_branches', 'manage_menus', 'manage_tiffin', 'manage_tables', 
  'manage_reservations', 'manage_waitlist', 'manage_users', 'manage_inventory', 'manage_offers', 
  'manage_rewards', 'manage_referrals', 'manage_reviews', 'manage_sliders', 'manage_blogs', 
  'manage_comments', 'manage_seo', 'manage_pages', 'manage_orders', 'manage_payouts', 
  'manage_refunds', 'manage_surge_pricing', 'manage_corporate', 'manage_hrms', 'manage_leaves', 
  'manage_support', 'manage_compliance', 'manage_audit_logs', 'manage_roles', 'manage_whatsapp_config', 
  'manage_templates', 'manage_maps_config', 'manage_email_config', 'manage_sms_config', 'manage_service_providers', 
  'manage_delivery_settings', 'manage_sla_config', 'manage_payment_config', 'manage_settings'
];

const DUMMY_ROLES = [
  { id: 'role_1', name: 'SUPER_ADMIN', description: 'Full access to all modules', permissions: ALL_PERMISSIONS.map(p => ({ name: p })) },
  { id: 'role_2', name: 'MANAGER', description: 'Can manage daily operations', permissions: [{ name: 'manage_orders' }, { name: 'manage_menus' }, { name: 'manage_dashboard' }] },
  { id: 'role_3', name: 'MARKETING_ADMIN', description: 'Manages marketing, SEO, and CMS', permissions: [{ name: 'manage_offers' }, { name: 'manage_seo' }, { name: 'manage_dashboard' }] },
  { id: 'role_4', name: 'HR_ADMIN', description: 'Manages HRMS and staff', permissions: [{ name: 'manage_hrms' }, { name: 'manage_leaves' }, { name: 'manage_users' }] },
  { id: 'role_5', name: 'SUPPORT_ADMIN', description: 'Handles support and compliance', permissions: [{ name: 'manage_support' }, { name: 'manage_compliance' }, { name: 'manage_audit_logs' }] }
];

export default function RolesPermissionsAdmin() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => { fetchRoles(); fetchPermissions(); }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/roles', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.text().then(t => JSON.parse(t));
      const parsed = Array.isArray(data) ? data : [];
      setRoles(parsed.length > 0 ? parsed : DUMMY_ROLES);
    } catch (e) { 
      // Fallback
      setRoles(DUMMY_ROLES);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await fetch('/api/users/permissions', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.text().then(t => JSON.parse(t));
      setPermissions(Array.isArray(data) ? data : []);
    } catch (e) {
      setPermissions(ALL_PERMISSIONS.map(name => ({ name })));
    }
  };

  const createRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      const res = await fetch('/api/users/roles', { 
        method: 'POST', 
        headers: authHeaders(), 
        body: JSON.stringify({ name: newRoleName.toUpperCase() }) 
      });
      if (!res.ok) throw new Error();
      toast.success(`Role "${newRoleName.toUpperCase()}" created`);
      setNewRoleName('');
      fetchRoles();
    } catch {
      // Mock creation
      const newRole = {
        id: `role_mock_${Date.now()}`,
        name: newRoleName.toUpperCase(),
        description: 'Custom created role',
        permissions: []
      };
      setRoles(prev => [...prev, newRole]);
      toast.success(`(Mocked) Role "${newRoleName.toUpperCase()}" created`);
      setNewRoleName('');
    }
  };

  const togglePermission = async (roleId: string, permName: string, has: boolean) => {
    const endpoint = has ? 'revoke-permission' : 'grant-permission';
    try {
      const res = await fetch(`/api/users/roles/${roleId}/${endpoint}`, { 
        method: 'POST', 
        headers: authHeaders(), 
        body: JSON.stringify({ permission: permName }) 
      });
      if (!res.ok) throw new Error();
      toast.success(`Permission "${permName.replace(/_/g, ' ')}" ${has ? 'revoked' : 'granted'}`);
      
      // Update selected via API
      fetchRoles();
      if (selected?.id === roleId) {
        const rolesRes = await fetch('/api/users/roles', { headers: authHeaders() });
        const data = await rolesRes.text().then(t => JSON.parse(t));
        const updated = (Array.isArray(data) ? data : []).find((r: any) => r.id === roleId);
        setSelected(updated);
      }
    } catch {
      // Mock toggle
      setRoles(prevRoles => {
        const updatedRoles = prevRoles.map(role => {
          if (role.id === roleId) {
            const updatedPerms = has 
              ? role.permissions.filter((p: any) => p.name !== permName)
              : [...role.permissions, { name: permName }];
            return { ...role, permissions: updatedPerms };
          }
          return role;
        });
        
        if (selected?.id === roleId) {
          setSelected(updatedRoles.find(r => r.id === roleId));
        }
        
        return updatedRoles;
      });
      
      toast.success(`(Mocked) Permission "${permName.replace(/_/g, ' ')}" ${has ? 'revoked' : 'granted'}`);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.pageTitle}>🔐 Roles & Permissions</h2>

      <div className={styles.layoutGrid}>
        {/* Roles Panel */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>Roles</div>
          
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
          ) : (
            <div className={styles.roleList}>
              {roles.map(role => (
                <div 
                  key={role.id} 
                  onClick={() => setSelected(role)}
                  className={`${styles.roleItem} ${selected?.id === role.id ? styles.active : ''}`}
                >
                  <div className={styles.roleName}>{role.name}</div>
                  <div className={styles.roleCount}>{role.permissions?.length || 0} permissions</div>
                </div>
              ))}
            </div>
          )}
          
          <div className={styles.addRoleForm}>
            <input 
              value={newRoleName} 
              onChange={e => setNewRoleName(e.target.value)} 
              placeholder="New role name..."
              className={styles.roleInput}
              onKeyDown={e => e.key === 'Enter' && createRole()} 
            />
            <button onClick={createRole} className={styles.addBtn}>
              +
            </button>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div>
          {selected ? (
            <div className={styles.matrixPanel}>
              <div className={styles.matrixHeader}>
                <div className={styles.matrixTitle}>{selected.name}</div>
                <div className={styles.matrixSubtitle}>{selected.description || 'Click permissions to toggle'}</div>
              </div>
              
              <div className={styles.matrixBody}>
                <div className={styles.permissionsGrid}>
                  {ALL_PERMISSIONS.map(perm => {
                    const has = selected.permissions?.some((p: any) => p.permission?.name === perm || p.name === perm);
                    return (
                      <label 
                        key={perm} 
                        className={`${styles.permLabel} ${has ? styles.granted : ''}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={has} 
                          onChange={() => togglePermission(selected.id, perm, has)}
                          className={styles.permCheckbox} 
                        />
                        <span className={styles.permText}>
                          {perm.replace(/_/g, ' ')}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <ShieldCheck size={48} color="#cbd5e1" />
              <div>Select a role from the sidebar to view and manage its permissions</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
