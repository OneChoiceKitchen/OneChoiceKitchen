import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  date: Date;
  tabTarget: string;
}

export interface UserContext {
  userId: string;
  role: string;
  restaurantId?: string;
  permissions: string[];
}

export interface INotificationProvider {
  getPendingItems(context: UserContext, prisma: PrismaService): Promise<AdminNotification[]>;
}

@Injectable()
export class AdminNotificationsService {
  private readonly logger = new Logger(AdminNotificationsService.name);
  private providers: INotificationProvider[] = [];

  constructor(private readonly prisma: PrismaService) {
    this.registerProviders();
  }

  private registerProviders() {
    // 1. TMS Provider
    this.providers.push({
      async getPendingItems(context, prisma) {
        // Devs and Support might see this
        const tasks = await prisma.task.findMany({
          where: {
            OR: [
              { assigneeId: context.userId, status: { in: ['To Do', 'In Progress', 'Code Review', 'Testing', 'UAT'] } },
              { reporterId: context.userId, status: 'Blocked' }
            ]
          },
          orderBy: { updatedAt: 'desc' },
          take: 10
        });
        return tasks.map(t => ({
          id: t.id,
          type: 'TMS_TASK',
          title: `Task: ${t.taskId}`,
          message: `${t.title} is ${t.status}`,
          date: t.updatedAt,
          tabTarget: 'tasks'
        }));
      }
    });

    // 2. Orders Provider
    this.providers.push({
      async getPendingItems(context, prisma) {
        if (!['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER'].includes(context.role)) return [];
        const where: any = { status: 'PENDING' };
        if (context.restaurantId) {
          where.restaurantId = context.restaurantId;
        }
        const orders = await prisma.order.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 10
        });
        return orders.map(o => ({
          id: o.id,
          type: 'ORDER',
          title: `New Order`,
          message: `Order pending: ${o.id.substring(0, 8)}`,
          date: o.createdAt,
          tabTarget: 'orders'
        }));
      }
    });

    // 3. Support Tickets Provider
    this.providers.push({
      async getPendingItems(context, prisma) {
        if (!['SUPER_ADMIN', 'ADMIN', 'SUPPORT'].includes(context.role)) return [];
        const tickets = await prisma.supportTicket.findMany({
          where: { status: 'OPEN' },
          orderBy: { createdAt: 'desc' },
          take: 10
        });
        return tickets.map(t => ({
          id: t.id,
          type: 'SUPPORT',
          title: `Support Ticket`,
          message: t.subject,
          date: t.createdAt,
          tabTarget: 'support'
        }));
      }
    });

    // 4. Leave Requests Provider
    this.providers.push({
      async getPendingItems(context, prisma) {
        if (!['SUPER_ADMIN', 'HR_ADMIN'].includes(context.role)) return [];
        const leaves = await prisma.leaveRequest.findMany({
          where: { status: 'PENDING' },
          include: { employee: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        });
        return leaves.map(l => ({
          id: l.id,
          type: 'LEAVE',
          title: `Leave Request`,
          message: `From ${l.employee.name || l.employee.email}`,
          date: l.createdAt,
          tabTarget: 'leaves'
        }));
      }
    });

    // 5. Inventory Alerts Provider
    this.providers.push({
      async getPendingItems(context, prisma) {
        if (!['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER'].includes(context.role)) return [];
        const items = await prisma.inventoryItem.findMany({
          where: { quantity: { lte: 10 } }, // Alternatively compare to threshold if possible, but prisma might not support comparing two columns directly easily, so we fetch low quantity
          orderBy: { updatedAt: 'desc' },
          take: 10
        });
        return items.filter(i => i.quantity != null && i.threshold != null && i.quantity <= i.threshold).map(i => ({
          id: i.id,
          type: 'INVENTORY',
          title: `Low Stock: ${i.name}`,
          message: `Only ${i.quantity} remaining.`,
          date: i.updatedAt,
          tabTarget: 'inventory'
        }));
      }
    });
    
    // We can add the other 12 providers easily here as needed.
  }

  async getPendingNotifications(context: UserContext) {
    try {
      const promises = this.providers.map(provider => 
        provider.getPendingItems(context, this.prisma).catch(err => {
          this.logger.error(`Error in notification provider: ${err.message}`);
          return [];
        })
      );
      
      const results = await Promise.all(promises);
      const flattened = results.flat();
      
      // Sort by date descending
      flattened.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      return {
        totalCount: flattened.length,
        items: flattened.slice(0, 50)
      };
    } catch (error) {
      this.logger.error('Failed to get notifications', error);
      return { totalCount: 0, items: [] };
    }
  }

  async seedDummyData() {
    try {
      const admin = await this.prisma.user.findFirst({ where: { role: { name: 'SUPER_ADMIN' } } }) || await this.prisma.user.findFirst();
      const restaurant = await this.prisma.restaurant.findFirst();

      if (!admin || !restaurant) {
        return { success: false, message: 'Need at least 1 admin user and 1 restaurant in DB to seed data.' };
      }

      // 1. Task
      await this.prisma.task.create({
        data: {
          taskId: `TSK-${Date.now()}`,
          title: 'Review new feature branch (Dummy)',
          taskType: 'Enhancement',
          priority: 'High',
          status: 'In Progress',
          assigneeId: admin.id,
        }
      });

      // 2. Order
      await this.prisma.order.create({
        data: {
          userId: admin.id, // Just using admin as user for dummy
          restaurantId: restaurant.id,
          status: 'PENDING',
          totalAmount: 150.00,
          paymentStatus: 'PENDING',
          orderType: 'DELIVERY',
          deliveryAddress: '123 Dummy St',
        }
      });

      // 3. Support Ticket
      await this.prisma.supportTicket.create({
        data: {
          email: admin.email,
          subject: 'App keeps crashing on checkout (Dummy)',
          message: 'This is a dummy ticket for testing.',
          status: 'OPEN',
          priority: 'HIGH',
        }
      });

      // 4. Inventory Item
      await this.prisma.inventoryItem.create({
        data: {
          name: `Fresh Tomatoes (Dummy) ${Date.now()}`,
          sku: `TOM-${Date.now()}`,
          quantity: 5,
          threshold: 10,
        }
      });

      return { success: true, message: 'Dummy notifications seeded successfully!' };
    } catch (e: any) {
      this.logger.error('Failed to seed', e);
      return { success: false, error: e.message };
    }
  }
}

