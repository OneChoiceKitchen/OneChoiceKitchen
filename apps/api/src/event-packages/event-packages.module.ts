import { Module } from '@nestjs/common';
import { EventPackagesService } from './event-packages.service';
import { EventPackagesController } from './event-packages.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EventPackagesController],
  providers: [EventPackagesService],
  exports: [EventPackagesService]
})
export class EventPackagesModule {}
