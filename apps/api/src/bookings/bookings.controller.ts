import { Controller, Get, Post, Body, Param, Patch, Delete, Req } from '@common/nestjs';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { SecurePortal } from '../auth/decorators/secure-portal.decorator';
import { PortalCode } from '@prisma/client';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.createBooking(createBookingDto);
  }

  @SecurePortal(PortalCode.PARTNER, true)
  @Get()
  findAll(@Req() req: any) {
    // Assuming tenantId is attached to req by the auth guard
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID not found in request');
    }
    return this.bookingsService.findAllByTenant(tenantId);
  }

  @SecurePortal(PortalCode.PARTNER, true)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user?.tenantId;
    return this.bookingsService.findOne(id, tenantId);
  }

  @SecurePortal(PortalCode.PARTNER, true)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto, @Req() req: any) {
    const tenantId = req.user?.tenantId;
    return this.bookingsService.update(id, tenantId, updateBookingDto);
  }

  @SecurePortal(PortalCode.PARTNER, true)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user?.tenantId;
    return this.bookingsService.remove(id, tenantId);
  }
}
