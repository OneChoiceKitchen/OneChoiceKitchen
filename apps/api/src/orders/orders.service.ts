import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersGateway } from './orders.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private ordersGateway: OrdersGateway,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const order = await this.prisma.order.create({
      data: createOrderDto as any,
    });
    this.ordersGateway.notifyNewOrder(order);
    return order;
  }

  async findAll() {
    try {
      return await this.prisma.order.findMany({
        include: { user: true, restaurant: true, items: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      if (!this.isLocalDevReadCompatibilityError(error)) throw error;

      const orders = await this.prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
      return orders.map((order) => ({
        ...order,
        user: null,
        restaurant: null,
      }));
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.order.findUnique({
        where: { id },
        include: { user: true, restaurant: true, items: true },
      });
    } catch (error) {
      if (!this.isLocalDevReadCompatibilityError(error)) throw error;

      const order = await this.prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });
      return order ? { ...order, user: null, restaurant: null } : null;
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.prisma.order.update({
      where: { id },
      data: updateOrderDto as any,
    });
    if ((updateOrderDto as any).status) {
      this.ordersGateway.notifyOrderStatusChange(
        id,
        (updateOrderDto as any).status as string,
        { order },
      );
    }
    return order;
  }

  remove(id: string) {
    return this.prisma.order.delete({
      where: { id },
    });
  }

  private isLocalDevReadCompatibilityError(error: unknown): boolean {
    if (process.env.NODE_ENV === 'production') return false;

    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'cause' in error
          ? JSON.stringify((error as { cause?: unknown }).cause)
          : String(error);
    return (
      /no such table:\s*main\.cat_customers|no such table:\s*cat_customers/i.test(
        message,
      ) ||
      /no such column:\s*main\.Restaurant\.tenantId|no such column:\s*Restaurant\.tenantId/i.test(
        message,
      )
    );
  }
}
