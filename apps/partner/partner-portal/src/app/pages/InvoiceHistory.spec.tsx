import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InvoiceHistory from './InvoiceHistory';
import axios from 'axios';
import { useToast } from '@org/ui-design-system';

jest.mock('axios');
jest.mock('@org/ui-design-system', () => ({
  useToast: jest.fn(),
}));

describe('InvoiceHistory', () => {
  const mockToast = { error: jest.fn() };

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (axios.get as jest.Mock).mockClear();
    mockToast.error.mockClear();
  });

  it('renders loading state initially', () => {
    (axios.get as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<InvoiceHistory />);
    expect(screen.getByText('Loading invoices...')).toBeInTheDocument();
  });

  it('renders invoices successfully', async () => {
    const mockInvoices = [
      { id: 'inv-123', amount: 500, status: 'PAID', billingDate: '2023-10-01T00:00:00Z', pdfUrl: '/pdf' },
    ];
    (axios.get as jest.Mock).mockResolvedValue({ data: mockInvoices });

    render(<InvoiceHistory />);

    await waitFor(() => {
      expect(screen.getByText('Invoice History')).toBeInTheDocument();
      expect(screen.getByText('inv-123')).toBeInTheDocument();
      expect(screen.getByText('₹500')).toBeInTheDocument();
    });
  });

  it('renders fallback data on error', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<InvoiceHistory />);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to load invoice history');
      expect(screen.getByText('inv-1001')).toBeInTheDocument(); // from fallback data
    });
  });
});
