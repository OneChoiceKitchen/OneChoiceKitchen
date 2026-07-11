import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Email Providers
import * as nodemailer from 'nodemailer';
import * as sgMail from '@sendgrid/mail';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // EMAIL
  // ==========================================
  
  async getEmailConfigs() {
    return this.prisma.emailConfig.findMany({
      orderBy: { priority: 'asc' },
    });
  }

  async upsertEmailConfigs(configs: any[]) {
    // Delete missing configs
    const currentIds = configs.filter(c => c.id && !c.id.startsWith('new_')).map(c => c.id);
    await this.prisma.emailConfig.deleteMany({
      where: { id: { notIn: currentIds } },
    });

    const results = [];
    for (const config of configs) {
      if (config.id && !config.id.startsWith('new_')) {
        results.push(
          await this.prisma.emailConfig.update({
            where: { id: config.id },
            data: {
              isActive: config.isActive,
              priority: config.priority,
              dailyLimit: config.dailyLimit,
              config: config.config,
            },
          })
        );
      } else {
        results.push(
          await this.prisma.emailConfig.create({
            data: {
              providerName: config.providerName,
              isActive: config.isActive,
              priority: config.priority,
              dailyLimit: config.dailyLimit,
              config: config.config,
            },
          })
        );
      }
    }
    return results;
  }

  async sendEmail(recipientEmail: string, subject: string, body: string) {
    const activeConfigs = await this.prisma.emailConfig.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' },
    });

    if (activeConfigs.length === 0) {
      this.logger.warn('No active email providers configured. Logging to console instead.');
      this.logger.log(`\n\n[MOCK EMAIL]\nTo: ${recipientEmail}\nSubject: ${subject}\nBody: ${body}\n\n`);
      return { success: true, provider: 'Local Console Mock' };
    }

    let lastError = null;
    for (const provider of activeConfigs) {
      try {
        const result = await this.dispatchEmail(provider, recipientEmail, subject, body);
        return { success: true, provider: provider.providerName, result };
      } catch (error: any) {
        lastError = error;
      }
    }
    throw new Error(`All email providers failed. Last error: ${(lastError as any)?.message}`);
  }

  async sendTestEmail(recipientEmail: string, subject: string) {
    const activeConfigs = await this.prisma.emailConfig.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' },
    });

    if (activeConfigs.length === 0) {
      throw new Error('No active email providers configured');
    }

    let lastError = null;

    // Try providers in priority order
    for (const provider of activeConfigs) {
      try {
        this.logger.log(`Attempting to send email via ${provider.providerName}`);
        
        const result = await this.dispatchEmail(provider, recipientEmail, subject, 'This is a test message from your system configuration.');
        return { success: true, provider: provider.providerName, result };
      } catch (error: any) {
        this.logger.error(`Failed to send email via ${provider.providerName}: ${error.message}`);
        lastError = error;
      }
    }

    throw new Error(`All email providers failed. Last error: ${(lastError as any)?.message}`);
  }

  private async dispatchEmail(provider: any, to: string, subject: string, body: string) {
    const config = provider.config as any;
    
    switch (provider.providerName) {
      case 'SMTP':
      case 'Gmail SMTP':
        const transporter = nodemailer.createTransport({
          host: config.host || 'smtp.gmail.com',
          port: config.port || 587,
          secure: config.useTls || false,
          auth: {
            user: config.username || config.email,
            pass: config.password || config.appPassword,
          },
        });
        return transporter.sendMail({
          from: `"${config.fromName}" <${config.fromEmail || config.email}>`,
          to,
          subject,
          text: body,
        });

      case 'SendGrid':
        sgMail.setApiKey(config.apiKey);
        return sgMail.send({
          to,
          from: { email: config.fromEmail, name: config.fromName },
          subject,
          text: body,
        });

      case 'Amazon SES':
        const ses = new SESClient({
          region: config.region,
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          },
        });
        return ses.send(new SendEmailCommand({
          Source: config.fromEmail,
          Destination: { ToAddresses: [to] },
          Message: {
            Subject: { Data: subject },
            Body: { Text: { Data: body } },
          },
        }));

      case 'Local Console':
        this.logger.log(`\n\n[LOCAL CONSOLE EMAIL]\nTo: ${to}\nSubject: ${subject}\nBody: ${body}\n\n`);
        return { messageId: `mock-email-${Date.now()}` };

      default:
        // Mock success for other providers to avoid errors in this demo
        this.logger.log(`Mocking send for ${provider.providerName}`);
        return { messageId: 'mock-id' };
    }
  }


  // ==========================================
  // SMS
  // ==========================================

  async getSmsConfigs() {
    return this.prisma.smsConfig.findMany({
      orderBy: { priority: 'asc' },
    });
  }

  async upsertSmsConfigs(configs: any[]) {
    // Delete missing configs
    const currentIds = configs.filter(c => c.id && !c.id.startsWith('new_')).map(c => c.id);
    await this.prisma.smsConfig.deleteMany({
      where: { id: { notIn: currentIds } },
    });

    const results = [];
    for (const config of configs) {
      if (config.id && !config.id.startsWith('new_')) {
        results.push(
          await this.prisma.smsConfig.update({
            where: { id: config.id },
            data: {
              isActive: config.isActive,
              priority: config.priority,
              dailyLimit: config.dailyLimit,
              config: config.config,
            },
          })
        );
      } else {
        results.push(
          await this.prisma.smsConfig.create({
            data: {
              providerName: config.providerName,
              isActive: config.isActive,
              priority: config.priority,
              dailyLimit: config.dailyLimit,
              config: config.config,
            },
          })
        );
      }
    }
    return results;
  }

  async sendSms(phone: string, message: string) {
    const activeConfigs = await this.prisma.smsConfig.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' },
    });

    if (activeConfigs.length === 0) {
      this.logger.warn('No active SMS providers configured. Logging to console instead.');
      this.logger.log(`\n\n[MOCK SMS]\nTo: ${phone}\nMessage: ${message}\n\n`);
      return { success: true, provider: 'Local Console Mock' };
    }

    let lastError = null;
    for (const provider of activeConfigs) {
      try {
        const result = await this.dispatchSms(provider, phone, message);
        return { success: true, provider: provider.providerName, result };
      } catch (error: any) {
        lastError = error;
      }
    }
    throw new Error(`All SMS providers failed. Last error: ${(lastError as any)?.message}`);
  }

  async sendTestSms(phone: string, message: string) {
    const activeConfigs = await this.prisma.smsConfig.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' },
    });

    if (activeConfigs.length === 0) {
      throw new Error('No active SMS providers configured');
    }

    let lastError = null;

    for (const provider of activeConfigs) {
      try {
        this.logger.log(`Attempting to send SMS via ${provider.providerName}`);
        const result = await this.dispatchSms(provider, phone, message);
        return { success: true, provider: provider.providerName, result };
      } catch (error: any) {
        this.logger.error(`Failed to send SMS via ${provider.providerName}: ${error.message}`);
        lastError = error;
      }
    }

    throw new Error(`All SMS providers failed. Last error: ${(lastError as any)?.message}`);
  }

  private async dispatchSms(provider: any, phone: string, message: string) {
    // const config = provider.config as any;

    switch (provider.providerName) {
      case 'Local Console':
        this.logger.log(`\n\n[LOCAL CONSOLE SMS]\nTo: ${phone}\nMessage: ${message}\n\n`);
        return { messageId: `mock-sms-${Date.now()}` };

      case 'Twilio':
        // Mock Twilio send
        this.logger.log(`Sending via Twilio to ${phone}...`);
        return { messageId: `twilio-${Date.now()}` };
        
      case 'MessageBird':
        this.logger.log(`Sending via MessageBird to ${phone}...`);
        return { messageId: `messagebird-${Date.now()}` };

      default:
        this.logger.log(`Mocking SMS send for ${provider.providerName}`);
        return { messageId: 'mock-sms-id' };
    }
  }

  async getTemplates() {
    return this.prisma.notificationTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async upsertTemplate(data: any) {
    if (data.id) {
      return this.prisma.notificationTemplate.update({
        where: { id: data.id },
        data: {
          eventName: data.eventName,
          channel: data.channel,
          subject: data.subject,
          body: data.body,
          isActive: data.isActive
        }
      });
    } else {
      return this.prisma.notificationTemplate.create({
        data: {
          eventName: data.eventName,
          channel: data.channel,
          subject: data.subject,
          body: data.body,
          isActive: data.isActive ?? true
        }
      });
    }
  }
}
