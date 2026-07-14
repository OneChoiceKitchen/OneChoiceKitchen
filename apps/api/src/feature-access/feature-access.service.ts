import { Injectable, NotFoundException } from '@nestjs/common';
import {
  EntitlementLevel,
  TenantSubscriptionStatus,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import type { FeatureAccessResult } from './feature-access.types';

@Injectable()
export class FeatureAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async evaluate(tenantId: string, moduleId: string, now = new Date()): Promise<FeatureAccessResult> {
    const moduleRecord = await this.prisma.moduleCatalog.findFirst({
      where: {
        isActive: true,
        OR: [{ id: moduleId }, { code: moduleId }],
      },
      select: { id: true, code: true },
    });

    if (!moduleRecord) {
      throw new NotFoundException(`Module catalog entry not found: ${moduleId}`);
    }

    const subscription = await this.prisma.tenantSubscription.findFirst({
      where: {
        tenantId,
        moduleId: moduleRecord.id,
        status: TenantSubscriptionStatus.ACTIVE,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        ],
      },
      select: {
        id: true,
        plan: { select: { defaultAccessLevel: true } },
      },
      orderBy: { startsAt: 'desc' },
    });

    if (!subscription) {
      return this.previewResult(tenantId, moduleRecord.id, moduleRecord.code);
    }

    const entitlement = await this.prisma.tenantEntitlement.findUnique({
      where: {
        tenantId_moduleId: {
          tenantId,
          moduleId: moduleRecord.id,
        },
      },
      select: {
        accessLevel: true,
        isActive: true,
        validFrom: true,
        validUntil: true,
      },
    });

    const entitlementIsCurrent =
      entitlement?.isActive === true &&
      (!entitlement.validFrom || entitlement.validFrom <= now) &&
      (!entitlement.validUntil || entitlement.validUntil > now);
    const accessLevel = entitlementIsCurrent
      ? entitlement.accessLevel
      : subscription.plan.defaultAccessLevel;

    return {
      tenantId,
      moduleId: moduleRecord.id,
      moduleCode: moduleRecord.code,
      accessLevel,
      isPreview: accessLevel === EntitlementLevel.PREVIEW,
      subscriptionId: subscription.id,
      source: entitlementIsCurrent ? 'ENTITLEMENT' : 'PLAN_DEFAULT',
    };
  }

  private previewResult(tenantId: string, moduleId: string, moduleCode: string): FeatureAccessResult {
    return {
      tenantId,
      moduleId,
      moduleCode,
      accessLevel: EntitlementLevel.PREVIEW,
      isPreview: true,
      subscriptionId: null,
      source: 'IMPLICIT_PREVIEW',
    };
  }
}
