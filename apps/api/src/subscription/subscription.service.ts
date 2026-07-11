import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private whatsappService: WhatsappService
  ) {}

  async findAllPlans() {
    return this.prisma.subscriptionPlan.findMany();
  }

  async getCustomerSubscriptions(userId: string) {
    return this.prisma.customerSubscription.findMany({
      where: { userId },
      include: {
        plan: true,
        schedules: {
          orderBy: { date: 'asc' },
        },
      },
    });
  }

  async bookSubscription(userId: string, data: any) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: data.planId } });
    if (!plan) throw new Error("Plan not found");

    // Mock distance calculation logic (In real app, call GeolocationService)
    const distanceKm = 4.5;
    let deliveryFee = 0;
    if (distanceKm > 3) {
      deliveryFee = (distanceKm - 3) * 8; // Rs 8 per extra KM
    }

    const subscription = await this.prisma.customerSubscription.create({
      data: {
        userId,
        planId: plan.id,
        startDate: new Date(data.startDate),
        endDate: new Date(new Date(data.startDate).getTime() + (plan.durationDays * 24 * 60 * 60 * 1000)),
        deliveryLat: data.deliveryLat,
        deliveryLng: data.deliveryLng,
        deliveryFee: deliveryFee,
        packagingFee: data.needsPackaging ? 15 * plan.durationDays : 0,
      },
      include: {
        user: true,
        plan: true
      }
    });

    this.notifyParties(subscription).catch(err => {
      this.logger.error(`Failed to send tiffin notifications: ${err?.message}`);
    });

    return subscription;
  }

  private async getParsedTemplate(eventName: string, data: any, defaultMsg: string, defaultSubject = '') {
    const template = await this.prisma.notificationTemplate.findUnique({ where: { eventName } });
    if (!template || !template.isActive) return { subject: defaultSubject, body: defaultMsg };

    let body = template.body;
    let subject = template.subject || defaultSubject;

    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      body = body.replace(regex, String(value || ''));
      subject = subject.replace(regex, String(value || ''));
    }
    return { subject, body };
  }

  private async notifyParties(sub: any) {
    const { user, plan, startDate } = sub;
    const formattedDate = new Date(startDate).toLocaleDateString();
    
    const customerMsg = `Hello ${user.name},\n\nYour Tiffin Subscription (${plan.name}) is confirmed!\nStarts: ${formattedDate}\n\nThank you for choosing One Choice Kitchen!`;
    const adminMsg = `New Tiffin Subscription!\n\nCustomer: ${user.name} (${user.mobile || user.phone})\nPlan: ${plan.name}\nStarts: ${formattedDate}`;

    const templateData = {
      customerName: user.name,
      customerPhone: user.mobile || user.phone || '',
      planName: plan.name,
      startDate: formattedDate
    };

    const custEmail = await this.getParsedTemplate('TIFFIN_CUSTOMER_EMAIL', templateData, customerMsg, 'Tiffin Subscription Confirmed!');
    const custWa = await this.getParsedTemplate('TIFFIN_CUSTOMER_WA', templateData, customerMsg, '');
    const adminEmail = await this.getParsedTemplate('TIFFIN_ADMIN_EMAIL', templateData, adminMsg, 'New Tiffin Subscription');
    const adminWa = await this.getParsedTemplate('TIFFIN_ADMIN_WA', templateData, adminMsg, '');

    // 1. Notify Customer
    if (user.email) await this.notificationsService.sendEmail(user.email, custEmail.subject, custEmail.body);
    if (user.mobile || user.phone) {
      const phone = user.mobile || user.phone;
      await this.whatsappService.sendMessage(phone, custWa.body);
      await this.notificationsService.sendSms(phone, custWa.body);
    }

    // 2. Notify Admins
    const admins = await this.prisma.user.findMany({
      where: {
        OR: [
          { role: { name: 'SUPER_ADMIN' } },
          { role: { name: 'RESTAURANT_ADMIN' } } // Can specify restaurantId if needed later
        ],
        isActive: true
      }
    });

    for (const admin of admins) {
      if (admin.email) await this.notificationsService.sendEmail(admin.email, adminEmail.subject, adminEmail.body);
      if (admin.mobile) await this.whatsappService.sendMessage(admin.mobile, adminWa.body);
    }
  }
}
