import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { SecurePortal } from '../app/auth/secure-portal.decorator';
import { PortalCode, EntitlementLevel } from '@prisma/client';
import { RequireEntitlement } from '../feature-access/require-entitlement.decorator';

@SecurePortal(PortalCode.PARTNER, true)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @RequireEntitlement('inventory', EntitlementLevel.WRITE)
  @Post()
  create(@Body() data: any) {
    return this.inventoryService.create(data);
  }

  @RequireEntitlement('inventory', EntitlementLevel.READ)
  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @RequireEntitlement('inventory', EntitlementLevel.READ)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @RequireEntitlement('inventory', EntitlementLevel.WRITE)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.inventoryService.update(id, data);
  }

  @RequireEntitlement('inventory', EntitlementLevel.WRITE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }

  @RequireEntitlement('inventory', EntitlementLevel.WRITE)
  @Post('menu-mapping')
  mapToMenu(@Body() body: { menuItemId: string, inventoryItemId: string, quantityRequired: number }) {
    return this.inventoryService.mapToMenu(body.menuItemId, body.inventoryItemId, body.quantityRequired);
  }
}
