import { NotFoundException } from '@nestjs/common';
import { EntitlementLevel } from '@prisma/client';

import { FeatureAccessService } from './feature-access.service';

describe('FeatureAccessService', () => {
  const prisma = {
    moduleCatalog: { findFirst: jest.fn() },
    tenantSubscription: { findFirst: jest.fn() },
    tenantEntitlement: { findUnique: jest.fn() },
  };
  const service = new FeatureAccessService(prisma as never);
  const now = new Date('2026-07-14T10:00:00.000Z');

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.moduleCatalog.findFirst.mockResolvedValue({ id: 'module-hrms', code: 'hrms' });
  });

  it('returns implicit PREVIEW when no active subscription exists', async () => {
    prisma.tenantSubscription.findFirst.mockResolvedValue(null);

    await expect(service.evaluate('tenant-a', 'hrms', now)).resolves.toEqual({
      tenantId: 'tenant-a',
      moduleId: 'module-hrms',
      moduleCode: 'hrms',
      accessLevel: EntitlementLevel.PREVIEW,
      isPreview: true,
      subscriptionId: null,
      source: 'IMPLICIT_PREVIEW',
    });
    expect(prisma.tenantEntitlement.findUnique).not.toHaveBeenCalled();
  });

  it('uses the plan default when an active subscription has no current entitlement', async () => {
    prisma.tenantSubscription.findFirst.mockResolvedValue({
      id: 'subscription-a',
      plan: { defaultAccessLevel: EntitlementLevel.WRITE },
    });
    prisma.tenantEntitlement.findUnique.mockResolvedValue(null);

    await expect(service.evaluate('tenant-a', 'module-hrms', now)).resolves.toMatchObject({
      accessLevel: EntitlementLevel.WRITE,
      isPreview: false,
      subscriptionId: 'subscription-a',
      source: 'PLAN_DEFAULT',
    });
  });

  it('uses a current resolved entitlement over the plan default', async () => {
    prisma.tenantSubscription.findFirst.mockResolvedValue({
      id: 'subscription-a',
      plan: { defaultAccessLevel: EntitlementLevel.READ },
    });
    prisma.tenantEntitlement.findUnique.mockResolvedValue({
      accessLevel: EntitlementLevel.MANAGE,
      isActive: true,
      validFrom: new Date('2026-07-01T00:00:00.000Z'),
      validUntil: new Date('2026-08-01T00:00:00.000Z'),
    });

    await expect(service.evaluate('tenant-a', 'hrms', now)).resolves.toMatchObject({
      accessLevel: EntitlementLevel.MANAGE,
      source: 'ENTITLEMENT',
    });
  });

  it('ignores an expired entitlement and falls back to the active plan', async () => {
    prisma.tenantSubscription.findFirst.mockResolvedValue({
      id: 'subscription-a',
      plan: { defaultAccessLevel: EntitlementLevel.READ },
    });
    prisma.tenantEntitlement.findUnique.mockResolvedValue({
      accessLevel: EntitlementLevel.MANAGE,
      isActive: true,
      validFrom: null,
      validUntil: new Date('2026-07-01T00:00:00.000Z'),
    });

    await expect(service.evaluate('tenant-a', 'hrms', now)).resolves.toMatchObject({
      accessLevel: EntitlementLevel.READ,
      source: 'PLAN_DEFAULT',
    });
  });

  it('rejects unknown or disabled module identifiers', async () => {
    prisma.moduleCatalog.findFirst.mockResolvedValue(null);

    await expect(service.evaluate('tenant-a', 'missing', now)).rejects.toThrow(NotFoundException);
  });
});
