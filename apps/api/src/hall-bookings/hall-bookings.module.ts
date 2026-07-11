import { Module } from '@nestjs/common';
import { HallBookingsService } from './hall-bookings.service';
import { HallBookingsController } from './hall-bookings.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HallBookingsController],
  providers: [HallBookingsService],
  exports: [HallBookingsService]
})
export class HallBookingsModule {}
