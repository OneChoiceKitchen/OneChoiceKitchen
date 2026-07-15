import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getTenants(skip = 0, take = 50) {
    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        skip,
        take,
        include: {
          subscriptions: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count(),
    ]);

    return {
      data,
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  async updateTenantStatus(id: string, status: TenantStatus) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    return this.prisma.tenant.update({
      where: { id },
      data: { status },
      include: { subscriptions: true }
    });
  }

  async getAuditLogs(skip = 0, take = 50) {
    const [data, total] = await Promise.all([
      this.prisma.approvalDecision.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          case: {
            include: {
              tenant: true
            }
          },
          approver: true
        }
      }),
      this.prisma.approvalDecision.count(),
    ]);

    return {
      data,
      meta: {
        total,
        skip,
        take,
      },
    };
  }
}
