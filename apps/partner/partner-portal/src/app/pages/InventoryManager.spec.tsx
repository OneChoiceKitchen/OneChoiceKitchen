import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { InventoryManager } from './InventoryManager';
import { useInventoryManagement } from '../hooks/useInventoryManagement';
import { useModuleEntitlement } from '@org/frontend-platform';

// Mock the hooks
jest.mock('../hooks/useInventoryManagement');
jest.mock('@org/frontend-platform', () => ({
  ...jest.requireActual('@org/frontend-platform'),
  useModuleEntitlement: jest.fn(),
  PreviewGuard: ({ children, moduleId, requiredEntitlement }: any) => {
    const { useModuleEntitlement } = require('@org/frontend-platform');
    const actual = useModuleEntitlement(moduleId);
    if (actual === 'WRITE' || actual === 'MANAGE') return <div data-testid="preview-guard-pass">{children}</div>;
    return <div data-testid="preview-guard-blocked">Preview Guard Blocked</div>;
  }
}));

describe('InventoryManager', () => {
  const mockCreateItem = jest.fn();
  const mockDeleteItem = jest.fn();
  const mockMapToMenu = jest.fn();

  beforeEach(() => {
    (useModuleEntitlement as jest.Mock).mockReturnValue('WRITE');
    (useInventoryManagement as jest.Mock).mockReturnValue({
      inventory: [{ id: 'inv-1', name: 'Tomatoes', sku: 'TOM-01' }],
      menuItems: [{ id: 'menu-1', name: 'Tomato Soup' }],
      loading: false,
      error: null,
      createItem: mockCreateItem,
      deleteItem: mockDeleteItem,
      mapToMenu: mockMapToMenu
    });
    
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render inventory items', () => {
    render(<InventoryManager />);
    expect(screen.getAllByText('Tomatoes')[0]).toBeInTheDocument();
    expect(screen.getByText('TOM-01')).toBeInTheDocument();
  });

  it('should call createItem on submit', async () => {
    render(<InventoryManager />);
    const nameInput = screen.getByPlaceholderText('New Item Name');
    const skuInput = screen.getByPlaceholderText('SKU');
    
    fireEvent.change(nameInput, { target: { value: 'Potatoes' } });
    fireEvent.change(skuInput, { target: { value: 'POT-01' } });
    fireEvent.click(screen.getByText('Add Item'));

    await waitFor(() => {
      expect(mockCreateItem).toHaveBeenCalledWith({ name: 'Potatoes', sku: 'POT-01' });
    });
  });

  it('should call mapToMenu on submit', async () => {
    render(<InventoryManager />);
    
    // Selects
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(2);
    
    // Select Menu Item
    fireEvent.change(selects[0], { target: { value: 'menu-1' } });
    // Select Inventory Item
    fireEvent.change(selects[1], { target: { value: 'inv-1' } });
    
    const quantityInput = screen.getByRole('spinbutton');
    fireEvent.change(quantityInput, { target: { value: '5' } });
    
    fireEvent.click(screen.getByText('Save Mapping'));

    await waitFor(() => {
      expect(mockMapToMenu).toHaveBeenCalledWith('menu-1', 'inv-1', 5);
      expect(window.alert).toHaveBeenCalledWith('Mapping created successfully');
    });
  });
});
