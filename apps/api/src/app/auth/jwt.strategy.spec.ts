import { UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const findUnique = jest.fn();
  let strategy: JwtStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
    strategy = new JwtStrategy({
      user: { findUnique },
    } as unknown as PrismaService);
  });

  it('returns the admin demo profile when cat_customers is not migrated locally', async () => {
    findUnique.mockRejectedValue(
      new Error('SQLITE_ERROR: no such table: main.cat_customers'),
    );

    await expect(
      strategy.validate({ sub: 'mock-admin-id', email: 'admin@test.com' }),
    ).resolves.toEqual({
      userId: 'mock-admin-id',
      email: 'admin@test.com',
      role: 'SUPER_ADMIN',
    });
  });

  it('rejects unknown mock payloads when cat_customers is not migrated locally', async () => {
    findUnique.mockRejectedValue(
      new Error('SQLITE_ERROR: no such table: main.cat_customers'),
    );

    await expect(
      strategy.validate({ sub: 'unknown-id', email: 'unknown@test.com' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
