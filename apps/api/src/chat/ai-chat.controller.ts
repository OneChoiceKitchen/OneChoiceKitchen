import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiChatService } from './ai-chat.service';

function extractUser(req: any) {
  return { id: req.user?.id || req.headers['x-user-id'] || null, role: req.user?.role?.name || req.headers['x-user-role'] };
}

@ApiTags('ai-chat')
@Controller('api/ai-chat')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  // ── Session Management ────────────────────────────────────────────────────

  @Post('sessions')
  @ApiOperation({ summary: 'Start a new AI chat session' })
  async createSession(
    @Body() body: { channel?: string; language?: string },
    @Req() req: any,
  ) {
    const user = extractUser(req);
    return this.aiChatService.createSession(user.id || undefined, body.channel, body.language);
  }

  @Get('sessions/:token')
  @ApiOperation({ summary: 'Get session by token' })
  async getSession(@Param('token') token: string) {
    return this.aiChatService.getSession(token);
  }

  @Get('sessions/:id/history')
  @ApiOperation({ summary: 'Get conversation history for a session' })
  async getHistory(@Param('id') id: string) {
    return this.aiChatService.getSessionHistory(id);
  }

  // ── Messaging ─────────────────────────────────────────────────────────────

  @Post('sessions/:id/message')
  @ApiOperation({ summary: 'Send a message and receive AI response' })
  async sendMessage(
    @Param('id') sessionId: string,
    @Body() body: { message: string },
    @Req() req: any,
  ) {
    const user = extractUser(req);
    const response = await this.aiChatService.processMessage(sessionId, body.message, user.id);
    return response;
  }

  @Get('sessions/:id/messages')
  @ApiOperation({ summary: 'Get messages for a session (alias for history)' })
  async getSessionMessages(@Param('id') id: string, @Query('page') page = 1, @Query('limit') limit = 50) {
    return this.aiChatService.getSessionHistory(id);
  }

  @Post('sessions/:id/end')
  @ApiOperation({ summary: 'End AI chat session with optional satisfaction rating' })
  async endSession(
    @Param('id') sessionId: string,
    @Body() body: { satisfactionRating?: number; reason?: string },
    @Req() req: any,
  ) {
    return this.aiChatService.endSession(sessionId, body.satisfactionRating);
  }

  @Post('sessions/:id/request-human')
  @ApiOperation({ summary: 'Request human support (alias for escalate)' })
  async requestHuman(
    @Param('id') sessionId: string,
    @Body() body: { reason?: string },
    @Req() req: any,
  ) {
    const user = extractUser(req);
    return this.aiChatService.requestHumanSupport(sessionId, user.id, body.reason || 'Customer requested human support');
  }

  // ── Human Escalation ──────────────────────────────────────────────────────

  @Post('sessions/:id/escalate')
  @ApiOperation({ summary: 'Request human support from AI session' })
  async requestHumanSupport(
    @Param('id') sessionId: string,
    @Body() body: { reason?: string; customerNote?: string },
    @Req() req: any,
  ) {
    const user = extractUser(req);
    return this.aiChatService.requestHumanSupport(
      sessionId, user.id, body.reason || 'Customer requested human support', body.customerNote,
    );
  }

  @Get('support-requests')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get pending human support requests' })
  async getSupportRequests(@Req() req: any) {
    const user = extractUser(req);
    return this.aiChatService.getPendingSupportRequests(user.id);
  }

  @Patch('support-requests/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Accept, reject, assign, or close support request' })
  async updateSupportRequest(
    @Param('id') id: string,
    @Body() body: { status: string; adminNote?: string; assignedToId?: string },
  ) {
    return this.aiChatService.updateSupportRequest(id, body);
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  @Get('admin/analytics')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get chatbot analytics' })
  async getAnalytics(@Query('days') days = 7) {
    return this.aiChatService.getChatbotAnalytics(+days);
  }

  // ── AI Provider Config ─────────────────────────────────────────────────────

  @Get('admin/providers')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] List all AI provider configurations' })
  async getProviders(@Req() req: any) {
    const user = extractUser(req);
    return this.aiChatService.getProviderConfigs(user.id);
  }

  @Post('admin/providers')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create or update AI provider configuration' })
  async upsertProvider(
    @Body() body: {
      provider: string; displayName: string; apiKey?: string; apiEndpoint?: string;
      model?: string; isActive?: boolean; isPrimary?: boolean; settings?: string;
    },
    @Req() req: any,
  ) {
    const user = extractUser(req);
    return this.aiChatService.upsertProviderConfig(user.id, body);
  }

  @Delete('admin/providers/:provider')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Delete AI provider configuration' })
  async deleteProvider(@Param('provider') provider: string, @Req() req: any) {
    const user = extractUser(req);
    return this.aiChatService.deleteProviderConfig(user.id, provider);
  }

  // ── Knowledge Base ─────────────────────────────────────────────────────────

  @Get('admin/knowledge')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get knowledge base entries' })
  async getKnowledge(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.aiChatService.getKnowledgeBase(+page, +limit);
  }

  @Post('admin/knowledge')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create or update knowledge base entry' })
  async upsertKnowledge(@Body() body: any) {
    return this.aiChatService.upsertKnowledgeEntry(body);
  }

  @Delete('admin/knowledge/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Delete knowledge base entry' })
  async deleteKnowledge(@Param('id') id: string) {
    return this.aiChatService.deleteKnowledgeEntry(id);
  }

  // ── Canned Responses ──────────────────────────────────────────────────────

  @Get('admin/canned-responses')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get canned responses' })
  async getCannedResponses() {
    return this.aiChatService.getCannedResponses();
  }

  @Post('admin/canned-responses')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create or update canned response' })
  async upsertCannedResponse(@Body() body: any) {
    return this.aiChatService.upsertCannedResponse(body);
  }

  @Delete('admin/canned-responses/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Delete canned response' })
  async deleteCannedResponse(@Param('id') id: string) {
    return this.aiChatService.deleteCannedResponse(id);
  }
}
