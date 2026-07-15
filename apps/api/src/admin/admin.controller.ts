import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { SecurePortal } from '../auth/decorators/secure-portal.decorator';
import { PortalCode, TenantStatus } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@SecurePortal(PortalCode.ADMIN, true)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('tenants')
  @Roles('SUPER_ADMIN')
  async getTenants(
    @Query('skip') skip?: string,
    @Query('take') take?: string
  ) {
    return this.adminService.getTenants(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 50
    );
  }

  @Put('tenants/:id/status')
  @Roles('SUPER_ADMIN')
  async updateTenantStatus(
    @Param('id') id: string,
    @Body('status') status: TenantStatus
  ) {
    return this.adminService.updateTenantStatus(id, status);
  }

  @Get('audit-logs')
  @Roles('SUPER_ADMIN')
  async getAuditLogs(
    @Query('skip') skip?: string,
    @Query('take') take?: string
  ) {
    return this.adminService.getAuditLogs(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 50
    );
  }
}
