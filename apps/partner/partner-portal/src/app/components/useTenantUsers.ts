import { useState, useCallback } from 'react';
import axios from 'axios';
import type { UserContextResponse } from '@org/frontend-platform';
import { useUserContext } from '@org/frontend-platform';

export function useTenantUsers() {
  const [users, setUsers] = useState<UserContextResponse[]>([]);
  const [tenantRoles, setTenantRoles] = useState<{ id: string, name: string, description?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const userContext = useUserContext();

  const fetchUsers = useCallback(async () => {
    if (!userContext?.tenantId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<UserContextResponse[]>(`/api/users?tenantId=${userContext.tenantId}`);
      setUsers(response.data);
      
      const rolesResponse = await axios.get(`/api/roles?scope=TENANT`);
      setTenantRoles(rolesResponse.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [userContext?.tenantId]);

  const inviteUser = async (userId: string, roleId: string) => {
    if (!userContext?.tenantId) return false;
    
    try {
      await axios.put(`/api/users/${userId}/roles?tenantId=${userContext.tenantId}`, { roleIds: [roleId] });
      fetchUsers();
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to invite user');
      return false;
    }
  };

  return { users, tenantRoles, loading, error, fetchUsers, inviteUser };
}
