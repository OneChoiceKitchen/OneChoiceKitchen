import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface ChatMessageCreatedEvent {
  conversationId: string;
  message: unknown;
}

@Injectable()
export class ChatEventsService {
  readonly messageCreated$ = new Subject<ChatMessageCreatedEvent>();

  publishMessageCreated(event: ChatMessageCreatedEvent): void {
    this.messageCreated$.next(event);
  }
}
