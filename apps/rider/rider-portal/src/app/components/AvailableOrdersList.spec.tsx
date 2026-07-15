import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AvailableOrdersList } from './AvailableOrdersList';

describe('AvailableOrdersList', () => {
  const mockOrders = [
    {
      id: 'order-1',
      restaurant: { name: 'Test Rest', address: '123 Test St', lat: 0, lng: 0 },
      deliveryAddress: '456 Drop St',
      totalAmount: 500,
      deliveryFee: 50,
      createdAt: new Date().toISOString()
    }
  ];

  it('shows loading state', () => {
    render(<AvailableOrdersList orders={[]} onAcceptOrder={jest.fn()} isLoading={true} />);
    expect(screen.getByText('Loading available orders...')).toBeTruthy();
  });

  it('shows empty state', () => {
    render(<AvailableOrdersList orders={[]} onAcceptOrder={jest.fn()} isLoading={false} />);
    expect(screen.getByText('No Orders Available')).toBeTruthy();
  });

  it('renders orders list and handles accept', () => {
    const onAcceptMock = jest.fn();
    render(<AvailableOrdersList orders={mockOrders} onAcceptOrder={onAcceptMock} isLoading={false} />);
    
    expect(screen.getByText('Test Rest')).toBeTruthy();
    expect(screen.getByText(/456 Drop St/)).toBeTruthy();
    expect(screen.getByText('₹50.00')).toBeTruthy();

    const acceptBtn = screen.getByText('Accept Order');
    fireEvent.click(acceptBtn);
    expect(onAcceptMock).toHaveBeenCalledWith('order-1');
  });
});
