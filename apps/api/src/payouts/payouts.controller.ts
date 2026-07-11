import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@Controller('payouts')
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  findAll(@Query() filters: any) {
    return this.payoutsService.findAll(filters);
  }

  @Get('rider/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'RIDER')
  findForRider(@Param('id') id: string) {
    return this.payoutsService.findForRecipient(id);
  }

  @Get('partner/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PARTNER')
  findForPartner(@Param('id') id: string) {
    return this.payoutsService.findForRecipient(id);
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  generate(@Body() body: { periodStart: string; periodEnd: string; type: 'RIDER' | 'PARTNER' }) {
    return this.payoutsService.generatePayouts(body.periodStart, body.periodEnd, body.type);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  approve(@Param('id') id: string, @Body() body: { adminId: string }) {
    return this.payoutsService.approve(id, body.adminId);
  }

  @Patch(':id/process')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  markProcessed(@Param('id') id: string, @Body() body: { adminId: string; transactionRef: string }) {
    return this.payoutsService.markProcessed(id, body.adminId, body.transactionRef);
  }
}
