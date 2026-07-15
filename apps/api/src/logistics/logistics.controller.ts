import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { SecurePortal } from '../app/auth/secure-portal.decorator';
import { PortalCode } from '@prisma/client';
import { UserContext } from '../app/auth/user-context.decorator';

@Controller('logistics')
@SecurePortal(PortalCode.RIDER, true)
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Get('available-orders')
  async getAvailableOrders() {
    return this.logisticsService.getAvailableOrders();
  }
  
  @Get('active-delivery')
  async getActiveDelivery(@UserContext('userId') userId: string) {
    return this.logisticsService.getActiveDelivery(userId);
  }

  @Post('orders/:id/accept')
  async acceptOrder(
    @Param('id') orderId: string,
    @UserContext('userId') userId: string
  ) {
    return this.logisticsService.acceptOrder(orderId, userId);
  }

  @Put('orders/:id/status')
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body('status') status: string,
    @UserContext('userId') userId: string
  ) {
    return this.logisticsService.updateOrderStatus(orderId, userId, status);
  }
}
