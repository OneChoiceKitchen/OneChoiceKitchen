import React, { useEffect, useState } from 'react';
import { Users, Shield, Edit } from 'lucide-react';
import { useGlobalUsers } from './useGlobalUsers';
import type { PortalCode, UserContextResponse } from '@org/frontend-platform';

export function GlobalUserManager() {
  const { users, loading, error, fetchUsers, assignRole } = useGlobalUsers();
  const [selectedUser, setSelectedUser] = useState<UserContextResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<PortalCode>('ADMIN');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenModal = (user: UserContextResponse) => {
    setSelectedUser(user);
    setSelectedPortal(user.portalCode || 'ADMIN');
    setSelectedRole(user.roles?.[0] || '');
    setModalOpen(true);
  };

  const handleAssignRole = async () => {
    if (selectedUser && selectedRole) {
      const success = await assignRole(selectedUser.userId, selectedPortal, selectedRole);
      if (success) {
        setModalOpen(false);
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">
            <Users size={24} style={{ marginRight: '8px' }} />
            Global User Manager
          </h1>
          <p className="page-subtitle">Manage all platform users, their portals, and roles.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={fetchUsers}>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--brand-red-lt, #fef2f2)', color: 'var(--brand-red, #DC2626)', marginBottom: '1rem', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div className="table-wrapper">
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--bdr, #e2e8f0)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Assigned Portal</th>
              <th style={{ padding: '1rem' }}>Tenant / Partner</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No users found.</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.userId} style={{ borderBottom: '1px solid var(--bdr, #e2e8f0)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{user.displayName}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{user.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ display: 'inline-block', background: 'var(--brand-blue-lt, #eff6ff)', color: 'var(--brand-blue-dk, #1d4ed8)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                      {user.portalCode}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{user.partnerName || user.tenantId || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Shield size={14} />
                      {user.roles?.[0] || 'No Role'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleOpenModal(user)}
                      style={{ border: '1px solid var(--bdr, #e2e8f0)', background: 'var(--surf, #ffffff)', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit size={14} /> Assign Role
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'var(--surf, #ffffff)', padding: '2rem', borderRadius: '8px', width: '400px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>Assign Role</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>User</label>
              <input type="text" value={selectedUser.displayName} disabled style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--bdr, #e2e8f0)', borderRadius: '4px', background: '#f8fafc' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Portal</label>
              <select
                value={selectedPortal}
                onChange={(e) => setSelectedPortal(e.target.value as PortalCode)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--bdr, #e2e8f0)', borderRadius: '4px' }}
                data-testid="portal-select"
              >
                <option value="ADMIN">Admin Portal</option>
                <option value="PARTNER">Partner Portal</option>
                <option value="RIDER">Rider Portal</option>
                <option value="WEB">Web Frontend</option>
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Role</label>
              <input
                type="text"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                placeholder="e.g. SUPER_ADMIN"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--bdr, #e2e8f0)', borderRadius: '4px' }}
                data-testid="role-input"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{ padding: '0.5rem 1rem', border: '1px solid var(--bdr, #e2e8f0)', background: 'transparent', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRole}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                disabled={!selectedRole}
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
