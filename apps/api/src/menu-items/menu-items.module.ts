import { Module } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsController } from './menu-items.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
})
export class MenuItemsModule {}
