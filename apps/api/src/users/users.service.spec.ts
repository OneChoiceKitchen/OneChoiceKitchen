import { PrismaService } from '../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const findMany = jest.fn();
  const queryRaw = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: { findMany },
            role: { findMany: jest.fn() },
            permission: { findMany: jest.fn() },
            $queryRaw: queryRaw,
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('falls back to the legacy User table when cat_customers is not migrated locally', async () => {
    findMany.mockRejectedValue(
      new Error('SQLITE_ERROR: no such table: main.cat_customers'),
    );
    queryRaw
      .mockResolvedValueOnce([
        {
          id: 'user-1',
          email: 'admin@test.com',
          roleId: 'role-1',
          restaurantId: null,
        },
      ])
      .mockResolvedValueOnce([{ id: 'role-1', name: 'SUPER_ADMIN' }]);

    await expect(service.findAll()).resolves.toEqual([
      {
        id: 'user-1',
        email: 'admin@test.com',
        roleId: 'role-1',
        restaurantId: null,
        role: { id: 'role-1', name: 'SUPER_ADMIN' },
        restaurant: null,
      },
    ]);
  });
});
