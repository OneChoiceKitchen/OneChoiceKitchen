import { applyDecorators, UseGuards } from '@nestjs/common';
import type { PortalCode } from '@prisma/client';

import { JwtAuthGuard } from './jwt-auth.guard';
import { EntitlementGuard } from '../../feature-access/entitlement.guard';
import { Portals } from './portal.decorator';
import { PortalGuard } from './portal.guard';
import { RequireTenant } from './tenant.decorator';
import { TenantGuard } from './tenant.guard';
import { UserContextGuard } from './user-context.guard';

export function SecurePortal(portal: PortalCode, tenantRequired = false): MethodDecorator & ClassDecorator {
  return applyDecorators(
    Portals(portal),
    ...(tenantRequired ? [RequireTenant()] : []),
    UseGuards(JwtAuthGuard, UserContextGuard, PortalGuard, TenantGuard, EntitlementGuard),
  );
}
