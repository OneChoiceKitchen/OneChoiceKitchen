import { ForbiddenException } from '@nestjs/common';
import { MembershipStatus, PortalCode } from '@prisma/client';

import { UserContextResolverService } from './user-context-resolver.service';

describe('UserContextResolverService', () => {
  const prisma = {
    userPortalMembership: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };
  const service = new UserContextResolverService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves active membership roles and permissions from the database', async () => {
    prisma.userPortalMembership.findMany.mockResolvedValue([
      {
        id: 'membership-a',
        tenantId: 'tenant-a',
        roles: [
          {
            role: {
              name: 'PARTNER',
              permissions: [{ permission: { name: 'orders.read' } }],
            },
          },
        ],
      },
    ]);

    const context = await service.resolve(
      { userId: 'user-a', email: 'partner@example.com', role: 'PARTNER' },
      {
        expectedPortals: [PortalCode.PARTNER],
        requestedTenantId: 'tenant-a',
      },
    );

    expect(context).toMatchObject({
      portalCode: PortalCode.PARTNER,
      tenantId: 'tenant-a',
      roleNames: ['PARTNER'],
      permissions: ['orders.read'],
      source: 'MEMBERSHIP',
    });
    expect(prisma.userPortalMembership.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: MembershipStatus.ACTIVE }),
      }),
    );
  });

  it('rejects a Partner JWT before querying an Admin membership', async () => {
    await expect(
      service.resolve(
        { userId: 'user-a', role: 'PARTNER' },
        { expectedPortals: [PortalCode.ADMIN] },
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.userPortalMembership.findMany).not.toHaveBeenCalled();
  });

  it('preserves legacy users only when no membership records exist', async () => {
    prisma.userPortalMembership.findMany.mockResolvedValue([]);
    prisma.userPortalMembership.count.mockResolvedValue(0);

    const context = await service.resolve(
      { userId: 'legacy-partner', role: 'PARTNER', restaurantId: 'restaurant-a' },
      { expectedPortals: [PortalCode.PARTNER] },
    );

    expect(context).toMatchObject({
      portalCode: PortalCode.PARTNER,
      tenantId: 'restaurant-a',
      source: 'LEGACY',
    });
  });
});
