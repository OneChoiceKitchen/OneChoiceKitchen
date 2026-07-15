import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckoutFlow from './CheckoutFlow';

// Mock useToast from design system
jest.mock('@org/ui-design-system', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
  }),
}));

global.fetch = jest.fn();

describe('CheckoutFlow', () => {
  const mockCart = {
    'item1': {
      item: { id: 'item1', name: 'Pizza', price: 200, category: 'Main' },
      qty: 2,
      price: 200
    }
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders correctly', () => {
    render(<CheckoutFlow cart={mockCart} subtotal={400} onOrderComplete={jest.fn()} />);
    expect(screen.getByText('Checkout Details')).toBeTruthy();
    expect(screen.getByText('Delivery Address')).toBeTruthy();
    expect(screen.getByText('Payment Method')).toBeTruthy();
    expect(screen.getByText('₹400')).toBeTruthy();
  });

  it('shows error if address is missing', async () => {
    const { useToast } = require('@org/ui-design-system');
    const toast = useToast();
    
    render(<CheckoutFlow cart={mockCart} subtotal={400} onOrderComplete={jest.fn()} />);
    fireEvent.click(screen.getByText('Place Order'));
    
    expect(toast.error).toHaveBeenCalledWith('Please enter a delivery address');
  });

  it('submits order successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'order-123' }),
    });

    const onOrderComplete = jest.fn();
    render(<CheckoutFlow cart={mockCart} subtotal={400} onOrderComplete={onOrderComplete} />);
    
    fireEvent.change(screen.getByPlaceholderText('Enter complete address...'), {
      target: { value: '123 Main St' }
    });
    
    fireEvent.click(screen.getByText('Place Order'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/orders/checkout', expect.objectContaining({
        method: 'POST',
      }));
      expect(onOrderComplete).toHaveBeenCalled();
    });
  });
});
