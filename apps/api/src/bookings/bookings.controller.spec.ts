import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { ServiceType } from '@prisma/client';

describe('BookingsController', () => {
  let controller: BookingsController;
  let service: BookingsService;

  const mockBookingsService = {
    createBooking: jest.fn(),
    findAllByTenant: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
    service = module.get<BookingsService>(BookingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a booking', async () => {
      const dto = {
        tenantId: 'tenant-1',
        customerId: 'customer-1',
        serviceType: ServiceType.HALL,
        eventStartDate: '2026-08-01T10:00:00Z',
        eventEndDate: '2026-08-01T14:00:00Z',
      };
      mockBookingsService.createBooking.mockResolvedValue({ id: 'b1', ...dto });

      const result = await controller.create(dto);
      expect(result).toEqual({ id: 'b1', ...dto });
      expect(mockBookingsService.createBooking).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return bookings for a tenant', async () => {
      const req = { user: { tenantId: 'tenant-1' } };
      const bookings = [{ id: 'b1' }];
      mockBookingsService.findAllByTenant.mockResolvedValue(bookings);

      const result = await controller.findAll(req);
      expect(result).toEqual(bookings);
      expect(mockBookingsService.findAllByTenant).toHaveBeenCalledWith('tenant-1');
    });
  });
});
