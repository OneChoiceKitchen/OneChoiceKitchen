import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { TenantScopeService } from '../app/auth/tenant-scope.service';
import { Reflector } from '@nestjs/core';
import { UserContextResolverService } from '../app/auth/user-context-resolver.service';
import { FeatureAccessService } from '../feature-access/feature-access.service';

describe('BillingController', () => {
  let controller: BillingController;
  let service: BillingService;
  let tenantScope: TenantScopeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingController],
      providers: [
        {
          provide: BillingService,
          useValue: {
            simulateSubscriptionPayment: jest.fn(),
            getInvoices: jest.fn(),
          },
        },
        {
          provide: TenantScopeService,
          useValue: {
            get tenantId() {
              return 'test-tenant';
            },
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
        Reflector,
      ],
    }).compile();

    controller = module.get<BillingController>(BillingController);
    service = module.get<BillingService>(BillingService);
    tenantScope = module.get<TenantScopeService>(TenantScopeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('subscribe', () => {
    it('should throw BadRequestException if tenantId is missing', async () => {
      jest.spyOn(tenantScope, 'tenantId', 'get').mockReturnValue(null);
      await expect(controller.subscribe({ subscriptionId: 's1', amount: 100 })).rejects.toThrow(BadRequestException);
    });

    it('should call simulateSubscriptionPayment on service', async () => {
      const mockResult = { success: true, invoice: { id: 'inv-1', status: 'PAID' }, subscription: { id: 's1', status: 'ACTIVE' } };
      (service.simulateSubscriptionPayment as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.subscribe({ subscriptionId: 's1', amount: 100 });
      expect(result).toEqual(mockResult);
      expect(service.simulateSubscriptionPayment).toHaveBeenCalledWith('test-tenant', 's1', 100);
    });
  });

  describe('getInvoices', () => {
    it('should throw BadRequestException if tenantId is missing', async () => {
      jest.spyOn(tenantScope, 'tenantId', 'get').mockReturnValue(null);
      await expect(controller.getInvoices()).rejects.toThrow(BadRequestException);
    });

    it('should return invoices from service', async () => {
      const mockInvoices = [{ id: 'inv-1' }];
      (service.getInvoices as jest.Mock).mockResolvedValue(mockInvoices);

      const result = await controller.getInvoices();
      expect(result).toEqual(mockInvoices);
      expect(service.getInvoices).toHaveBeenCalledWith('test-tenant');
    });
  });
});
