import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { HallBookingsService } from './hall-bookings.service';

@Controller('hall-bookings')
export class HallBookingsController {
  constructor(private readonly hallBookingsService: HallBookingsService) {}

  @Post()
  create(@Body() createBookingDto: any) {
    return this.hallBookingsService.create(createBookingDto);
  }

  @Get()
  findAll(@Query('status') status: string) {
    return this.hallBookingsService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hallBookingsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.hallBookingsService.updateStatus(id, status);
  }
}
