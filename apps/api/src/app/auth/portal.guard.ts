import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { PortalCode } from '@prisma/client';

import { PORTALS_KEY } from './portal.decorator';
import type { RequestWithUserContext } from './user-context.types';

@Injectable()
export class PortalGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const expectedPortals = this.reflector.getAllAndOverride<PortalCode[]>(PORTALS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!expectedPortals?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUserContext>();
    if (!request.userContext || !expectedPortals.includes(request.userContext.portalCode)) {
      throw new ForbiddenException('Portal access denied');
    }
    return true;
  }
}
