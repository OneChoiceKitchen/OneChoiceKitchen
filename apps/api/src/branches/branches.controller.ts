import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';
import { RolesGuard } from '../app/auth/roles.guard';
import { Roles } from '../app/auth/roles.decorator';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  findAll(@Query('restaurantId') restaurantId?: string) {
    return this.branchesService.findAll(restaurantId);
  }

  @Get('restaurants/all')
  getRestaurants() {
    return this.branchesService.getRestaurants();
  }

  @Get('restaurants/nearby')
  getNearbyRestaurants(@Query('lat') lat: string, @Query('lng') lng: string, @Query('radius') radius: string) {
    return this.branchesService.getNearbyRestaurants(Number(lat), Number(lng), Number(radius) || 3);
  }

  @Get('recycle-bin/branches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  getRecycledBranches() {
    return this.branchesService.getRecycledBranches();
  }

  @Get('recycle-bin/restaurants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  getRecycledRestaurants() {
    return this.branchesService.getRecycledRestaurants();
  }

  @Patch('recycle-bin/branches/:id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  restoreBranch(@Param('id') id: string) {
    return this.branchesService.restoreBranch(id);
  }

  @Patch('recycle-bin/restaurants/:id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  restoreRestaurant(@Param('id') id: string) {
    return this.branchesService.restoreRestaurant(id);
  }

  @Delete('recycle-bin/branches/:id/hard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  hardDeleteBranch(@Param('id') id: string) {
    return this.branchesService.hardDeleteBranch(id);
  }

  @Delete('recycle-bin/restaurants/:id/hard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  hardDeleteRestaurant(@Param('id') id: string) {
    return this.branchesService.hardDeleteRestaurant(id);
  }


  @Get('restaurant/:restaurantId')
  findByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.branchesService.findByRestaurant(restaurantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PARTNER', 'PARTNER_ADMIN')
  create(@Body() body: any) {
    return this.branchesService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PARTNER', 'PARTNER_ADMIN')
  update(@Param('id') id: string, @Body() body: any) {
    return this.branchesService.update(id, body);
  }

  @Patch('restaurants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  updateRestaurant(@Param('id') id: string, @Body() body: any) {
    return this.branchesService.updateRestaurant(id, body);
  }

  @Delete('restaurants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  removeRestaurant(@Param('id') id: string) {
    return this.branchesService.removeRestaurant(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.branchesService.remove(id);
  }
}
