import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  getUserReferrals(@Param('userId') userId: string) {
    return this.referralsService.getUserReferrals(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('admin')
  getAllReferralsAdmin() {
    return this.referralsService.getAllReferralsAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('admin/create')
  createReferral(@Body() body: { referrerId: string; referredEmail: string }) {
    return this.referralsService.createReferral(body.referrerId, body.referredEmail);
  }

  @Post('process')
  processReferral(@Body() body: { code: string; email: string }) {
    return this.referralsService.processReferralCode(body.code, body.email);
  }
}
