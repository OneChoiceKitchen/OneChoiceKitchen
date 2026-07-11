import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() body: { orderId: string; amount: number; reason: string }) {
    return this.refundsService.create(req.user.userId, body);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  findAll(@Query() filters: any) {
    return this.refundsService.findAll(filters);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findUserRefunds(@Req() req: any) {
    return this.refundsService.findUserRefunds(req.user.userId);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  approve(@Param('id') id: string, @Body() body: { adminId: string }) {
    return this.refundsService.approve(id, body.adminId);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  reject(@Param('id') id: string, @Body() body: { adminId: string; notes: string }) {
    return this.refundsService.reject(id, body.adminId, body.notes);
  }

  @Patch(':id/process')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  process(@Param('id') id: string, @Body() body: { adminId: string; transactionRef: string }) {
    return this.refundsService.process(id, body.adminId, body.transactionRef);
  }
}
