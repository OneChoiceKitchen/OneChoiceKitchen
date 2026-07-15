import { Test, TestingModule } from '@nestjs/testing';
import { KitchenService } from './kitchen.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantScopeService } from '../app/auth/tenant-scope.service';
import { KitchenGateway } from './kitchen.gateway';
import { NotFoundException } from '@nestjs/common';

describe('KitchenService', () => {
  let service: KitchenService;
  let prismaService: PrismaService;
  let tenantScopeService: TenantScopeService;
  let kitchenGateway: KitchenGateway;

  const mockPrismaService = {
    order: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockTenantScopeService = {
    get tenantId() {
      return 'tenant-1';
    },
  };

  const mockKitchenGateway = {
    broadcastOrderUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KitchenService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TenantScopeService, useValue: mockTenantScopeService },
        { provide: KitchenGateway, useValue: mockKitchenGateway },
      ],
    }).compile();

    service = module.get<KitchenService>(KitchenService);
    prismaService = module.get<PrismaService>(PrismaService);
    tenantScopeService = module.get<TenantScopeService>(TenantScopeService);
    kitchenGateway = module.get<KitchenGateway>(KitchenGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getActiveOrders', () => {
    it('should return pending and preparing orders for tenant', async () => {
      const mockOrders = [{ id: 'order-1', status: 'PENDING' }];
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      const result = await service.getActiveOrders();

      expect(result).toEqual(mockOrders);
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: { in: ['PENDING', 'PREPARING'] },
            items: {
              some: {
                menuItem: {
                  tenantId: 'tenant-1',
                },
              },
            },
          },
        }),
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should throw NotFoundException if order does not belong to tenant', async () => {
      mockPrismaService.order.findFirst.mockResolvedValue(null);

      await expect(service.updateOrderStatus('order-x', 'PREPARING')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update status and broadcast event', async () => {
      const mockOrder = { id: 'order-1', status: 'PENDING' };
      const updatedOrder = { ...mockOrder, status: 'PREPARING' };

      mockPrismaService.order.findFirst.mockResolvedValue(mockOrder);
      mockPrismaService.order.update.mockResolvedValue(updatedOrder);

      const result = await service.updateOrderStatus('order-1', 'PREPARING');

      expect(result).toEqual(updatedOrder);
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'PREPARING' },
        include: expect.any(Object),
      });
      expect(mockKitchenGateway.broadcastOrderUpdate).toHaveBeenCalledWith(
        'tenant-1',
        updatedOrder,
      );
    });
  });
});
