import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@org/frontend-platform';

export function useMenuManagement() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catsRes, itemsRes] = await Promise.all([
        apiClient.get('/api/menu-categories'),
        apiClient.get('/api/menu-items')
      ]);
      setCategories(catsRes.data);
      setItems(itemsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const createCategory = async (data: any) => {
    setLoading(true);
    try {
      await apiClient.post('/api/menu-categories', data);
      await fetchMenu();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, data: any) => {
    setLoading(true);
    try {
      await apiClient.patch(`/api/menu-categories/${id}`, data);
      await fetchMenu();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setLoading(true);
    try {
      await apiClient.delete(`/api/menu-categories/${id}`);
      await fetchMenu();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (data: any) => {
    setLoading(true);
    try {
      await apiClient.post('/api/menu-items', data);
      await fetchMenu();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: string, data: any) => {
    setLoading(true);
    try {
      await apiClient.patch(`/api/menu-items/${id}`, data);
      await fetchMenu();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    setLoading(true);
    try {
      await apiClient.delete(`/api/menu-items/${id}`);
      await fetchMenu();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    items,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    createItem,
    updateItem,
    deleteItem,
    refresh: fetchMenu
  };
}
