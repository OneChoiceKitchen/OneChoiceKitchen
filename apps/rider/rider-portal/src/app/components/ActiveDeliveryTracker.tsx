import React from 'react';

export interface ActiveOrder {
  id: string;
  status: string;
  restaurant: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  user: {
    name: string;
    mobile: string;
  };
  deliveryAddress: string;
  totalAmount: number;
  items: Array<{
    quantity: number;
    menuItem: { name: string };
  }>;
}

export interface ActiveDeliveryTrackerProps {
  order: ActiveOrder | null;
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
  isLoading?: boolean;
}

export function ActiveDeliveryTracker({ order, onUpdateStatus, isLoading }: ActiveDeliveryTrackerProps) {
  if (isLoading) {
    return <div className="p-4 text-center">Loading delivery details...</div>;
  }

  if (!order) {
    return <div className="p-4 text-center">No active delivery found.</div>;
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-[var(--brand-blue)]">
        <div className="bg-[var(--brand-blue)] text-white p-4">
          <h2 className="text-xl font-bold flex items-center justify-between">
            Active Delivery
            <span className="text-xs bg-white text-[var(--brand-blue)] px-2 py-1 rounded-full font-bold">
              {order.status.replace(/_/g, ' ')}
            </span>
          </h2>
          <p className="text-sm opacity-90 mt-1">Order #{order.id.slice(0, 8)}</p>
        </div>

        <div className="p-4 space-y-6">
          {/* Pickup Details */}
          <div className="relative pl-6 border-l-2 border-dashed border-gray-300">
            <div className="absolute -left-[9px] top-0 w-4 h-4 bg-gray-400 rounded-full border-2 border-white shadow-sm" />
            <h3 className="font-semibold text-gray-800">Pickup: {order.restaurant.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{order.restaurant.address}</p>
          </div>

          {/* Drop-off Details */}
          <div className="relative pl-6 border-l-2 border-dashed border-gray-300">
            <div className="absolute -left-[9px] top-0 w-4 h-4 bg-[var(--brand-red)] rounded-full border-2 border-white shadow-sm" />
            <h3 className="font-semibold text-gray-800">Drop-off: {order.user.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{order.deliveryAddress}</p>
            <a href={`tel:${order.user.mobile}`} className="text-sm text-[var(--brand-blue)] font-medium mt-2 inline-block">
              📞 Call {order.user.mobile}
            </a>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Items</h4>
            <ul className="text-sm space-y-1 text-gray-600">
              {order.items.map((item, idx) => (
                <li key={idx}>
                  {item.quantity}x {item.menuItem.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
          {order.status === 'OUT_FOR_DELIVERY' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
              className="w-full py-4 bg-[var(--brand-blue)] text-white text-lg font-bold rounded-xl shadow-lg hover:bg-[var(--brand-blue-dk)] transition-colors"
            >
              Mark as Delivered
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
