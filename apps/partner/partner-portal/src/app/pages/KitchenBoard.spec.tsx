import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import KitchenBoard from './KitchenBoard';
import axios from 'axios';
import { useKitchenSocket } from '../hooks/useKitchenSocket';

jest.mock('axios');
jest.mock('@org/ui-design-system', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn()
  })
}));

jest.mock('../hooks/useKitchenSocket', () => ({
  useKitchenSocket: jest.fn()
}));

const mockOrders = [
  {
    id: 'order-1',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    items: []
  },
  {
    id: 'order-2',
    status: 'PREPARING',
    createdAt: new Date().toISOString(),
    items: []
  },
  {
    id: 'order-3',
    status: 'READY_FOR_PICKUP',
    createdAt: new Date().toISOString(),
    items: []
  }
];

describe('KitchenBoard Component', () => {
  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({ data: mockOrders });
    (useKitchenSocket as jest.Mock).mockReturnValue({
      socket: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn()
      },
      isConnected: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and display orders in respective columns', async () => {
    render(<KitchenBoard />);
    
    await waitFor(() => {
      expect(screen.getByText('New Orders')).toBeInTheDocument();
      expect(screen.getByText('Preparing')).toBeInTheDocument();
      expect(screen.getByText('Ready for Pickup')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('#ORDER-1')).toBeInTheDocument();
      expect(screen.getByText('#ORDER-2')).toBeInTheDocument();
      expect(screen.getByText('#ORDER-3')).toBeInTheDocument();
    });
  });
});
