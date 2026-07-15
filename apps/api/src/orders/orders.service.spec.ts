import { PrismaService } from '../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { PromotionsService } from '../promotions/promotions.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { BadRequestException } from '@nestjs/common';
import { ItemType } from '@prisma/client';

describe('OrdersService', () => {
  let service: OrdersService;
  const findMany = jest.fn();
  const menuItemFindMany = jest.fn();
  const transaction = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            order: { findMany },
            menuItem: { findMany: menuItemFindMany },
            $transaction: transaction,
          },
        },
        { provide: OrdersGateway, useValue: { notifyNewOrder: jest.fn() } },
        {
          provide: PromotionsService,
          useValue: {
            validate: jest.fn().mockResolvedValue({ valid: true, discountAmount: 0 }),
          },
        },
        {
          provide: WebhooksService,
          useValue: { dispatch: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkout', () => {
    it('throws error if menu items are missing', async () => {
      menuItemFindMany.mockResolvedValueOnce([]);
      
      await expect(
        service.checkout({
          serviceType: ItemType.FOOD_ORDERING,
          deliveryAddress: '123 Main St',
          items: [{ menuItemId: 'invalid-id', quantity: 1, price: 100 }],
        } as any, 'user-1')
      ).rejects.toThrow(BadRequestException);
    });

    it('validates single-tenant food ordering invariants', async () => {
      menuItemFindMany.mockResolvedValueOnce([
        { id: 'item1', tenantId: 'tenant1', branchId: 'branch1' },
        { id: 'item2', tenantId: 'tenant2', branchId: 'branch1' },
      ]);

      await expect(
        service.checkout({
          serviceType: ItemType.FOOD_ORDERING,
          deliveryAddress: '123 Main St',
          items: [
            { menuItemId: 'item1', quantity: 1, price: 100 },
            { menuItemId: 'item2', quantity: 1, price: 100 },
          ],
        } as any, 'user-1')
      ).rejects.toThrow('All food items in the cart must belong to the same tenant and branch');
    });

    it('proceeds if invariants are met', async () => {
      menuItemFindMany.mockResolvedValueOnce([
        { id: 'item1', tenantId: 'tenant1', branchId: 'branch1', restaurantId: 'rest1' },
      ]);
      transaction.mockResolvedValueOnce(undefined);

      await expect(
        service.checkout({
          serviceType: ItemType.FOOD_ORDERING,
          deliveryAddress: '123 Main St',
          items: [{ menuItemId: 'item1', quantity: 1, price: 100 }],
        } as any, 'user-1')
      ).resolves.toBeDefined();
    });
  });

  it('falls back to order rows without user include when cat_customers is not migrated locally', async () => {
    const order = { id: 'order-1', items: [] };
    findMany
      .mockRejectedValueOnce(
        new Error('SQLITE_ERROR: no such table: main.cat_customers'),
      )
      .mockResolvedValueOnce([order]);

    await expect(service.findAll()).resolves.toEqual([
      { ...order, user: null, restaurant: null },
    ]);
  });
});
