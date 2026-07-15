import { Test, TestingModule } from '@nestjs/testing';
import { LogisticsController } from './logistics.controller';
import { LogisticsService } from './logistics.service';
import { UserContextGuard } from '../app/auth/user-context.guard';
import { EntitlementGuard } from '../feature-access/entitlement.guard';
import { TenantGuard } from '../app/auth/tenant.guard';
import { PortalGuard } from '../app/auth/portal.guard';

describe('LogisticsController', () => {
  let controller: LogisticsController;
  let service: LogisticsService;

  const mockLogisticsService = {
    getAvailableOrders: jest.fn(),
    getActiveDelivery: jest.fn(),
    acceptOrder: jest.fn(),
    updateOrderStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogisticsController],
      providers: [
        { provide: LogisticsService, useValue: mockLogisticsService },
      ],
    })
      .overrideGuard(UserContextGuard).useValue({ canActivate: () => true })
      .overrideGuard(EntitlementGuard).useValue({ canActivate: () => true })
      .overrideGuard(TenantGuard).useValue({ canActivate: () => true })
      .overrideGuard(PortalGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LogisticsController>(LogisticsController);
    service = module.get<LogisticsService>(LogisticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAvailableOrders', () => {
    it('should call getAvailableOrders on service', async () => {
      const orders = [{ id: '1' }];
      mockLogisticsService.getAvailableOrders.mockResolvedValue(orders);

      const result = await controller.getAvailableOrders();

      expect(result).toEqual(orders);
      expect(service.getAvailableOrders).toHaveBeenCalled();
    });
  });

  describe('getActiveDelivery', () => {
    it('should call getActiveDelivery on service with user id', async () => {
      const order = { id: '1' };
      mockLogisticsService.getActiveDelivery.mockResolvedValue(order);

      const result = await controller.getActiveDelivery('user-1');

      expect(result).toEqual(order);
      expect(service.getActiveDelivery).toHaveBeenCalledWith('user-1');
    });
  });

  describe('acceptOrder', () => {
    it('should call acceptOrder on service with order id and user id', async () => {
      const order = { id: '1', riderId: 'user-1' };
      mockLogisticsService.acceptOrder.mockResolvedValue(order);

      const result = await controller.acceptOrder('1', 'user-1');

      expect(result).toEqual(order);
      expect(service.acceptOrder).toHaveBeenCalledWith('1', 'user-1');
    });
  });

  describe('updateOrderStatus', () => {
    it('should call updateOrderStatus on service with order id, user id, and status', async () => {
      const order = { id: '1', status: 'DELIVERED' };
      mockLogisticsService.updateOrderStatus.mockResolvedValue(order);

      const result = await controller.updateOrderStatus('1', 'DELIVERED', 'user-1');

      expect(result).toEqual(order);
      expect(service.updateOrderStatus).toHaveBeenCalledWith('1', 'user-1', 'DELIVERED');
    });
  });
});
