import { Test, TestingModule } from '@nestjs/testing';
import { VenuesService } from './venues.service';
import { PrismaService } from '../prisma/prisma.service';

describe('VenuesService', () => {
  let service: VenuesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    hall: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VenuesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<VenuesService>(VenuesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a hall', async () => {
    const data = { name: 'Test Hall', basePrice: 5000, minCapacity: 50, maxCapacity: 200, restaurantId: '1' };
    mockPrismaService.hall.create.mockResolvedValue({ id: '1', ...data });

    const result = await service.create(data);
    expect(result).toEqual({ id: '1', ...data });
    expect(prismaService.hall.create).toHaveBeenCalledWith({ data });
  });

  it('should find all halls', async () => {
    const halls = [{ id: '1', name: 'Test Hall' }];
    mockPrismaService.hall.findMany.mockResolvedValue(halls);

    const result = await service.findAll();
    expect(result).toEqual(halls);
  });
});
