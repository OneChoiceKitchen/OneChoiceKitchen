import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('faqs')
  getActiveFaqs() {
    return this.supportService.getActiveFaqs();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('admin/faqs')
  getAllFaqsAdmin() {
    return this.supportService.getAllFaqsAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('admin/faqs')
  createFaq(@Body() body: any) {
    return this.supportService.createFaq(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Put('admin/faqs/:id')
  updateFaq(@Param('id') id: string, @Body() body: any) {
    return this.supportService.updateFaq(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete('admin/faqs/:id')
  deleteFaq(@Param('id') id: string) {
    return this.supportService.deleteFaq(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('tickets')
  createTicket(@Body() body: any) {
    return this.supportService.createTicket(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tickets/user/:userId')
  getUserTickets(@Param('userId') userId: string) {
    return this.supportService.getUserTickets(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('admin/tickets')
  getAllTicketsAdmin() {
    return this.supportService.getAllTicketsAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Put('admin/tickets/:id/status')
  updateTicketStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.supportService.updateTicketStatus(id, status);
  }
}
