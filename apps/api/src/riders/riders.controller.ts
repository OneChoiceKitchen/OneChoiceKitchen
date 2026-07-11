import {
  Controller,
  Get,
  Post,
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

  @Post('register')
  register(@Body() data: { fullName: string; mobile: string; vehicleType?: string }) {
    return this.ridersService.register(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get()
  findAll() {
    return this.ridersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.ridersService.approve(id);
  }
}
