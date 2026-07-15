import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async simulateSubscriptionPayment(tenantId: string, subscriptionId: string, amount: number) {
    const subscription = await this.prisma.tenantSubscription.findUnique({
      where: { id: subscriptionId, tenantId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === 'ACTIVE') {
      throw new BadRequestException('Subscription is already active');
    }

    // Process payment simulation inside a transaction
    return this.prisma.$transaction(async (tx) => {
      // 1. Update subscription status
      const updatedSub = await tx.tenantSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'ACTIVE',
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // e.g. 30 days
        },
      });

      // 2. Grant corresponding TenantEntitlement
      const existingEntitlement = await tx.tenantEntitlement.findUnique({
        where: {
          tenantId_moduleId: {
            tenantId,
            moduleId: subscription.moduleId,
          },
        },
      });

      if (existingEntitlement) {
        await tx.tenantEntitlement.update({
          where: { id: existingEntitlement.id },
          data: {
            accessLevel: 'WRITE', // Upgrading from PREVIEW to WRITE
            subscriptionId: updatedSub.id,
            isActive: true,
          },
        });
      } else {
        await tx.tenantEntitlement.create({
          data: {
            tenantId,
            moduleId: subscription.moduleId,
            accessLevel: 'WRITE',
            subscriptionId: updatedSub.id,
            isActive: true,
          },
        });
      }

      // 3. Generate a "PAID" Invoice record
      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          amount,
          status: 'PAID',
          billingDate: new Date(),
          pdfUrl: `/assets/invoices/inv-${Date.now()}.pdf`,
        },
      });

      return {
        success: true,
        invoice,
        subscription: updatedSub,
      };
    });
  }

  async getInvoices(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId },
      orderBy: { billingDate: 'desc' },
    });
  }
}
