import { Module } from '@nestjs/common';
import { PartnerPermissionsController } from './partner-permissions.controller';
import { PartnerPermissionsService } from './partner-permissions.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PartnerPermissionsController],
  providers: [PartnerPermissionsService],
  exports: [PartnerPermissionsService],
})
export class PartnerPermissionsModule {}
