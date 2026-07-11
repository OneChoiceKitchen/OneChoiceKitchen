import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PARTNER', 'SUPER_ADMIN', 'ADMIN')
  upload(@Body() body: any) {
    const { restaurantId, ...data } = body;
    return this.complianceService.upload(restaurantId, data);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  findAll() {
    return this.complianceService.findAll();
  }

  @Get('restaurant/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PARTNER', 'SUPER_ADMIN', 'ADMIN')
  findByRestaurant(@Param('id') id: string) {
    return this.complianceService.findByRestaurant(id);
  }

  @Patch(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  review(
    @Param('id') id: string,
    @Body() body: { status: string; reviewNotes: string; reviewedById: string },
  ) {
    return this.complianceService.review(id, body.status, body.reviewNotes, body.reviewedById);
  }
}
