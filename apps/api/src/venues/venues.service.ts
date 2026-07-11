import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.hall.create({ data });
  }

  async findAll(query: any = {}) {
    const { categoryId, minCapacity, maxPrice, location } = query;
    const where: any = { isActive: true };

    if (categoryId) where.categoryId = categoryId;
    if (minCapacity) where.capacity = { gte: parseInt(minCapacity, 10) };
    if (maxPrice) where.pricePerDay = { lte: parseFloat(maxPrice) };
    if (location) where.locationString = { contains: location };

    return this.prisma.hall.findMany({
      where,
      include: {
        category: true,
        restaurant: true
      }
    });
  }

  async findOne(id: string) {
    const hall = await this.prisma.hall.findUnique({
      where: { id },
      include: {
        category: true,
        restaurant: true,
        bookings: true
      }
    });
    if (!hall) throw new NotFoundException(`Venue with ID ${id} not found`);
    return hall;
  }

  async update(id: string, data: any) {
    return this.prisma.hall.update({
      where: { id },
      data
    });
  }

  async remove(id: string) {
    return this.prisma.hall.delete({
      where: { id }
    });
  }
}
