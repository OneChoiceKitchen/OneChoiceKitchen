import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TenantUserManager } from './TenantUserManager';
import { useTenantUsers } from './useTenantUsers';
import type { UserContextResponse } from '@org/frontend-platform';

// Mock the hook
jest.mock('./useTenantUsers');

// Mock PreviewGuard
jest.mock('@org/frontend-platform', () => ({
  PreviewGuard: ({ children }: { children: React.ReactNode }) => <div data-testid="preview-guard">{children}</div>,
  useUserContext: () => ({ tenantId: 'tenant-123' }),
}));

const mockUseTenantUsers = useTenantUsers as jest.MockedFunction<typeof useTenantUsers>;

const mockUsers: UserContextResponse[] = [
  {
    userId: '1',
    displayName: 'Chef John',
    email: 'john@example.com',
    portalCode: 'PARTNER',
    portalName: 'Partner Portal',
    siteTitle: 'Test',
    tenantId: 'tenant-123',
    partnerName: 'Test Partner',
    roles: ['CHEF'],
    permissions: [],
  }
];

describe('TenantUserManager', () => {
  const mockFetchUsers = jest.fn();
  const mockInviteUser = jest.fn().mockResolvedValue(true);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTenantUsers.mockReturnValue({
      users: mockUsers,
      tenantRoles: [
        { id: '1', name: 'STORE_MANAGER' },
        { id: '2', name: 'CASHIER' }
      ],
      loading: false,
      error: null,
      fetchUsers: mockFetchUsers,
      inviteUser: mockInviteUser,
    });
  });

  it('renders correctly and fetches users on mount inside PreviewGuard', () => {
    render(<TenantUserManager />);
    expect(screen.getByTestId('preview-guard')).toBeTruthy();
    expect(screen.getByText('Tenant Staff Management')).toBeTruthy();
    expect(mockFetchUsers).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Chef John')).toBeTruthy();
    expect(screen.getByText('john@example.com')).toBeTruthy();
    expect(screen.getByText('CHEF')).toBeTruthy();
  });

  it('displays loading state', () => {
    mockUseTenantUsers.mockReturnValue({
      users: [],
      tenantRoles: [],
      loading: true,
      error: null,
      fetchUsers: mockFetchUsers,
      inviteUser: mockInviteUser,
    });
    render(<TenantUserManager />);
    expect(screen.getByText('Loading staff...')).toBeTruthy();
  });

  it('displays error message', () => {
    mockUseTenantUsers.mockReturnValue({
      users: [],
      tenantRoles: [],
      loading: false,
      error: 'Network Error',
      fetchUsers: mockFetchUsers,
      inviteUser: mockInviteUser,
    });
    render(<TenantUserManager />);
    expect(screen.getByText('Network Error')).toBeTruthy();
  });

  it('opens modal, inputs email and role, and saves assignment', async () => {
    render(<TenantUserManager />);
    
    // Open modal
    const inviteButton = screen.getByText('Assign Role');
    fireEvent.click(inviteButton);

    // Modal should be visible
    expect(screen.getByText('Send Invite')).toBeTruthy();
    
    // Check that non-tenant roles (like SUPER_ADMIN) are not in the select options
    const roleSelect = screen.getByTestId('role-select') as HTMLSelectElement;
    const options = Array.from(roleSelect.options).map(opt => opt.value);
    expect(options).not.toContain('SUPER_ADMIN');
    expect(options).toContain('CASHIER');

    // Input email
    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'newstaff@example.com' } });

    // Change role
    fireEvent.change(roleSelect, { target: { value: 'CASHIER' } });

    // Send Invite
    const saveButton = screen.getByText('Send Invite');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockInviteUser).toHaveBeenCalledWith('newstaff@example.com', 'CASHIER');
    });
  });
});
