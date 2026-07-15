import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { WebhookEventTrigger } from './dto/create-webhook.dto';

describe('WebhooksService', () => {
  let service: WebhooksService;
  let prisma: PrismaService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        {
          provide: PrismaService,
          useValue: {
            webhook: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
            webhookLog: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
    prisma = module.get<PrismaService>(PrismaService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should register a new webhook', async () => {
    const mockDto = {
      eventTrigger: WebhookEventTrigger.ORDER_CREATED,
      targetUrl: 'https://example.com/webhook',
    };
    const mockResult = { id: 'webhook-1', ...mockDto, tenantId: 'tenant-1' };
    
    (prisma.webhook.create as jest.Mock).mockResolvedValue(mockResult);

    const result = await service.register('tenant-1', mockDto);
    expect(result).toEqual(mockResult);
    expect(prisma.webhook.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        eventTrigger: 'ORDER_CREATED',
        targetUrl: 'https://example.com/webhook',
      },
    });
  });

  it('should list webhooks for a tenant', async () => {
    const mockWebhooks = [{ id: 'webhook-1' }];
    (prisma.webhook.findMany as jest.Mock).mockResolvedValue(mockWebhooks);

    const result = await service.list('tenant-1');
    expect(result).toEqual(mockWebhooks);
    expect(prisma.webhook.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should list webhook logs for a tenant', async () => {
    const mockLogs = [{ id: 'log-1' }];
    (prisma.webhookLog.findMany as jest.Mock).mockResolvedValue(mockLogs);

    const result = await service.listLogs('tenant-1');
    expect(result).toEqual(mockLogs);
    expect(prisma.webhookLog.findMany).toHaveBeenCalledWith({
      where: { webhook: { tenantId: 'tenant-1' } },
      include: { webhook: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  });

  describe('dispatch', () => {
    it('should dispatch successfully and log success', async () => {
      const mockWebhooks = [
        { id: 'webhook-1', targetUrl: 'https://example.com/webhook', secretKey: 'secret' }
      ];
      (prisma.webhook.findMany as jest.Mock).mockResolvedValue(mockWebhooks);

      (httpService.post as jest.Mock).mockReturnValue(of({ status: 200 }));

      await service.dispatch('ORDER_CREATED', 'tenant-1', { orderId: '123' });

      expect(httpService.post).toHaveBeenCalledWith(
        'https://example.com/webhook',
        { orderId: '123' },
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-ock-signature': expect.any(String),
          })
        })
      );

      expect(prisma.webhookLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          webhookId: 'webhook-1',
          responseStatus: 200,
          isSuccessful: true,
        })
      });
    });

    it('should handle dispatch failure and log error', async () => {
      const mockWebhooks = [
        { id: 'webhook-1', targetUrl: 'https://example.com/webhook', secretKey: 'secret' }
      ];
      (prisma.webhook.findMany as jest.Mock).mockResolvedValue(mockWebhooks);

      (httpService.post as jest.Mock).mockReturnValue(
        throwError(() => ({ response: { status: 500 } }))
      );

      await service.dispatch('ORDER_CREATED', 'tenant-1', { orderId: '123' });

      expect(prisma.webhookLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          webhookId: 'webhook-1',
          responseStatus: 500,
          isSuccessful: false,
        })
      });
    });
  });
});
