import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { EventBookingManager } from './EventBookingManager';

// Mock fetch
global.fetch = jest.fn();

describe('EventBookingManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
    render(<EventBookingManager />);
    expect(screen.getByText('Loading bookings...')).toBeTruthy();
  });

  it('renders bookings fetched from API', async () => {
    const mockBookings = [
      {
        id: '1',
        serviceType: 'HALL',
        customerId: 'customer-1',
        eventStartDate: '2026-08-01T10:00:00Z',
        eventEndDate: '2026-08-01T14:00:00Z',
        status: 'PENDING',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookings,
    });

    render(<EventBookingManager />);

    await waitFor(() => {
      expect(screen.getByText('HALL')).toBeTruthy();
      expect(screen.getAllByText('PENDING').length).toBeGreaterThan(0);
    });
  });

  it('opens details form when Manage is clicked', async () => {
    const mockBookings = [
      {
        id: '1',
        serviceType: 'HALL',
        customerId: 'customer-1',
        eventStartDate: '2026-08-01T10:00:00Z',
        eventEndDate: '2026-08-01T14:00:00Z',
        status: 'PENDING',
        specialRequirements: 'Needs projector',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookings,
    });

    render(<EventBookingManager />);

    await waitFor(() => {
      expect(screen.getByText('Manage')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Manage'));

    await waitFor(() => {
      expect(screen.getByText('Event Booking Details')).toBeTruthy();
      expect(screen.getByDisplayValue('Needs projector')).toBeTruthy();
    });
  });
});
