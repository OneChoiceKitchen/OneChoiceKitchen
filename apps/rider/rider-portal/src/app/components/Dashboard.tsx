import React, { useState, useEffect, useCallback } from 'react';
import { AvailableOrdersList, AvailableOrder } from './AvailableOrdersList';
import { ActiveDeliveryTracker, ActiveOrder } from './ActiveDeliveryTracker';
import { useToast } from '@org/ui-design-system';

const API_BASE = '/api/logistics';

const authHeaders = () => ({
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('rider_token')}`,
    'Content-Type': 'application/json',
  }
});

export function Dashboard() {
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [availableOrders, setAvailableOrders] = useState<AvailableOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Check for active delivery first
      const activeRes = await fetch(`${API_BASE}/active-delivery`, { headers: authHeaders().headers });
      if (activeRes.ok) {
        const activeData = await activeRes.json();
        if (activeData) {
          setActiveOrder(activeData);
          setAvailableOrders([]);
          return;
        }
      }

      // 2. If no active delivery, fetch available orders
      setActiveOrder(null);
      const availRes = await fetch(`${API_BASE}/available-orders`, { headers: authHeaders().headers });
      if (availRes.ok) {
        setAvailableOrders(await availRes.json());
      } else {
        setAvailableOrders([]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
    // In a real app we'd poll or use WebSocket here for live updates.
    // For now, poll every 15 seconds
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleAcceptOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/accept`, {
        method: 'POST',
        ...authHeaders()
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to accept order');
      }
      toast.success('Order accepted successfully!');
      await fetchDashboardData(); // Refresh to switch to active view
    } catch (error: any) {
      toast.error(error.message);
      await fetchDashboardData(); // Refresh available list just in case
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        ...authHeaders(),
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update order status');
      }
      toast.success(`Order marked as ${status.replace(/_/g, ' ')}`);
      await fetchDashboardData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto min-h-[80vh]">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Delivery Dashboard</h1>
      
      {activeOrder ? (
        <ActiveDeliveryTracker 
          order={activeOrder} 
          onUpdateStatus={handleUpdateStatus} 
          isLoading={isLoading} 
        />
      ) : (
        <AvailableOrdersList 
          orders={availableOrders} 
          onAcceptOrder={handleAcceptOrder} 
          isLoading={isLoading} 
        />
      )}
    </div>
  );
}
