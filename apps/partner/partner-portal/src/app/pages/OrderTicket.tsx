import React from 'react';

interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  customizations?: string;
  menuItem: {
    name: string;
  };
}

interface Order {
  id: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
  specialInstructions?: string;
}

interface OrderTicketProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: string) => void;
  isLoading: boolean;
}

export default function OrderTicket({ order, onStatusChange, isLoading }: OrderTicketProps) {
  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING': return 'PREPARING';
      case 'PREPARING': return 'READY_FOR_PICKUP';
      default: return currentStatus;
    }
  };

  const nextStatus = getNextStatus(order.status);
  const timeElapsed = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      position: 'relative',
      transition: 'all 0.3s ease',
      opacity: isLoading ? 0.6 : 1,
      transform: isLoading ? 'scale(0.98)' : 'scale(1)',
    }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255,255,255,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          borderRadius: '8px'
        }}>
          <div style={{
            width: '24px', height: '24px',
            border: '3px solid #2563EB',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
          #{order.id.substring(0, 8).toUpperCase()}
        </span>
        <span style={{ fontSize: '0.8rem', color: timeElapsed > 15 ? '#DC2626' : '#64748b', fontWeight: 600 }}>
          {timeElapsed}m ago
        </span>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
        {order.items.map(item => (
          <li key={item.id} style={{ marginBottom: '0.5rem', color: '#334155' }}>
            <span style={{ fontWeight: 600, marginRight: '0.5rem' }}>{item.quantity}x</span>
            {item.menuItem?.name || 'Unknown Item'}
            {item.customizations && (
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '1.5rem', fontStyle: 'italic' }}>
                {item.customizations}
              </div>
            )}
          </li>
        ))}
      </ul>

      {order.specialInstructions && (
        <div style={{ 
          background: '#fef2f2', 
          color: '#b91c1c', 
          padding: '0.5rem', 
          borderRadius: '4px', 
          fontSize: '0.8rem',
          marginBottom: '1rem',
          borderLeft: '3px solid #DC2626'
        }}>
          <strong>Note:</strong> {order.specialInstructions}
        </div>
      )}

      {nextStatus !== order.status && (
        <button
          onClick={() => onStatusChange(order.id, nextStatus)}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '0.5rem',
            background: order.status === 'PENDING' ? '#2563EB' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {order.status === 'PENDING' ? 'Start Cooking' : 'Mark Ready'}
        </button>
      )}
    </div>
  );
}
