import React from 'react';

export interface AvailableOrder {
  id: string;
  restaurant: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  deliveryAddress: string;
  totalAmount: number;
  deliveryFee: number;
  createdAt: string;
}

export interface AvailableOrdersListProps {
  orders: AvailableOrder[];
  onAcceptOrder: (orderId: string) => Promise<void>;
  isLoading?: boolean;
}

export function AvailableOrdersList({ orders, onAcceptOrder, isLoading }: AvailableOrdersListProps) {
  if (isLoading) {
    return <div className="p-4 text-center">Loading available orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-2">No Orders Available</h3>
        <p>Waiting for new delivery requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Available Orders</h2>
      {orders.map((order) => (
        <div key={order.id} className="bg-white p-4 rounded-xl shadow-md border border-[var(--bdr)] flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{order.restaurant.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">Pickup: {order.restaurant.address}</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-[var(--brand-blue)]">₹{order.deliveryFee.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Payout</div>
            </div>
          </div>
          
          <div className="border-t border-dashed border-gray-200 pt-3">
            <p className="text-sm text-gray-600 line-clamp-2">Drop-off: {order.deliveryAddress}</p>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-gray-400">Order: #{order.id.slice(0,8)}</span>
            <button
              onClick={() => onAcceptOrder(order.id)}
              className="px-6 py-2 bg-[var(--brand-blue)] text-white rounded-lg font-medium hover:bg-[var(--brand-blue-dk)] transition-colors"
            >
              Accept Order
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
