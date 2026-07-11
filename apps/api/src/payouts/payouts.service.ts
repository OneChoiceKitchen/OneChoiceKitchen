import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayoutsService {
  constructor(private prisma: PrismaService) {}

  findAll(filters?: any) {
    const { status, recipientType } = filters || {};
    return this.prisma.payoutRecord.findMany({
      where: { ...(status ? { status } : {}), ...(recipientType ? { recipientType } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  findForRecipient(recipientId: string) {
    return this.prisma.payoutRecord.findMany({ where: { recipientId }, orderBy: { createdAt: 'desc' } });
  }

  async generatePayouts(periodStart: string, periodEnd: string, type: 'RIDER' | 'PARTNER') {
    return this.prisma.payoutRecord.createMany({
      data: [{
        recipientId: 'PLACEHOLDER',
        recipientType: type,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        grossAmount: 0,
        netAmount: 0,
        status: 'PENDING',
      }],
    });
  }

  approve(id: string, adminId: string) {
    return this.prisma.payoutRecord.update({
      where: { id },
      data: { status: 'APPROVED', processedById: adminId },
    });
  }

  markProcessed(id: string, adminId: string, transactionRef: string) {
    return this.prisma.payoutRecord.update({
      where: { id },
      data: { status: 'PROCESSED', processedById: adminId, transactionRef, processedAt: new Date() },
    });
  }

  getSettlementSummary(recipientId: string, recipientType: string) {
    return this.prisma.payoutRecord.aggregate({
      where: { recipientId, recipientType },
      _sum: { grossAmount: true, netAmount: true, deductions: true },
      _count: true,
    });
  }
}
