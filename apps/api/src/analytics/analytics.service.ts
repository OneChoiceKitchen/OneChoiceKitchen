import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getKpis(tenantId?: string | null) {
    const whereClause = tenantId ? { restaurantId: tenantId } : {};
    
    // Total Orders
    const totalOrders = await this.prisma.order.count({
      where: whereClause,
    });

    // Total Revenue (assuming COMPLETED or DELIVERED)
    const revenueAgg = await this.prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        ...whereClause,
        status: { in: ['DELIVERED', 'COMPLETED'] },
      },
    });

    const totalRevenue = revenueAgg._sum.totalAmount || 0;

    // Active Inventory Alerts
    const inventoryWhere = tenantId ? { tenantId } : {};
    const inventoryItems = await this.prisma.inventoryItem.findMany({
      where: inventoryWhere,
      select: { currentStock: true, threshold: true },
    });
    const activeInventoryAlerts = inventoryItems.filter(item => item.currentStock <= (item.threshold || 10)).length;

    return {
      totalOrders,
      totalRevenue,
      activeInventoryAlerts,
    };
  }

  async getSalesTrend(tenantId?: string | null) {
    const whereClause = tenantId ? { restaurantId: tenantId } : {};
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Includes today + 6 previous days

    const orders = await this.prisma.order.findMany({
      where: {
        ...whereClause,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    // Group by date (YYYY-MM-DD)
    const trendMap = new Map<string, { date: string; revenue: number; orderCount: number }>();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      trendMap.set(dateStr, { date: dateStr, revenue: 0, orderCount: 0 });
    }

    orders.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (trendMap.has(dateStr)) {
        const entry = trendMap.get(dateStr)!;
        entry.revenue += order.totalAmount;
        entry.orderCount += 1;
      }
    });

    return Array.from(trendMap.values());
  }
}
