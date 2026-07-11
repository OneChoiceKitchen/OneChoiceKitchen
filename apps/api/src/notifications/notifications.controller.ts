import { Controller, Get, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService, private readonly prisma: PrismaService) {}

  @Get('seed')
  async seed() {
    await this.prisma.notificationTemplate.deleteMany({});
    const templates = [
      {
        eventName: 'RESERVATION_CUSTOMER_EMAIL',
        channel: 'EMAIL',
        subject: 'Table Reservation Confirmed!',
        body: 'Hello {{customerName}},\n\nYour table at {{restaurantName}} ({{branchName}}) is confirmed!\nDate: {{date}}\nTime: {{timeSlot}}\nParty Size: {{partySize}}\nConfirmation Code: {{confirmationCode}}\n\nThank you for choosing us!',
        isActive: true
      },
      {
        eventName: 'RESERVATION_CUSTOMER_WA',
        channel: 'WHATSAPP',
        body: 'Hello {{customerName}},\n\nYour table at {{restaurantName}} ({{branchName}}) is confirmed!\nDate: {{date}}\nTime: {{timeSlot}}\nParty Size: {{partySize}}\nConfirmation Code: {{confirmationCode}}\n\nThank you for choosing us!',
        isActive: true
      },
      {
        eventName: 'RESERVATION_ADMIN_EMAIL',
        channel: 'EMAIL',
        subject: 'New Table Reservation - Action Required',
        body: 'New Table Reservation!\n\nCustomer: {{customerName}} ({{customerPhone}})\nRestaurant: {{restaurantName}} ({{branchName}})\nDate: {{date}}\nTime: {{timeSlot}}\nParty Size: {{partySize}}\nConfirmation Code: {{confirmationCode}}',
        isActive: true
      },
      {
        eventName: 'RESERVATION_ADMIN_WA',
        channel: 'WHATSAPP',
        body: 'New Table Reservation!\n\nCustomer: {{customerName}} ({{customerPhone}})\nRestaurant: {{restaurantName}} ({{branchName}})\nDate: {{date}}\nTime: {{timeSlot}}\nParty Size: {{partySize}}\nConfirmation Code: {{confirmationCode}}',
        isActive: true
      },
      {
        eventName: 'TIFFIN_CUSTOMER_EMAIL',
        channel: 'EMAIL',
        subject: 'Tiffin Subscription Confirmed!',
        body: 'Hello {{customerName}},\n\nYour Tiffin Subscription ({{planName}}) is confirmed!\nStarts: {{startDate}}\n\nThank you for choosing One Choice Kitchen!',
        isActive: true
      },
      {
        eventName: 'TIFFIN_CUSTOMER_WA',
        channel: 'WHATSAPP',
        body: 'Hello {{customerName}},\n\nYour Tiffin Subscription ({{planName}}) is confirmed!\nStarts: {{startDate}}\n\nThank you for choosing One Choice Kitchen!',
        isActive: true
      },
      {
        eventName: 'TIFFIN_ADMIN_EMAIL',
        channel: 'EMAIL',
        subject: 'New Tiffin Subscription',
        body: 'New Tiffin Subscription!\n\nCustomer: {{customerName}} ({{customerPhone}})\nPlan: {{planName}}\nStarts: {{startDate}}',
        isActive: true
      },
      {
        eventName: 'TIFFIN_ADMIN_WA',
        channel: 'WHATSAPP',
        body: 'New Tiffin Subscription!\n\nCustomer: {{customerName}} ({{customerPhone}})\nPlan: {{planName}}\nStarts: {{startDate}}',
        isActive: true
      }
    ];

    for (const t of templates) {
      await this.prisma.notificationTemplate.create({ data: t });
    }

    await this.prisma.whatsappConfig.deleteMany({});
    await this.prisma.whatsappConfig.create({
      data: {
        providerName: 'Local Console',
        isActive: true,
        priority: 1,
        dailyLimit: 500
      }
    });

    return { success: true, message: 'Seeded successfully' };
  }

  @Get('email-configs')
  async getEmailConfigs() {
    return this.notificationsService.getEmailConfigs();
  }

  @Post('email-configs')
  async upsertEmailConfigs(@Body() configs: any[]) {
    return this.notificationsService.upsertEmailConfigs(configs);
  }

  @Post('email-test')
  async sendTestEmail(@Body() body: { email: string; subject: string }) {
    return this.notificationsService.sendTestEmail(body.email, body.subject);
  }

  @Get('sms-configs')
  async getSmsConfigs() {
    return this.notificationsService.getSmsConfigs();
  }

  @Post('sms-configs')
  async upsertSmsConfigs(@Body() configs: any[]) {
    return this.notificationsService.upsertSmsConfigs(configs);
  }

  @Post('sms-test')
  async sendTestSms(@Body() body: { phone: string; message: string }) {
    return this.notificationsService.sendTestSms(body.phone, body.message);
  }

  @Get('templates')
  async getTemplates() {
    return this.notificationsService.getTemplates();
  }

  @Post('templates')
  async upsertTemplate(@Body() body: any) {
    return this.notificationsService.upsertTemplate(body);
  }
}
