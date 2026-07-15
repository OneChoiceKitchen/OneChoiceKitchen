import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromoCodeInput from './PromoCodeInput';
import axios from 'axios';

jest.mock('axios');

describe('PromoCodeInput', () => {
  const mockOnApply = jest.fn();
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input field initially', () => {
    render(<PromoCodeInput tenantId="tenant1" cartTotal={1000} onApply={mockOnApply} onRemove={mockOnRemove} />);
    expect(screen.getByPlaceholderText('Enter code')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
  });

  it('calls API and onApply when valid promo code is entered', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { valid: true, discountAmount: 100 },
    });

    render(<PromoCodeInput tenantId="tenant1" cartTotal={1000} onApply={mockOnApply} onRemove={mockOnRemove} />);
    
    const input = screen.getByPlaceholderText('Enter code');
    fireEvent.change(input, { target: { value: 'TESTPROMO' } });
    
    fireEvent.click(screen.getByText('Apply'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/promotions/validate', {
        code: 'TESTPROMO',
        tenantId: 'tenant1',
        cartTotal: 1000,
      });
      expect(mockOnApply).toHaveBeenCalledWith('TESTPROMO', 100);
    });
  });

  it('displays error message when promo code is invalid', async () => {
    (axios.post as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Invalid promo code' } },
    });

    render(<PromoCodeInput tenantId="tenant1" cartTotal={1000} onApply={mockOnApply} onRemove={mockOnRemove} />);
    
    const input = screen.getByPlaceholderText('Enter code');
    fireEvent.change(input, { target: { value: 'INVALID' } });
    
    fireEvent.click(screen.getByText('Apply'));

    await waitFor(() => {
      expect(screen.getByText('Invalid promo code')).toBeInTheDocument();
      expect(mockOnApply).not.toHaveBeenCalled();
    });
  });

  it('renders applied state correctly', () => {
    render(
      <PromoCodeInput 
        tenantId="tenant1" 
        cartTotal={1000} 
        onApply={mockOnApply} 
        onRemove={mockOnRemove} 
        appliedCode="TESTPROMO"
        discountAmount={100}
      />
    );
    
    expect(screen.getByText('TESTPROMO')).toBeInTheDocument();
    expect(screen.getByText(/You saved ₹100/i)).toBeInTheDocument();
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    render(
      <PromoCodeInput 
        tenantId="tenant1" 
        cartTotal={1000} 
        onApply={mockOnApply} 
        onRemove={mockOnRemove} 
        appliedCode="TESTPROMO"
        discountAmount={100}
      />
    );
    
    fireEvent.click(screen.getByText('Remove'));
    expect(mockOnRemove).toHaveBeenCalled();
  });
});
