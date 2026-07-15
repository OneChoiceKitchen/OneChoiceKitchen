import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders.gateway';
import { PromotionsModule } from '../promotions/promotions.module';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [PromotionsModule, WebhooksModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway],
})
export class OrdersModule {}
