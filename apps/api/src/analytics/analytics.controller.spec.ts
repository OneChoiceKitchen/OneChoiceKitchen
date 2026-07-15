import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TenantScopeService } from '../app/auth/tenant-scope.service';
import { UserContextResolverService } from '../app/auth/user-context-resolver.service';
import { FeatureAccessService } from '../feature-access/feature-access.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;
  let tenantScope: TenantScopeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            getKpis: jest.fn(),
            getSalesTrend: jest.fn(),
          },
        },
        {
          provide: TenantScopeService,
          useValue: {
            getTenantIdOrNull: jest.fn(),
          },
        },
        {
          provide: UserContextResolverService,
          useValue: {},
        },
        {
          provide: FeatureAccessService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
    tenantScope = module.get<TenantScopeService>(TenantScopeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getKpis', () => {
    it('should call service with tenantId from scope', async () => {
      const mockTenantId = 'tenant-1';
      const mockResult = { totalOrders: 10, totalRevenue: 100, activeInventoryAlerts: 1 };
      
      jest.spyOn(tenantScope, 'getTenantIdOrNull').mockReturnValue(mockTenantId);
      jest.spyOn(service, 'getKpis').mockResolvedValue(mockResult);

      const result = await controller.getKpis();

      expect(tenantScope.getTenantIdOrNull).toHaveBeenCalled();
      expect(service.getKpis).toHaveBeenCalledWith(mockTenantId);
      expect(result).toEqual(mockResult);
    });

    it('should call service with null tenantId if not in scope', async () => {
      const mockResult = { totalOrders: 100, totalRevenue: 1000, activeInventoryAlerts: 5 };
      
      jest.spyOn(tenantScope, 'getTenantIdOrNull').mockReturnValue(null);
      jest.spyOn(service, 'getKpis').mockResolvedValue(mockResult);

      const result = await controller.getKpis();

      expect(tenantScope.getTenantIdOrNull).toHaveBeenCalled();
      expect(service.getKpis).toHaveBeenCalledWith(null);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getSalesTrend', () => {
    it('should call service with tenantId from scope', async () => {
      const mockTenantId = 'tenant-1';
      const mockResult = [{ date: '2023-01-01', revenue: 100, orderCount: 5 }];
      
      jest.spyOn(tenantScope, 'getTenantIdOrNull').mockReturnValue(mockTenantId);
      jest.spyOn(service, 'getSalesTrend').mockResolvedValue(mockResult);

      const result = await controller.getSalesTrend();

      expect(tenantScope.getTenantIdOrNull).toHaveBeenCalled();
      expect(service.getSalesTrend).toHaveBeenCalledWith(mockTenantId);
      expect(result).toEqual(mockResult);
    });
  });
});
