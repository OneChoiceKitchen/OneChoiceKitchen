import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@org/ui-design-system';
import { useKitchenSocket } from '../hooks/useKitchenSocket';
import OrderTicket from './OrderTicket';

export default function KitchenBoard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<Record<string, boolean>>({});
  const [tenantId, setTenantId] = useState<string>('');
  const toast = useToast();
  
  // Connect to websocket
  const { socket, isConnected } = useKitchenSocket(tenantId);

  useEffect(() => {
    // Determine tenantId from local storage or context (simulated here)
    const storedTenantId = localStorage.getItem('partner_tenantId') || 'tenant-1'; // Mock fallback for demo
    setTenantId(storedTenantId);
    
    fetchOrders(storedTenantId);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('orderUpdated', (updatedOrder: any) => {
      setOrders(prev => {
        // If status is beyond PREPARING, we might want to remove it from the board after a delay
        // For now, if it's READY_FOR_PICKUP, we'll keep it in a "Ready" column or filter it out.
        // The requirements say: PENDING, PREPARING, and READY.
        
        const exists = prev.find(o => o.id === updatedOrder.id);
        if (exists) {
          return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
        } else {
          // New order coming in via websocket
          return [...prev, updatedOrder];
        }
      });
      // Clear loading state if this was initiated by us
      setLoadingOrders(prev => ({ ...prev, [updatedOrder.id]: false }));
    });

    socket.on('newOrder', (newOrder: any) => {
       setOrders(prev => [...prev, newOrder]);
    });

    return () => {
      socket.off('orderUpdated');
      socket.off('newOrder');
    };
  }, [socket]);

  const fetchOrders = async (tId: string) => {
    try {
      const token = localStorage.getItem('partner_token');
      const res = await axios.get('/api/kitchen/active-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to load kitchen orders');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setLoadingOrders(prev => ({ ...prev, [orderId]: true }));
    try {
      const token = localStorage.getItem('partner_token');
      await axios.put(`/api/kitchen/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // We don't manually update state here because the websocket will broadcast the update
      // But we can optimistically update if desired. We'll rely on the fast websocket response.
    } catch (err) {
      toast.error('Failed to update order status');
      setLoadingOrders(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const preparingOrders = orders.filter(o => o.status === 'PREPARING');
  const readyOrders = orders.filter(o => o.status === 'READY_FOR_PICKUP');

  const ColumnHeader = ({ title, count, color }: { title: string, count: number, color: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: `2px solid ${color}`, paddingBottom: '0.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{title}</h3>
      <span style={{ background: color, color: 'white', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
        {count}
      </span>
    </div>
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>Kitchen Display System</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Real-time order fulfillment</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isConnected ? '#10b981' : '#DC2626' }} />
          <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* NEW COLUMN */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', minHeight: '600px' }}>
          <ColumnHeader title="New Orders" count={pendingOrders.length} color="#DC2626" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingOrders.map(order => (
              <OrderTicket 
                key={order.id} 
                order={order} 
                onStatusChange={handleStatusChange} 
                isLoading={!!loadingOrders[order.id]} 
              />
            ))}
            {pendingOrders.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>No new orders</div>}
          </div>
        </div>

        {/* COOKING COLUMN */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', minHeight: '600px' }}>
          <ColumnHeader title="Preparing" count={preparingOrders.length} color="#f59e0b" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {preparingOrders.map(order => (
              <OrderTicket 
                key={order.id} 
                order={order} 
                onStatusChange={handleStatusChange} 
                isLoading={!!loadingOrders[order.id]} 
              />
            ))}
            {preparingOrders.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>No orders in prep</div>}
          </div>
        </div>

        {/* READY COLUMN */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', minHeight: '600px' }}>
          <ColumnHeader title="Ready for Pickup" count={readyOrders.length} color="#10b981" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {readyOrders.map(order => (
              <OrderTicket 
                key={order.id} 
                order={order} 
                onStatusChange={handleStatusChange} 
                isLoading={!!loadingOrders[order.id]} 
              />
            ))}
            {readyOrders.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>No orders waiting</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
