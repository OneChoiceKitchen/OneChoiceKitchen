import { Module } from '@nestjs/common';
import { TiffinModule } from '../tiffin/tiffin.module';
import { TiffinMenusController } from './menu.controller';

/** @deprecated Legacy route alias — use `/api/tiffin/menu` instead. */
@Module({
  imports: [TiffinModule],
  controllers: [TiffinMenusController],
})
export class MenuModule {}
