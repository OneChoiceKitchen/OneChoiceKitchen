import { useState, useCallback } from 'react';
import axios from 'axios';
import type { UserContextResponse, PortalCode } from '@org/frontend-platform';

export function useGlobalUsers() {
  const [users, setUsers] = useState<UserContextResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<UserContextResponse[]>('/api/users');
      setUsers(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const assignRole = async (userId: string, portalCode: PortalCode, role: string) => {
    try {
      // Optimistic update
      setUsers(prev => prev.map(u => {
        if (u.userId === userId) {
          return { ...u, portalCode, roleIds: [role] };
        }
        return u;
      }));
      
      await axios.put(`/api/users/${userId}/roles`, { portalCode, roleIds: [role] });
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to assign role');
      // Revert optimistic update by refetching
      fetchUsers();
      return false;
    }
  };

  return { users, loading, error, fetchUsers, assignRole };
}
