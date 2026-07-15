import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubscriptionManager from './SubscriptionManager';
import axios from 'axios';
import { useToast } from '@org/ui-design-system';

jest.mock('axios');
jest.mock('@org/ui-design-system', () => ({
  useToast: jest.fn(),
}));

describe('SubscriptionManager', () => {
  const mockToast = { success: jest.fn(), error: jest.fn() };
  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (axios.post as jest.Mock).mockClear();
    mockToast.success.mockClear();
    mockToast.error.mockClear();
  });

  it('renders available plans', () => {
    render(<SubscriptionManager />);
    expect(screen.getByText('Available Plans')).toBeInTheDocument();
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('handles subscription click successfully', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: { success: true } });
    render(<SubscriptionManager />);

    const buttons = screen.getAllByText('Select Plan');
    fireEvent.click(buttons[0]); // Click Starter plan

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/billing/subscribe',
        { subscriptionId: 'tier-1', amount: 999 },
        expect.any(Object)
      );
      expect(mockToast.success).toHaveBeenCalledWith('Successfully subscribed to Starter plan!');
    });
  });

  it('handles subscription click failure', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('Network error'));
    render(<SubscriptionManager />);

    const buttons = screen.getAllByText('Select Plan');
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('An error occurred during subscription processing');
    });
  });
});
