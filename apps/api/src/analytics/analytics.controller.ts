import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SecurePortal } from '../app/auth/secure-portal.decorator';
import { TenantScopeService } from '../app/auth/tenant-scope.service';

@Controller('analytics')
@SecurePortal('ADMIN', 'PARTNER')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly tenantScope: TenantScopeService
  ) {}

  @Get('kpis')
  async getKpis() {
    const tenantId = this.tenantScope.getTenantIdOrNull();
    return this.analyticsService.getKpis(tenantId);
  }

  @Get('sales-trend')
  async getSalesTrend() {
    const tenantId = this.tenantScope.getTenantIdOrNull();
    return this.analyticsService.getSalesTrend(tenantId);
  }
}
