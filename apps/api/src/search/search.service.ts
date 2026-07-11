import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(params: any) {
    const { q, lat: _lat, lng: _lng, filters: _filters, sort: _sort } = params;

    // For now, return some mocked/basic search data structure
    // This can be expanded into complex Prisma queries later based on the actual schema
    
    // We will query simple restaurants as a mock response for now
    const restaurants = await this.prisma.restaurant.findMany({
      take: 10,
      include: {
        branches: true,
      }
    });

    // Query actual menu items from the database
    const dishes = await this.prisma.menuItem.findMany({
      where: {
        isDeleted: false,
        isAvailable: true,
        ...(q ? { name: { contains: q } } : {}) // SQLite doesn't support mode: 'insensitive' out of the box in the same way, but let's just do contains.
      },
      take: 100 // return a decent chunk
    });

    return {
      dishes: dishes,
      restaurants: restaurants,
      branches: restaurants.flatMap(r => r.branches)
    };
  }
}
