import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';
import { PermissionsGuard } from '../app/auth/permissions.guard';
import { Permissions } from '../app/auth/permissions.decorator';
import { PERMISSIONS } from '../app/auth/permissions.constants';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('subscribe/:subscriptionId')
  processPayment(@Param('subscriptionId') subscriptionId: string, @Body('paymentMethodId') paymentMethodId: string) {
    return this.paymentService.processSubscriptionPayment(subscriptionId, paymentMethodId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions(PERMISSIONS.MANAGE_PAYMENTS)
  @Get('config')
  getConfigs() {
    return this.paymentService.getDynamicPaymentGateways();
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions(PERMISSIONS.MANAGE_PAYMENTS)
  @Post('config')
  upsertConfigs(@Body() configs: any[]) {
    return this.paymentService.upsertPaymentConfigs(configs);
  }
}
