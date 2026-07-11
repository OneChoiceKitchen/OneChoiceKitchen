import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersGateway } from './orders.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private ordersGateway: OrdersGateway
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const order = await this.prisma.order.create({
      data: createOrderDto as any,
    });
    this.ordersGateway.notifyNewOrder(order);
    return order;
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { user: true, restaurant: true, items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { user: true, restaurant: true, items: true }
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.prisma.order.update({
      where: { id },
      data: updateOrderDto as any,
    });
    if ((updateOrderDto as any).status) {
      this.ordersGateway.notifyOrderStatusChange(id, (updateOrderDto as any).status as string, { order });
    }
    return order;
  }

  remove(id: string) {
    return this.prisma.order.delete({
      where: { id },
    });
  }
}
