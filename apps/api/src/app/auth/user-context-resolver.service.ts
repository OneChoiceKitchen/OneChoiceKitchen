import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MembershipStatus, PortalCode } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPrincipal, UserContext } from './user-context.types';

export interface ContextSelection {
  expectedPortals: PortalCode[];
  requestedPortal?: string;
  requestedTenantId?: string;
}

const LEGACY_ROLE_PORTALS: Readonly<Record<string, PortalCode>> = {
  SUPER_ADMIN: PortalCode.ADMIN,
  ADMIN: PortalCode.ADMIN,
  SUPPORT: PortalCode.ADMIN,
  PARTNER: PortalCode.PARTNER,
  RIDER: PortalCode.RIDER,
  CUSTOMER: PortalCode.WEB,
};

@Injectable()
export class UserContextResolverService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(principal: JwtPrincipal | undefined, selection: ContextSelection): Promise<UserContext> {
    if (!principal?.userId) {
      throw new UnauthorizedException('Authenticated user context is missing');
    }

    const portalCode = this.resolvePortal(principal, selection);
    this.assertLegacyRoleCanUsePortal(principal.role, portalCode);

    const memberships = await this.prisma.userPortalMembership.findMany({
      where: {
        userId: principal.userId,
        portal: portalCode,
        status: MembershipStatus.ACTIVE,
        ...(selection.requestedTenantId ? { tenantId: selection.requestedTenantId } : {}),
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    if (memberships.length > 1 && !selection.requestedTenantId) {
      throw new BadRequestException('A tenant must be selected for this portal');
    }

    const membership = memberships[0];
    if (membership) {
      const roleNames = this.unique([
        ...membership.roles.map((assignment) => assignment.role.name),
        ...(principal.role ? [principal.role] : []),
      ]);
      const permissions = this.unique([
        ...(principal.permissions ?? []),
        ...membership.roles.flatMap((assignment) =>
          assignment.role.permissions.map((entry) => entry.permission.name),
        ),
      ]);

      return {
        userId: principal.userId,
        email: principal.email ?? null,
        portalCode,
        tenantId: membership.tenantId,
        membershipId: membership.id,
        roleNames,
        permissions,
        isSuperAdmin: roleNames.includes('SUPER_ADMIN'),
        source: 'MEMBERSHIP',
      };
    }

    const membershipCount = await this.prisma.userPortalMembership.count({
      where: { userId: principal.userId },
    });
    if (membershipCount > 0) {
      throw new ForbiddenException(`No active ${portalCode} portal membership`);
    }

    return this.resolveLegacyContext(principal, portalCode, selection.requestedTenantId);
  }

  private resolvePortal(principal: JwtPrincipal, selection: ContextSelection): PortalCode {
    const requestedPortal = selection.requestedPortal ?? principal.portalCode;
    const portalCode = requestedPortal
      ? this.parsePortal(requestedPortal)
      : selection.expectedPortals.length === 1
        ? selection.expectedPortals[0]
        : LEGACY_ROLE_PORTALS[principal.role ?? 'CUSTOMER'];

    if (!portalCode) {
      throw new BadRequestException('Portal selection is required');
    }
    if (selection.expectedPortals.length > 0 && !selection.expectedPortals.includes(portalCode)) {
      throw new ForbiddenException(`This endpoint does not accept ${portalCode} portal sessions`);
    }
    return portalCode;
  }

  private parsePortal(value: string | PortalCode): PortalCode {
    const normalized = value.toString().toUpperCase();
    if (!Object.values(PortalCode).includes(normalized as PortalCode)) {
      throw new BadRequestException('Invalid portal selection');
    }
    return normalized as PortalCode;
  }

  private assertLegacyRoleCanUsePortal(role: string | undefined, portal: PortalCode): void {
    const restrictedPortal = role ? LEGACY_ROLE_PORTALS[role] : undefined;
    if (restrictedPortal && restrictedPortal !== portal) {
      throw new ForbiddenException(`${role} sessions cannot access the ${portal} portal`);
    }
  }

  private resolveLegacyContext(
    principal: JwtPrincipal,
    portalCode: PortalCode,
    requestedTenantId?: string,
  ): UserContext {
    const roleName = principal.role ?? 'CUSTOMER';
    const tenantId = requestedTenantId ?? principal.tenantId ?? principal.restaurantId ?? null;

    return {
      userId: principal.userId,
      email: principal.email ?? null,
      portalCode,
      tenantId,
      membershipId: null,
      roleNames: [roleName],
      permissions: this.unique(principal.permissions ?? []),
      isSuperAdmin: roleName === 'SUPER_ADMIN',
      source: 'LEGACY',
    };
  }

  private unique(values: string[]): string[] {
    return [...new Set(values)];
  }
}
