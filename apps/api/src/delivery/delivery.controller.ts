import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@Controller('delivery-settings')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get()
  async getSettings() {
    return this.deliveryService.getSettings();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  async updateSettings(@Body() dto: any) {
    return this.deliveryService.updateSettings(dto);
  }

  // ── Surge Pricing Endpoints ────────────────────────────────────────────

  @Get('surge-pricing')
  getSurgePricingRules() {
    return this.deliveryService.getSurgePricingRules();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('surge-pricing')
  createSurgePricingRule(@Body() data: any) {
    return this.deliveryService.createSurgePricingRule(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('surge-pricing/:id')
  updateSurgePricingRule(@Param('id') id: string, @Body() data: any) {
    return this.deliveryService.updateSurgePricingRule(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete('surge-pricing/:id')
  deleteSurgePricingRule(@Param('id') id: string) {
    return this.deliveryService.deleteSurgePricingRule(id);
  }

  @Get('surge-pricing/active')
  getActiveSurgeMultiplier() {
    return this.deliveryService.getActiveSurgeMultiplier();
  }

  // ── SLA Config Endpoints ───────────────────────────────────────────────

  @Get('sla')
  getSlaConfigs() {
    return this.deliveryService.getSlaConfigs();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('sla')
  upsertSlaConfig(@Body() data: any) {
    return this.deliveryService.upsertSlaConfig(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete('sla/:id')
  deleteSlaConfig(@Param('id') id: string) {
    return this.deliveryService.deleteSlaConfig(id);
  }
}
