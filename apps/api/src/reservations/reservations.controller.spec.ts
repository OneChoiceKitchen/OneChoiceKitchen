import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn().mockResolvedValue({ id: 'res-1', confirmationCode: 'ABC' }),
      findUserReservations: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        { provide: ReservationsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a reservation successfully', async () => {
    const req = { user: { userId: 'user-1' } };
    const body = { restaurantId: 'r-1', branchId: 'b-1', date: '2023-10-10', timeSlot: '18:00', partySize: 4 };
    
    const result = await controller.create(req, body);
    
    expect(service.create).toHaveBeenCalledWith('user-1', body);
    expect(result.confirmationCode).toBe('ABC');
  });

  it('should return user reservations', async () => {
    const req = { user: { userId: 'user-1' } };
    const result = await controller.findUserReservations(req);
    expect(service.findUserReservations).toHaveBeenCalledWith('user-1');
    expect(result).toEqual([]);
  });
});
