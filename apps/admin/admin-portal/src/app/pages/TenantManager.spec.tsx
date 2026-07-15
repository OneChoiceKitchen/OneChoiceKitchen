import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TenantManager from './TenantManager';
import axios from 'axios';

jest.mock('axios');
jest.mock('@org/ui-design-system', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn()
  })
}));

const mockTenants = [
  {
    id: 't1',
    legalName: 'Test Kitchen',
    businessType: 'RESTAURANT',
    status: 'ACTIVE',
    subscriptions: [{ status: 'ACTIVE' }]
  },
  {
    id: 't2',
    legalName: 'Suspended Cafe',
    businessType: 'CAFE',
    status: 'SUSPENDED',
    subscriptions: []
  }
];

describe('TenantManager Component', () => {
  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { data: mockTenants, meta: { total: 2 } } });
    (axios.put as jest.Mock).mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render tenants', async () => {
    render(<TenantManager />);
    expect(screen.getByText('Loading tenants...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Kitchen')).toBeInTheDocument();
      expect(screen.getByText('Suspended Cafe')).toBeInTheDocument();
    });
  });

  it('should call updateStatus API on select change', async () => {
    render(<TenantManager />);
    await waitFor(() => {
      expect(screen.getByText('Test Kitchen')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'SUSPENDED' } });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/admin/tenants/t1/status', { status: 'SUSPENDED' }, expect.any(Object));
    });
  });
});
