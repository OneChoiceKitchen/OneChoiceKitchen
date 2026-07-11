import { Module } from '@nestjs/common';
import { TiffinService } from './tiffin.service';
import { TiffinController } from './tiffin.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TiffinController],
  providers: [TiffinService],
  exports: [TiffinService],
})
export class TiffinModule {}
