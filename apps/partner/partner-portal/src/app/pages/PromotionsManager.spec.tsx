import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromotionsManager from './PromotionsManager';
import axios from 'axios';

jest.mock('axios');

describe('PromotionsManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (axios.get as jest.Mock).mockReturnValue(new Promise(() => {})); // pending promise
    render(<PromotionsManager />);
    expect(screen.getByText('Loading campaigns...')).toBeInTheDocument();
  });

  it('renders promotions data', async () => {
    const mockPromos = [
      {
        id: '1',
        code: 'SUMMER20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderValue: 500,
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 86400000).toISOString(),
        isActive: true,
      },
    ];
    (axios.get as jest.Mock).mockResolvedValue({ data: mockPromos });

    render(<PromotionsManager />);

    await waitFor(() => {
      expect(screen.getByText('SUMMER20')).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument();
      expect(screen.getByText('₹500')).toBeInTheDocument();
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    });
  });

  it('opens modal to create promotion', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: [] });
    render(<PromotionsManager />);

    await waitFor(() => {
      expect(screen.getByText('+ Create Promo')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Create Promo'));
    expect(screen.getByText('Create Promotion')).toBeInTheDocument();
  });

  it('submits new promotion', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: [] });
    (axios.post as jest.Mock).mockResolvedValue({ data: { success: true } });

    render(<PromotionsManager />);

    await waitFor(() => {
      expect(screen.getByText('+ Create Promo')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Create Promo'));

    const codeInput = screen.getByPlaceholderText('e.g. SAVE20');
    fireEvent.change(codeInput, { target: { value: 'NEWPROMO' } });

    const valueInputs = screen.getAllByRole('spinbutton');
    // Discount value is the first number input
    fireEvent.change(valueInputs[0], { target: { value: '15' } });

    // validFrom and validUntil are datetime-local
    const dateInputs = document.querySelectorAll('input[type="datetime-local"]');
    fireEvent.change(dateInputs[0], { target: { value: '2026-08-01T10:00' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026-08-31T10:00' } });

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/promotions',
        expect.objectContaining({
          code: 'NEWPROMO',
          discountValue: 15,
        }),
        expect.any(Object)
      );
    });
  });
});
