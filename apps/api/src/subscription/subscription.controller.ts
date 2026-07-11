import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subService: SubscriptionService) {}

  @Get('plans')
  getPlans() {
    return this.subService.findAllPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  getUserSubscriptions(@Param('id') userId: string) {
    return this.subService.getCustomerSubscriptions(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('book/:userId')
  bookPlan(@Param('userId') userId: string, @Body() data: any) {
    return this.subService.bookSubscription(userId, data);
  }
}
