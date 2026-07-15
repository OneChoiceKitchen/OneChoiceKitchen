import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@org/frontend-platform';

export function useInventoryManagement() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [invRes, menuRes] = await Promise.all([
        apiClient.get('/api/inventory'),
        apiClient.get('/api/menu-items')
      ]);
      setInventory(invRes.data);
      setMenuItems(menuRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createItem = async (data: any) => {
    setLoading(true);
    try {
      await apiClient.post('/api/inventory', data);
      await fetchData();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create inventory item');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: string, data: any) => {
    setLoading(true);
    try {
      await apiClient.patch(`/api/inventory/${id}`, data);
      await fetchData();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update inventory item');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    setLoading(true);
    try {
      await apiClient.delete(`/api/inventory/${id}`);
      await fetchData();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete inventory item');
    } finally {
      setLoading(false);
    }
  };

  const mapToMenu = async (menuItemId: string, inventoryItemId: string, quantityRequired: number) => {
    setLoading(true);
    try {
      await apiClient.post('/api/inventory/menu-mapping', { menuItemId, inventoryItemId, quantityRequired });
      await fetchData();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to map to menu');
    } finally {
      setLoading(false);
    }
  };

  return {
    inventory,
    menuItems,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    mapToMenu,
    refresh: fetchData
  };
}
