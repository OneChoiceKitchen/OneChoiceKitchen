import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  userName?: string;
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
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly onlineUsers = new Map<string, Set<string>>(); // userId -> Set<socketId>

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
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

      client.userId = user.id;
      client.userRole = user.role?.name || 'CUSTOMER';
      client.userName = user.name;

      // Track online status
      if (!this.onlineUsers.has(user.id)) {
        this.onlineUsers.set(user.id, new Set());
      }
      this.onlineUsers.get(user.id)!.add(client.id);

      // Auto-join all conversations the user is part of
      const conversations = await this.chatService.getUserConversationIds(user.id);
      for (const convId of conversations) {
        client.join(`conv:${convId}`);
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
    );
    if (!canAccess) {
      client.emit('error', { message: 'Access denied to this conversation' });
      return;
    }
    client.join(`conv:${data.conversationId}`);
    client.emit('joinedConversation', { conversationId: data.conversationId });
  }

  @SubscribeMessage('leaveConversation')
  handleLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conv:${data.conversationId}`);
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
      const message = await this.chatService.sendMessage({
        ...data,
        senderId: client.userId,
      });

      // Broadcast to all room participants
      this.server.to(`conv:${data.conversationId}`).emit('newMessage', {
        ...message,
        senderName: client.userName,
        isOnline: this.isOnline(client.userId),
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
}
