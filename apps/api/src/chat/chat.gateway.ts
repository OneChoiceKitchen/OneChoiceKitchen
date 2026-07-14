import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PortalCode } from '@prisma/client';
import type { Subscription } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { UserContextResolverService } from '../app/auth/user-context-resolver.service';
import type { UserContext } from '../app/auth/user-context.types';
import {
  ChatEventsService,
  type ChatMessageCreatedEvent,
} from './chat-events.service';
import { ChatService } from './chat.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  userName?: string;
  userContext?: UserContext;
}

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:4205', // admin
      'http://localhost:4206', // partner
      'http://localhost:4207', // rider
      'http://localhost:4208', // web
      process.env.ADMIN_URL,
      process.env.PARTNER_URL,
      process.env.RIDER_URL,
      process.env.WEB_URL,
    ].filter(Boolean),
    credentials: true,
  },
  namespace: '/chat',
  transports: ['websocket', 'polling'],
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly onlineUsers = new Map<string, Set<string>>(); // userId -> Set<socketId>
  private messageSubscription?: Subscription;

  constructor(
    private readonly chatService: ChatService,
    private readonly chatEvents: ChatEventsService,
    private readonly userContextResolver: UserContextResolverService,
  ) {}

  onModuleInit(): void {
    this.messageSubscription = this.chatEvents.messageCreated$.subscribe((event) =>
      this.handleNewMessage(event),
    );
  }

  onModuleDestroy(): void {
    this.messageSubscription?.unsubscribe();
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Socket JWT authentication and Portal/Tenant validation must happen here,
      // before the socket is allowed to join any conversation room.
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const user = await this.chatService.validateToken(token);
      if (!user) {
        client.disconnect();
        return;
      }

      const requestedPortal =
        this.handshakeString(client.handshake.auth?.portalCode) ??
        this.handshakeString(client.handshake.headers['x-portal-code']) ??
        this.defaultPortalForRole(user.role?.name);
      const requestedTenantId =
        this.handshakeString(client.handshake.auth?.tenantId) ??
        this.handshakeString(client.handshake.headers['x-tenant-id']);
      const userContext = await this.userContextResolver.resolve(
        {
          userId: user.id,
          email: user.email,
          role: user.role?.name,
          restaurantId: user.restaurantId,
        },
        {
          expectedPortals: [PortalCode.ADMIN, PortalCode.PARTNER, PortalCode.RIDER],
          requestedPortal,
          requestedTenantId,
        },
      );

      client.userId = user.id;
      client.userRole = user.role?.name || 'CUSTOMER';
      client.userName = user.name;
      client.userContext = userContext;

      // Track online status
      if (!this.onlineUsers.has(user.id)) {
        this.onlineUsers.set(user.id, new Set());
      }
      this.onlineUsers.get(user.id)!.add(client.id);

      // Auto-join all conversations the user is part of
      const conversations = await this.chatService.getUserConversationIds(
        user.id,
        userContext.tenantId,
        userContext.isSuperAdmin,
      );
      for (const convId of conversations) {
        await client.join([`conv:${convId}`, `room_${convId}`]);
      }

      // Broadcast online status
      this.server.emit('userOnline', { userId: user.id, userName: user.name });
      this.logger.log(`Connected: ${user.name} (${user.id}) via socket ${client.id}`);
    } catch (err) {
      this.logger.error('Connection error:', (err as Error).message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (!client.userId) return;

    const sockets = this.onlineUsers.get(client.userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.onlineUsers.delete(client.userId);
        this.server.emit('userOffline', { userId: client.userId });
      }
    }
    this.logger.log(`Disconnected: ${client.userId} socket ${client.id}`);
  }

  isOnline(userId: string): boolean {
    return this.onlineUsers.has(userId) && this.onlineUsers.get(userId)!.size > 0;
  }

  @SubscribeMessage('joinConversation')
  async handleJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!client.userId) return;
    const canAccess = await this.chatService.canAccessConversation(
      client.userId,
      data.conversationId,
      client.userContext?.tenantId,
      client.userContext?.isSuperAdmin,
    );
    if (!canAccess) {
      client.emit('error', { message: 'Access denied to this conversation' });
      return;
    }
    await client.join([`conv:${data.conversationId}`, `room_${data.conversationId}`]);
    client.emit('joinedConversation', { conversationId: data.conversationId });
  }

  @SubscribeMessage('leaveConversation')
  handleLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conv:${data.conversationId}`);
    client.leave(`room_${data.conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      type?: string;
      replyToId?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      fileMime?: string;
    },
  ) {
    if (!client.userId) return;
    try {
      const canAccess = await this.chatService.canAccessConversation(
        client.userId,
        data.conversationId,
        client.userContext?.tenantId,
        client.userContext?.isSuperAdmin,
      );
      if (!canAccess) {
        client.emit('error', { message: 'Access denied to this conversation' });
        return { success: false, error: 'Access denied to this conversation' };
      }

      const message = await this.chatService.sendMessage({
        ...data,
        senderId: client.userId,
      });

      // Check priority and send notification if urgent
      const conversation = await this.chatService.getConversation(data.conversationId);
      if (conversation && ['URGENT', 'CRITICAL'].includes(conversation.priority)) {
        this.server.to(`conv:${data.conversationId}`).emit('urgentMessage', {
          conversationId: data.conversationId,
          priority: conversation.priority,
          senderName: client.userName,
        });
      }

      return { success: true, messageId: message.id };
    } catch (err) {
      const error = err as Error;
      client.emit('error', { message: error.message ?? 'An error occurred' });
      return { success: false, error: error.message };
    }
  }

  handleNewMessage(event: ChatMessageCreatedEvent): void {
    if (!this.server) return;

    const message = event.message as {
      sender?: { id?: string; name?: string } | null;
      [key: string]: unknown;
    };
    this.server
      .to([`conv:${event.conversationId}`, `room_${event.conversationId}`])
      .emit('newMessage', {
        ...message,
        senderName: message.sender?.name,
        isOnline: message.sender?.id ? this.isOnline(message.sender.id) : false,
      });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    if (!client.userId) return;
    client.to(`conv:${data.conversationId}`).emit('userTyping', {
      userId: client.userId,
      userName: client.userName,
      conversationId: data.conversationId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!client.userId) return;
    await this.chatService.markConversationRead(data.conversationId, client.userId);
    client.to(`conv:${data.conversationId}`).emit('messagesRead', {
      conversationId: data.conversationId,
      userId: client.userId,
      readAt: new Date().toISOString(),
    });
  }

  @SubscribeMessage('reactToMessage')
  async handleReaction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; emoji: string; conversationId: string },
  ) {
    if (!client.userId) return;
    const updated = await this.chatService.toggleReaction(data.messageId, client.userId, data.emoji);
    this.server.to(`conv:${data.conversationId}`).emit('reactionUpdated', {
      messageId: data.messageId,
      reactions: updated,
    });
  }

  @SubscribeMessage('deleteMessage')
  async handleDelete(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; conversationId: string },
  ) {
    if (!client.userId) return;
    await this.chatService.deleteMessage(data.messageId, client.userId);
    this.server.to(`conv:${data.conversationId}`).emit('messageDeleted', {
      messageId: data.messageId,
    });
  }

  @SubscribeMessage('editMessage')
  async handleEdit(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; content: string; conversationId: string },
  ) {
    if (!client.userId) return;
    const updated = await this.chatService.editMessage(data.messageId, client.userId, data.content);
    this.server.to(`conv:${data.conversationId}`).emit('messageEdited', updated);
  }

  // Called externally to notify users (e.g. support request approved)
  notifyUser(userId: string, event: string, payload: any) {
    const sockets = this.onlineUsers.get(userId);
    if (sockets) {
      sockets.forEach((sid) => {
        this.server.to(sid).emit(event, payload);
      });
    }
  }

  getOnlineUsers(): string[] {
    return [...this.onlineUsers.keys()];
  }

  private handshakeString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  private defaultPortalForRole(role?: string): PortalCode {
    if (role === 'PARTNER') return PortalCode.PARTNER;
    if (role === 'RIDER') return PortalCode.RIDER;
    if (role === 'CUSTOMER') return PortalCode.WEB;
    return PortalCode.ADMIN;
  }
}
