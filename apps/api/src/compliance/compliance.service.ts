import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  upload(restaurantId: string, data: any) {
    return this.prisma.restaurantCompliance.create({ data: { restaurantId, status: 'PENDING', ...data } });
  }

  findByRestaurant(restaurantId: string) {
    return this.prisma.restaurantCompliance.findMany({ where: { restaurantId } });
  }

  findAll() {
    return this.prisma.restaurantCompliance.findMany({ orderBy: { createdAt: 'desc' } });
  }

  review(id: string, status: string, reviewNotes: string, reviewedById: string) {
    return this.prisma.restaurantCompliance.update({
      where: { id },
      data: { status, reviewNotes, reviewedById },
    });
  }

  getExpiringSoon() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return this.prisma.restaurantCompliance.findMany({
      where: { expiryDate: { lte: thirtyDaysFromNow, gte: new Date() } },
    });
  }
}
