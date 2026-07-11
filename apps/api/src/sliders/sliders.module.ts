import { Module } from '@nestjs/common';
import { SlidersController } from './sliders.controller';
import { SlidersService } from './sliders.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SlidersController],
  providers: [SlidersService],
  exports: [SlidersService]
})
export class SlidersModule {}
