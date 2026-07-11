import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles('SUPER_ADMIN', 'PARTNER_ADMIN', 'PARTNER_STAFF')
  @Post()
  create(@Body() data: any) {
    return this.inventoryService.create(data);
  }

  @Roles('SUPER_ADMIN', 'PARTNER_ADMIN', 'PARTNER_STAFF')
  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Roles('SUPER_ADMIN', 'PARTNER_ADMIN', 'PARTNER_STAFF')
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.inventoryService.update(id, data);
  }

  @Roles('SUPER_ADMIN', 'PARTNER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
