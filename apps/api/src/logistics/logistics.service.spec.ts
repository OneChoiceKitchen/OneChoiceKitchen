import { Test, TestingModule } from '@nestjs/testing';
import { LogisticsService } from './logistics.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('LogisticsService', () => {
  let service: LogisticsService;
  let prisma: PrismaService;

  const mockPrisma = {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogisticsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LogisticsService>(LogisticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableOrders', () => {
    it('should return available orders', async () => {
      const expectedOrders = [{ id: '1' }, { id: '2' }];
      mockPrisma.order.findMany.mockResolvedValue(expectedOrders);

      const result = await service.getAvailableOrders();

      expect(result).toEqual(expectedOrders);
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: {
          status: { in: ['PREPARING', 'READY_FOR_PICKUP'] },
          riderId: null,
          orderType: 'DELIVERY',
        },
        include: {
          restaurant: { select: { name: true, address: true, lat: true, lng: true } },
          user: { select: { name: true, mobile: true } }
        },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('acceptOrder', () => {
    it('should accept an order successfully', async () => {
      const order = { id: '1', riderId: null, status: 'READY_FOR_PICKUP', orderType: 'DELIVERY' };
      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.order.update.mockResolvedValue({ ...order, riderId: 'rider-1', status: 'OUT_FOR_DELIVERY' });

      const result = await service.acceptOrder('1', 'rider-1');

      expect(result.riderId).toBe('rider-1');
      expect(result.status).toBe('OUT_FOR_DELIVERY');
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await expect(service.acceptOrder('1', 'rider-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if order is already assigned', async () => {
      const order = { id: '1', riderId: 'other-rider', status: 'READY_FOR_PICKUP', orderType: 'DELIVERY' };
      mockPrisma.order.findUnique.mockResolvedValue(order);
      await expect(service.acceptOrder('1', 'rider-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if order is not in a valid state', async () => {
      const order = { id: '1', riderId: null, status: 'DELIVERED', orderType: 'DELIVERY' };
      mockPrisma.order.findUnique.mockResolvedValue(order);
      await expect(service.acceptOrder('1', 'rider-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const order = { id: '1', riderId: 'rider-1' };
      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.order.update.mockResolvedValue({ ...order, status: 'DELIVERED' });

      const result = await service.updateOrderStatus('1', 'rider-1', 'DELIVERED');
      
      expect(result.status).toBe('DELIVERED');
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const order = { id: '1', riderId: 'rider-1' };
      mockPrisma.order.findUnique.mockResolvedValue(order);

      await expect(service.updateOrderStatus('1', 'rider-1', 'PENDING')).rejects.toThrow(BadRequestException);
    });
    
    it('should throw BadRequestException if rider is not assigned to order', async () => {
      const order = { id: '1', riderId: 'rider-2' };
      mockPrisma.order.findUnique.mockResolvedValue(order);

      await expect(service.updateOrderStatus('1', 'rider-1', 'DELIVERED')).rejects.toThrow(BadRequestException);
    });
  });
});
