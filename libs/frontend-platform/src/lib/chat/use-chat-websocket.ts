'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

import { apiClient } from '../api/api-client';
import { useAuthStore } from '../auth/auth-store';

export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  senderId?: string | null;
  senderName?: string | null;
  createdAt: string;
  pending?: boolean;
  failed?: boolean;
}

export interface ChatSocketAck {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ChatSocket {
  connected?: boolean;
  on(event: string, listener: (payload?: unknown) => void): ChatSocket;
  off(event: string, listener?: (payload?: unknown) => void): ChatSocket;
  emit(
    event: string,
    payload?: unknown,
    acknowledgement?: (ack: ChatSocketAck) => void,
  ): ChatSocket;
  disconnect(): ChatSocket;
}

export interface ChatSocketFactoryOptions {
  url: string;
  auth: {
    token: string;
    portalCode?: string;
    tenantId?: string | null;
  };
}

export type ChatSocketFactory = (
  options: ChatSocketFactoryOptions,
) => ChatSocket;

export interface ChatRestClient {
  get<T>(url: string): Promise<{ data: T }>;
  post<T>(url: string, body?: unknown): Promise<{ data: T }>;
}

export interface UseChatWebSocketOptions {
  conversationId: string;
  socketUrl?: string;
  enabled?: boolean;
  socketFactory?: ChatSocketFactory;
  restClient?: ChatRestClient;
  loadHistory?: boolean;
}

export interface UseChatWebSocketResult {
  messages: ChatMessage[];
  isConnected: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
}

function defaultSocketFactory({
  url,
  auth,
}: ChatSocketFactoryOptions): ChatSocket {
  return io(url, {
    auth,
    transports: ['websocket', 'polling'],
  }) as unknown as ChatSocket;
}

function messageEndpoint(conversationId: string): string {
  return `/chat/conversations/${conversationId}/messages`;
}

function normalizeMessages(data: ChatMessage[] | { items?: ChatMessage[] }) {
  return Array.isArray(data) ? data : (data.items ?? []);
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ChatMessage>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.conversationId === 'string' &&
    typeof candidate.content === 'string'
  );
}

function upsertMessage(messages: ChatMessage[], nextMessage: ChatMessage) {
  const existingIndex = messages.findIndex(
    (message) => message.id === nextMessage.id,
  );
  if (existingIndex >= 0) {
    return messages.map((message, index) =>
      index === existingIndex ? { ...message, ...nextMessage } : message,
    );
  }
  return [...messages, nextMessage];
}

export function useChatWebSocket({
  conversationId,
  socketUrl = '/chat',
  enabled = true,
  socketFactory = defaultSocketFactory,
  restClient = apiClient,
  loadHistory = true,
}: UseChatWebSocketOptions): UseChatWebSocketResult {
  const authState = useAuthStore((state) => state);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(loadHistory);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<ChatSocket | null>(null);

  useEffect(() => {
    setMessages([]);
  }, [conversationId]);

  useEffect(() => {
    if (!loadHistory || !conversationId) {
      setIsLoadingHistory(false);
      return;
    }

    let cancelled = false;
    setIsLoadingHistory(true);
    void restClient
      .get<ChatMessage[] | { items?: ChatMessage[] }>(
        messageEndpoint(conversationId),
      )
      .then((response) => {
        if (!cancelled) setMessages(normalizeMessages(response.data));
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load chat history.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId, loadHistory, restClient]);

  useEffect(() => {
    const token = authState.accessToken;
    const userContext = authState.userContext;
    if (!enabled || !conversationId || !token) {
      setIsConnected(false);
      return;
    }

    const socket = socketFactory({
      url: socketUrl,
      auth: {
        token,
        portalCode: userContext?.portalCode,
        tenantId: userContext?.tenantId,
      },
    });
    socketRef.current = socket;

    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      socket.emit('joinConversation', { conversationId });
    };
    const handleDisconnect = () => setIsConnected(false);
    const handleNewMessage = (payload?: unknown) => {
      if (!isChatMessage(payload) || payload.conversationId !== conversationId)
        return;
      setMessages((current) => upsertMessage(current, payload));
    };
    const handleError = () => setError('Chat connection error.');

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('newMessage', handleNewMessage);
    socket.on('error', handleError);
    socket.on('connect_error', handleError);
    if (socket.connected) handleConnect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('newMessage', handleNewMessage);
      socket.off('error', handleError);
      socket.off('connect_error', handleError);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    authState.accessToken,
    authState.userContext,
    conversationId,
    enabled,
    socketFactory,
    socketUrl,
  ]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const optimisticId = `local-${Date.now()}`;
      const optimisticMessage: ChatMessage = {
        id: optimisticId,
        conversationId,
        content: trimmed,
        senderId: authState.userContext?.userId,
        senderName: authState.userContext?.displayName,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      setMessages((current) => [...current, optimisticMessage]);

      const socket = socketRef.current;
      if (socket && isConnected) {
        await new Promise<void>((resolve, reject) => {
          socket.emit(
            'sendMessage',
            { conversationId, content: trimmed, type: 'TEXT' },
            (ack) => {
              if (!ack.success) {
                reject(new Error(ack.error ?? 'Message send failed'));
                return;
              }
              setMessages((current) =>
                current.map((message) =>
                  message.id === optimisticId
                    ? {
                        ...message,
                        id: ack.messageId ?? optimisticId,
                        pending: false,
                      }
                    : message,
                ),
              );
              resolve();
            },
          );
        }).catch(() => {
          setMessages((current) =>
            current.map((message) =>
              message.id === optimisticId
                ? { ...message, pending: false, failed: true }
                : message,
            ),
          );
          setError('Unable to send message.');
        });
        return;
      }

      try {
        const response = await restClient.post<ChatMessage>(
          messageEndpoint(conversationId),
          {
            content: trimmed,
            type: 'TEXT',
          },
        );
        setMessages((current) =>
          current.map((message) =>
            message.id === optimisticId
              ? { ...response.data, pending: false }
              : message,
          ),
        );
      } catch {
        setMessages((current) =>
          current.map((message) =>
            message.id === optimisticId
              ? { ...message, pending: false, failed: true }
              : message,
          ),
        );
        setError('Unable to send message.');
      }
    },
    [authState.userContext, conversationId, isConnected, restClient],
  );

  return { messages, isConnected, isLoadingHistory, error, sendMessage };
}
