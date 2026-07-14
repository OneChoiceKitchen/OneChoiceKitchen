import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApprovalAction,
  ApprovalCaseStatus,
  ApprovalStage,
  ApprovalType,
  EscalationLevel,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { WorkingDayService } from './working-day.service';

const INITIAL_SLA_WORKING_DAYS = 3;

const APPROVAL_TRANSITIONS: Readonly<Record<ApprovalType, Partial<Record<ApprovalStage, ApprovalStage>>>> = {
  [ApprovalType.ONBOARDING]: {
    [ApprovalStage.PENDING_MANAGER]: ApprovalStage.PENDING_ADMIN,
    [ApprovalStage.PENDING_ADMIN]: ApprovalStage.APPROVED,
  },
  [ApprovalType.SUBSCRIPTION]: {
    [ApprovalStage.PENDING_ACCOUNTS]: ApprovalStage.PENDING_MANAGER,
    [ApprovalStage.PENDING_MANAGER]: ApprovalStage.PENDING_ADMIN,
    [ApprovalStage.PENDING_ADMIN]: ApprovalStage.APPROVED,
  },
};

@Injectable()
export class ApprovalWorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workingDays: WorkingDayService,
  ) {}

  async createCase(
    type: ApprovalType,
    referenceId: string,
    tenantId: string | null,
    userId: string | null = null,
  ) {
    if (!referenceId.trim()) {
      throw new BadRequestException('Approval reference ID is required');
    }

    const createdAt = new Date();
    const dueAt = this.workingDays.addWorkingDays(createdAt, INITIAL_SLA_WORKING_DAYS);

    try {
      return await this.prisma.approvalCase.create({
        data: {
          type,
          referenceId,
          activeKey: `${type}:${referenceId}`,
          tenantId,
          userId,
          currentStage: this.initialStage(type),
          status: ApprovalCaseStatus.PENDING,
          dueAt,
          escalationLevel: EscalationLevel.NONE,
          nextEscalationAt: dueAt,
          createdAt,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('A pending approval case already exists for this reference');
      }
      throw error;
    }
  }

  async advanceCase(
    caseId: string,
    approverUserId: string,
    action: ApprovalAction,
    notes?: string,
  ) {
    return this.prisma.$transaction(async (transaction) => {
      const approvalCase = await transaction.approvalCase.findUnique({ where: { id: caseId } });
      if (!approvalCase) {
        throw new NotFoundException('Approval case not found');
      }
      if (approvalCase.status !== ApprovalCaseStatus.PENDING) {
        throw new ConflictException('Approval case is already complete');
      }

      const toStage =
        action === ApprovalAction.REJECT
          ? ApprovalStage.REJECTED
          : this.nextApprovedStage(approvalCase.type, approvalCase.currentStage);
      const terminalStatus = this.terminalStatus(toStage);
      const decidedAt = new Date();

      const updateResult = await transaction.approvalCase.updateMany({
        where: {
          id: approvalCase.id,
          version: approvalCase.version,
          status: ApprovalCaseStatus.PENDING,
          currentStage: approvalCase.currentStage,
        },
        data: {
          currentStage: toStage,
          status: terminalStatus ?? ApprovalCaseStatus.PENDING,
          escalationLevel: EscalationLevel.NONE,
          nextEscalationAt: terminalStatus ? null : approvalCase.dueAt,
          activeKey: terminalStatus ? null : approvalCase.activeKey,
          completedAt: terminalStatus ? decidedAt : null,
          version: { increment: 1 },
        },
      });
      if (updateResult.count !== 1) {
        throw new ConflictException('Approval case was changed by another approver');
      }

      await transaction.approvalDecision.create({
        data: {
          approvalCaseId: approvalCase.id,
          approverUserId,
          action,
          fromStage: approvalCase.currentStage,
          toStage,
          notes,
          createdAt: decidedAt,
        },
      });

      return transaction.approvalCase.findUniqueOrThrow({ where: { id: approvalCase.id } });
    });
  }

  private initialStage(type: ApprovalType): ApprovalStage {
    if (type === ApprovalType.ONBOARDING) {
      return ApprovalStage.PENDING_MANAGER;
    }
    if (type === ApprovalType.SUBSCRIPTION) {
      return ApprovalStage.PENDING_ACCOUNTS;
    }
    throw new BadRequestException(`Unsupported approval type: ${type}`);
  }

  private nextApprovedStage(type: ApprovalType, currentStage: ApprovalStage): ApprovalStage {
    const nextStage = APPROVAL_TRANSITIONS[type]?.[currentStage];
    if (!nextStage) {
      throw new ConflictException(`Cannot approve ${type} from stage ${currentStage}`);
    }
    return nextStage;
  }

  private terminalStatus(stage: ApprovalStage): ApprovalCaseStatus | null {
    if (stage === ApprovalStage.APPROVED) {
      return ApprovalCaseStatus.APPROVED;
    }
    if (stage === ApprovalStage.REJECTED) {
      return ApprovalCaseStatus.REJECTED;
    }
    return null;
  }
}
