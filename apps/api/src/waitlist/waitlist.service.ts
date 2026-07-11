import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WaitlistService {
  constructor(private prisma: PrismaService) {}

  async join(userId: string, data: any) {
    // Basic ETA Calculation (15 mins per waiting party ahead)
    const waitingParties = await this.prisma.waitlist.count({
      where: {
        restaurantId: data.restaurantId,
        branchId: data.branchId,
        status: 'WAITING'
      }
    });

    const estimatedWaitTime = (waitingParties + 1) * 15;

    return this.prisma.waitlist.create({ 
      data: { 
        userId, 
        status: 'WAITING', 
        estimatedWaitTime,
        ...data 
      } 
    });
  }

  getRestaurantWaitlist(restaurantId: string) {
    return this.prisma.waitlist.findMany({
      where: { restaurantId, status: 'WAITING' },
      orderBy: { createdAt: 'asc' },
    });
  }

  notifyCustomer(id: string) {
    return this.prisma.waitlist.update({
      where: { id },
      data: { status: 'NOTIFIED', notifiedAt: new Date() },
    });
  }

  cancelEntry(id: string, userId: string) {
    return this.prisma.waitlist.update({
      where: { id, userId },
      data: { status: 'CANCELLED' },
    });
  }

  getUserWaitlist(userId: string) {
    return this.prisma.waitlist.findMany({ where: { userId } });
  }
}
