import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrisma = {
      restaurantTable: {
        findMany: jest.fn(),
      },
      tableReservation: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      user: {
        findMany: jest.fn().mockResolvedValue([]),
      }
    };

    const mockNotifications = {
      sendEmail: jest.fn(),
      sendSms: jest.fn(),
    };

    const mockWhatsapp = {
      sendMessage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: WhatsappService, useValue: mockWhatsapp },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkAvailability', () => {
    it('should return true when tables are available and no overlapping reservations', async () => {
      jest.spyOn(prismaService.restaurantTable, 'findMany').mockResolvedValue([
        { id: 't-1', restaurantId: 'r-1', capacity: 4, isAvailable: true } as any
      ]);
      jest.spyOn(prismaService.tableReservation, 'findMany').mockResolvedValue([]);

      const result = await service.checkAvailability('r-1', '2023-10-10', '18:00', 4);
      expect(result).toBe(true);
    });

    it('should return false when no tables match party size', async () => {
      jest.spyOn(prismaService.restaurantTable, 'findMany').mockResolvedValue([]);

      const result = await service.checkAvailability('r-1', '2023-10-10', '18:00', 4);
      expect(result).toBe(false);
    });

    it('should return false when reservations equal or exceed available tables', async () => {
      jest.spyOn(prismaService.restaurantTable, 'findMany').mockResolvedValue([
        { id: 't-1', restaurantId: 'r-1', capacity: 4, isAvailable: true } as any
      ]);
      jest.spyOn(prismaService.tableReservation, 'findMany').mockResolvedValue([
        { id: 'res-1', status: 'CONFIRMED' } as any
      ]);

      const result = await service.checkAvailability('r-1', '2023-10-10', '18:00', 4);
      expect(result).toBe(false);
    });
  });

  describe('create', () => {
    it('should throw error if checkAvailability fails', async () => {
      jest.spyOn(service, 'checkAvailability').mockResolvedValue(false);

      await expect(service.create('user-1', {
        restaurantId: 'r-1',
        date: '2023-10-10',
        timeSlot: '18:00',
        partySize: 4
      })).rejects.toThrow('No tables available');
    });

    it('should create reservation if availability passes', async () => {
      jest.spyOn(service, 'checkAvailability').mockResolvedValue(true);
      jest.spyOn(prismaService.tableReservation, 'create').mockResolvedValue({
        id: 'res-1',
        confirmationCode: 'TESTCODE',
        user: { name: 'Test User' },
        restaurant: { name: 'Test Rest' }
      } as any);

      const result = await service.create('user-1', {
        restaurantId: 'r-1',
        date: '2023-10-10',
        timeSlot: '18:00',
        partySize: 4
      });

      expect(result.id).toBe('res-1');
      expect(prismaService.tableReservation.create).toHaveBeenCalled();
    });
  });
});
