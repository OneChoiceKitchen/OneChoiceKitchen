import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  join(@Req() req: any, @Body() body: any) {
    return this.waitlistService.join(req.user.userId, body);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getUserWaitlist(@Req() req: any) {
    return this.waitlistService.getUserWaitlist(req.user.userId);
  }

  @Get('restaurant/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PARTNER', 'SUPER_ADMIN', 'ADMIN')
  getRestaurantWaitlist(@Param('id') id: string) {
    return this.waitlistService.getRestaurantWaitlist(id);
  }

  @Patch(':id/notify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PARTNER', 'SUPER_ADMIN', 'ADMIN')
  notifyCustomer(@Param('id') id: string) {
    return this.waitlistService.notifyCustomer(id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelEntry(@Param('id') id: string, @Req() req: any) {
    return this.waitlistService.cancelEntry(id, req.user.userId);
  }
}
