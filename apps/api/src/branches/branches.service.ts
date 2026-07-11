import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// Trigger restart for SEO and SMO fields

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  findAll(restaurantId?: string) {
    return this.prisma.restaurantBranch.findMany({
      where: restaurantId ? { restaurantId, isDeleted: false } : { isDeleted: false },
    });
  }

  findOne(id: string) {
    return this.prisma.restaurantBranch.findFirst({ where: { id, isDeleted: false } });
  }

  findByRestaurant(restaurantId: string) {
    return this.prisma.restaurantBranch.findMany({ where: { restaurantId, isDeleted: false } });
  }

  async create(data: any) {
    if (!data.restaurantId) {
      const newRestaurant = await this.prisma.restaurant.create({
        data: {
          name: data.name,
          email: data.email || null,
          secondaryEmail: data.secondaryEmail || null,
          mobile: data.phone || null,
          secondaryMobile: data.secondaryPhone || null,
          address: data.address || '',
          city: data.city || '',
          lat: data.lat || null,
          lng: data.lng || null,
        }
      });
      data.restaurantId = newRestaurant.id;
    }

    const payload = this.sanitizeBranchData(data);
    return this.prisma.restaurantBranch.create({ data: payload });
  }

  async update(id: string, data: any) {
    const payload = this.sanitizeBranchData(data);
    // Never update restaurantId to empty string
    if (!payload.restaurantId) delete payload.restaurantId;
    return this.prisma.restaurantBranch.update({ where: { id }, data: payload });
  }

  /** Strip all non-schema / relation fields; convert empty strings to null for optional fields */
  private sanitizeBranchData(data: any): any {
    // Remove fields that must not be in create/update payloads
    const BLOCKED = [
      'id', 'createdAt', 'updatedAt', 'isDeleted', 'deletedAt',
      'restaurant', 'reservations', 'waitlistEntries', 'tables',
      'menus', 'tiffinMenus', 'tiffinPlans', 'tiffinFlyers',
      'tiffinGlobalSettings', 'tiffinHolidays', 'tiffinTerms', 'offers',
      'restaurantOfferText', 'restaurantDiscountPct',
    ];
    const clean: any = {};
    for (const [key, val] of Object.entries(data)) {
      if (BLOCKED.includes(key)) continue;
      // Convert empty string → null for optional string fields
      clean[key] = (typeof val === 'string' && val.trim() === '') ? null : val;
    }
    return clean;
  }

  remove(id: string) {
    return this.prisma.restaurantBranch.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });
  }

  getRestaurants() {
    return this.prisma.restaurant.findMany({
      where: { isDeleted: false },
      include: { 
        branches: {
          where: { isDeleted: false }
        } 
      },
      orderBy: { name: 'asc' },
    });
  }

  async getNearbyRestaurants(lat: number, lng: number, radiusKm: number) {
    const restaurants = await this.prisma.restaurant.findMany({
      where: { isActive: true, isDeleted: false },
      include: {
        tiffinPlans: true,
      }
    });

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return restaurants;

    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; 

    return restaurants.filter(restaurant => {
      if (!restaurant.lat || !restaurant.lng) return false;
      const dLat = toRad(restaurant.lat - lat);
      const dLng = toRad(restaurant.lng - lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat)) * Math.cos(toRad(restaurant.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      (restaurant as any).distance = distance;
      
      return distance <= radiusKm;
    }).sort((a: any, b: any) => a.distance - b.distance);
  }

  async updateRestaurant(id: string, data: any) {
    return this.prisma.restaurant.update({
      where: { id },
      data
    });
  }

  async removeRestaurant(id: string) {
    const branches = await this.prisma.restaurantBranch.findMany({ where: { restaurantId: id, isDeleted: false } });
    if (branches.length > 0) {
      throw new BadRequestException('Cannot delete parent restaurant because it still has active branches attached.');
    }
    return this.prisma.restaurant.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });
  }

  getRecycledBranches() {
    return this.prisma.restaurantBranch.findMany({
      where: { isDeleted: true },
      include: { restaurant: true }
    });
  }

  getRecycledRestaurants() {
    return this.prisma.restaurant.findMany({
      where: { isDeleted: true },
      include: { branches: true }
    });
  }

  restoreBranch(id: string) {
    return this.prisma.restaurantBranch.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null }
    });
  }

  restoreRestaurant(id: string) {
    return this.prisma.restaurant.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null }
    });
  }

  hardDeleteBranch(id: string) {
    return this.prisma.restaurantBranch.delete({ where: { id } });
  }

  hardDeleteRestaurant(id: string) {
    return this.prisma.restaurant.delete({ where: { id } });
  }
}
