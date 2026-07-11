import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MenuService } from '../services/menu.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Menus & Attributes')
@ApiBearerAuth()
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: 'Get all menu items with attributes and options' })
  getAllMenus(
    @Query('restaurantId') restaurantId?: string, 
    @Query('branchId') branchId?: string,
    @Query('userLat') userLat?: string,
    @Query('userLng') userLng?: string
  ) {
    const lat = userLat ? parseFloat(userLat) : undefined;
    const lng = userLng ? parseFloat(userLng) : undefined;
    return this.menuService.getAllMenus(restaurantId, branchId, lat, lng);
  }

  @Post('generate-description')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'RESTAURANT_ADMIN', 'PARTNER')
  @ApiOperation({ summary: 'Auto-generate a description using AI' })
  generateDescription(@Body() body: { name: string }) {
    return this.menuService.generateDescription(body.name);
  }

  @Get('recycle-bin/items')
  @ApiOperation({ summary: 'Get all recycled menu items' })
  getRecycledMenus() {
    return this.menuService.getRecycledMenus();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'RESTAURANT_ADMIN', 'PARTNER')
  @Patch('recycle-bin/items/:id/restore')
  @ApiOperation({ summary: 'Restore a recycled menu item' })
  restoreMenu(@Param('id') id: string) {
    return this.menuService.restoreMenu(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'RESTAURANT_ADMIN', 'PARTNER')
  @Delete('recycle-bin/items/:id/hard')
  @ApiOperation({ summary: 'Permanently delete a menu item' })
  hardDeleteMenu(@Param('id') id: string) {
    return this.menuService.hardDeleteMenu(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific menu item by ID' })
  getMenuById(@Param('id') id: string) {
    return this.menuService.getMenuById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'RESTAURANT_ADMIN', 'PARTNER')
  @Post()
  @ApiOperation({ summary: 'Create a new menu item with dynamic attributes' })
  createMenu(@Body() data: any) {
    return this.menuService.createMenu(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'RESTAURANT_ADMIN', 'PARTNER')
  @Put(':id')
  @ApiOperation({ summary: 'Update a menu item and its attributes' })
  updateMenu(@Param('id') id: string, @Body() data: any) {
    return this.menuService.updateMenu(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'RESTAURANT_ADMIN', 'PARTNER')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a menu item' })
  deleteMenu(@Param('id') id: string) {
    return this.menuService.deleteMenu(id);
  }
}
