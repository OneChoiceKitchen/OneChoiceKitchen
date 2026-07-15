import { Controller, Post, Get, Body, BadRequestException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { TenantScopeService } from '../app/auth/tenant-scope.service';
import { SecurePortal } from '../app/auth/secure-portal.decorator';

@Controller('billing')
@SecurePortal('PARTNER')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly tenantScope: TenantScopeService
  ) {}

  @Post('subscribe')
  async subscribe(@Body() body: { subscriptionId: string; amount: number }) {
    const tenantId = this.tenantScope.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.billingService.simulateSubscriptionPayment(tenantId, body.subscriptionId, body.amount);
  }

  @Get('invoices')
  async getInvoices() {
    const tenantId = this.tenantScope.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.billingService.getInvoices(tenantId);
  }
}
