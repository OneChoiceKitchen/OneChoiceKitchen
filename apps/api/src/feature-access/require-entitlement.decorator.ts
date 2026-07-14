import { SetMetadata } from '@nestjs/common';
import { EntitlementLevel } from '@prisma/client';

import type { RequiredEntitlement as RequiredEntitlementMetadata } from './feature-access.types';

export const REQUIRED_ENTITLEMENT_KEY = 'security:required-entitlement';

export const RequireEntitlement = (
  moduleId: string,
  accessLevel: EntitlementLevel = EntitlementLevel.READ,
) =>
  SetMetadata(REQUIRED_ENTITLEMENT_KEY, {
    moduleId,
    accessLevel,
  } satisfies RequiredEntitlementMetadata);
