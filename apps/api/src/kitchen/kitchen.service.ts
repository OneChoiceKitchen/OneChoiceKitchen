import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantScopeService } from '../app/auth/tenant-scope.service';
import { KitchenGateway } from './kitchen.gateway';

@Injectable()
export class KitchenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantScope: TenantScopeService,
    private readonly kitchenGateway: KitchenGateway,
  ) {}

  async getActiveOrders() {
    const tenantId = this.tenantScope.tenantId;
    if (!tenantId) throw new Error('Tenant context is required');

    return this.prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'PREPARING'] },
        items: {
          some: {
            menuItem: {
              tenantId,
            },
          },
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    const tenantId = this.tenantScope.tenantId;
    if (!tenantId) throw new Error('Tenant context is required');

    // Verify the order exists and belongs to the tenant
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            menuItem: {
              tenantId,
            },
          },
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found for this tenant`);
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // Broadcast the update to the tenant's kitchen clients
    this.kitchenGateway.broadcastOrderUpdate(tenantId, updatedOrder);

    return updatedOrder;
  }
}
