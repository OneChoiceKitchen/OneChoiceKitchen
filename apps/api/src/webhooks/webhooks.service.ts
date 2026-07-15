import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async register(tenantId: string, dto: CreateWebhookDto) {
    return this.prisma.webhook.create({
      data: {
        tenantId,
        eventTrigger: dto.eventTrigger,
        targetUrl: dto.targetUrl,
      },
    });
  }

  async list(tenantId: string) {
    return this.prisma.webhook.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listLogs(tenantId: string) {
    return this.prisma.webhookLog.findMany({
      where: { webhook: { tenantId } },
      include: { webhook: true },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to recent logs
    });
  }

  async dispatch(eventTrigger: string, tenantId: string, payload: any) {
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        tenantId,
        eventTrigger,
        isActive: true,
      },
    });

    if (webhooks.length === 0) {
      return;
    }

    const payloadString = JSON.stringify(payload);

    // Dispatch all matched webhooks in parallel, but do not wait for them in the main thread if called asynchronously
    Promise.allSettled(
      webhooks.map(async (webhook) => {
        try {
          const signature = crypto
            .createHmac('sha256', webhook.secretKey)
            .update(payloadString)
            .digest('hex');

          const response = await firstValueFrom(
            this.httpService.post(webhook.targetUrl, payload, {
              headers: {
                'Content-Type': 'application/json',
                'x-ock-signature': signature,
              },
              timeout: 5000,
            }),
          );

          await this.prisma.webhookLog.create({
            data: {
              webhookId: webhook.id,
              payload: payloadString,
              responseStatus: response.status,
              isSuccessful: response.status >= 200 && response.status < 300,
            },
          });
        } catch (error: any) {
          this.logger.error(
            `Failed to dispatch webhook ${webhook.id} to ${webhook.targetUrl}`,
            error.stack,
          );

          const status = error.response ? error.response.status : 0;

          await this.prisma.webhookLog.create({
            data: {
              webhookId: webhook.id,
              payload: payloadString,
              responseStatus: status,
              isSuccessful: false,
            },
          });
        }
      }),
    ).catch((err) => {
      this.logger.error('Error settling webhook dispatch promises', err);
    });
  }
}
