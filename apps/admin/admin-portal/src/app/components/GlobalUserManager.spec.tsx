import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlobalUserManager } from './GlobalUserManager';
import { useGlobalUsers } from './useGlobalUsers';
import type { UserContextResponse } from '@org/frontend-platform';

// Mock the hook
jest.mock('./useGlobalUsers');

const mockUseGlobalUsers = useGlobalUsers as jest.MockedFunction<typeof useGlobalUsers>;

const mockUsers: UserContextResponse[] = [
  {
    userId: '1',
    displayName: 'Test User',
    email: 'test@example.com',
    portalCode: 'ADMIN',
    portalName: 'Admin Portal',
    siteTitle: 'Test',
    tenantId: null,
    partnerName: null,
    roles: ['SUPER_ADMIN'],
    permissions: [],
  }
];

describe('GlobalUserManager', () => {
  const mockFetchUsers = jest.fn();
  const mockAssignRole = jest.fn().mockResolvedValue(true);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGlobalUsers.mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,
      fetchUsers: mockFetchUsers,
      assignRole: mockAssignRole,
    });
  });

  it('renders correctly and fetches users on mount', () => {
    render(<GlobalUserManager />);
    expect(screen.getByText('Global User Manager')).toBeTruthy();
    expect(mockFetchUsers).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Test User')).toBeTruthy();
    expect(screen.getByText('test@example.com')).toBeTruthy();
    expect(screen.getByText('SUPER_ADMIN')).toBeTruthy();
  });

  it('displays loading state', () => {
    mockUseGlobalUsers.mockReturnValue({
      users: [],
      loading: true,
      error: null,
      fetchUsers: mockFetchUsers,
      assignRole: mockAssignRole,
    });
    render(<GlobalUserManager />);
    expect(screen.getByText('Loading users...')).toBeTruthy();
  });

  it('displays error message', () => {
    mockUseGlobalUsers.mockReturnValue({
      users: [],
      loading: false,
      error: 'Network Error',
      fetchUsers: mockFetchUsers,
      assignRole: mockAssignRole,
    });
    render(<GlobalUserManager />);
    expect(screen.getByText('Network Error')).toBeTruthy();
  });

  it('opens modal, changes role, and saves assignment', async () => {
    render(<GlobalUserManager />);
    
    // Open modal
    const assignButtons = screen.getAllByText('Assign Role');
    fireEvent.click(assignButtons[0]);

    // Modal should be visible
    expect(screen.getByText('Save Assignment')).toBeTruthy();
    
    // Change portal
    const portalSelect = screen.getByTestId('portal-select');
    fireEvent.change(portalSelect, { target: { value: 'PARTNER' } });

    // Change role
    const roleInput = screen.getByTestId('role-input');
    fireEvent.change(roleInput, { target: { value: 'PARTNER_ADMIN' } });

    // Save
    const saveButton = screen.getByText('Save Assignment');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockAssignRole).toHaveBeenCalledWith('1', 'PARTNER', 'PARTNER_ADMIN');
    });
  });
});
