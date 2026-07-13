import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { MapsService } from './maps.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  getConfigs() {
    return this.mapsService.getConfigs();
  }

  @Get('active-config')
  getActiveConfig() {
    return this.mapsService.getActiveProvider();
  }

  @Post('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  upsertConfig(@Body() body: any) {
    return this.mapsService.upsertConfig(body);
  }

  @Post('test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  testConfig(@Body() body: any) {
    return this.mapsService.testConfig(body);
  }

  @Patch('config/:id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  setActiveProvider(@Param('id') id: string) {
    return this.mapsService.setActiveProvider(id);
  }

  @Post('route')
  @UseGuards(JwtAuthGuard)
  getRoute(@Body() body: { originLat: number; originLng: number; destLat: number; destLng: number }) {
    return this.mapsService.getRouteDistance(body.originLat, body.originLng, body.destLat, body.destLng);
  }
}
