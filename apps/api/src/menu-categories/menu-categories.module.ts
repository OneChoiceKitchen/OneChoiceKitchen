import { Module } from '@nestjs/common';
import { MenuCategoriesService } from './menu-categories.service';
import { MenuCategoriesController } from './menu-categories.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MenuCategoriesController],
  providers: [MenuCategoriesService],
})
export class MenuCategoriesModule {}
