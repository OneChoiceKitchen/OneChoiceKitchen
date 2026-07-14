import { ForbiddenException } from '@nestjs/common';
import { PortalCode } from '@prisma/client';

import { TenantScopeService } from './tenant-scope.service';
import type { RequestWithUserContext } from './user-context.types';

function requestContext(overrides: Partial<NonNullable<RequestWithUserContext['userContext']>> = {}) {
  return {
    userContext: {
      userId: 'user-a',
      email: 'partner@example.com',
      portalCode: PortalCode.PARTNER,
      tenantId: 'tenant-a',
      membershipId: 'membership-a',
      roleNames: ['PARTNER'],
      permissions: [],
      isSuperAdmin: false,
      source: 'MEMBERSHIP' as const,
      ...overrides,
    },
  } as unknown as RequestWithUserContext;
}

describe('TenantScopeService', () => {
  it('adds the resolved tenant to read and create data', () => {
    const service = new TenantScopeService(requestContext());

    expect(service.scopeWhere({ status: 'ACTIVE' })).toEqual({ status: 'ACTIVE', tenantId: 'tenant-a' });
    expect(service.scopeCreate({ name: 'Employee' })).toEqual({ name: 'Employee', tenantId: 'tenant-a' });
  });

  it('rejects explicit cross-tenant reads and writes', () => {
    const service = new TenantScopeService(requestContext());

    expect(() => service.scopeWhere({ tenantId: 'tenant-b' })).toThrow(ForbiddenException);
    expect(() => service.scopeCreate({ tenantId: 'tenant-b' })).toThrow(ForbiddenException);
  });

  it('lets Super Admin query globally but requires a tenant for tenant-owned creates', () => {
    const service = new TenantScopeService(
      requestContext({ isSuperAdmin: true, tenantId: null, roleNames: ['SUPER_ADMIN'] }),
    );

    expect(service.scopeWhere({ status: 'ACTIVE' })).toEqual({ status: 'ACTIVE' });
    expect(() => service.scopeCreate({ name: 'Employee' })).toThrow(ForbiddenException);
    expect(service.scopeCreate({ name: 'Employee', tenantId: 'tenant-b' })).toEqual({
      name: 'Employee',
      tenantId: 'tenant-b',
    });
  });
});
