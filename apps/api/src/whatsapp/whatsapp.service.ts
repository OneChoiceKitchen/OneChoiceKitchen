import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private prisma: PrismaService) {}

  getConfigs() {
    return this.prisma.whatsappConfig.findMany({ orderBy: { priority: 'asc' } });
  }

  upsertConfig(data: any) {
    const { providerName, ...rest } = data;
    return this.prisma.whatsappConfig.upsert({
      where: { providerName },
      update: rest,
      create: { providerName, ...rest },
    });
  }

  deleteConfig(id: string) {
    return this.prisma.whatsappConfig.delete({ where: { id } });
  }

  async sendMessage(to: string, message: string): Promise<{ success: boolean; provider: string }> {
    const configs = await this.prisma.whatsappConfig.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' },
    });

    if (!configs.length) {
      this.logger.warn('No active WhatsApp config found. Logging to console instead.');
      this.logger.log(`\n\n[MOCK WHATSAPP]\nTo: ${to}\nMessage: ${message}\n\n`);
      return { success: true, provider: 'Local Console Mock' };
    }
    const config = configs[0];

    try {
      if (config.providerName === 'META_CLOUD') {
        await fetch(
          `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.accessToken}` },
            body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: message } }),
          },
        );
      } else if (config.providerName === 'TWILIO') {
        const creds = Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64');
        await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${creds}` },
            body: new URLSearchParams({ To: `whatsapp:${to}`, From: config.fromNumber || '', Body: message }),
          },
        );
      } else if (config.providerName === 'MSG91') {
        await fetch('https://control.msg91.com/api/v5/flow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', authkey: config.apiKey || '' },
          body: JSON.stringify({ template_id: config.senderId, recipients: [{ mobiles: to, message }] }),
        });
      }
      this.logger.log(`WhatsApp message sent via ${config.providerName} to ${to}`);
      return { success: true, provider: config.providerName };
    } catch (err: any) {
      this.logger.error(`WhatsApp send failed: ${err?.message}`);
      return { success: false, provider: config.providerName };
    }
  }

  sendOtp(to: string, otp: string) {
    return this.sendMessage(to, `Your OneChoiceKitchen OTP is: ${otp}. Valid for 10 minutes. Do not share it with anyone.`);
  }
}
