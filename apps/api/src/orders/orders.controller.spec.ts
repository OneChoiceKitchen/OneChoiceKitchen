import { PrismaService } from '../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { PromotionsService } from '../promotions/promotions.service';
import { WebhooksService } from '../webhooks/webhooks.service';

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            order: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
          },
        },
        {
          provide: OrdersGateway,
          useValue: { notifyNewOrder: jest.fn(), notifyOrderStatusChange: jest.fn() },
        },
        {
          provide: PromotionsService,
          useValue: { validate: jest.fn(), create: jest.fn() },
        },
        {
          provide: WebhooksService,
          useValue: { dispatch: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
