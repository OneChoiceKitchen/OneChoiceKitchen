import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { ApprovalWorkflowService } from './approval-workflow.service';
import { SlaMonitorCronService } from './sla-monitor-cron.service';
import { WorkingDayService } from './working-day.service';

@Module({
  imports: [PrismaModule],
  providers: [ApprovalWorkflowService, SlaMonitorCronService, WorkingDayService],
  exports: [ApprovalWorkflowService, WorkingDayService],
})
export class ApprovalWorkflowModule {}
