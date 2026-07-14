import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PortalCode } from '@prisma/client';

import { PortalGuard } from './portal.guard';
import { TenantGuard } from './tenant.guard';
import type { RequestWithUserContext } from './user-context.types';

function executionContext(request: Partial<RequestWithUserContext>): ExecutionContext {
  return {
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('PortalGuard', () => {
  it('rejects a Partner context on an Admin endpoint', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue([PortalCode.ADMIN]) } as unknown as Reflector;
    const guard = new PortalGuard(reflector);
    const context = executionContext({
      userContext: {
        userId: 'partner-a',
        email: null,
        portalCode: PortalCode.PARTNER,
        tenantId: 'tenant-a',
        membershipId: 'membership-a',
        roleNames: ['PARTNER'],
        permissions: [],
        isSuperAdmin: false,
        source: 'MEMBERSHIP',
      },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

describe('TenantGuard', () => {
  it('requires a tenant for tenant endpoints', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(true) } as unknown as Reflector;
    const guard = new TenantGuard(reflector);
    const context = executionContext({
      userContext: {
        userId: 'partner-a',
        email: null,
        portalCode: PortalCode.PARTNER,
        tenantId: null,
        membershipId: 'membership-a',
        roleNames: ['PARTNER'],
        permissions: [],
        isSuperAdmin: false,
        source: 'MEMBERSHIP',
      },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('attaches an immutable Super Admin bypass descriptor', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(true) } as unknown as Reflector;
    const guard = new TenantGuard(reflector);
    const request: Partial<RequestWithUserContext> = {
      userContext: {
        userId: 'admin-a',
        email: null,
        portalCode: PortalCode.ADMIN,
        tenantId: null,
        membershipId: 'membership-a',
        roleNames: ['SUPER_ADMIN'],
        permissions: [],
        isSuperAdmin: true,
        source: 'MEMBERSHIP',
      },
    };

    expect(guard.canActivate(executionContext(request))).toBe(true);
    expect(request.tenantScope).toEqual({ tenantId: null, bypassTenantScope: true });
    expect(Object.isFrozen(request.tenantScope)).toBe(true);
  });
});
