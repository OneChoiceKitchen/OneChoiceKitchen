import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { SecurePortal } from '../app/auth/secure-portal.decorator';
import { PortalCode, EntitlementLevel } from '@prisma/client';
import { RequireEntitlement } from '../feature-access/require-entitlement.decorator';

@SecurePortal(PortalCode.PARTNER, true)
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @RequireEntitlement('menu', EntitlementLevel.WRITE)
  @Post()
  create(@Body() data: any) {
    return this.menuItemsService.create(data);
  }

  @RequireEntitlement('menu', EntitlementLevel.READ)
  @Get()
  findAll() {
    return this.menuItemsService.findAll();
  }

  @RequireEntitlement('menu', EntitlementLevel.READ)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuItemsService.findOne(id);
  }

  @RequireEntitlement('menu', EntitlementLevel.WRITE)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.menuItemsService.update(id, data);
  }

  @RequireEntitlement('menu', EntitlementLevel.WRITE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuItemsService.remove(id);
  }
}
