import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ConversationStatus,
  ConversationType,
  ParticipantRole,
  PortalCode,
} from '@prisma/client';

import { ChatService } from './chat.service';

describe('ChatService Phase 5 foundations', () => {
  const transaction = {
    chatParticipant: { findUnique: jest.fn() },
    chatMessage: { create: jest.fn(), findFirst: jest.fn() },
    chatConversation: { update: jest.fn() },
  };
  const prisma = {
    user: { findUnique: jest.fn(), findMany: jest.fn() },
    userPortalMembership: { findFirst: jest.fn(), findMany: jest.fn() },
    chatConversation: { create: jest.fn(), findMany: jest.fn() },
    chatParticipant: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    chatMessage: { findFirst: jest.fn() },
    $transaction: jest.fn((callback: (client: typeof transaction) => unknown) =>
      callback(transaction),
    ),
  };
  const jwtService = { verify: jest.fn() };
  const chatEvents = { publishMessageCreated: jest.fn() };
  let service: ChatService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ChatService(prisma as never, jwtService as never, chatEvents as never);
  });

  it('preserves the legacy direct/group creation contract while dual-writing Phase 5 fields', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'owner',
      role: { name: 'ADMIN' },
    });
    prisma.user.findMany.mockResolvedValue([
      { id: 'owner', role: { name: 'ADMIN' } },
      { id: 'member', role: { name: 'PARTNER' } },
    ]);
    prisma.chatConversation.findMany.mockResolvedValue([]);
    prisma.chatConversation.create.mockResolvedValue({ id: 'conversation-1' });

    await service.createConversation(
      { type: 'DIRECT', participantIds: ['member'] },
      'owner',
    );

    expect(prisma.chatConversation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'DIRECT',
          conversationType: ConversationType.INTERNAL,
          participants: {
            create: [
              expect.objectContaining({
                userId: 'owner',
                participantRole: ParticipantRole.OWNER,
              }),
              expect.objectContaining({
                userId: 'member',
                participantRole: ParticipantRole.MEMBER,
              }),
            ],
          },
        }),
      }),
    );
  });

  it('does not allow group creation to bypass the chat role matrix', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'partner',
      role: { name: 'PARTNER' },
    });
    prisma.user.findMany.mockResolvedValue([
      { id: 'partner', role: { name: 'PARTNER' } },
      { id: 'rider', role: { name: 'RIDER' } },
    ]);

    await expect(
      service.createConversation(
        { type: 'GROUP', participantIds: ['rider'] },
        'partner',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.chatConversation.create).not.toHaveBeenCalled();
  });

  it('routes a support conversation to an active Admin Portal participant', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'partner-user' }]);
    prisma.userPortalMembership.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ userId: 'support-admin' });
    prisma.userPortalMembership.findMany.mockResolvedValue([
      { userId: 'partner-user' },
      { userId: 'support-admin' },
    ]);
    prisma.chatConversation.create.mockResolvedValue({ id: 'support-1' });

    await service.createConversation(
      ConversationType.SUPPORT,
      'tenant-a',
      ['partner-user'],
    );

    expect(prisma.chatConversation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-a',
          conversationType: ConversationType.SUPPORT,
          status: ConversationStatus.ACTIVE,
          participants: {
            create: expect.arrayContaining([
              expect.objectContaining({
                userId: 'support-admin',
                participantRole: ParticipantRole.ADMIN_SUPPORT,
              }),
            ]),
          },
        }),
      }),
    );
  });

  it('requires a tenant for internal conversations', async () => {
    await expect(
      service.createConversation(ConversationType.INTERNAL, null, ['user-1']),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not create an unroutable support conversation', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'partner-user', role: null }]);
    prisma.userPortalMembership.findFirst.mockResolvedValue(null);

    await expect(
      service.createConversation(
        ConversationType.SUPPORT,
        'tenant-a',
        ['partner-user'],
      ),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(prisma.chatConversation.create).not.toHaveBeenCalled();
  });

  it('rejects participants without an active membership in the selected tenant', async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: 'owner', role: null },
      { id: 'other-tenant-user', role: null },
    ]);
    prisma.userPortalMembership.findMany.mockResolvedValue([{ userId: 'owner' }]);

    await expect(
      service.createConversation(
        ConversationType.INTERNAL,
        'tenant-a',
        ['owner', 'other-tenant-user'],
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.chatConversation.create).not.toHaveBeenCalled();
  });

  it('rejects messages from non-participants before writing', async () => {
    transaction.chatParticipant.findUnique.mockResolvedValue(null);

    await expect(
      service.sendMessage('conversation-1', 'intruder', 'Hello'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(transaction.chatMessage.create).not.toHaveBeenCalled();
    expect(chatEvents.publishMessageCreated).not.toHaveBeenCalled();
  });

  it('reserves trusted system message types for internal producers', async () => {
    await expect(
      service.sendMessage({
        conversationId: 'conversation-1',
        senderId: 'member',
        content: 'Looks official',
        type: 'SYSTEM',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('re-checks active tenant membership when authorizing a conversation', async () => {
    prisma.chatParticipant.findUnique.mockResolvedValue({
      participantRole: ParticipantRole.MEMBER,
      conversation: { tenantId: 'tenant-a' },
      user: {
        role: null,
        portalMemberships: [
          { tenantId: 'tenant-a', portal: PortalCode.PARTNER, status: 'ACTIVE' },
        ],
      },
    });

    await expect(
      service.canAccessConversation('member', 'conversation-1', 'tenant-a'),
    ).resolves.toBe(true);

    prisma.chatParticipant.findUnique.mockResolvedValue({
      participantRole: ParticipantRole.MEMBER,
      conversation: { tenantId: 'tenant-a' },
      user: {
        role: null,
        portalMemberships: [
          { tenantId: 'tenant-a', portal: PortalCode.PARTNER, status: 'SUSPENDED' },
        ],
      },
    });
    await expect(
      service.canAccessConversation('member', 'conversation-1', 'tenant-a'),
    ).resolves.toBe(false);
  });

  it('rejects a closed conversation', async () => {
    transaction.chatParticipant.findUnique.mockResolvedValue({
      participantRole: ParticipantRole.MEMBER,
      conversation: {
        id: 'conversation-1',
        tenantId: null,
        status: ConversationStatus.CLOSED,
        isLocked: false,
      },
      user: { portalMemberships: [] },
    });

    await expect(
      service.sendMessage('conversation-1', 'member', 'Hello'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('persists and publishes a message only after tenant membership is verified', async () => {
    const message = {
      id: 'message-1',
      conversationId: 'conversation-1',
      senderId: 'member',
      content: 'Hello tenant',
      sender: { id: 'member', name: 'Member', profilePhoto: null },
      replyTo: null,
    };
    transaction.chatParticipant.findUnique.mockResolvedValue({
      participantRole: ParticipantRole.MEMBER,
      conversation: {
        id: 'conversation-1',
        tenantId: 'tenant-a',
        status: ConversationStatus.ACTIVE,
        isLocked: false,
      },
      user: {
        portalMemberships: [{ tenantId: 'tenant-a', portal: PortalCode.PARTNER }],
      },
    });
    transaction.chatMessage.create.mockResolvedValue(message);
    transaction.chatConversation.update.mockResolvedValue({ id: 'conversation-1' });

    await expect(
      service.sendMessage('conversation-1', 'member', '  Hello tenant  '),
    ).resolves.toEqual(message);
    expect(transaction.chatMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ content: 'Hello tenant' }),
      }),
    );
    expect(chatEvents.publishMessageCreated).toHaveBeenCalledWith({
      conversationId: 'conversation-1',
      message,
    });
    expect(transaction.chatMessage.create.mock.invocationCallOrder[0]).toBeLessThan(
      chatEvents.publishMessageCreated.mock.invocationCallOrder[0],
    );
  });

  it('rejects a reply target from another conversation', async () => {
    transaction.chatParticipant.findUnique.mockResolvedValue({
      participantRole: ParticipantRole.MEMBER,
      conversation: {
        id: 'conversation-1',
        tenantId: 'tenant-a',
        status: ConversationStatus.ACTIVE,
        isLocked: false,
      },
      user: {
        role: null,
        portalMemberships: [{ tenantId: 'tenant-a', portal: PortalCode.PARTNER }],
      },
    });
    transaction.chatMessage.findFirst.mockResolvedValue(null);

    await expect(
      service.sendMessage({
        conversationId: 'conversation-1',
        senderId: 'member',
        content: 'Reply',
        replyToId: 'other-conversation-message',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(transaction.chatMessage.create).not.toHaveBeenCalled();
  });

  it('stores the last-read message pointer without removing the legacy timestamp', async () => {
    prisma.chatParticipant.findUnique.mockResolvedValue({
      participantRole: ParticipantRole.MEMBER,
      conversation: { tenantId: null },
      user: { role: null, portalMemberships: [] },
    });
    prisma.chatMessage.findFirst.mockResolvedValue({ id: 'message-9' });
    prisma.chatParticipant.update.mockResolvedValue({ id: 'participant-1' });

    await service.markConversationRead('conversation-1', 'member', 'message-9');

    expect(prisma.chatParticipant.update).toHaveBeenCalledWith({
      where: {
        conversationId_userId: {
          conversationId: 'conversation-1',
          userId: 'member',
        },
      },
      data: {
        lastReadAt: expect.any(Date),
        lastReadMessageId: 'message-9',
      },
    });
  });
});
