import { Test, TestingModule } from '@nestjs/testing';
import { KitchenController } from './kitchen.controller';
import { KitchenService } from './kitchen.service';
import { TenantScopeService } from '../app/auth/tenant-scope.service';
import { BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserContextResolverService } from '../app/auth/user-context-resolver.service';
import { FeatureAccessService } from '../feature-access/feature-access.service';

describe('KitchenController', () => {
  let controller: KitchenController;
  let service: KitchenService;

  const mockKitchenService = {
    getActiveOrders: jest.fn(),
    updateOrderStatus: jest.fn(),
  };

  const mockTenantScopeService = {
    get tenantId() {
      return 'tenant-1';
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KitchenController],
      providers: [
        { provide: KitchenService, useValue: mockKitchenService },
        { provide: TenantScopeService, useValue: mockTenantScopeService },
        { provide: UserContextResolverService, useValue: {} },
        { provide: FeatureAccessService, useValue: {} },
        Reflector,
      ],
    }).compile();

    controller = module.get<KitchenController>(KitchenController);
    service = module.get<KitchenService>(KitchenService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getActiveOrders', () => {
    it('should return active orders', async () => {
      const mockOrders = [{ id: 'order-1' }];
      mockKitchenService.getActiveOrders.mockResolvedValue(mockOrders);

      const result = await controller.getActiveOrders();
      expect(result).toEqual(mockOrders);
      expect(mockKitchenService.getActiveOrders).toHaveBeenCalled();
    });
  });

  describe('updateOrderStatus', () => {
    it('should throw BadRequestException if status is missing', async () => {
      await expect(controller.updateOrderStatus('order-1', '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update status', async () => {
      const mockOrder = { id: 'order-1', status: 'PREPARING' };
      mockKitchenService.updateOrderStatus.mockResolvedValue(mockOrder);

      const result = await controller.updateOrderStatus('order-1', 'PREPARING');
      expect(result).toEqual(mockOrder);
      expect(mockKitchenService.updateOrderStatus).toHaveBeenCalledWith(
        'order-1',
        'PREPARING',
      );
    });
  });
});
