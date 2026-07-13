import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards
} from '@nestjs/common';
import { RidersService } from './riders.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@Controller('riders')
export class RidersController {
  constructor(private readonly ridersService: RidersService) {}

  // Public registration from Rider App
  @Post('register')
  register(@Body() data: { fullName: string; mobile: string; vehicleType?: string }) {
    return this.ridersService.register(data);
  }

  // Admin manual creation
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  create(@Body() data: { fullName: string; mobile: string; vehicleType?: string }) {
    return this.ridersService.register(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get()
  findAll() {
    return this.ridersService.findAll();
  }

  // Admin edit
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<{ fullName: string; mobile: string; vehicleType?: string }>) {
    return this.ridersService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.ridersService.approve(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post(':id/reject')
  reject(@Param('id') id: string) {
    return this.ridersService.reject(id);
  }
}