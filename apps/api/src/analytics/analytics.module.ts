import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

import { PrismaModule } from '../prisma/prisma.module';
import { TenantScopeService } from '../app/auth/tenant-scope.service';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, TenantScopeService],
  exports: [AnalyticsService]
})
export class AnalyticsModule {}
