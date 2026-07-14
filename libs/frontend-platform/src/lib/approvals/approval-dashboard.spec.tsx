import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import {
  ApprovalDashboard,
  getApprovalSlaTone,
  type ApprovalCaseRecord,
  type ApprovalDashboardClient,
} from './approval-dashboard';

const NOW = new Date('2026-07-14T10:00:00.000Z');

const CASES: ApprovalCaseRecord[] = [
  {
    id: 'case-1',
    type: 'ONBOARDING',
    referenceId: 'partner-100',
    tenantId: 'tenant-1',
    userId: 'user-1',
    currentStage: 'PENDING_MANAGER',
    status: 'PENDING',
    dueAt: '2026-07-17T10:00:00.000Z',
    escalationLevel: 'NONE',
  },
  {
    id: 'case-2',
    type: 'SUBSCRIPTION',
    referenceId: 'sub-200',
    tenantId: 'tenant-2',
    userId: 'user-2',
    currentStage: 'PENDING_ADMIN',
    status: 'PENDING',
    dueAt: '2026-07-14T16:00:00.000Z',
    escalationLevel: 'NONE',
  },
  {
    id: 'case-3',
    type: 'ONBOARDING',
    referenceId: 'rider-300',
    tenantId: null,
    userId: 'user-3',
    currentStage: 'PENDING_ADMIN',
    status: 'PENDING',
    dueAt: '2026-07-10T10:00:00.000Z',
    escalationLevel: 'ESCALATED_ADMIN',
  },
];

function createClient(cases = CASES): ApprovalDashboardClient & {
  get: jest.Mock;
  post: jest.Mock;
} {
  return {
    get: jest.fn().mockResolvedValue({ data: cases }),
    post: jest.fn().mockResolvedValue({
      data: { ...cases[0], status: 'APPROVED', currentStage: 'APPROVED' },
    }),
  };
}

describe('ApprovalDashboard', () => {
  it('renders pending approval cases with SLA status labels', async () => {
    render(<ApprovalDashboard client={createClient()} now={NOW} />);

    expect(screen.getByRole('status')).toBeTruthy();
    expect(await screen.findByText('partner-100')).toBeTruthy();
    expect(screen.getByText('sub-200')).toBeTruthy();
    expect(screen.getByText('rider-300')).toBeTruthy();
    expect(screen.getByText('Normal')).toBeTruthy();
    expect(screen.getByText('Warning')).toBeTruthy();
    expect(screen.getByText('Critical')).toBeTruthy();
  });

  it('advances a case through the configured API endpoint', async () => {
    const client = createClient();
    render(<ApprovalDashboard client={client} now={NOW} />);

    await screen.findByText('partner-100');
    fireEvent.click(screen.getAllByRole('button', { name: /approve/i })[0]);

    await waitFor(() => {
      expect(client.post).toHaveBeenCalledWith(
        '/approval-cases/case-1/advance',
        {
          action: 'APPROVE',
        },
      );
    });
    expect(screen.queryByText('partner-100')).toBeNull();
  });

  it('shows an empty state when no cases are pending', async () => {
    render(<ApprovalDashboard client={createClient([])} now={NOW} />);

    expect(await screen.findByText('No pending approvals.')).toBeTruthy();
  });

  it('surfaces API failures without hiding the dashboard shell', async () => {
    const client = createClient();
    client.get.mockRejectedValue(new Error('failed'));

    render(<ApprovalDashboard client={client} now={NOW} />);

    expect(
      await screen.findByText('Unable to load pending approval cases.'),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: 'SLA Approval Dashboard' }),
    ).toBeTruthy();
  });

  it('computes escalation-first SLA tone', () => {
    expect(getApprovalSlaTone(CASES[0], NOW)).toBe('normal');
    expect(getApprovalSlaTone(CASES[1], NOW)).toBe('warning');
    expect(getApprovalSlaTone(CASES[2], NOW)).toBe('critical');
  });
});
