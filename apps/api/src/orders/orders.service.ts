import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersGateway } from './orders.gateway';
import { PromotionsService } from '../promotions/promotions.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { ItemType } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private ordersGateway: OrdersGateway,
    private promotionsService: PromotionsService,
    private webhooksService: WebhooksService,
  ) {}

  async checkout(createOrderDto: CreateOrderDto, userId: string) {
    const menuItemIds = createOrderDto.items.map(i => i.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new BadRequestException('One or more menu items not found');
    }

    this.validateCartInvariants(createOrderDto, menuItems);

    const groups = new Map<string, { restaurantId: string, branchId: string | null, items: any[] }>();
    
    for (const item of createOrderDto.items) {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      if (!menuItem) continue;
      
      const key = `${menuItem.restaurantId}-${menuItem.branchId || 'default'}`;
      if (!groups.has(key)) {
        groups.set(key, {
          restaurantId: menuItem.restaurantId!,
          branchId: menuItem.branchId,
          items: []
        });
      }
      groups.get(key)!.items.push({ ...item, menuItem });
    }

    const createdOrders = [];

    await this.prisma.$transaction(async (tx) => {
      for (const group of groups.values()) {
        let totalAmount = group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discountAmount = 0;
        let promoCode = createOrderDto.promoCode || null;

        if (promoCode) {
          try {
            const promoResult = await this.promotionsService.validate({
              code: promoCode,
              tenantId: group.items[0].menuItem.tenantId, // assume single-tenant invariant
              cartTotal: totalAmount
            });
            discountAmount = promoResult.discountAmount;
            totalAmount -= discountAmount;
          } catch (error) {
            throw new BadRequestException(`Promo code validation failed: ${error.message}`);
          }
        }

        const order = await tx.order.create({
          data: {
            userId,
            restaurantId: group.restaurantId,
            branchId: group.branchId,
            orderType: 'DELIVERY',
            totalAmount,
            discountAmount,
            promoCode,
            deliveryAddress: createOrderDto.deliveryAddress,
            paymentMethod: createOrderDto.paymentMethod || 'ONLINE',
            items: {
              create: group.items.map(item => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: item.price,
                customizations: item.customizations
              }))
            }
          },
          include: { items: true }
        });
        createdOrders.push(order);

        for (const item of group.items) {
          const mappings = await tx.menuInventoryMapping.findMany({
            where: { menuItemId: item.menuItemId }
          });

          for (const mapping of mappings) {
            const deductAmount = mapping.quantityRequired * item.quantity;
            await tx.inventoryItem.update({
              where: { id: mapping.inventoryItemId },
              data: {
                currentStock: {
                  decrement: deductAmount
                }
              }
            });
          }
        }
      }
    });

    for (const order of createdOrders) {
      this.ordersGateway.notifyNewOrder(order);
      
      // Dispatch webhook asynchronously
      const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
      if (firstItem) {
        this.prisma.menuItem.findUnique({ where: { id: firstItem.menuItemId } })
          .then(menuItem => {
            if (menuItem && menuItem.tenantId) {
              this.webhooksService.dispatch('ORDER_CREATED', menuItem.tenantId, {
                orderId: order.id,
                totalAmount: order.totalAmount,
                discountAmount: order.discountAmount,
                status: order.status,
                createdAt: order.createdAt
              });
            }
          })
          .catch(err => console.error('Failed to dispatch webhook for order', err));
      }
    }

    return createdOrders;
  }

  private validateCartInvariants(cart: CreateOrderDto, menuItems: any[]) {
    if (cart.serviceType === ItemType.FOOD_ORDERING) {
      const tenants = new Set(menuItems.map(m => m.tenantId));
      const branches = new Set(menuItems.map(m => m.branchId));
      
      if (tenants.size > 1 || branches.size > 1) {
        throw new BadRequestException('All food items in the cart must belong to the same tenant and branch');
      }
    }
  }

  async create(createOrderDto: any) {
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
