import { Controller, Post, Get, Body, Req } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { SecurePortal } from '../app/auth/decorators/secure-portal.decorator';
import { PortalCode } from '@prisma/client';

@Controller('api/webhooks')
@SecurePortal(PortalCode.PARTNER, true)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  async registerWebhook(@Req() req: any, @Body() dto: CreateWebhookDto) {
    const tenantId = req.user.tenantId;
    return this.webhooksService.register(tenantId, dto);
  }

  @Get()
  async listWebhooks(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.webhooksService.list(tenantId);
  }

  @Get('logs')
  async listLogs(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.webhooksService.listLogs(tenantId);
  }
}
