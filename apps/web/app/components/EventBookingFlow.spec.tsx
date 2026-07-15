import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventBookingFlow from './EventBookingFlow';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
}));

import axios from 'axios';

describe('EventBookingFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the first step correctly', () => {
    render(<EventBookingFlow />);
    expect(screen.getByText('What service do you need?')).toBeTruthy();
    expect(screen.getByText('HALL')).toBeTruthy();
    expect(screen.getByText('PHOTOGRAPHY')).toBeTruthy();
    expect(screen.getByText('DECORATION')).toBeTruthy();
  });

  it('navigates through the steps and submits', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });

    render(<EventBookingFlow />);

    // Step 1: Select service and continue
    fireEvent.click(screen.getByText('Continue'));

    // Step 2: Date & Time
    expect(screen.getByText('When is your event?')).toBeTruthy();
    
    const dateInput = screen.getByLabelText('Event Date');
    const startTimeInput = screen.getByLabelText('Start Time');
    const endTimeInput = screen.getByLabelText('End Time');

    fireEvent.change(dateInput, { target: { value: '2026-08-01' } });
    fireEvent.change(startTimeInput, { target: { value: '10:00' } });
    fireEvent.change(endTimeInput, { target: { value: '14:00' } });

    fireEvent.click(screen.getByText('Continue'));

    // Step 3: Details
    expect(screen.getByText('Any special requirements?')).toBeTruthy();
    
    const notesInput = screen.getByLabelText('Additional Notes');
    fireEvent.change(notesInput, { target: { value: 'Test note' } });

    fireEvent.click(screen.getByText('Confirm Booking'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/bookings', {
        tenantId: 'tenant-1',
        customerId: 'customer-user-id',
        serviceType: 'HALL',
        eventStartDate: expect.any(String),
        eventEndDate: expect.any(String),
        specialRequirements: 'Test note'
      });
      expect(screen.getByText('Booking Confirmed!')).toBeTruthy();
    });
  });

  it('shows error if dates are missing on step 2', () => {
    render(<EventBookingFlow />);
    
    // Go to step 2
    fireEvent.click(screen.getByText('Continue'));
    
    // Try to continue without filling
    fireEvent.click(screen.getByText('Continue'));
    
    expect(screen.getByText('Please select date and times')).toBeTruthy();
  });
});
