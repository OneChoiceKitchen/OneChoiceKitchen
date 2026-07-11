import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PartnersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.partnerRegistration.create({
      data: {
        restaurantName: data.restaurantName,
        ownerName: data.ownerName,
        email: data.email,
        mobile: data.mobile,
        businessDetails: data.businessDetails,
        status: 'PENDING',
      },
    });
  }

  findAll() {
    return this.prisma.partnerRegistration.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.partnerRegistration.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.partnerRegistration.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.partnerRegistration.delete({
      where: { id },
    });
  }

  async approve(id: string) {
    const registration = await this.prisma.partnerRegistration.findUnique({ where: { id } });
    if (!registration) throw new NotFoundException('Registration not found');

    // Update status
    await this.prisma.partnerRegistration.update({
      where: { id },
      data: { status: 'APPROVED' }
    });

    // Create Restaurant and User
    const restaurant = await this.prisma.restaurant.create({
      data: {
        name: registration.restaurantName,
        ownerName: registration.ownerName,
        email: registration.email,
        mobile: registration.mobile,
        businessDetails: registration.businessDetails,
        isActive: true,
      }
    });

    let role = await this.prisma.role.findUnique({ where: { name: 'RESTAURANT_ADMIN' } });
    if (!role) {
      role = await this.prisma.role.create({ data: { name: 'RESTAURANT_ADMIN' } });
    }

    const user = await this.prisma.user.create({
      data: {
        name: registration.ownerName,
        email: registration.email,
        password: null, // User must reset/set password later via email link (or we default it)
        roleId: role.id,
        restaurantId: restaurant.id,
        isActive: true,
      }
    });

    return { restaurant, user };
  }
}
