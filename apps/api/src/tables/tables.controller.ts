import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { TablesService } from './tables.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

const ADMIN_PARTNER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_ADMIN', 'PARTNER', 'PARTNER_ADMIN'] as const;

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  findAll(@Query('restaurantId') restaurantId?: string, @Query('branchId') branchId?: string) {
    return this.tablesService.findAll(restaurantId, branchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Post()
  create(@Body() createData: any) {
    return this.tablesService.create(createData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.tablesService.update(id, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tablesService.remove(id);
  }
}
