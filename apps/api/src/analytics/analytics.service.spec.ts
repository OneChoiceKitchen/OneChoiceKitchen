import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              count: jest.fn(),
              aggregate: jest.fn(),
              findMany: jest.fn(),
            },
            inventoryItem: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getKpis', () => {
    it('should calculate KPIs for a specific tenant', async () => {
      jest.spyOn(prisma.order, 'count').mockResolvedValue(10);
      jest.spyOn(prisma.order, 'aggregate').mockResolvedValue({ _sum: { totalAmount: 500 } } as any);
      jest.spyOn(prisma.inventoryItem, 'findMany').mockResolvedValue([
        { currentStock: 5, threshold: 10 },
        { currentStock: 15, threshold: 10 },
      ] as any);

      const result = await service.getKpis('tenant-1');

      expect(prisma.order.count).toHaveBeenCalledWith({ where: { restaurantId: 'tenant-1' } });
      expect(prisma.order.aggregate).toHaveBeenCalledWith({
        _sum: { totalAmount: true },
        where: { restaurantId: 'tenant-1', status: { in: ['DELIVERED', 'COMPLETED'] } },
      });
      expect(prisma.inventoryItem.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        select: { currentStock: true, threshold: true },
      });
      
      expect(result).toEqual({
        totalOrders: 10,
        totalRevenue: 500,
        activeInventoryAlerts: 1, // only one item has currentStock <= threshold
      });
    });

    it('should calculate KPIs for all tenants if no tenantId provided', async () => {
      jest.spyOn(prisma.order, 'count').mockResolvedValue(100);
      jest.spyOn(prisma.order, 'aggregate').mockResolvedValue({ _sum: { totalAmount: 5000 } } as any);
      jest.spyOn(prisma.inventoryItem, 'findMany').mockResolvedValue([
        { currentStock: 5, threshold: 10 },
        { currentStock: 2, threshold: 5 },
      ] as any);

      const result = await service.getKpis(null);

      expect(prisma.order.count).toHaveBeenCalledWith({ where: {} });
      expect(result.totalOrders).toBe(100);
      expect(result.totalRevenue).toBe(5000);
      expect(result.activeInventoryAlerts).toBe(2);
    });
  });

  describe('getSalesTrend', () => {
    it('should calculate sales trend for the last 7 days', async () => {
      const mockDate = new Date();
      jest.spyOn(prisma.order, 'findMany').mockResolvedValue([
        { createdAt: mockDate, totalAmount: 100 },
        { createdAt: mockDate, totalAmount: 150 },
      ] as any);

      const result = await service.getSalesTrend('tenant-1');
      
      expect(prisma.order.findMany).toHaveBeenCalled();
      
      const dateStr = mockDate.toISOString().split('T')[0];
      const entry = result.find(r => r.date === dateStr);
      expect(entry).toBeDefined();
      if (entry) {
        expect(entry.revenue).toBe(250);
        expect(entry.orderCount).toBe(2);
      }
    });
  });
});
