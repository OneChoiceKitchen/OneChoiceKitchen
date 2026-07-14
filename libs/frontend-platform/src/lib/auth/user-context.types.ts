export type PortalCode = 'ADMIN' | 'PARTNER' | 'RIDER' | 'WEB';

export type PortalName =
  | 'Admin Portal'
  | 'Partner Portal'
  | 'Rider Portal'
  | 'Web Frontend';

export type EntitlementLevel = 'PREVIEW' | 'READ' | 'WRITE' | 'MANAGE';

export interface UserContextResponse {
  userId: string;
  displayName: string;
  email: string | null;
  portalCode: PortalCode;
  portalName: PortalName;
  siteTitle: string;
  tenantId: string | null;
  partnerName: string | null;
  roles: string[];
  permissions: string[];
}

export type ModuleEntitlements = Readonly<Record<string, EntitlementLevel>>;

export interface AuthSession {
  accessToken: string;
  userContext: UserContextResponse;
  entitlements?: ModuleEntitlements;
}
