import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BillingService', () => {
  let service: BillingService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: PrismaService,
          useValue: {
            tenantSubscription: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            tenantEntitlement: {
              findUnique: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
            invoice: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
            $transaction: jest.fn(async (cb) => {
              return cb({
                tenantSubscription: { update: jest.fn().mockResolvedValue({ id: 'sub-1', status: 'ACTIVE' }) },
                tenantEntitlement: {
                  findUnique: jest.fn().mockResolvedValue(null),
                  create: jest.fn().mockResolvedValue({}),
                },
                invoice: {
                  create: jest.fn().mockResolvedValue({ id: 'inv-1', status: 'PAID' }),
                },
              });
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('simulateSubscriptionPayment', () => {
    it('should throw NotFoundException if subscription not found', async () => {
      (prisma.tenantSubscription.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.simulateSubscriptionPayment('t1', 's1', 100))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if subscription is already ACTIVE', async () => {
      (prisma.tenantSubscription.findUnique as jest.Mock).mockResolvedValue({ status: 'ACTIVE' });

      await expect(service.simulateSubscriptionPayment('t1', 's1', 100))
        .rejects.toThrow(BadRequestException);
    });

    it('should process payment and return invoice', async () => {
      (prisma.tenantSubscription.findUnique as jest.Mock).mockResolvedValue({
        id: 'sub-1',
        status: 'PENDING',
        moduleId: 'mod-1',
      });

      const result = await service.simulateSubscriptionPayment('t1', 'sub-1', 100);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.invoice.status).toBe('PAID');
    });
  });

  describe('getInvoices', () => {
    it('should return invoices for tenant', async () => {
      const mockInvoices = [{ id: 'inv-1' }, { id: 'inv-2' }];
      (prisma.invoice.findMany as jest.Mock).mockResolvedValue(mockInvoices);

      const result = await service.getInvoices('t1');
      expect(result).toEqual(mockInvoices);
      expect(prisma.invoice.findMany).toHaveBeenCalledWith({
        where: { tenantId: 't1' },
        orderBy: { billingDate: 'desc' },
      });
    });
  });
});
