import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  ApprovalAction,
  ApprovalCaseStatus,
  ApprovalStage,
  ApprovalType,
  EscalationLevel,
} from '@prisma/client';

import { ApprovalWorkflowService } from './approval-workflow.service';

describe('ApprovalWorkflowService', () => {
  const transaction = {
    approvalCase: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      updateMany: jest.fn(),
    },
    approvalDecision: { create: jest.fn() },
  };
  const prisma = {
    approvalCase: { create: jest.fn() },
    $transaction: jest.fn((callback) => callback(transaction)),
  };
  const dueAt = new Date('2026-07-17T04:30:00.000Z');
  const workingDays = { addWorkingDays: jest.fn().mockReturnValue(dueAt) };
  const service = new ApprovalWorkflowService(prisma as never, workingDays as never);

  const pendingCase = {
    id: 'case-a',
    type: ApprovalType.ONBOARDING,
    referenceId: 'registration-a',
    activeKey: 'ONBOARDING:registration-a',
    tenantId: 'tenant-a',
    userId: null,
    currentStage: ApprovalStage.PENDING_MANAGER,
    status: ApprovalCaseStatus.PENDING,
    dueAt,
    escalationLevel: EscalationLevel.ESCALATED_PARTNER_ADMIN,
    nextEscalationAt: dueAt,
    version: 2,
    completedAt: null,
    createdAt: new Date('2026-07-14T04:30:00.000Z'),
    updatedAt: new Date('2026-07-14T04:30:00.000Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    workingDays.addWorkingDays.mockReturnValue(dueAt);
    prisma.approvalCase.create.mockImplementation(({ data }) => Promise.resolve({ id: 'case-a', ...data }));
    transaction.approvalCase.findUnique.mockResolvedValue(pendingCase);
    transaction.approvalCase.updateMany.mockResolvedValue({ count: 1 });
    transaction.approvalDecision.create.mockResolvedValue({ id: 'decision-a' });
    transaction.approvalCase.findUniqueOrThrow.mockResolvedValue({
      ...pendingCase,
      currentStage: ApprovalStage.PENDING_ADMIN,
      version: 3,
    });
  });

  it.each([
    [ApprovalType.ONBOARDING, ApprovalStage.PENDING_MANAGER],
    [ApprovalType.SUBSCRIPTION, ApprovalStage.PENDING_ACCOUNTS],
  ])('creates %s cases at the correct initial stage', async (type, initialStage) => {
    await service.createCase(type, 'reference-a', 'tenant-a');

    expect(prisma.approvalCase.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type,
        referenceId: 'reference-a',
        activeKey: `${type}:reference-a`,
        currentStage: initialStage,
        status: ApprovalCaseStatus.PENDING,
        dueAt,
        nextEscalationAt: dueAt,
      }),
    });
  });

  it('advances onboarding from Manager to Admin and resets escalation', async () => {
    await service.advanceCase('case-a', 'manager-a', ApprovalAction.APPROVE, 'KYC verified');

    expect(transaction.approvalCase.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ id: 'case-a', version: 2 }),
      data: expect.objectContaining({
        currentStage: ApprovalStage.PENDING_ADMIN,
        status: ApprovalCaseStatus.PENDING,
        escalationLevel: EscalationLevel.NONE,
        nextEscalationAt: dueAt,
        version: { increment: 1 },
      }),
    });
    expect(transaction.approvalDecision.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        approverUserId: 'manager-a',
        action: ApprovalAction.APPROVE,
        fromStage: ApprovalStage.PENDING_MANAGER,
        toStage: ApprovalStage.PENDING_ADMIN,
      }),
    });
  });

  it('advances subscription Accounts to Manager', async () => {
    transaction.approvalCase.findUnique.mockResolvedValue({
      ...pendingCase,
      type: ApprovalType.SUBSCRIPTION,
      currentStage: ApprovalStage.PENDING_ACCOUNTS,
    });

    await service.advanceCase('case-a', 'accounts-a', ApprovalAction.APPROVE);

    expect(transaction.approvalCase.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ currentStage: ApprovalStage.PENDING_MANAGER }),
      }),
    );
  });

  it('rejects any pending stage and clears SLA scheduling', async () => {
    await service.advanceCase('case-a', 'manager-a', ApprovalAction.REJECT, 'Invalid documents');

    expect(transaction.approvalCase.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          currentStage: ApprovalStage.REJECTED,
          status: ApprovalCaseStatus.REJECTED,
          activeKey: null,
          nextEscalationAt: null,
          completedAt: expect.any(Date),
        }),
      }),
    );
  });

  it('rejects missing and already completed cases', async () => {
    transaction.approvalCase.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.advanceCase('missing', 'manager-a', ApprovalAction.APPROVE),
    ).rejects.toThrow(NotFoundException);

    transaction.approvalCase.findUnique.mockResolvedValueOnce({
      ...pendingCase,
      status: ApprovalCaseStatus.APPROVED,
    });
    await expect(
      service.advanceCase('case-a', 'manager-a', ApprovalAction.APPROVE),
    ).rejects.toThrow(ConflictException);
  });

  it('rejects a concurrent stale transition without writing an audit decision', async () => {
    transaction.approvalCase.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.advanceCase('case-a', 'manager-a', ApprovalAction.APPROVE),
    ).rejects.toThrow(ConflictException);
    expect(transaction.approvalDecision.create).not.toHaveBeenCalled();
  });
});
