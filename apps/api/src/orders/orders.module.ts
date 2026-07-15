import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders.gateway';
import { PromotionsModule } from '../promotions/promotions.module';

@Module({
  imports: [PromotionsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway],
})
export class OrdersModule {}
