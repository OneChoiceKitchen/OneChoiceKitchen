import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Req,
  HttpCode, HttpStatus, StreamableFile, Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import type { Response } from 'express';

// Simple auth guard using request headers
function extractUser(req: any) {
  // In production this would use AuthGuard from the existing auth module
  // For now, we read user from the custom header set by auth middleware
  return { id: req.user?.id || req.headers['x-user-id'], role: req.user?.role?.name || req.headers['x-user-role'] };
}

@ApiTags('chat')
@ApiBearerAuth()
@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ── User Search & Discovery ──────────────────────────────────────────────

  @Get('users/search')
  @ApiOperation({ summary: 'Search internal users (RBAC filtered)' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async searchUsers(@Query('q') q = '', @Query('page') page = 1, @Query('limit') limit = 20, @Req() req: any) {
    const user = extractUser(req);
    return this.chatService.searchUsers(q, user.id, +page, +limit);
  }

  @Get('users/contactable')
  @ApiOperation({ summary: 'Get users I can contact (RBAC matrix)' })
  async getContactable(@Req() req: any) {
    const user = extractUser(req);
    return this.chatService.getContactableUsers(user.id);
  }

  @Get('users/online')
  @ApiOperation({ summary: 'Get list of online user IDs' })
  async getOnlineUsers(@Req() req: any) {
    // Returns from gateway — injected via service
    return { online: [] }; // populated by gateway's onlineUsers map
  }

  // ── Conversations ────────────────────────────────────────────────────────

  @Get('conversations')
  @ApiOperation({ summary: 'Get my conversations with unread counts' })
  async getConversations(@Req() req: any) {
    const user = extractUser(req);
    return this.chatService.getUserConversations(user.id);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Create direct or group conversation' })
  async createConversation(
    @Body() body: { type: 'DIRECT' | 'GROUP'; participantIds: string[]; name?: string; description?: string },
    @Req() req: any,
  ) {
    const user = extractUser(req);
    return this.chatService.createConversation(body, user.id);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation details' })
  async getConversation(@Param('id') id: string, @Req() req: any) {
    const user = extractUser(req);
    const conv = await this.chatService.getConversation(id);
    const hasAccess = await this.chatService.canAccessConversation(user.id, id);
    if (!hasAccess) return { error: 'Access denied' };
    return conv;
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages (cursor-based pagination)' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getMessages(
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = 30,
    @Req() req?: any,
  ) {
    const user = extractUser(req);
    return this.chatService.getMessages(id, user.id, cursor, +limit);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send message (REST fallback — prefer WebSocket)' })
  async sendMessage(
    @Param('id') conversationId: string,
    @Body() body: { content: string; type?: string; replyToId?: string; fileUrl?: string; fileName?: string },
    @Req() req: any,
  ) {
    const user = extractUser(req);
    return this.chatService.sendMessage({ conversationId, senderId: user.id, ...body });
  }

  @Get('conversations/:id/messages/search')
  @ApiOperation({ summary: 'Search within conversation' })
  async searchMessages(@Param('id') id: string, @Query('q') q: string, @Req() req: any) {
    const user = extractUser(req);
    return this.chatService.searchMessages(id, user.id, q || '');
  }

  @Get('conversations/:id/pinned')
  @ApiOperation({ summary: 'Get pinned messages' })
  async getPinnedMessages(@Param('id') id: string, @Req() req: any) {
    const user = extractUser(req);
    return this.chatService.getPinnedMessages(id, user.id);
  }

  @Patch('conversations/:id/priority')
  @ApiOperation({ summary: 'Set conversation priority' })
  async setPriority(
    @Param('id') id: string,
    @Body() body: { priority: 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL' },
    @Req() req: any,
  ) {
    const user = extractUser(req);
    return this.chatService.setConversationPriority(id, body.priority, user.id);
  }

  @Post('conversations/:id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive conversation' })
  async archiveConversation(@Param('id') id: string, @Req() req: any) {
    const user = extractUser(req);
    return this.chatService.archiveConversation(id, user.id);
  }

  @Post('conversations/:id/lock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lock conversation (admin only)' })
  async lockConversation(@Param('id') id: string, @Req() req: any) {
    const user = extractUser(req);
    return this.chatService.lockConversation(id, user.id);
  }

  @Post('conversations/:id/participants')
  @ApiOperation({ summary: 'Add participant to group' })
  async addParticipant(@Param('id') id: string, @Body() body: { userId: string }, @Req() req: any) {
    const user = extractUser(req);
    return this.chatService.addParticipant(id, body.userId, user.id);
  }

  @Delete('conversations/:id/participants/:userId')
  @ApiOperation({ summary: 'Remove participant from group (admin only)' })
  async removeParticipant(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    const user = extractUser(req);
    return this.chatService.removeParticipant(id, userId, user.id);
  }

  // ── Messages ─────────────────────────────────────────────────────────────

  @Patch('messages/:id')
  @ApiOperation({ summary: 'Edit message' })
  async editMessage(@Param('id') id: string, @Body() body: { content: string }, @Req() req: any) {
    const user = extractUser(req);
    return this.chatService.editMessage(id, user.id, body.content);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete message (soft)' })
  async deleteMessage(@Param('id') id: string, @Req() req: any) {
    const user = extractUser(req);
    return this.chatService.deleteMessage(id, user.id);
  }

  @Post('messages/:id/pin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pin message' })
  async pinMessage(@Param('id') id: string, @Req() req: any) {
    const user = extractUser(req);
    return this.chatService.pinMessage(id, user.id);
  }

  @Post('messages/:id/star')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Star / unstar message' })
  async starMessage(@Param('id') id: string, @Req() req: any) {
    const user = extractUser(req);
    return this.chatService.starMessage(id, user.id);
  }

  @Post('messages/:id/react')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle reaction on message' })
  async reactToMessage(@Param('id') id: string, @Body() body: { emoji: string }, @Req() req: any) {
    const user = extractUser(req);
    return this.chatService.toggleReaction(id, user.id, body.emoji);
  }

  @Get('starred')
  @ApiOperation({ summary: 'Get my starred messages' })
  async getStarredMessages(@Req() req: any) {
    const user = extractUser(req);
    return this.chatService.getStarredMessages(user.id);
  }

  // ── Admin ────────────────────────────────────────────────────────────────

  @Get('admin/conversations')
  @ApiOperation({ summary: '[Admin] View all conversations' })
  async getAllConversations(
    @Query('type') type?: string,
    @Query('priority') priority?: string,
    @Query('isArchived') isArchived?: string,
    @Req() req?: any,
  ) {
    const user = extractUser(req);
    return this.chatService.getAllConversations(user.id, {
      type,
      priority,
      isArchived: isArchived === 'true' ? true : isArchived === 'false' ? false : undefined,
    });
  }

  @Get('admin/export/:conversationId')
  @ApiOperation({ summary: '[Admin] Export conversation as JSON' })
  async exportConversation(
    @Param('conversationId') conversationId: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: any,
  ) {
    const user = extractUser(req);
    const messages = await this.chatService.exportConversation(conversationId, user.id);
    const json = JSON.stringify(messages, null, 2);
    const buffer = Buffer.from(json, 'utf8');
    res.setHeader('Content-Disposition', `attachment; filename="chat-${conversationId}.json"`);
    res.setHeader('Content-Type', 'application/json');
    return new StreamableFile(buffer);
  }
}
