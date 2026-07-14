import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntitlementLevel, PortalCode } from '@prisma/client';

import type { RequestWithUserContext } from '../app/auth/user-context.types';
import { EntitlementGuard, PREVIEW_MODE_WRITE_ERROR } from './entitlement.guard';
import type { FeatureAccessResult } from './feature-access.types';

function executionContext(request: Partial<RequestWithUserContext>): ExecutionContext {
  return {
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function tenantRequest(overrides: Partial<NonNullable<RequestWithUserContext['userContext']>> = {}) {
  return {
    userContext: {
      userId: 'partner-a',
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
  } as Partial<RequestWithUserContext>;
}

function access(accessLevel: EntitlementLevel): FeatureAccessResult {
  return {
    tenantId: 'tenant-a',
    moduleId: 'module-hrms',
    moduleCode: 'hrms',
    accessLevel,
    isPreview: accessLevel === EntitlementLevel.PREVIEW,
    subscriptionId: accessLevel === EntitlementLevel.PREVIEW ? null : 'subscription-a',
    source: accessLevel === EntitlementLevel.PREVIEW ? 'IMPLICIT_PREVIEW' : 'ENTITLEMENT',
  };
}

describe('EntitlementGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
  const featureAccess = { evaluate: jest.fn() };
  const guard = new EntitlementGuard(reflector, featureAccess as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows READ endpoints while a module is in PREVIEW mode', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue({
      moduleId: 'hrms',
      accessLevel: EntitlementLevel.READ,
    });
    featureAccess.evaluate.mockResolvedValue(access(EntitlementLevel.PREVIEW));

    await expect(guard.canActivate(executionContext(tenantRequest()))).resolves.toBe(true);
  });

  it('rejects WRITE endpoints in PREVIEW mode with the required message', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue({
      moduleId: 'hrms',
      accessLevel: EntitlementLevel.WRITE,
    });
    featureAccess.evaluate.mockResolvedValue(access(EntitlementLevel.PREVIEW));

    await expect(guard.canActivate(executionContext(tenantRequest()))).rejects.toThrow(
      new ForbiddenException(PREVIEW_MODE_WRITE_ERROR),
    );
  });

  it('allows WRITE when the resolved entitlement meets the requirement', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue({
      moduleId: 'hrms',
      accessLevel: EntitlementLevel.WRITE,
    });
    featureAccess.evaluate.mockResolvedValue(access(EntitlementLevel.MANAGE));

    await expect(guard.canActivate(executionContext(tenantRequest()))).resolves.toBe(true);
  });

  it('bypasses entitlement lookup for Super Admin', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue({
      moduleId: 'hrms',
      accessLevel: EntitlementLevel.MANAGE,
    });

    await expect(
      guard.canActivate(
        executionContext(tenantRequest({ isSuperAdmin: true, roleNames: ['SUPER_ADMIN'], tenantId: null })),
      ),
    ).resolves.toBe(true);
    expect(featureAccess.evaluate).not.toHaveBeenCalled();
  });

  it('does nothing on endpoints without entitlement metadata', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    await expect(guard.canActivate(executionContext({}))).resolves.toBe(true);
  });
});
