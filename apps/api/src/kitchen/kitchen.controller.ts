import { Controller, Get, Put, Param, Body, BadRequestException } from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { TenantScopeService } from '../app/auth/tenant-scope.service';
import { SecurePortal } from '../app/auth/secure-portal.decorator';
import { Roles } from '../app/auth/roles.decorator';

@Controller('kitchen')
@SecurePortal('PARTNER', true)
@Roles('CHEF', 'KITCHEN_STAFF', 'ADMIN', 'SUPER_ADMIN')
export class KitchenController {
  constructor(
    private readonly kitchenService: KitchenService,
    private readonly tenantScope: TenantScopeService
  ) {}

  @Get('active-orders')
  async getActiveOrders() {
    const tenantId = this.tenantScope.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.kitchenService.getActiveOrders();
  }

  @Put('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    if (!status) {
      throw new BadRequestException('Status is required');
    }
    return this.kitchenService.updateOrderStatus(id, status);
  }
}
