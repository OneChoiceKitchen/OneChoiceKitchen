import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConversationStatus,
  ConversationType,
  MembershipStatus,
  ParticipantRole,
  PortalCode,
  type Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChatEventsService } from './chat-events.service';

interface LegacyCreateConversationDto {
  type: 'DIRECT' | 'GROUP';
  participantIds: string[];
  name?: string;
  description?: string;
}

interface SendMessageDto {
  conversationId: string;
  senderId: string;
  content: string;
  type?: string;
  replyToId?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMime?: string;
  accessScope?: ConversationAccessScope;
}

export interface ConversationAccessScope {
  tenantId?: string | null;
  isSuperAdmin?: boolean;
}

type SentChatMessage = Prisma.ChatMessageGetPayload<{
  include: {
    sender: { select: { id: true; name: true; profilePhoto: true } };
    replyTo: {
      select: {
        id: true;
        content: true;
        sender: { select: { name: true } };
      };
    };
  };
}>;

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
const SUPPORT_ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'CUSTOMER_CARE'];
const HUMAN_MESSAGE_TYPES = new Set(['TEXT', 'IMAGE', 'FILE', 'VOICE']);

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly chatEvents: ChatEventsService,
  ) {}

  // ── Auth ──────────────────────────────────────────────────────────────────

  async validateToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token) as any;
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub || decoded.userId || decoded.id },
        include: { role: true },
      });
      return user?.isActive && !user.isLocked ? user : null;
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
    dto: LegacyCreateConversationDto,
    creatorId: string,
    tenantId?: string | null,
  ): Promise<unknown>;
  async createConversation(
    type: ConversationType,
    tenantId: string | null,
    participantUserIds: string[],
  ): Promise<unknown>;
  async createConversation(
    dtoOrType: LegacyCreateConversationDto | ConversationType,
    creatorIdOrTenantId: string | null,
    participantUserIdsOrTenantId?: string[] | string | null,
  ): Promise<unknown> {
    if (typeof dtoOrType === 'string') {
      return this.createTenantConversation(
        dtoOrType,
        creatorIdOrTenantId,
        Array.isArray(participantUserIdsOrTenantId)
          ? participantUserIdsOrTenantId
          : [],
      );
    }

    if (!creatorIdOrTenantId) {
      throw new BadRequestException('Conversation creator is required');
    }

    return this.createLegacyConversation(
      dtoOrType,
      creatorIdOrTenantId,
      typeof participantUserIdsOrTenantId === 'string'
        ? participantUserIdsOrTenantId
        : null,
    );
  }

  private async createLegacyConversation(
    dto: LegacyCreateConversationDto,
    creatorId: string,
    tenantId: string | null,
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
      const existing = await this.findDirectConversation(creatorId, otherId, tenantId);
      if (existing) return existing;

      // RBAC check
      const other = await this.prisma.user.findUnique({ where: { id: otherId }, include: { role: true } });
      const otherRole = this.getUserRole(other);
      if (!this.canChatWith(creatorRole, otherRole)) {
        throw new ForbiddenException(`You cannot start a conversation with users of role ${otherRole}`);
      }
    }

    const allParticipants = [...new Set([creatorId, ...dto.participantIds])];
    const activeUsers = await this.prisma.user.findMany({
      where: { id: { in: allParticipants }, isActive: true },
      select: { id: true, role: { select: { name: true } } },
    });
    if (activeUsers.length !== allParticipants.length) {
      throw new BadRequestException('Every participant must be an active user');
    }
    const disallowedParticipant = activeUsers.find(
      (user) =>
        user.id !== creatorId &&
        !this.canChatWith(creatorRole, this.getUserRole(user)),
    );
    if (disallowedParticipant) {
      throw new ForbiddenException(
        `You cannot add users of role ${this.getUserRole(disallowedParticipant)}`,
      );
    }

    if (tenantId) {
      await this.assertTenantParticipantAccess(
        ConversationType.INTERNAL,
        tenantId,
        allParticipants,
        new Set(
          activeUsers
            .filter((user) => user.role?.name === 'SUPER_ADMIN')
            .map((user) => user.id),
        ),
      );
    }

    const conversation = await this.prisma.chatConversation.create({
      data: {
        tenantId,
        type: dto.type,
        conversationType: ConversationType.INTERNAL,
        title: dto.name,
        name: dto.name,
        description: dto.description,
        createdById: creatorId,
        participants: {
          create: allParticipants.map((uid) => ({
            userId: uid,
            role: uid === creatorId ? 'ADMIN' : 'MEMBER',
            participantRole:
              uid === creatorId ? ParticipantRole.OWNER : ParticipantRole.MEMBER,
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

  private async createTenantConversation(
    type: ConversationType,
    tenantId: string | null,
    participantUserIds: string[],
  ) {
    const requestedParticipantIds = [
      ...new Set(participantUserIds.filter((userId) => Boolean(userId))),
    ];
    if (requestedParticipantIds.length === 0) {
      throw new BadRequestException('At least one participant is required');
    }
    if (type === ConversationType.INTERNAL && !tenantId) {
      throw new BadRequestException('Tenant is required for internal conversations');
    }

    const activeUsers = await this.prisma.user.findMany({
      where: { id: { in: requestedParticipantIds }, isActive: true },
      select: { id: true, role: { select: { name: true } } },
    });
    if (activeUsers.length !== requestedParticipantIds.length) {
      throw new BadRequestException('Every participant must be an active user');
    }

    let supportAdminId: string | null = null;
    const allParticipantIds = [...requestedParticipantIds];
    if (type === ConversationType.SUPPORT) {
      supportAdminId = await this.resolveSupportAdmin(allParticipantIds);
      if (!allParticipantIds.includes(supportAdminId)) {
        allParticipantIds.push(supportAdminId);
      }
    }

    const aiBotUserIds = new Set(
      activeUsers
        .filter((user) => user.role?.name === 'AI_BOT')
        .map((user) => user.id),
    );
    const tenantBypassUserIds = new Set(
      activeUsers
        .filter(
          (user) =>
            user.role?.name === 'SUPER_ADMIN' ||
            (type === ConversationType.AI && user.role?.name === 'AI_BOT'),
        )
        .map((user) => user.id),
    );
    await this.assertTenantParticipantAccess(
      type,
      tenantId,
      allParticipantIds,
      tenantBypassUserIds,
    );

    const creatorId = requestedParticipantIds[0];
    const legacyType =
      type === ConversationType.SUPPORT
        ? 'SUPPORT_SESSION'
        : type === ConversationType.INTERNAL
          ? allParticipantIds.length === 2
            ? 'DIRECT'
            : 'GROUP'
          : 'AI';

    return this.prisma.chatConversation.create({
      data: {
        tenantId,
        conversationType: type,
        status: ConversationStatus.ACTIVE,
        type: legacyType,
        createdById: creatorId,
        participants: {
          create: allParticipantIds.map((userId) => {
            const participantRole =
              userId === supportAdminId
                ? ParticipantRole.ADMIN_SUPPORT
                : aiBotUserIds.has(userId)
                  ? ParticipantRole.AI_BOT
                  : userId === creatorId
                    ? ParticipantRole.OWNER
                    : ParticipantRole.MEMBER;

            return {
              userId,
              participantRole,
              role:
                participantRole === ParticipantRole.MEMBER ? 'MEMBER' : 'ADMIN',
            };
          }),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePhoto: true,
                role: { select: { name: true } },
              },
            },
          },
        },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  private async resolveSupportAdmin(participantUserIds: string[]): Promise<string> {
    const existingAdmin = await this.prisma.userPortalMembership.findFirst({
      where: {
        userId: { in: participantUserIds },
        portal: PortalCode.ADMIN,
        status: MembershipStatus.ACTIVE,
        OR: [
          { user: { role: { name: { in: SUPPORT_ADMIN_ROLES } } } },
          { roles: { some: { role: { name: { in: SUPPORT_ADMIN_ROLES } } } } },
        ],
      },
      select: { userId: true },
    });
    if (existingAdmin) return existingAdmin.userId;

    const routedAdmin = await this.prisma.userPortalMembership.findFirst({
      where: {
        portal: PortalCode.ADMIN,
        status: MembershipStatus.ACTIVE,
        user: { isActive: true },
        OR: [
          { user: { role: { name: { in: SUPPORT_ADMIN_ROLES } } } },
          { roles: { some: { role: { name: { in: SUPPORT_ADMIN_ROLES } } } } },
        ],
      },
      orderBy: { createdAt: 'asc' },
      select: { userId: true },
    });
    if (!routedAdmin) {
      throw new ServiceUnavailableException(
        'No active Admin Portal support user is currently available',
      );
    }

    return routedAdmin.userId;
  }

  private async assertTenantParticipantAccess(
    type: ConversationType,
    tenantId: string | null,
    participantUserIds: string[],
    tenantBypassUserIds: ReadonlySet<string>,
  ): Promise<void> {
    if (!tenantId) return;

    const memberships = await this.prisma.userPortalMembership.findMany({
      where: {
        userId: { in: participantUserIds },
        status: MembershipStatus.ACTIVE,
        ...(type === ConversationType.SUPPORT
          ? { OR: [{ tenantId }, { portal: PortalCode.ADMIN }] }
          : { tenantId }),
      },
      select: { userId: true },
    });
    const allowedUserIds = new Set([
      ...memberships.map((membership) => membership.userId),
      ...tenantBypassUserIds,
    ]);
    const invalidUserId = participantUserIds.find((userId) => !allowedUserIds.has(userId));
    if (invalidUserId) {
      throw new ForbiddenException('All participants must belong to the selected tenant');
    }
  }

  private async findDirectConversation(
    userId1: string,
    userId2: string,
    tenantId?: string | null,
  ) {
    const conversations = await this.prisma.chatConversation.findMany({
      where: {
        type: 'DIRECT',
        ...(tenantId !== undefined ? { tenantId } : {}),
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

  async getUserConversations(
    userId: string,
    tenantId?: string | null,
    isSuperAdmin = false,
  ) {
    const conversations = await this.prisma.chatConversation.findMany({
      where: {
        isArchived: false,
        participants: { some: { userId } },
        ...(!isSuperAdmin && tenantId
          ? { OR: [{ tenantId }, { tenantId: null }] }
          : {}),
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

  async getUserConversationIds(
    userId: string,
    tenantId?: string | null,
    isSuperAdmin = false,
  ): Promise<string[]> {
    const participants = await this.prisma.chatParticipant.findMany({
      where: {
        userId,
        ...(!isSuperAdmin && tenantId
          ? {
              conversation: {
                OR: [{ tenantId }, { tenantId: null }],
              },
            }
          : {}),
      },
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

  async getMessageConversationId(messageId: string): Promise<string> {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { conversationId: true },
    });
    if (!message) throw new NotFoundException('Message not found');
    return message.conversationId;
  }

  async canAccessConversation(
    userId: string,
    conversationId: string,
    tenantId?: string | null,
    isSuperAdmin = false,
  ): Promise<boolean> {
    if (isSuperAdmin) {
      const conversation = await this.prisma.chatConversation.findUnique({
        where: { id: conversationId },
        select: { id: true },
      });
      return Boolean(conversation);
    }

    const participant = await this.prisma.chatParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
      include: {
        conversation: { select: { tenantId: true } },
        user: {
          select: {
            role: { select: { name: true } },
            portalMemberships: {
              select: { tenantId: true, portal: true, status: true },
            },
          },
        },
      },
    });
    if (!participant) return false;
    if (participant.user.role?.name === 'SUPER_ADMIN') return true;

    const activeMemberships = participant.user.portalMemberships.filter(
      (membership) => membership.status === MembershipStatus.ACTIVE,
    );
    const conversationTenantId = participant.conversation.tenantId;
    if (!conversationTenantId) {
      return (
        participant.user.portalMemberships.length === 0 || activeMemberships.length > 0
      );
    }
    if (typeof tenantId === 'string' && tenantId !== conversationTenantId) {
      return false;
    }

    return activeMemberships.some(
      (membership) =>
        membership.tenantId === conversationTenantId ||
        (participant.participantRole === ParticipantRole.ADMIN_SUPPORT &&
          membership.portal === PortalCode.ADMIN),
    );
  }

  async setConversationPriority(
    conversationId: string,
    priority: string,
    userId: string,
    scope?: ConversationAccessScope,
  ) {
    await this.ensureConversationAccess(userId, conversationId, scope);
    return this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: { priority },
    });
  }

  async lockConversation(
    conversationId: string,
    userId: string,
    scope?: ConversationAccessScope,
  ) {
    await this.ensureAdminAccess(userId);
    await this.ensureConversationAccess(userId, conversationId, scope);
    return this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: { isLocked: true },
    });
  }

  async archiveConversation(
    conversationId: string,
    userId: string,
    scope?: ConversationAccessScope,
  ) {
    await this.ensureConversationAccess(userId, conversationId, scope);
    return this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: { isArchived: true },
    });
  }

  async getPinnedMessages(
    conversationId: string,
    userId: string,
    scope?: ConversationAccessScope,
  ) {
    await this.ensureConversationAccess(userId, conversationId, scope);
    return this.prisma.chatMessage.findMany({
      where: { conversationId, isPinned: true, isDeleted: false },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  async sendMessage(dto: SendMessageDto): Promise<SentChatMessage>;
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    accessScope?: ConversationAccessScope,
  ): Promise<SentChatMessage>;
  async sendMessage(
    dtoOrConversationId: SendMessageDto | string,
    senderId?: string,
    content?: string,
    accessScope?: ConversationAccessScope,
  ): Promise<SentChatMessage> {
    const dto: SendMessageDto =
      typeof dtoOrConversationId === 'string'
        ? {
            conversationId: dtoOrConversationId,
            senderId: senderId ?? '',
            content: content ?? '',
            accessScope,
          }
        : dtoOrConversationId;

    if (!dto.senderId) {
      throw new BadRequestException('Message sender is required');
    }
    const normalizedContent = dto.content?.trim() ?? '';
    if (!normalizedContent && !dto.fileUrl) {
      throw new BadRequestException('Message content or an attachment is required');
    }
    const messageType = (dto.type ?? 'TEXT').toUpperCase();
    if (!HUMAN_MESSAGE_TYPES.has(messageType)) {
      throw new BadRequestException('Unsupported user message type');
    }

    const message = await this.prisma.$transaction(async (transaction) => {
      const participant = await transaction.chatParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: dto.conversationId,
            userId: dto.senderId,
          },
        },
        include: {
          conversation: true,
          user: {
            select: {
              role: { select: { name: true } },
              portalMemberships: {
                where: { status: MembershipStatus.ACTIVE },
                select: { tenantId: true, portal: true },
              },
            },
          },
        },
      });
      if (!participant) {
        throw new ForbiddenException('Sender is not a participant in this conversation');
      }

      const conversation = participant.conversation;
      if (conversation.status === ConversationStatus.CLOSED) {
        throw new ConflictException('Conversation is closed');
      }
      if (conversation.isLocked) {
        throw new ForbiddenException('Conversation is locked');
      }
      if (conversation.tenantId) {
        if (
          !dto.accessScope?.isSuperAdmin &&
          typeof dto.accessScope?.tenantId === 'string' &&
          dto.accessScope.tenantId !== conversation.tenantId
        ) {
          throw new ForbiddenException('Conversation belongs to another tenant');
        }
        const hasTenantAccess =
          participant.user.role?.name === 'SUPER_ADMIN' ||
          participant.user.portalMemberships.some(
            (membership) =>
              membership.tenantId === conversation.tenantId ||
              (participant.participantRole === ParticipantRole.ADMIN_SUPPORT &&
                membership.portal === PortalCode.ADMIN),
          );
        if (!hasTenantAccess) {
          throw new ForbiddenException('Sender does not have access to this tenant');
        }
      }
      if (dto.replyToId) {
        const replyTarget = await transaction.chatMessage.findFirst({
          where: {
            id: dto.replyToId,
            conversationId: dto.conversationId,
            isDeleted: false,
          },
          select: { id: true },
        });
        if (!replyTarget) {
          throw new BadRequestException(
            'Reply target does not belong to this conversation',
          );
        }
      }

      const createdMessage = await transaction.chatMessage.create({
        data: {
          conversationId: dto.conversationId,
          senderId: dto.senderId,
          content: normalizedContent,
          type: messageType,
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

      await transaction.chatConversation.update({
        where: { id: dto.conversationId },
        data: { updatedAt: new Date() },
      });

      return createdMessage;
    });

    this.chatEvents.publishMessageCreated({
      conversationId: dto.conversationId,
      message,
    });

    return message;
  }

  async getMessages(
    conversationId: string,
    userId: string,
    cursor?: string,
    limit = 30,
    scope?: ConversationAccessScope,
  ) {
    await this.ensureConversationAccess(userId, conversationId, scope);

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

  async searchMessages(
    conversationId: string,
    userId: string,
    query: string,
    scope?: ConversationAccessScope,
  ) {
    await this.ensureConversationAccess(userId, conversationId, scope);
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

  async editMessage(
    messageId: string,
    userId: string,
    content: string,
    scope?: ConversationAccessScope,
  ) {
    const message = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    await this.ensureConversationAccess(userId, message.conversationId, scope);
    if (message.senderId !== userId) throw new ForbiddenException('Cannot edit others\' messages');

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { content, isEdited: true },
      include: { sender: { select: { id: true, name: true } } },
    });
  }

  async deleteMessage(
    messageId: string,
    userId: string,
    scope?: ConversationAccessScope,
  ) {
    const message = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    await this.ensureConversationAccess(userId, message.conversationId, scope);

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

  async pinMessage(
    messageId: string,
    userId: string,
    scope?: ConversationAccessScope,
  ) {
    const message = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    await this.ensureConversationAccess(userId, message.conversationId, scope);
    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { isPinned: true },
    });
  }

  async toggleReaction(
    messageId: string,
    userId: string,
    emoji: string,
    scope?: ConversationAccessScope,
  ): Promise<string> {
    const message = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    await this.ensureConversationAccess(userId, message.conversationId, scope);

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

  async starMessage(
    messageId: string,
    userId: string,
    scope?: ConversationAccessScope,
  ) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { conversationId: true },
    });
    if (!message) throw new NotFoundException('Message not found');
    await this.ensureConversationAccess(userId, message.conversationId, scope);

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

  async getStarredMessages(userId: string, scope?: ConversationAccessScope) {
    return this.prisma.chatStarredMessage.findMany({
      where: {
        userId,
        message: {
          conversation: {
            participants: { some: { userId } },
            ...(!scope?.isSuperAdmin && scope?.tenantId
              ? { OR: [{ tenantId: scope.tenantId }, { tenantId: null }] }
              : {}),
          },
        },
      },
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

  async markConversationRead(
    conversationId: string,
    userId: string,
    lastReadMessageId?: string,
    scope?: ConversationAccessScope,
  ) {
    await this.ensureConversationAccess(userId, conversationId, scope);
    const lastReadMessage = await this.prisma.chatMessage.findFirst({
      where: {
        conversationId,
        ...(lastReadMessageId ? { id: lastReadMessageId } : {}),
        isDeleted: false,
      },
      select: { id: true },
      orderBy: lastReadMessageId ? undefined : { createdAt: 'desc' },
    });
    if (lastReadMessageId && !lastReadMessage) {
      throw new BadRequestException('Last-read message does not belong to this conversation');
    }

    return this.prisma.chatParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: {
        lastReadAt: new Date(),
        lastReadMessageId: lastReadMessage?.id ?? null,
      },
    });
  }

  // ── Admin operations ──────────────────────────────────────────────────────

  async getAllConversations(
    adminId: string,
    filters: any = {},
    scope?: ConversationAccessScope,
  ) {
    await this.ensureAdminAccess(adminId);
    return this.prisma.chatConversation.findMany({
      where: {
        ...(!scope?.isSuperAdmin
          ? {
              participants: { some: { userId: adminId } },
              ...(scope?.tenantId ? { tenantId: scope.tenantId } : {}),
            }
          : {}),
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

  async exportConversation(
    conversationId: string,
    adminId: string,
    scope?: ConversationAccessScope,
  ) {
    await this.ensureAdminAccess(adminId);
    await this.ensureConversationAccess(adminId, conversationId, scope);
    return this.prisma.chatMessage.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, name: true, role: { select: { name: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addParticipant(
    conversationId: string,
    targetUserId: string,
    requesterId: string,
    scope?: ConversationAccessScope,
  ) {
    await this.ensureConversationAccess(requesterId, conversationId, scope);
    const requesterParticipant = await this.prisma.chatParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId: requesterId },
      },
      include: { user: { include: { role: true } } },
    });
    if (
      !requesterParticipant ||
      (requesterParticipant.participantRole !== ParticipantRole.OWNER &&
        requesterParticipant.participantRole !== ParticipantRole.ADMIN_SUPPORT &&
        requesterParticipant.role !== 'ADMIN')
    ) {
      throw new ForbiddenException('Only conversation owners or support admins can add participants');
    }

    const existing = await this.prisma.chatParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: targetUserId } },
    });
    if (existing) return existing;

    const [conversation, targetUser] = await Promise.all([
      this.prisma.chatConversation.findUnique({
        where: { id: conversationId },
        select: { tenantId: true, conversationType: true },
      }),
      this.prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, isActive: true, role: { select: { name: true } } },
      }),
    ]);
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (!targetUser?.isActive) {
      throw new BadRequestException('Participant must be an active user');
    }
    const requesterRole = this.getUserRole(requesterParticipant.user);
    const targetRole = this.getUserRole(targetUser);
    if (!this.canChatWith(requesterRole, targetRole)) {
      throw new ForbiddenException(`You cannot add users of role ${targetRole}`);
    }
    await this.assertTenantParticipantAccess(
      conversation.conversationType ?? ConversationType.INTERNAL,
      conversation.tenantId,
      [targetUserId],
      new Set(targetUser.role?.name === 'SUPER_ADMIN' ? [targetUserId] : []),
    );

    return this.prisma.chatParticipant.create({
      data: {
        conversationId,
        userId: targetUserId,
        participantRole: ParticipantRole.MEMBER,
      },
    });
  }

  async removeParticipant(
    conversationId: string,
    targetUserId: string,
    requesterId: string,
    scope?: ConversationAccessScope,
  ) {
    await this.ensureAdminAccess(requesterId);
    await this.ensureConversationAccess(requesterId, conversationId, scope);
    return this.prisma.chatParticipant.delete({
      where: { conversationId_userId: { conversationId, userId: targetUserId } },
    });
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async ensureConversationAccess(
    userId: string,
    conversationId: string,
    scope?: ConversationAccessScope,
  ) {
    const ok = await this.canAccessConversation(
      userId,
      conversationId,
      scope?.tenantId,
      scope?.isSuperAdmin,
    );
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
