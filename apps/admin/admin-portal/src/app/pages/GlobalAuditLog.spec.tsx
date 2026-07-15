import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlobalAuditLog from './GlobalAuditLog';
import axios from 'axios';

jest.mock('axios');
jest.mock('@org/ui-design-system', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn()
  })
}));

const mockLogs = [
  {
    id: 'log1',
    createdAt: new Date('2023-10-10T10:00:00Z').toISOString(),
    approver: { name: 'Admin One' },
    action: 'APPROVE',
    notes: 'Looks good',
    case: {
      tenant: { legalName: 'Approved Tenant' }
    }
  },
  {
    id: 'log2',
    createdAt: new Date('2023-10-11T10:00:00Z').toISOString(),
    action: 'REJECT',
    case: {
      tenant: { legalName: 'Rejected Tenant' }
    }
  }
];

describe('GlobalAuditLog Component', () => {
  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { data: mockLogs, meta: { total: 2 } } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render audit logs', async () => {
    render(<GlobalAuditLog />);
    expect(screen.getByText('Loading audit logs...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Admin One')).toBeInTheDocument();
      expect(screen.getByText('APPROVE')).toBeInTheDocument();
      expect(screen.getByText('Approved Tenant')).toBeInTheDocument();
      expect(screen.getByText('Looks good')).toBeInTheDocument();

      expect(screen.getByText('REJECT')).toBeInTheDocument();
      expect(screen.getByText('Rejected Tenant')).toBeInTheDocument();
    });
  });
});
