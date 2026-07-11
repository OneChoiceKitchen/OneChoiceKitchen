import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SlidersService } from './sliders.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@ApiTags('Sliders')
@Controller('sliders')
export class SlidersController {
  constructor(private readonly slidersService: SlidersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sliders across all portals' })
  findAll() {
    return this.slidersService.findAll();
  }

  @Get('portal/:portalName')
  @ApiOperation({ summary: 'Get active sliders for a specific portal (web, partner, rider)' })
  findByPortal(@Param('portalName') portalName: string) {
    return this.slidersService.findByPortal(portalName);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get slider by id' })
  findOne(@Param('id') id: string) {
    return this.slidersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create a new slider' })
  create(@Body() data: any) {
    return this.slidersService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Put(':id')
  @ApiOperation({ summary: 'Update a slider' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.slidersService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a slider' })
  remove(@Param('id') id: string) {
    return this.slidersService.remove(id);
  }
}
