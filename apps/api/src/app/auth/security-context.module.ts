import { Global, Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { EntitlementGuard } from '../../feature-access/entitlement.guard';
import { FeatureAccessService } from '../../feature-access/feature-access.service';
import { PortalGuard } from './portal.guard';
import { TenantGuard } from './tenant.guard';
import { TenantScopeService } from './tenant-scope.service';
import { UserContextGuard } from './user-context.guard';
import { UserContextResolverService } from './user-context-resolver.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    UserContextResolverService,
    UserContextGuard,
    PortalGuard,
    TenantGuard,
    TenantScopeService,
    FeatureAccessService,
    EntitlementGuard,
  ],
  exports: [
    UserContextResolverService,
    UserContextGuard,
    PortalGuard,
    TenantGuard,
    TenantScopeService,
    FeatureAccessService,
    EntitlementGuard,
  ],
})
export class SecurityContextModule {}
