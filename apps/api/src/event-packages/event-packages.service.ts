import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventPackagesService {
  constructor(private prisma: PrismaService) {}

  async createFoodPackage(data: any) {
    return this.prisma.foodPackage.create({ data });
  }

  async findAllFoodPackages(restaurantId?: string) {
    const where = restaurantId ? { restaurantId } : {};
    return this.prisma.foodPackage.findMany({
      where,
      include: {
        items: { include: { menuItem: true } }
      }
    });
  }

  async createAddonPackage(data: any) {
    return this.prisma.addonPackage.create({ data });
  }

  async findAllAddonPackages(restaurantId?: string) {
    const where = restaurantId ? { restaurantId } : {};
    return this.prisma.addonPackage.findMany({ where });
  }
}
