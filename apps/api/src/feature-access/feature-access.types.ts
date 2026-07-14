import type { EntitlementLevel } from '@prisma/client';

export type FeatureAccessSource = 'IMPLICIT_PREVIEW' | 'PLAN_DEFAULT' | 'ENTITLEMENT';

export interface FeatureAccessResult {
  tenantId: string;
  moduleId: string;
  moduleCode: string;
  accessLevel: EntitlementLevel;
  isPreview: boolean;
  subscriptionId: string | null;
  source: FeatureAccessSource;
}

export interface RequiredEntitlement {
  moduleId: string;
  accessLevel: EntitlementLevel;
}
