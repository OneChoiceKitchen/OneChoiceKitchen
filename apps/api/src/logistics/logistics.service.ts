import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogisticsService {
  constructor(private prisma: PrismaService) {}

  async getAvailableOrders() {
    return this.prisma.order.findMany({
      where: {
        status: { in: ['PREPARING', 'READY_FOR_PICKUP'] },
        riderId: null,
        orderType: 'DELIVERY',
      },
      include: {
        restaurant: {
          select: {
            name: true,
            address: true,
            lat: true,
            lng: true,
          }
        },
        user: {
          select: {
            name: true,
            mobile: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc',
      }
    });
  }

  async acceptOrder(orderId: string, riderId: string) {
    // We should use a transaction to avoid race conditions where two riders accept at the same time
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      if (order.riderId) {
        throw new BadRequestException('Order has already been accepted by another rider');
      }

      if (!['PREPARING', 'READY_FOR_PICKUP'].includes(order.status)) {
        throw new BadRequestException(`Order cannot be accepted in status: ${order.status}`);
      }
      
      if (order.orderType !== 'DELIVERY') {
        throw new BadRequestException('Only delivery orders can be accepted');
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          riderId,
          status: 'OUT_FOR_DELIVERY',
        },
        include: {
          restaurant: true,
          user: true,
          items: {
            include: {
              menuItem: true
            }
          }
        }
      });
    });
  }

  async updateOrderStatus(orderId: string, riderId: string, status: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.riderId !== riderId) {
      throw new BadRequestException('You are not assigned to this order');
    }

    const validTransitions = ['OUT_FOR_DELIVERY', 'DELIVERED'];
    if (!validTransitions.includes(status)) {
      throw new BadRequestException(`Invalid status transition to ${status}`);
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        restaurant: true,
        user: true,
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });
  }

  async getActiveDelivery(riderId: string) {
    return this.prisma.order.findFirst({
      where: {
        riderId,
        status: 'OUT_FOR_DELIVERY',
      },
      include: {
        restaurant: {
          select: {
            name: true,
            address: true,
            lat: true,
            lng: true,
          }
        },
        user: {
          select: {
            name: true,
            mobile: true,
          }
        },
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc',
      }
    });
  }
}
