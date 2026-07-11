import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

// RBAC permission matrix for internal chat
const CHAT_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN:    ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'OPERATIONS', 'CUSTOMER_CARE', 'PARTNER', 'RIDER'],
  ADMIN:          ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'OPERATIONS', 'CUSTOMER_CARE', 'PARTNER', 'RIDER'],
  SUPPORT:        ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'OPERATIONS', 'CUSTOMER_CARE', 'PARTNER', 'RIDER'],
  CUSTOMER_CARE:  ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'OPERATIONS', 'CUSTOMER_CARE', 'PARTNER', 'RIDER'],
  OPERATIONS:     ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'OPERATIONS', 'CUSTOMER_CARE', 'PARTNER', 'RIDER'],
  PARTNER:        ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'OPERATIONS', 'CUSTOMER_CARE'],
  RIDER:          ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'],
  // CUSTOMER role has NO access to internal chat — only AI chatbot
};

const INTERNAL_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'OPERATIONS', 'CUSTOMER_CARE', 'PARTNER', 'RIDER'];

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ── Auth ──────────────────────────────────────────────────────────────────

  async validateToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token) as any;
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub || decoded.userId || decoded.id },
        include: { role: true },
      });
      return user;
    } catch {
      return null;
    }
  }

  // ── RBAC helpers ──────────────────────────────────────────────────────────

  private getUserRole(user: any): string {
    return user?.role?.name?.toUpperCase() || 'CUSTOMER';
  }

  canChatWith(fromRole: string, toRole: string): boolean {
    const allowed = CHAT_PERMISSIONS[fromRole.toUpperCase()] || [];
    return allowed.includes(toRole.toUpperCase());
  }

  isInternalUser(role: string): boolean {
    return INTERNAL_ROLES.includes(role.toUpperCase());
  }

  // ── User Search (RBAC filtered) ───────────────────────────────────────────

  async searchUsers(query: string, requestingUserId: string, page = 1, limit = 20) {
    const requester = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
      include: { role: true },
    });
    const requesterRole = this.getUserRole(requester);

    if (!this.isInternalUser(requesterRole)) {
      throw new ForbiddenException('Internal chat not available for this role');
    }

    const allowedRoles = CHAT_PERMISSIONS[requesterRole] || [];

    const roles = await this.prisma.role.findMany({
      where: { name: { in: allowedRoles } },
    });
    const roleIds = roles.map((r) => r.id);

    const where: any = {
      id: { not: requestingUserId },
      isActive: true,
      roleId: { in: roleIds },
      OR: [
        { name: { contains: query } },
        { email: { contains: query } },
        { mobile: { contains: query } },
      ],
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          profilePhoto: true,
          restaurantId: true,
          roleId: true,
          role: { select: { name: true } },
          restaurant: { select: { name: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, meta: { total, page, pageSize: limit, hasNextPage: total > page * limit } };
  }

  async getContactableUsers(requestingUserId: string) {
    const requester = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
      include: { role: true },
    });
    const requesterRole = this.getUserRole(requester);

    const allowedRoles = CHAT_PERMISSIONS[requesterRole] || [];
    const roles = await this.prisma.role.findMany({
      where: { name: { in: allowedRoles } },
    });
    const roleIds = roles.map((r) => r.id);

    return this.prisma.user.findMany({
      where: { id: { not: requestingUserId }, isActive: true, roleId: { in: roleIds } },
      select: {
        id: true, name: true, email: true, profilePhoto: true,
        role: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  // ── Conversations ─────────────────────────────────────────────────────────

  async createConversation(
    dto: { type: 'DIRECT' | 'GROUP'; participantIds: string[]; name?: string; description?: string },
    creatorId: string,
  ) {
    const creator = await this.prisma.user.findUnique({
      where: { id: creatorId },
      include: { role: true },
    });
    const creatorRole = this.getUserRole(creator);

    if (!this.isInternalUser(creatorRole)) {
      throw new ForbiddenException('Internal chat not available');
    }

    // For DIRECT chats, check if conversation already exists
    if (dto.type === 'DIRECT' && dto.participantIds.length === 1) {
      const otherId = dto.participantIds[0];
      const existing = await this.findDirectConversation(creatorId, otherId);
      if (existing) return existing;

      // RBAC check
      const other = await this.prisma.user.findUnique({ where: { id: otherId }, include: { role: true } });
      const otherRole = this.getUserRole(other);
      if (!this.canChatWith(creatorRole, otherRole)) {
        throw new ForbiddenException(`You cannot start a conversation with users of role ${otherRole}`);
      }
    }

    const allParticipants = [...new Set([creatorId, ...dto.participantIds])];

    const conversation = await this.prisma.chatConversation.create({
      data: {
        type: dto.type,
        name: dto.name,
        description: dto.description,
        createdById: creatorId,
        participants: {
          create: allParticipants.map((uid) => ({
            userId: uid,
            role: uid === creatorId ? 'ADMIN' : 'MEMBER',
          })),
        },
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, profilePhoto: true, role: { select: { name: true } } } } } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });

    return conversation;
  }

  private async findDirectConversation(userId1: string, userId2: string) {
    const conversations = await this.prisma.chatConversation.findMany({
      where: {
        type: 'DIRECT',
        participants: { some: { userId: userId1 } },
      },
      include: { participants: true },
    });

    return conversations.find(
      (c) =>
        c.participants.length === 2 &&
        c.participants.some((p) => p.userId === userId2),
    ) || null;
  }

  async getUserConversations(userId: string) {
    const conversations = await this.prisma.chatConversation.findMany({
      where: {
        isArchived: false,
        participants: { some: { userId } },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, profilePhoto: true, role: { select: { name: true } } } },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          where: { isDeleted: false },
          include: { sender: { select: { name: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Attach unread count
    return Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find((p) => p.userId === userId);
        const unread = await this.prisma.chatMessage.count({
          where: {
            conversationId: conv.id,
            isDeleted: false,
            senderId: { not: userId },
            createdAt: participant?.lastReadAt ? { gt: participant.lastReadAt } : undefined,
          },
        });
        return { ...conv, unreadCount: unread };
      }),
    );
  }

  async getUserConversationIds(userId: string): Promise<string[]> {
    const participants = await this.prisma.chatParticipant.findMany({
      where: { userId },
      select: { conversationId: true },
    });
    return participants.map((p) => p.conversationId);
  }

  async getConversation(conversationId: string) {
    return this.prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, profilePhoto: true, role: { select: { name: true } } } },
          },
        },
      },
    });
  }

  async canAccessConversation(userId: string, conversationId: string): Promise<boolean> {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    return !!participant;
  }

  async setConversationPriority(conversationId: string, priority: string, userId: string) {
    await this.ensureConversationAccess(userId, conversationId);
    return this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: { priority },
    });
  }

  async lockConversation(conversationId: string, userId: string) {
    await this.ensureAdminAccess(userId);
    return this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: { isLocked: true },
    });
  }

  async archiveConversation(conversationId: string, userId: string) {
    await this.ensureConversationAccess(userId, conversationId);
    return this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: { isArchived: true },
    });
  }

  async getPinnedMessages(conversationId: string, userId: string) {
    await this.ensureConversationAccess(userId, conversationId);
    return this.prisma.chatMessage.findMany({
      where: { conversationId, isPinned: true, isDeleted: false },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  async sendMessage(dto: {
    conversationId: string;
    senderId: string;
    content: string;
    type?: string;
    replyToId?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileMime?: string;
  }) {
    const conversation = await this.prisma.chatConversation.findUnique({
      where: { id: dto.conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.isLocked) throw new ForbiddenException('Conversation is locked');

    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId: dto.conversationId,
        senderId: dto.senderId,
        content: dto.content,
        type: dto.type || 'TEXT',
        replyToId: dto.replyToId,
        fileUrl: dto.fileUrl,
        fileName: dto.fileName,
        fileSize: dto.fileSize,
        fileMime: dto.fileMime,
      },
      include: {
        sender: { select: { id: true, name: true, profilePhoto: true } },
        replyTo: {
          select: { id: true, content: true, sender: { select: { name: true } } },
        },
      },
    });

    // Update conversation updatedAt
    await this.prisma.chatConversation.update({
      where: { id: dto.conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getMessages(conversationId: string, userId: string, cursor?: string, limit = 30) {
    await this.ensureConversationAccess(userId, conversationId);

    const messages = await this.prisma.chatMessage.findMany({
      where: {
        conversationId,
        isDeleted: false,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      include: {
        sender: { select: { id: true, name: true, profilePhoto: true } },
        replyTo: {
          include: { sender: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, limit) : messages;

    return {
      data: items.reverse(),
      hasMore,
      nextCursor: hasMore ? items[0]?.createdAt?.toISOString() : null,
    };
  }

  async searchMessages(conversationId: string, userId: string, query: string) {
    await this.ensureConversationAccess(userId, conversationId);
    return this.prisma.chatMessage.findMany({
      where: {
        conversationId,
        isDeleted: false,
        content: { contains: query },
      },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async editMessage(messageId: string, userId: string, content: string) {
    const message = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) throw new ForbiddenException('Cannot edit others\' messages');

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { content, isEdited: true },
      include: { sender: { select: { id: true, name: true } } },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');

    const requester = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    const role = this.getUserRole(requester);
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(role);

    if (message.senderId !== userId && !isAdmin) {
      throw new ForbiddenException('Cannot delete this message');
    }

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { isDeleted: true, content: '[Message deleted]' },
    });
  }

  async pinMessage(messageId: string, userId: string) {
    const message = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    await this.ensureConversationAccess(userId, message.conversationId);
    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { isPinned: true },
    });
  }

  async toggleReaction(messageId: string, userId: string, emoji: string): Promise<string> {
    const message = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');

    const reactions = JSON.parse(message.reactions || '{}') as Record<string, string[]>;
    if (!reactions[emoji]) reactions[emoji] = [];

    const idx = reactions[emoji].indexOf(userId);
    if (idx >= 0) {
      reactions[emoji].splice(idx, 1);
      if (reactions[emoji].length === 0) delete reactions[emoji];
    } else {
      reactions[emoji].push(userId);
    }

    const updated = JSON.stringify(reactions);
    await this.prisma.chatMessage.update({ where: { id: messageId }, data: { reactions: updated } });
    return updated;
  }

  async starMessage(messageId: string, userId: string) {
    const existing = await this.prisma.chatStarredMessage.findUnique({
      where: { userId_messageId: { userId, messageId } },
    });

    if (existing) {
      await this.prisma.chatStarredMessage.delete({ where: { id: existing.id } });
      return { starred: false };
    }

    await this.prisma.chatStarredMessage.create({ data: { userId, messageId } });
    return { starred: true };
  }

  async getStarredMessages(userId: string) {
    return this.prisma.chatStarredMessage.findMany({
      where: { userId },
      include: {
        message: {
          include: {
            sender: { select: { id: true, name: true } },
            conversation: { select: { id: true, name: true, type: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markConversationRead(conversationId: string, userId: string) {
    return this.prisma.chatParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
    });
  }

  // ── Admin operations ──────────────────────────────────────────────────────

  async getAllConversations(adminId: string, filters: any = {}) {
    await this.ensureAdminAccess(adminId);
    return this.prisma.chatConversation.findMany({
      where: {
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.priority ? { priority: filters.priority } : {}),
        ...(filters.isArchived !== undefined ? { isArchived: filters.isArchived } : {}),
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, role: { select: { name: true } } } } },
        },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { updatedAt: 'desc' },
      take: filters.limit || 100,
    });
  }

  async exportConversation(conversationId: string, adminId: string) {
    await this.ensureAdminAccess(adminId);
    return this.prisma.chatMessage.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, name: true, role: { select: { name: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addParticipant(conversationId: string, targetUserId: string, requesterId: string) {
    await this.ensureConversationAccess(requesterId, conversationId);
    const existing = await this.prisma.chatParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: targetUserId } },
    });
    if (existing) return existing;
    return this.prisma.chatParticipant.create({
      data: { conversationId, userId: targetUserId },
    });
  }

  async removeParticipant(conversationId: string, targetUserId: string, requesterId: string) {
    await this.ensureAdminAccess(requesterId);
    return this.prisma.chatParticipant.delete({
      where: { conversationId_userId: { conversationId, userId: targetUserId } },
    });
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async ensureConversationAccess(userId: string, conversationId: string) {
    const ok = await this.canAccessConversation(userId, conversationId);
    if (!ok) throw new ForbiddenException('No access to this conversation');
  }

  private async ensureAdminAccess(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    const role = this.getUserRole(user);
    if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
      throw new ForbiddenException('Admin access required');
    }
  }
}
