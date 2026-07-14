import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { authStore } from '../auth/auth-store';
import type { UserContextResponse } from '../auth/user-context.types';
import { ChatWidget } from './chat-widget';
import type { ChatMessage, ChatRestClient, ChatSocket, ChatSocketAck } from './use-chat-websocket';

const USER_CONTEXT: UserContextResponse = {
  userId: 'user-1',
  displayName: 'Partner Owner',
  email: 'owner@example.com',
  portalCode: 'PARTNER',
  portalName: 'Partner Portal',
  siteTitle: 'One Choice Kitchen',
  tenantId: 'tenant-1',
  partnerName: 'Spice House',
  roles: ['PARTNER'],
  permissions: ['chat.send'],
};

class FakeSocket implements ChatSocket {
  connected = false;
  emitted: Array<{ event: string; payload?: unknown }> = [];
  private handlers = new Map<string, Array<(payload?: unknown) => void>>();

  on(event: string, listener: (payload?: unknown) => void): ChatSocket {
    this.handlers.set(event, [...(this.handlers.get(event) ?? []), listener]);
    return this;
  }

  off(event: string, listener?: (payload?: unknown) => void): ChatSocket {
    if (!listener) {
      this.handlers.delete(event);
      return this;
    }
    this.handlers.set(
      event,
      (this.handlers.get(event) ?? []).filter((handler) => handler !== listener),
    );
    return this;
  }

  emit(event: string, payload?: unknown, acknowledgement?: (ack: ChatSocketAck) => void): ChatSocket {
    this.emitted.push({ event, payload });
    if (event === 'sendMessage') {
      acknowledgement?.({ success: true, messageId: 'message-server-1' });
    }
    return this;
  }

  disconnect(): ChatSocket {
    this.connected = false;
    return this;
  }

  trigger(event: string, payload?: unknown): void {
    if (event === 'connect') this.connected = true;
    if (event === 'disconnect') this.connected = false;
    (this.handlers.get(event) ?? []).forEach((handler) => handler(payload));
  }
}

function createRestClient(messages: ChatMessage[] = []): ChatRestClient & {
  get: jest.Mock;
  post: jest.Mock;
} {
  return {
    get: jest.fn().mockResolvedValue({ data: messages }),
    post: jest.fn().mockResolvedValue({
      data: {
        id: 'rest-message-1',
        conversationId: 'conversation-1',
        content: 'REST fallback',
        createdAt: '2026-07-14T10:00:00.000Z',
      },
    }),
  };
}

describe('ChatWidget', () => {
  beforeEach(() => {
    authStore.setSession({ accessToken: 'jwt-token', userContext: USER_CONTEXT });
  });

  afterEach(() => authStore.clearSession());

  it('opens floating chat and authenticates the socket with portal context', async () => {
    const socket = new FakeSocket();
    const socketFactory = jest.fn(() => socket);

    render(
      <ChatWidget
        conversationId="conversation-1"
        socketFactory={socketFactory}
        restClient={createRestClient()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /open chat/i }));

    await waitFor(() => expect(socketFactory).toHaveBeenCalled());
    expect(socketFactory).toHaveBeenCalledWith({
      url: '/chat',
      auth: { token: 'jwt-token', portalCode: 'PARTNER', tenantId: 'tenant-1' },
    });
  });

  it('joins the conversation and appends real-time messages', async () => {
    const socket = new FakeSocket();
    render(
      <ChatWidget
        conversationId="conversation-1"
        variant="inline"
        socketFactory={() => socket}
        restClient={createRestClient()}
      />,
    );

    await screen.findByText('No messages yet.');
    act(() => socket.trigger('connect'));

    expect(socket.emitted).toContainEqual({
      event: 'joinConversation',
      payload: { conversationId: 'conversation-1' },
    });

    act(() =>
      socket.trigger('newMessage', {
        id: 'message-1',
        conversationId: 'conversation-1',
        content: 'Hello from support',
        senderName: 'Support Admin',
        createdAt: '2026-07-14T10:00:00.000Z',
      }),
    );

    expect(screen.getByText('Hello from support')).toBeTruthy();
    expect(screen.getByText('Support Admin')).toBeTruthy();
  });

  it('sends optimistically through the websocket when connected', async () => {
    const socket = new FakeSocket();
    render(
      <ChatWidget
        conversationId="conversation-1"
        variant="inline"
        socketFactory={() => socket}
        restClient={createRestClient()}
      />,
    );

    await screen.findByText('No messages yet.');
    act(() => socket.trigger('connect'));
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Need help with subscription' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(screen.getByText('Need help with subscription')).toBeTruthy();
    await waitFor(() => {
      expect(socket.emitted).toContainEqual({
        event: 'sendMessage',
        payload: {
          conversationId: 'conversation-1',
          content: 'Need help with subscription',
          type: 'TEXT',
        },
      });
    });
  });

  it('falls back to REST when the socket is not connected', async () => {
    const restClient = createRestClient();
    render(
      <ChatWidget
        conversationId="conversation-1"
        variant="inline"
        socketFactory={() => new FakeSocket()}
        restClient={restClient}
      />,
    );

    await screen.findByText('No messages yet.');
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'REST fallback' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(restClient.post).toHaveBeenCalledWith(
        '/chat/conversations/conversation-1/messages',
        { content: 'REST fallback', type: 'TEXT' },
      );
    });
    expect(screen.getByText('REST fallback')).toBeTruthy();
  });
});
