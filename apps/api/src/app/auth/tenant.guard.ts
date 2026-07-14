import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { TENANT_REQUIRED_KEY } from './tenant.decorator';
import type { RequestWithUserContext } from './user-context.types';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const tenantRequired = this.reflector.getAllAndOverride<boolean>(TENANT_REQUIRED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? false;
    const request = context.switchToHttp().getRequest<RequestWithUserContext>();
    const userContext = request.userContext;

    if (!userContext) {
      throw new ForbiddenException('Tenant context has not been resolved');
    }
    if (tenantRequired && !userContext.tenantId && !userContext.isSuperAdmin) {
      throw new ForbiddenException('An active tenant membership is required');
    }

    request.tenantScope = Object.freeze({
      tenantId: userContext.tenantId,
      bypassTenantScope: userContext.isSuperAdmin,
    });
    return true;
  }
}
