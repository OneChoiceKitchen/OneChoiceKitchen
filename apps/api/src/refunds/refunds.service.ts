import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RefundsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, data: { orderId: string; amount: number; reason: string }) {
    return this.prisma.refund.create({ data: { userId, status: 'PENDING', ...data } });
  }

  findAll(filters?: any) {
    const { status } = filters || {};
    return this.prisma.refund.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  findUserRefunds(userId: string) {
    return this.prisma.refund.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  approve(id: string, adminId: string) {
    return this.prisma.refund.update({
      where: { id },
      data: { status: 'APPROVED', processedById: adminId, processedAt: new Date() },
    });
  }

  reject(id: string, adminId: string, notes: string) {
    return this.prisma.refund.update({
      where: { id },
      data: { status: 'REJECTED', processedById: adminId, notes },
    });
  }

  process(id: string, adminId: string, transactionRef: string) {
    return this.prisma.refund.update({
      where: { id },
      data: { status: 'PROCESSED', processedById: adminId, transactionRef, processedAt: new Date() },
    });
  }
}
