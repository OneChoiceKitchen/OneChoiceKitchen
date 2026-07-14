import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AiChatService } from './ai-chat.service';
import { AiChatController } from './ai-chat.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { getJwtSecret } from '../config/jwt.config';
import { ChatEventsService } from './chat-events.service';
import { SecurityContextModule } from '../app/auth/security-context.module';

@Module({
  imports: [
    PrismaModule,
    SecurityContextModule,
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [ChatEventsService, ChatGateway, ChatService, AiChatService],
  controllers: [ChatController, AiChatController],
  exports: [ChatService, AiChatService, ChatEventsService],
})
export class ChatModule {}
