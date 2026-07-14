import { Subject } from 'rxjs';

import type { ChatMessageCreatedEvent } from './chat-events.service';
import { ChatGateway } from './chat.gateway';

describe('ChatGateway Phase 5 events', () => {
  const chatService = {
    validateToken: jest.fn(),
    getUserConversationIds: jest.fn(),
    canAccessConversation: jest.fn(),
    sendMessage: jest.fn(),
    getConversation: jest.fn(),
  };
  const messageCreated$ = new Subject<ChatMessageCreatedEvent>();
  const chatEvents = { messageCreated$ };
  const userContextResolver = { resolve: jest.fn() };
  let gateway: ChatGateway;

  beforeEach(() => {
    jest.clearAllMocks();
    gateway = new ChatGateway(
      chatService as never,
      chatEvents as never,
      userContextResolver as never,
    );
  });

  it('emits created messages to both legacy and Phase 5 conversation rooms', () => {
    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    gateway.server = { to } as never;

    gateway.handleNewMessage({
      conversationId: 'conversation-1',
      message: {
        id: 'message-1',
        sender: { id: 'user-1', name: 'User One' },
      },
    });

    expect(to).toHaveBeenCalledWith([
      'conv:conversation-1',
      'room_conversation-1',
    ]);
    expect(emit).toHaveBeenCalledWith(
      'newMessage',
      expect.objectContaining({ id: 'message-1', senderName: 'User One' }),
    );
  });

  it('disconnects a socket that has no JWT', async () => {
    const client = {
      handshake: { auth: {}, headers: {} },
      disconnect: jest.fn(),
    };

    await gateway.handleConnection(client as never);

    expect(client.disconnect).toHaveBeenCalledTimes(1);
    expect(chatService.getUserConversationIds).not.toHaveBeenCalled();
  });

  it('always uses the authenticated socket user as the sender', async () => {
    const message = { id: 'message-1' };
    chatService.canAccessConversation.mockResolvedValue(true);
    chatService.sendMessage.mockResolvedValue(message);
    chatService.getConversation.mockResolvedValue({ priority: 'NORMAL' });
    const client = {
      userId: 'authenticated-user',
      userContext: { tenantId: 'tenant-a', isSuperAdmin: false },
      emit: jest.fn(),
    };

    await gateway.handleSendMessage(client as never, {
      conversationId: 'conversation-1',
      content: 'Hello',
    });

    expect(chatService.sendMessage).toHaveBeenCalledWith({
      conversationId: 'conversation-1',
      content: 'Hello',
      senderId: 'authenticated-user',
      accessScope: { tenantId: 'tenant-a', isSuperAdmin: false },
    });
  });
});
