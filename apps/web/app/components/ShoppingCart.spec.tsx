import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ShoppingCart from './ShoppingCart';

describe('ShoppingCart', () => {
  const mockCart = {
    'item1': {
      item: { id: 'item1', name: 'Pizza', price: 200, category: 'Main' },
      qty: 2,
      price: 200
    }
  };

  it('renders empty cart message when cart is empty', () => {
    render(<ShoppingCart cart={{}} updateCartQty={jest.fn()} />);
    expect(screen.getByText('Your cart is empty')).toBeTruthy();
  });

  it('renders cart items in a table', () => {
    render(<ShoppingCart cart={mockCart} updateCartQty={jest.fn()} />);
    expect(screen.getByText('Pizza')).toBeTruthy();
    expect(screen.getByText('Main')).toBeTruthy();
    expect(screen.getByText('₹200')).toBeTruthy();
    expect(screen.getByText('₹400')).toBeTruthy(); // Total
  });

  it('calls updateCartQty when buttons are clicked', () => {
    const updateCartQty = jest.fn();
    render(<ShoppingCart cart={mockCart} updateCartQty={updateCartQty} />);
    
    // Increment
    fireEvent.click(screen.getByText('+'));
    expect(updateCartQty).toHaveBeenCalledWith('item1', 3);

    // Decrement
    fireEvent.click(screen.getByText('-'));
    expect(updateCartQty).toHaveBeenCalledWith('item1', 1);
  });
});
