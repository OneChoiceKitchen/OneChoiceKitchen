import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { PortalCode } from '@prisma/client';

import { PORTALS_KEY } from './portal.decorator';
import type { RequestWithUserContext } from './user-context.types';
import { UserContextResolverService } from './user-context-resolver.service';

@Injectable()
export class UserContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly resolver: UserContextResolverService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUserContext>();
    const expectedPortals = this.reflector.getAllAndOverride<PortalCode[]>(PORTALS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [];

    request.userContext = await this.resolver.resolve(request.user, {
      expectedPortals,
      requestedPortal: this.header(request, 'x-portal-code'),
      requestedTenantId: this.header(request, 'x-tenant-id'),
    });
    return true;
  }

  private header(request: RequestWithUserContext, name: string): string | undefined {
    const value = request.headers[name];
    return Array.isArray(value) ? value[0] : value;
  }
}
