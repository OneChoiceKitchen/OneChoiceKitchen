import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ServiceType, BookingStatus } from '@prisma/client';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    booking: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should throw ConflictException if start date is after end date', async () => {
      const dto = {
        tenantId: 'tenant-1',
        customerId: 'customer-1',
        serviceType: ServiceType.HALL,
        eventStartDate: new Date('2026-08-02T10:00:00Z').toISOString(),
        eventEndDate: new Date('2026-08-01T10:00:00Z').toISOString(),
      };

      await expect(service.createBooking(dto)).rejects.toThrowError(ConflictException);
    });

    it('should throw ConflictException if there is an overlapping booking', async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue({ id: 'existing-booking' });

      const dto = {
        tenantId: 'tenant-1',
        customerId: 'customer-1',
        serviceType: ServiceType.HALL,
        eventStartDate: new Date('2026-08-01T10:00:00Z').toISOString(),
        eventEndDate: new Date('2026-08-01T14:00:00Z').toISOString(),
      };

      await expect(service.createBooking(dto)).rejects.toThrowError(ConflictException);
    });

    it('should create a booking successfully if no conflicts', async () => {
      mockPrismaService.booking.findFirst.mockResolvedValue(null);
      mockPrismaService.booking.create.mockResolvedValue({ id: 'new-booking' });

      const dto = {
        tenantId: 'tenant-1',
        customerId: 'customer-1',
        serviceType: ServiceType.HALL,
        eventStartDate: new Date('2026-08-01T10:00:00Z').toISOString(),
        eventEndDate: new Date('2026-08-01T14:00:00Z').toISOString(),
      };

      const result = await service.createBooking(dto);
      expect(result).toEqual({ id: 'new-booking' });
      expect(mockPrismaService.booking.create).toHaveBeenCalled();
    });
  });

  describe('findAllByTenant', () => {
    it('should return bookings for a tenant', async () => {
      const bookings = [{ id: 'b1' }, { id: 'b2' }];
      mockPrismaService.booking.findMany.mockResolvedValue(bookings);

      const result = await service.findAllByTenant('tenant-1');
      expect(result).toEqual(bookings);
      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { tenantId: 'tenant-1' } }));
    });
  });
});
