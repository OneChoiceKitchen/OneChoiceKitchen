import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MenuCategoriesService } from './menu-categories.service';
import { SecurePortal } from '../app/auth/secure-portal.decorator';
import { PortalCode, EntitlementLevel } from '@prisma/client';
import { RequireEntitlement } from '../feature-access/require-entitlement.decorator';

@SecurePortal(PortalCode.PARTNER, true)
@Controller('menu-categories')
export class MenuCategoriesController {
  constructor(private readonly menuCategoriesService: MenuCategoriesService) {}

  @RequireEntitlement('menu', EntitlementLevel.WRITE)
  @Post()
  create(@Body() data: any) {
    return this.menuCategoriesService.create(data);
  }

  @RequireEntitlement('menu', EntitlementLevel.READ)
  @Get()
  findAll() {
    return this.menuCategoriesService.findAll();
  }

  @RequireEntitlement('menu', EntitlementLevel.READ)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuCategoriesService.findOne(id);
  }

  @RequireEntitlement('menu', EntitlementLevel.WRITE)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.menuCategoriesService.update(id, data);
  }

  @RequireEntitlement('menu', EntitlementLevel.WRITE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuCategoriesService.remove(id);
  }
}
