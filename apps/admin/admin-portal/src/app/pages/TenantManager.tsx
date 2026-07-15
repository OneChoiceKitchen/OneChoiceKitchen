import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@org/ui-design-system';

export default function TenantManager() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get('/api/admin/tenants', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTenants(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`/api/admin/tenants/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Tenant status updated');
      fetchTenants();
    } catch (err) {
      toast.error('Failed to update tenant status');
    }
  };

  return (
    <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Tenant Management</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>Manage partner restaurants and businesses.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading tenants...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Legal Name</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Business Type</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Active Subscriptions</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => (
                <tr key={tenant.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem', color: '#1e293b', fontWeight: 500 }}>{tenant.legalName || 'N/A'}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{tenant.businessType || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: tenant.status === 'ACTIVE' ? '#dcfce7' : tenant.status === 'SUSPENDED' ? '#fee2e2' : '#f1f5f9',
                      color: tenant.status === 'ACTIVE' ? '#166534' : tenant.status === 'SUSPENDED' ? '#991b1b' : '#475569',
                    }}>
                      {tenant.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>
                    {tenant.subscriptions?.filter((s: any) => s.status === 'ACTIVE').length || 0}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <select
                      value=""
                      onChange={(e) => updateStatus(tenant.id, e.target.value)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="" disabled>Actions...</option>
                      {tenant.status !== 'ACTIVE' && <option value="ACTIVE">Activate</option>}
                      {tenant.status !== 'SUSPENDED' && <option value="SUSPENDED">Suspend</option>}
                      {tenant.status !== 'PENDING' && <option value="PENDING">Set Pending</option>}
                    </select>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    No tenants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
