import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { TiffinService } from './tiffin.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

const ADMIN_PARTNER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_ADMIN', 'PARTNER', 'PARTNER_ADMIN'] as const;

@Controller('tiffin')
export class TiffinController {
  constructor(private readonly tiffinService: TiffinService) {}

  @Get('menu')
  findAll(
    @Query('restaurantId') restaurantId?: string, 
    @Query('branchId') branchId?: string,
    @Query('userLat') userLat?: string,
    @Query('userLng') userLng?: string
  ) {
    const lat = userLat ? parseFloat(userLat) : undefined;
    const lng = userLng ? parseFloat(userLng) : undefined;
    return this.tiffinService.findAll(restaurantId, branchId, lat, lng);
  }

  @Get('menu/recycled')
  getRecycledMenus(
    @Query('restaurantId') restaurantId?: string, 
    @Query('branchId') branchId?: string
  ) {
    return this.tiffinService.getRecycledMenus(restaurantId, branchId);
  }

  @Get('menu/:id')
  findOne(@Param('id') id: string) {
    return this.tiffinService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Patch('menu/:id/restore')
  restoreMenu(@Param('id') id: string) {
    return this.tiffinService.restoreMenu(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Delete('menu/:id/hard')
  hardDeleteMenu(@Param('id') id: string) {
    return this.tiffinService.hardDeleteMenu(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Post('menu')
  create(@Body() createData: any) {
    return this.tiffinService.create(createData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Put('menu/:id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.tiffinService.update(id, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Delete('menu/:id')
  remove(@Param('id') id: string) {
    return this.tiffinService.remove(id);
  }

  @Get('flyers')
  getFlyers() {
    return this.tiffinService.getFlyers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Put('flyers/:type')
  updateFlyer(@Param('type') type: string, @Body() updateData: any) {
    return this.tiffinService.updateFlyer(type, updateData);
  }

  @Get('plans')
  getPlans(@Query('restaurantId') restaurantId?: string, @Query('branchId') branchId?: string) {
    return this.tiffinService.getPlans(restaurantId, branchId);
  }

  @Get('plans/recycled')
  getRecycledPlans(@Query('restaurantId') restaurantId?: string, @Query('branchId') branchId?: string) {
    return this.tiffinService.getRecycledPlans(restaurantId, branchId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Post('plans')
  createPlan(@Body() createData: any) {
    return this.tiffinService.createPlan(createData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Put('plans/:id')
  updatePlan(@Param('id') id: string, @Body() updateData: any) {
    return this.tiffinService.updatePlan(id, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Delete('plans/:id')
  deletePlan(@Param('id') id: string) {
    return this.tiffinService.deletePlan(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Patch('plans/:id/restore')
  restorePlan(@Param('id') id: string) {
    return this.tiffinService.restorePlan(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Delete('plans/:id/hard')
  hardDeletePlan(@Param('id') id: string) {
    return this.tiffinService.hardDeletePlan(id);
  }

  @Get('terms')
  getTerms(@Query('restaurantId') restaurantId?: string, @Query('branchId') branchId?: string) {
    return this.tiffinService.getTerms(restaurantId, branchId);
  }

  @Get('terms/recycled')
  getRecycledTerms(@Query('restaurantId') restaurantId?: string, @Query('branchId') branchId?: string) {
    return this.tiffinService.getRecycledTerms(restaurantId, branchId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Post('terms')
  createTerm(@Body() createData: any) {
    return this.tiffinService.createTerm(createData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Put('terms/:id')
  updateTerm(@Param('id') id: string, @Body() updateData: any) {
    return this.tiffinService.updateTerm(id, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Delete('terms/:id')
  deleteTerm(@Param('id') id: string) {
    return this.tiffinService.deleteTerm(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Patch('terms/:id/restore')
  restoreTerm(@Param('id') id: string) {
    return this.tiffinService.restoreTerm(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Delete('terms/:id/hard')
  hardDeleteTerm(@Param('id') id: string) {
    return this.tiffinService.hardDeleteTerm(id);
  }

  @Get('settings')
  getGlobalSettings(@Query('restaurantId') restaurantId?: string, @Query('branchId') branchId?: string) {
    return this.tiffinService.getGlobalSettings(restaurantId, branchId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Put('settings')
  updateGlobalSettings(@Body() updateData: any) {
    return this.tiffinService.updateGlobalSettings(updateData);
  }

  @Get('holidays')
  getHolidays(@Query('restaurantId') restaurantId?: string, @Query('branchId') branchId?: string) {
    return this.tiffinService.getHolidays(restaurantId, branchId);
  }

  @Get('holidays/recycled')
  getRecycledHolidays(@Query('restaurantId') restaurantId?: string, @Query('branchId') branchId?: string) {
    return this.tiffinService.getRecycledHolidays(restaurantId, branchId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Post('holidays')
  createHoliday(@Body() createData: any) {
    return this.tiffinService.createHoliday(createData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Put('holidays/:id')
  updateHoliday(@Param('id') id: string, @Body() updateData: any) {
    return this.tiffinService.updateHoliday(id, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Delete('holidays/:id')
  deleteHoliday(@Param('id') id: string) {
    return this.tiffinService.deleteHoliday(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Patch('holidays/:id/restore')
  restoreHoliday(@Param('id') id: string) {
    return this.tiffinService.restoreHoliday(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Delete('holidays/:id/hard')
  hardDeleteHoliday(@Param('id') id: string) {
    return this.tiffinService.hardDeleteHoliday(id);
  }

  @Get('offers')
  getOffers() {
    return this.tiffinService.getOffers();
  }

  @Get('offers/all')
  getAllOffers() {
    return this.tiffinService.getAllOffers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Post('offers')
  createOffer(@Body() createData: any) {
    return this.tiffinService.createOffer(createData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Put('offers/:id')
  updateOffer(@Param('id') id: string, @Body() updateData: any) {
    return this.tiffinService.updateOffer(id, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_PARTNER_ROLES)
  @Delete('offers/:id')
  deleteOffer(@Param('id') id: string) {
    return this.tiffinService.deleteOffer(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('seed-plans')
  seedPlans() {
    return this.tiffinService.seedPlans();
  }
}
