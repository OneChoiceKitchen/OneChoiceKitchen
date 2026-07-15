import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderTicket from './OrderTicket';

const mockOrder = {
  id: 'order-123',
  status: 'PENDING',
  createdAt: new Date().toISOString(),
  items: [
    {
      id: 'item-1',
      menuItemId: 'menu-1',
      quantity: 2,
      menuItem: { name: 'Burger' },
      customizations: 'No onions'
    }
  ],
  specialInstructions: 'Extra napkins'
};

describe('OrderTicket Component', () => {
  it('should render order details correctly', () => {
    render(<OrderTicket order={mockOrder} onStatusChange={jest.fn()} isLoading={false} />);
    
    expect(screen.getByText('#ORDER-12')).toBeInTheDocument();
    expect(screen.getByText('2x')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('No onions')).toBeInTheDocument();
    expect(screen.getByText('Note:')).toBeInTheDocument();
    expect(screen.getByText('Extra napkins')).toBeInTheDocument();
  });

  it('should display "Start Cooking" button for PENDING order', () => {
    render(<OrderTicket order={mockOrder} onStatusChange={jest.fn()} isLoading={false} />);
    expect(screen.getByText('Start Cooking')).toBeInTheDocument();
  });

  it('should call onStatusChange with PREPARING when "Start Cooking" is clicked', () => {
    const mockOnStatusChange = jest.fn();
    render(<OrderTicket order={mockOrder} onStatusChange={mockOnStatusChange} isLoading={false} />);
    
    fireEvent.click(screen.getByText('Start Cooking'));
    expect(mockOnStatusChange).toHaveBeenCalledWith('order-123', 'PREPARING');
  });

  it('should display "Mark Ready" button for PREPARING order', () => {
    const preparingOrder = { ...mockOrder, status: 'PREPARING' };
    render(<OrderTicket order={preparingOrder} onStatusChange={jest.fn()} isLoading={false} />);
    expect(screen.getByText('Mark Ready')).toBeInTheDocument();
  });
});
