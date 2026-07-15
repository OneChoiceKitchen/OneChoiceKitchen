import React, { useEffect, useState } from 'react';
import { Users, Shield, UserPlus } from 'lucide-react';
import { PreviewGuard } from '@org/frontend-platform';
import { useTenantUsers } from './useTenantUsers';

export function TenantUserManager() {
  const { users, tenantRoles, loading, error, fetchUsers, inviteUser } = useTenantUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('STORE_MANAGER');

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInvite = async () => {
    if (targetUserId && selectedRole) {
      const success = await inviteUser(targetUserId, selectedRole);
      if (success) {
        setModalOpen(false);
        setTargetUserId('');
      }
    }
  };

  return (
    <PreviewGuard moduleId="users" requiredEntitlement="WRITE">
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={24} color="#6366f1" />
              Tenant Staff Management
            </h2>
            <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>Manage your kitchen staff and assign roles.</p>
          </div>
          <div>
            <button onClick={() => setModalOpen(true)} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={18} /> Assign Role
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: '#fef2f2', color: '#DC2626', marginBottom: '1rem', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gap: '1rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading staff...</div>
          ) : users.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No staff members found.</div>
          ) : (
            users.map(user => (
              <div key={user.userId} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 'bold' }}>
                    {user.displayName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: '#0f172a' }}>{user.displayName}</h4>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', color: '#334155' }}>
                    <Shield size={14} />
                    {user.roles?.[0] || 'No Role'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {modalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>Assign Role to User</h2>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>User ID</label>
                <input
                  type="text"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="Enter User ID"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  data-testid="email-input"
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Assign Role (Tenant Scope Only)</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  data-testid="role-select"
                >
                  {tenantRoles.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '0.75rem 1.5rem', border: '1px solid #e2e8f0', background: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  style={{ padding: '0.75rem 1.5rem', border: 'none', background: '#6366f1', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                  disabled={!targetUserId}
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PreviewGuard>
  );
}
