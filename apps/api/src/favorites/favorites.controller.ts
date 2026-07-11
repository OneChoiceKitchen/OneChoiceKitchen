import { Controller, Get, Post, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../app/auth/jwt-auth.guard';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getUserFavorites(@Req() req: any) {
    return this.favoritesService.getUserFavorites(req.user.userId);
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  checkFavorite(@Req() req: any, @Query('restaurantId') restaurantId?: string, @Query('menuItemId') menuItemId?: string) {
    return this.favoritesService.checkFavorite(req.user.userId, restaurantId, menuItemId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  addFavorite(@Req() req: any, @Body() body: { restaurantId?: string; menuItemId?: string; type: string }) {
    return this.favoritesService.addFavorite(req.user.userId, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  removeFavorite(@Req() req: any, @Param('id') id: string) {
    return this.favoritesService.removeFavorite(req.user.userId, id);
  }
}
