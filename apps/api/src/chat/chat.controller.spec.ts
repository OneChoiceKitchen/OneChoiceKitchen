import { ChatController } from './chat.controller';
import type { ChatService } from './chat.service';

describe('ChatController security boundaries', () => {
  it('does not allow body fields to override the route conversation or authenticated sender', async () => {
    const chatService = {
      sendMessage: jest.fn().mockResolvedValue({ id: 'message-1' }),
    } as unknown as ChatService;
    const controller = new ChatController(chatService);
    const request = {
      userContext: {
        userId: 'authenticated-user',
        tenantId: 'tenant-a',
        isSuperAdmin: false,
        roleNames: ['PARTNER'],
      },
    };
    const maliciousBody = {
      content: 'Hello',
      senderId: 'impersonated-user',
      conversationId: 'other-conversation',
    } as unknown as { content: string };

    await controller.sendMessage('route-conversation', maliciousBody, request);

    expect(chatService.sendMessage).toHaveBeenCalledWith({
      content: 'Hello',
      senderId: 'authenticated-user',
      conversationId: 'route-conversation',
      accessScope: { tenantId: 'tenant-a', isSuperAdmin: false },
    });
  });
});
