import { PrismaService } from '../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';

describe('OrdersService', () => {
  let service: OrdersService;
  const findMany = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              findMany,
            },
          },
        },
        { provide: OrdersGateway, useValue: { notifyNewOrder: jest.fn() } },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
    expect(findMany).toHaveBeenNthCalledWith(1, {
      include: { user: true, restaurant: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
    expect(findMany).toHaveBeenNthCalledWith(2, {
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  });
});
