import { ForbiddenException, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import type { RequestWithUserContext } from './user-context.types';

type TenantRecord = Record<string, unknown> & { tenantId?: string | null };

@Injectable({ scope: Scope.REQUEST })
export class TenantScopeService {
  constructor(@Inject(REQUEST) private readonly request: RequestWithUserContext) {}

  get tenantId(): string | null {
    return this.request.userContext?.tenantId ?? null;
  }

  get bypassTenantScope(): boolean {
    return this.request.userContext?.isSuperAdmin ?? false;
  }

  scopeWhere<T extends TenantRecord>(where: T): T {
    if (this.bypassTenantScope) {
      return this.tenantId ? ({ ...where, tenantId: this.tenantId } as T) : where;
    }

    const tenantId = this.requireTenantId();
    if (where.tenantId && where.tenantId !== tenantId) {
      throw new ForbiddenException('Cross-tenant query denied');
    }
    return { ...where, tenantId } as T;
  }

  scopeCreate<T extends TenantRecord>(data: T): T {
    if (this.bypassTenantScope) {
      if (!data.tenantId && !this.tenantId) {
        throw new ForbiddenException('Super Admin must select a tenant for tenant-owned data');
      }
      return { ...data, tenantId: data.tenantId ?? this.tenantId } as T;
    }

    const tenantId = this.requireTenantId();
    if (data.tenantId && data.tenantId !== tenantId) {
      throw new ForbiddenException('Cross-tenant write denied');
    }
    return { ...data, tenantId } as T;
  }

  assertTenant(resourceTenantId: string | null | undefined): void {
    if (this.bypassTenantScope) {
      return;
    }
    if (!resourceTenantId || resourceTenantId !== this.requireTenantId()) {
      throw new ForbiddenException('Cross-tenant resource access denied');
    }
  }

  private requireTenantId(): string {
    if (!this.tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.tenantId;
  }
}
