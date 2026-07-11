import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TiffinService } from '../tiffin/tiffin.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

const PARTNER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PARTNER', 'RESTAURANT_ADMIN', 'PARTNER_ADMIN'] as const;

/**
 * @deprecated Use `/api/tiffin/menu` — this controller delegates to the same TiffinService for backward compatibility.
 */
@ApiTags('Tiffin Menus (Legacy)')
@Controller('tiffin-menus')
export class TiffinMenusController {
  constructor(private readonly tiffinService: TiffinService) {}

  @Get()
  @ApiOperation({ summary: 'List tiffin menus (legacy alias of GET /tiffin/menu)' })
  getAllMenus(@Query('date') date?: string) {
    return date ? this.tiffinService.findByDate(date) : this.tiffinService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PARTNER_ROLES)
  @Post()
  createMenu(@Body() data: any) {
    return this.tiffinService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PARTNER_ROLES)
  @Put(':id')
  updateMenu(@Param('id') id: string, @Body() data: any) {
    return this.tiffinService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PARTNER_ROLES)
  @Delete(':id')
  deleteMenu(@Param('id') id: string) {
    return this.tiffinService.remove(id);
  }
}
