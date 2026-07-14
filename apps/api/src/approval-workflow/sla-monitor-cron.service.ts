import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  ApprovalCase,
  ApprovalCaseStatus,
  EscalationLevel,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { WorkingDayService } from './working-day.service';

@Injectable()
export class SlaMonitorCronService {
  private readonly logger = new Logger(SlaMonitorCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly workingDays: WorkingDayService,
  ) {}

  @Cron('0 8 * * *', { timeZone: 'Asia/Kolkata' })
  async monitorApprovalSlas(): Promise<void> {
    const now = new Date();
    const overdueCases = await this.prisma.approvalCase.findMany({
      where: {
        status: { notIn: [ApprovalCaseStatus.APPROVED, ApprovalCaseStatus.REJECTED] },
        nextEscalationAt: { lt: now },
      },
      orderBy: { nextEscalationAt: 'asc' },
    });

    for (const approvalCase of overdueCases) {
      await this.processOverdueCase(approvalCase, now);
    }

    await this.sendDailyAdminSummaryEmail();
  }

  async processOverdueCase(approvalCase: ApprovalCase, now = new Date()): Promise<void> {
    if (!approvalCase.nextEscalationAt || approvalCase.nextEscalationAt >= now) {
      return;
    }

    const escalation = this.nextEscalation(approvalCase);
    if (!escalation) {
      return;
    }

    const updateResult = await this.prisma.approvalCase.updateMany({
      where: {
        id: approvalCase.id,
        version: approvalCase.version,
        status: { notIn: [ApprovalCaseStatus.APPROVED, ApprovalCaseStatus.REJECTED] },
        escalationLevel: approvalCase.escalationLevel,
        nextEscalationAt: { lt: now },
      },
      data: {
        escalationLevel: escalation.level,
        nextEscalationAt: escalation.nextEscalationAt,
        version: { increment: 1 },
      },
    });
    if (updateResult.count !== 1) {
      return;
    }

    const updatedCase = await this.prisma.approvalCase.findUniqueOrThrow({
      where: { id: approvalCase.id },
    });
    await escalation.notify(updatedCase);
  }

  async sendPartnerAdminEscalation(approvalCase: ApprovalCase): Promise<void> {
    this.logger.warn(`Partner Admin escalation required for approval case ${approvalCase.id}`);
  }

  async sendAdminEscalation(approvalCase: ApprovalCase): Promise<void> {
    this.logger.warn(`Admin Portal escalation required for approval case ${approvalCase.id}`);
  }

  async sendSuperAdminEscalation(approvalCase: ApprovalCase): Promise<void> {
    this.logger.error(`Super Admin escalation required for approval case ${approvalCase.id}`);
  }

  async sendDailyAdminSummaryEmail(): Promise<void> {
    const pendingCases = await this.prisma.approvalCase.findMany({
      where: { status: ApprovalCaseStatus.PENDING },
      select: {
        id: true,
        type: true,
        currentStage: true,
        tenantId: true,
        dueAt: true,
        escalationLevel: true,
      },
      orderBy: { dueAt: 'asc' },
    });

    const stageCounts = pendingCases.reduce<Record<string, number>>((summary, approvalCase) => {
      summary[approvalCase.currentStage] = (summary[approvalCase.currentStage] ?? 0) + 1;
      return summary;
    }, {});
    this.logger.log(
      `Daily approval summary: ${pendingCases.length} pending; stages=${JSON.stringify(stageCounts)}`,
    );
  }

  private nextEscalation(approvalCase: ApprovalCase): {
    level: EscalationLevel;
    nextEscalationAt: Date | null;
    notify: (updatedCase: ApprovalCase) => Promise<void>;
  } | null {
    if (!approvalCase.nextEscalationAt) {
      return null;
    }

    if (approvalCase.escalationLevel === EscalationLevel.NONE) {
      return {
        level: EscalationLevel.ESCALATED_PARTNER_ADMIN,
        nextEscalationAt: this.workingDays.addWorkingDays(approvalCase.nextEscalationAt, 2),
        notify: (updatedCase) => this.sendPartnerAdminEscalation(updatedCase),
      };
    }
    if (approvalCase.escalationLevel === EscalationLevel.ESCALATED_PARTNER_ADMIN) {
      return {
        level: EscalationLevel.ESCALATED_ADMIN,
        nextEscalationAt: this.workingDays.addWorkingDays(approvalCase.nextEscalationAt, 1),
        notify: (updatedCase) => this.sendAdminEscalation(updatedCase),
      };
    }
    if (approvalCase.escalationLevel === EscalationLevel.ESCALATED_ADMIN) {
      return {
        level: EscalationLevel.ESCALATED_SUPER_ADMIN,
        nextEscalationAt: null,
        notify: (updatedCase) => this.sendSuperAdminEscalation(updatedCase),
      };
    }
    return null;
  }
}
