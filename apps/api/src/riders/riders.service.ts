import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RidersService {
  constructor(private prisma: PrismaService) {}

  async register(data: { fullName: string; mobile: string; vehicleType?: string }) {
    const existing = await this.prisma.riderRegistration.findUnique({
      where: { mobile: data.mobile }
    });

    if (existing) {
      throw new BadRequestException('A registration with this mobile number already exists');
    }

    return this.prisma.riderRegistration.create({
      data: {
        fullName: data.fullName,
        mobile: data.mobile,
        vehicleType: data.vehicleType || 'Bike',
        status: 'PENDING'
      }
    });
  }

  findAll() {
    return this.prisma.riderRegistration.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async approve(id: string) {
    const registration = await this.prisma.riderRegistration.findUnique({
      where: { id }
    });

    if (!registration) {
      throw new BadRequestException('Registration not found');
    }

    if (registration.status === 'APPROVED') {
      throw new BadRequestException('Registration is already approved');
    }

    // Mark as approved
    const approved = await this.prisma.riderRegistration.update({
      where: { id },
      data: { status: 'APPROVED' }
    });

    // We can also create a User record for them if needed, but for now just approve
    // e.g., create User with role "RIDER"

    return approved;
  }
}
