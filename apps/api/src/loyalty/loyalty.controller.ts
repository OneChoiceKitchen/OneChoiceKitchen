import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('rewards')
  getRewards() {
    return this.loyaltyService.getRewards();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('admin/rewards')
  getAllRewardsAdmin() {
    return this.loyaltyService.getAllRewardsAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('admin/rewards')
  createReward(@Body() body: any) {
    return this.loyaltyService.createReward(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Put('admin/rewards/:id')
  updateReward(@Param('id') id: string, @Body() body: any) {
    return this.loyaltyService.updateReward(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete('admin/rewards/:id')
  deleteReward(@Param('id') id: string) {
    return this.loyaltyService.deleteReward(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  getUserData(@Param('userId') userId: string) {
    return this.loyaltyService.getUserLoyaltyData(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyData(@Req() req: any) {
    return this.loyaltyService.getUserLoyaltyData(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('redeem')
  redeemReward(@Body() body: { userId: string; rewardId: string }) {
    return this.loyaltyService.redeemReward(body.userId, body.rewardId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('redeem/me')
  redeemMyReward(@Req() req: any, @Body() body: { rewardId: string }) {
    return this.loyaltyService.redeemReward(req.user.id, body.rewardId);
  }
}
