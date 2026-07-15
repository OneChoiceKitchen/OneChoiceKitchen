import { Test, TestingModule } from '@nestjs/testing';
import { PromotionsService } from './promotions.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('PromotionsService', () => {
  let service: PromotionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionsService,
        {
          provide: PrismaService,
          useValue: {
            promotion: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PromotionsService>(PromotionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw if code already exists', async () => {
      jest.spyOn(prisma.promotion, 'findUnique').mockResolvedValue({ id: '1' } as any);

      await expect(
        service.create('tenant1', {
          code: 'TEST',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          validFrom: new Date().toISOString(),
          validUntil: new Date().toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create promotion', async () => {
      jest.spyOn(prisma.promotion, 'findUnique').mockResolvedValue(null);
      const mockPromo = { id: '1', code: 'TEST' };
      jest.spyOn(prisma.promotion, 'create').mockResolvedValue(mockPromo as any);

      const result = await service.create('tenant1', {
        code: 'test',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        validFrom: new Date().toISOString(),
        validUntil: new Date().toISOString(),
      });

      expect(result).toEqual(mockPromo);
      expect(prisma.promotion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            code: 'TEST',
            tenantId: 'tenant1',
          }),
        }),
      );
    });
  });

  describe('validate', () => {
    it('should throw if promo not found', async () => {
      jest.spyOn(prisma.promotion, 'findUnique').mockResolvedValue(null);

      await expect(
        service.validate({ code: 'INVALID', tenantId: 'tenant1', cartTotal: 500 }),
      ).rejects.toThrow('Invalid promo code');
    });

    it('should throw if promo inactive', async () => {
      jest.spyOn(prisma.promotion, 'findUnique').mockResolvedValue({ isActive: false } as any);

      await expect(
        service.validate({ code: 'TEST', tenantId: 'tenant1', cartTotal: 500 }),
      ).rejects.toThrow('Promo code is no longer active');
    });

    it('should calculate percentage discount correctly', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      jest.spyOn(prisma.promotion, 'findUnique').mockResolvedValue({
        isActive: true,
        validFrom: pastDate,
        validUntil: futureDate,
        discountType: 'PERCENTAGE',
        discountValue: 10, // 10%
        minOrderValue: 100,
        maxDiscount: 50,
      } as any);

      const result = await service.validate({ code: 'TEST', tenantId: 'tenant1', cartTotal: 1000 });
      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(50); // 10% of 1000 is 100, capped at 50
    });

    it('should calculate flat discount correctly', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      jest.spyOn(prisma.promotion, 'findUnique').mockResolvedValue({
        isActive: true,
        validFrom: pastDate,
        validUntil: futureDate,
        discountType: 'FLAT',
        discountValue: 100,
      } as any);

      const result = await service.validate({ code: 'TEST', tenantId: 'tenant1', cartTotal: 500 });
      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(100);
    });
  });
});
