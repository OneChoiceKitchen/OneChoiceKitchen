import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  getUserFavorites(userId: string) {
    return this.prisma.favorite.findMany({ where: { userId } });
  }

  addFavorite(userId: string, data: { restaurantId?: string; menuItemId?: string; type: string }) {
    return this.prisma.favorite.create({ data: { userId, ...data } });
  }

  removeFavorite(userId: string, id: string) {
    return this.prisma.favorite.delete({ where: { id, userId } });
  }

  checkFavorite(userId: string, restaurantId?: string, menuItemId?: string) {
    return this.prisma.favorite.findFirst({
      where: { userId, ...(restaurantId ? { restaurantId } : {}), ...(menuItemId ? { menuItemId } : {}) },
    });
  }
}
