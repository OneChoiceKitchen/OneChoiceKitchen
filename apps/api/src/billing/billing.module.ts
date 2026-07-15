import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { TenantScopeService } from '../app/auth/tenant-scope.service';

@Module({
  controllers: [BillingController],
  providers: [BillingService, TenantScopeService],
  exports: [BillingService],
})
export class BillingModule {}
