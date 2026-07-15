import { Module } from '@nestjs/common';
import { KitchenController } from './kitchen.controller';
import { KitchenService } from './kitchen.service';
import { KitchenGateway } from './kitchen.gateway';
import { TenantScopeService } from '../app/auth/tenant-scope.service';

@Module({
  controllers: [KitchenController],
  providers: [KitchenService, KitchenGateway, TenantScopeService],
  exports: [KitchenService, KitchenGateway],
})
export class KitchenModule {}
