import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntitlementLevel } from '@prisma/client';

import type { RequestWithUserContext } from '../app/auth/user-context.types';
import { FeatureAccessService } from './feature-access.service';
import type { FeatureAccessResult, RequiredEntitlement } from './feature-access.types';
import { REQUIRED_ENTITLEMENT_KEY } from './require-entitlement.decorator';

export const PREVIEW_MODE_WRITE_ERROR =
  'Subscription required. Module is currently in read-only preview mode.';

const ACCESS_RANK: Readonly<Record<EntitlementLevel, number>> = {
  [EntitlementLevel.PREVIEW]: 0,
  [EntitlementLevel.READ]: 1,
  [EntitlementLevel.WRITE]: 2,
  [EntitlementLevel.MANAGE]: 3,
};

type EntitlementRequest = RequestWithUserContext & {
  featureAccess?: FeatureAccessResult;
};

@Injectable()
export class EntitlementGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly featureAccess: FeatureAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.getAllAndOverride<RequiredEntitlement>(
      REQUIRED_ENTITLEMENT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest<EntitlementRequest>();
    const userContext = request.userContext;
    if (!userContext) {
      throw new ForbiddenException('User and tenant context must be resolved before entitlement checks');
    }
    if (userContext.isSuperAdmin) {
      return true;
    }
    if (!userContext.tenantId) {
      throw new ForbiddenException('Tenant context is required for module access');
    }

    const access = await this.featureAccess.evaluate(userContext.tenantId, requirement.moduleId);
    request.featureAccess = access;

    // GET/read endpoints remain available so the portal can render preview data and purchase CTA.
    if (requirement.accessLevel === EntitlementLevel.READ) {
      return true;
    }
    if (ACCESS_RANK[access.accessLevel] >= ACCESS_RANK[requirement.accessLevel]) {
      return true;
    }
    if (access.accessLevel === EntitlementLevel.PREVIEW) {
      throw new ForbiddenException(PREVIEW_MODE_WRITE_ERROR);
    }

    throw new ForbiddenException(
      `Insufficient module entitlement. ${requirement.accessLevel} access is required.`,
    );
  }
}
