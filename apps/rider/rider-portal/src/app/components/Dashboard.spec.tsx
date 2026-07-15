import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { useToast } from '@org/ui-design-system';

// Mock dependencies
jest.mock('@org/ui-design-system', () => ({
  useToast: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn()
  }))
}));

// Mock fetch
global.fetch = jest.fn();

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders AvailableOrdersList if no active delivery', async () => {
    (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
      if (url.includes('active-delivery')) {
        return { ok: true, json: async () => null };
      }
      if (url.includes('available-orders')) {
        return {
          ok: true,
          json: async () => [
            {
              id: '1',
              restaurant: { name: 'Test Rest', address: 'addr', lat: 0, lng: 0 },
              deliveryAddress: 'addr',
              deliveryFee: 10,
              totalAmount: 100
            }
          ]
        };
      }
      return { ok: false };
    });

    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Rest')).toBeTruthy();
      expect(screen.getByText('Available Orders')).toBeTruthy();
    });
  });

  it('renders ActiveDeliveryTracker if active delivery exists', async () => {
    (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
      if (url.includes('active-delivery')) {
        return {
          ok: true,
          json: async () => ({
            id: '1',
            status: 'OUT_FOR_DELIVERY',
            restaurant: { name: 'Test Rest', address: 'addr', lat: 0, lng: 0 },
            user: { name: 'User', mobile: '123' },
            deliveryAddress: 'addr',
            totalAmount: 100,
            items: []
          })
        };
      }
      return { ok: false };
    });

    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Active Delivery')).toBeTruthy();
      expect(screen.getByText(/Test Rest/)).toBeTruthy();
    });
  });
});
