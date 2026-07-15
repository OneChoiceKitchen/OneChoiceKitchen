import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiveDeliveryTracker } from './ActiveDeliveryTracker';

describe('ActiveDeliveryTracker', () => {
  const mockOrder = {
    id: 'order-1',
    status: 'OUT_FOR_DELIVERY',
    restaurant: { name: 'Test Rest', address: '123 Test St', lat: 0, lng: 0 },
    user: { name: 'John Doe', mobile: '9999999999' },
    deliveryAddress: '456 Drop St',
    totalAmount: 500,
    items: [{ quantity: 2, menuItem: { name: 'Burger' } }]
  };

  it('shows loading state', () => {
    render(<ActiveDeliveryTracker order={null} onUpdateStatus={jest.fn()} isLoading={true} />);
    expect(screen.getByText('Loading delivery details...')).toBeTruthy();
  });

  it('shows empty state when no active order', () => {
    render(<ActiveDeliveryTracker order={null} onUpdateStatus={jest.fn()} isLoading={false} />);
    expect(screen.getByText('No active delivery found.')).toBeTruthy();
  });

  it('renders order details correctly', () => {
    render(<ActiveDeliveryTracker order={mockOrder} onUpdateStatus={jest.fn()} isLoading={false} />);
    
    expect(screen.getByText(/Test Rest/)).toBeTruthy();
    expect(screen.getByText('123 Test St')).toBeTruthy();
    expect(screen.getByText('Drop-off: John Doe')).toBeTruthy();
    expect(screen.getByText('456 Drop St')).toBeTruthy();
    expect(screen.getByText('2x Burger')).toBeTruthy();
    expect(screen.getByText('OUT FOR DELIVERY')).toBeTruthy();
  });

  it('handles mark as delivered', () => {
    const onUpdateStatusMock = jest.fn();
    render(<ActiveDeliveryTracker order={mockOrder} onUpdateStatus={onUpdateStatusMock} isLoading={false} />);
    
    const deliverBtn = screen.getByText('Mark as Delivered');
    fireEvent.click(deliverBtn);
    expect(onUpdateStatusMock).toHaveBeenCalledWith('order-1', 'DELIVERED');
  });

  it('hides mark as delivered button if status is DELIVERED', () => {
    render(<ActiveDeliveryTracker order={{...mockOrder, status: 'DELIVERED'}} onUpdateStatus={jest.fn()} isLoading={false} />);
    expect(screen.queryByText('Mark as Delivered')).toBeNull();
  });
});
