import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

const ADMIN_PARTNER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_ADMIN', 'PARTNER', 'PARTNER_ADMIN'] as const;

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() body: any) {
    return this.reservationsService.create(req.user.userId, body);
  }

  @Post('check-in')
  @UseGuards(JwtAuthGuard)
  checkIn(@Body() body: { confirmationCode: string; qrCodeUrl?: string }) {
    return this.reservationsService.checkIn(body.confirmationCode, body.qrCodeUrl);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findUserReservations(@Req() req: any) {
    return this.reservationsService.findUserReservations(req.user.userId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  findAll(@Query() filters: any) {
    return this.reservationsService.findAll(filters);
  }

  @Get('restaurant/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  findRestaurantReservations(@Param('id') id: string, @Query('date') date?: string) {
    return this.reservationsService.findRestaurantReservations(id, date);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  updateStatus(@Param('id') id: string, @Body() body: { status: string; tableNumber?: string }) {
    return this.reservationsService.updateStatus(id, body.status, body.tableNumber);
  }
}
