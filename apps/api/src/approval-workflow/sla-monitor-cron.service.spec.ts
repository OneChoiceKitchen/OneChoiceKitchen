import {
  ApprovalCase,
  ApprovalCaseStatus,
  ApprovalStage,
  ApprovalType,
  EscalationLevel,
} from '@prisma/client';

import { SlaMonitorCronService } from './sla-monitor-cron.service';

describe('SlaMonitorCronService', () => {
  const prisma = {
    approvalCase: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
  };
  const nextDate = new Date('2026-07-21T04:30:00.000Z');
  const workingDays = { addWorkingDays: jest.fn().mockReturnValue(nextDate) };
  const service = new SlaMonitorCronService(prisma as never, workingDays as never);
  const now = new Date('2026-07-18T04:30:00.000Z');

  const approvalCase: ApprovalCase = {
    id: 'case-a',
    type: ApprovalType.ONBOARDING,
    referenceId: 'registration-a',
    activeKey: 'ONBOARDING:registration-a',
    tenantId: 'tenant-a',
    userId: null,
    currentStage: ApprovalStage.PENDING_ADMIN,
    status: ApprovalCaseStatus.PENDING,
    dueAt: new Date('2026-07-17T04:30:00.000Z'),
    escalationLevel: EscalationLevel.NONE,
    nextEscalationAt: new Date('2026-07-17T04:30:00.000Z'),
    version: 0,
    completedAt: null,
    createdAt: new Date('2026-07-14T04:30:00.000Z'),
    updatedAt: new Date('2026-07-14T04:30:00.000Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.approvalCase.updateMany.mockResolvedValue({ count: 1 });
    prisma.approvalCase.findUniqueOrThrow.mockImplementation(({ where }) =>
      Promise.resolve({ ...approvalCase, id: where.id, version: approvalCase.version + 1 }),
    );
    workingDays.addWorkingDays.mockReturnValue(nextDate);
  });

  it('escalates NONE to Partner Admin and schedules two working days', async () => {
    const notify = jest.spyOn(service, 'sendPartnerAdminEscalation').mockResolvedValue();

    await service.processOverdueCase(approvalCase, now);

    expect(workingDays.addWorkingDays).toHaveBeenCalledWith(approvalCase.nextEscalationAt, 2);
    expect(prisma.approvalCase.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          escalationLevel: EscalationLevel.ESCALATED_PARTNER_ADMIN,
          nextEscalationAt: nextDate,
        }),
      }),
    );
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('escalates Partner Admin to Admin and schedules one working day', async () => {
    const notify = jest.spyOn(service, 'sendAdminEscalation').mockResolvedValue();

    await service.processOverdueCase(
      { ...approvalCase, escalationLevel: EscalationLevel.ESCALATED_PARTNER_ADMIN },
      now,
    );

    expect(workingDays.addWorkingDays).toHaveBeenCalledWith(approvalCase.nextEscalationAt, 1);
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('escalates Admin to Super Admin and clears the next trigger', async () => {
    const notify = jest.spyOn(service, 'sendSuperAdminEscalation').mockResolvedValue();

    await service.processOverdueCase(
      { ...approvalCase, escalationLevel: EscalationLevel.ESCALATED_ADMIN },
      now,
    );

    expect(prisma.approvalCase.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          escalationLevel: EscalationLevel.ESCALATED_SUPER_ADMIN,
          nextEscalationAt: null,
        }),
      }),
    );
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('does not send duplicate notifications when another worker claims the case', async () => {
    prisma.approvalCase.updateMany.mockResolvedValue({ count: 0 });
    const notify = jest.spyOn(service, 'sendPartnerAdminEscalation').mockResolvedValue();

    await service.processOverdueCase(approvalCase, now);

    expect(notify).not.toHaveBeenCalled();
  });

  it('runs the daily pending summary after processing overdue cases', async () => {
    prisma.approvalCase.findMany.mockResolvedValueOnce([]);
    const summary = jest.spyOn(service, 'sendDailyAdminSummaryEmail').mockResolvedValue();

    await service.monitorApprovalSlas();

    expect(summary).toHaveBeenCalledTimes(1);
  });
});
