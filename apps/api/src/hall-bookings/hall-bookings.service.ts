import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HallBookingsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    // Basic computation logic could go here
    return this.prisma.hallBooking.create({
      data,
      include: {
        hall: true,
        customer: true,
        foodPackage: true,
        addons: true
      }
    });
  }

  async findAll(status?: string) {
    const where = status ? { status } : {};
    return this.prisma.hallBooking.findMany({
      where,
      include: {
        hall: true,
        customer: true
      }
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.hallBooking.findUnique({
      where: { id },
      include: {
        hall: true,
        customer: true,
        foodPackage: true,
        addons: { include: { addonPackage: true } }
      }
    });
    if (!booking) throw new NotFoundException(`Booking with ID ${id} not found`);
    return booking;
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.hallBooking.update({
      where: { id },
      data: { status }
    });
  }
}
