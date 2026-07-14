import type { PortalCode } from '@prisma/client';
import type { Request } from 'express';

export interface JwtPrincipal {
  userId: string;
  email?: string;
  role?: string;
  permissions?: string[];
  restaurantId?: string | null;
  portalCode?: PortalCode;
  tenantId?: string | null;
}

export interface UserContext {
  userId: string;
  email: string | null;
  portalCode: PortalCode;
  tenantId: string | null;
  membershipId: string | null;
  roleNames: string[];
  permissions: string[];
  isSuperAdmin: boolean;
  source: 'MEMBERSHIP' | 'LEGACY';
}

export interface UserContextResponse {
  userId: string;
  displayName: string;
  email: string | null;
  portalCode: PortalCode;
  portalName: 'Admin Portal' | 'Partner Portal' | 'Rider Portal' | 'Web Frontend';
  siteTitle: string;
  tenantId: string | null;
  partnerName: string | null;
  roles: string[];
  permissions: string[];
}

export interface TenantScopeDescriptor {
  tenantId: string | null;
  bypassTenantScope: boolean;
}

export interface RequestWithUserContext extends Request {
  user: JwtPrincipal;
  userContext?: UserContext;
  tenantScope?: TenantScopeDescriptor;
}
