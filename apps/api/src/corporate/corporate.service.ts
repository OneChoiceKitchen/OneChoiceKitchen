import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CorporateService {
  constructor(private prisma: PrismaService) {}

  createPlan(data: any) {
    return this.prisma.corporateMealPlan.create({ data });
  }

  findAll() {
    return this.prisma.corporateMealPlan.findMany();
  }

  findOne(id: string) {
    return this.prisma.corporateMealPlan.findUnique({
      where: { id },
      include: { subscriptions: true },
    });
  }

  updatePlan(id: string, data: any) {
    return this.prisma.corporateMealPlan.update({ where: { id }, data });
  }

  deletePlan(id: string) {
    return this.prisma.corporateMealPlan.delete({ where: { id } });
  }

  subscribe(corporatePlanId: string, userId: string, data: any) {
    return this.prisma.employeeMealSubscription.create({
      data: { corporatePlanId, userId, status: 'ACTIVE', ...data },
    });
  }

  getPlanSubscriptions(planId: string) {
    return this.prisma.employeeMealSubscription.findMany({ where: { corporatePlanId: planId } });
  }
}
