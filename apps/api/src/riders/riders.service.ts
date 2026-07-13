import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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
    // Make sure this matches the model you are using for the "Riders" tab
    return this.prisma.riderRegistration.findMany({
      where: { status: 'APPROVED' }, // If the tab only wants approved riders
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

    // Ensure RIDER role exists
    let role = await this.prisma.role.findFirst({ where: { name: 'RIDER' } });
    if (!role) {
      role = await this.prisma.role.create({ data: { name: 'RIDER' } } as any);
    }

    // Auto-create the User account so the rider can log in
    // We map their mobile number to an email format required by the login system
    const riderEmail = `${registration.mobile}@rider.com`;
    const existingUser = await this.prisma.user.findUnique({ where: { email: riderEmail } });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('Welcome@123', 10);
      
      try {
         // Attempt to create user (Schema handling for standard roleId)
         await this.prisma.user.create({
           data: {
             name: registration.fullName,
             email: riderEmail,
             mobile: registration.mobile,
             password: hashedPassword,
             isActive: true,
             roleId: role.id
           } as any
         });
      } catch (e) {
         // Fallback if your Prisma schema uses a many-to-many "roles" array instead
         await this.prisma.user.create({
           data: {
             name: registration.fullName,
             email: riderEmail,
             mobile: registration.mobile,
             password: hashedPassword,
             isActive: true,
             roles: { connect: { id: role.id } }
           } as any
         });
      }
    }

    return approved;
  }

  async reject(id: string) {
    return this.prisma.riderRegistration.update({
      where: { id },
      data: { status: 'REJECTED' }
    });
  }

  async update(id: string, data: Partial<{ fullName: string; mobile: string; vehicleType?: string }>) {
    return this.prisma.riderRegistration.update({
      where: { id },
      data
    });
  }
}