import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { MenuManager } from './MenuManager';
import { useMenuManagement } from '../hooks/useMenuManagement';
import { useModuleEntitlement } from '@org/frontend-platform';

// Mock the hooks
jest.mock('../hooks/useMenuManagement');
jest.mock('@org/frontend-platform', () => ({
  ...jest.requireActual('@org/frontend-platform'),
  useModuleEntitlement: jest.fn(),
  PreviewGuard: ({ children, moduleId, requiredEntitlement }: any) => {
    const { useModuleEntitlement } = require('@org/frontend-platform');
    const actual = useModuleEntitlement(moduleId);
    // Simple mock logic for test
    if (actual === 'WRITE' || actual === 'MANAGE') return <div data-testid="preview-guard-pass">{children}</div>;
    return <div data-testid="preview-guard-blocked">Preview Guard Blocked</div>;
  }
}));

describe('MenuManager', () => {
  const mockCreateCategory = jest.fn();
  const mockCreateItem = jest.fn();
  const mockDeleteCategory = jest.fn();
  const mockDeleteItem = jest.fn();

  beforeEach(() => {
    (useModuleEntitlement as jest.Mock).mockReturnValue('WRITE');
    (useMenuManagement as jest.Mock).mockReturnValue({
      categories: [{ id: 'cat-1', name: 'Starters' }],
      items: [{ id: 'item-1', name: 'Spring Roll', categoryId: 'cat-1' }],
      loading: false,
      error: null,
      createCategory: mockCreateCategory,
      createItem: mockCreateItem,
      deleteCategory: mockDeleteCategory,
      deleteItem: mockDeleteItem
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render categories and items', () => {
    render(<MenuManager />);
    expect(screen.getAllByText('Starters')[0]).toBeInTheDocument();
    expect(screen.getByText('Spring Roll')).toBeInTheDocument();
  });

  it('should call createCategory on submit', async () => {
    render(<MenuManager />);
    const input = screen.getByPlaceholderText('New Category Name');
    fireEvent.change(input, { target: { value: 'Mains' } });
    fireEvent.click(screen.getByText('Add Category'));

    await waitFor(() => {
      expect(mockCreateCategory).toHaveBeenCalledWith({ name: 'Mains' });
    });
  });

  it('should call createItem on submit', async () => {
    render(<MenuManager />);
    const input = screen.getByPlaceholderText('New Item Name');
    fireEvent.change(input, { target: { value: 'Fried Rice' } });
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'cat-1' } });
    
    fireEvent.click(screen.getByText('Add Item'));

    await waitFor(() => {
      expect(mockCreateItem).toHaveBeenCalledWith({ name: 'Fried Rice', categoryId: 'cat-1' });
    });
  });

  it('should be blocked by PreviewGuard if insufficient entitlement', () => {
    (useModuleEntitlement as jest.Mock).mockReturnValue('READ');
    render(<MenuManager />);
    expect(screen.getByTestId('preview-guard-blocked')).toBeInTheDocument();
    expect(screen.queryByText('Starters')).not.toBeInTheDocument();
  });
});
