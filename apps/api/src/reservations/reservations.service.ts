import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private whatsappService: WhatsappService
  ) {}

  async create(userId: string, data: any) {
    // 1. Check availability
    if (data.date && data.timeSlot && data.partySize && data.restaurantId) {
      const isAvailable = await this.checkAvailability(data.restaurantId, data.date, data.timeSlot, data.partySize, data.branchId);
      if (!isAvailable) {
        throw new Error('No tables available for the selected time and party size.');
      }
    }

    const confirmationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Create reservation
    const reservation = await this.prisma.tableReservation.create({
      data: { 
        userId, 
        confirmationCode, 
        depositStatus: data.depositAmount ? 'PAID' : 'PENDING',
        ...data 
      },
      include: {
        user: true,
        restaurant: true,
        branch: true
      }
    });

    // Fire notifications asynchronously
    this.notifyParties(reservation).catch(err => {
      this.logger.error(`Failed to send reservation notifications: ${err?.message}`);
    });

    return reservation;
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

  private async notifyParties(reservation: any) {
    const { user, restaurant, branch, confirmationCode, date, timeSlot, partySize } = reservation;
    const formattedDate = new Date(date).toLocaleDateString();

    const customerMsg = `Hello ${user.name},\n\nYour table at ${restaurant.name} (${branch?.name || 'Main'}) is confirmed!\nDate: ${formattedDate}\nTime: ${timeSlot}\nParty Size: ${partySize}\nConfirmation Code: ${confirmationCode}\n\nThank you for choosing us!`;
    const adminMsg = `New Table Reservation!\n\nCustomer: ${user.name} (${user.phone})\nRestaurant: ${restaurant.name} (${branch?.name || 'Main'})\nDate: ${formattedDate}\nTime: ${timeSlot}\nParty Size: ${partySize}\nConfirmation Code: ${confirmationCode}`;

    const templateData = {
      customerName: user.name,
      customerPhone: user.phone || user.mobile,
      restaurantName: restaurant.name,
      branchName: branch?.name || 'Main',
      date: formattedDate,
      timeSlot: timeSlot,
      partySize: partySize,
      confirmationCode: confirmationCode
    };

    const custEmail = await this.getParsedTemplate('RESERVATION_CUSTOMER_EMAIL', templateData, customerMsg, 'Table Reservation Confirmed!');
    const custWa = await this.getParsedTemplate('RESERVATION_CUSTOMER_WA', templateData, customerMsg, '');
    const adminEmail = await this.getParsedTemplate('RESERVATION_ADMIN_EMAIL', templateData, adminMsg, 'New Table Reservation - Action Required');
    const adminWa = await this.getParsedTemplate('RESERVATION_ADMIN_WA', templateData, adminMsg, '');

    // 1. Notify Customer
    if (user.email) {
      await this.notificationsService.sendEmail(user.email, custEmail.subject, custEmail.body);
    }
    if (user.phone || user.mobile) {
      const phone = user.phone || user.mobile;
      await this.whatsappService.sendMessage(phone, custWa.body);
      await this.notificationsService.sendSms(phone, custWa.body);
    }

    // 2. Notify Admins
    // Find admins for this branch and super admins
    const admins = await this.prisma.user.findMany({
      where: {
        OR: [
          { role: { name: 'SUPER_ADMIN' } },
          { role: { name: 'RESTAURANT_ADMIN' }, restaurantId: restaurant?.id }
        ],
        isActive: true
      }
    });

    for (const admin of admins) {
      if (admin.email) {
        await this.notificationsService.sendEmail(admin.email, adminEmail.subject, adminEmail.body);
      }
      if (admin.mobile) {
        await this.whatsappService.sendMessage(admin.mobile, adminWa.body);
      }
    }
  }

  async checkAvailability(restaurantId: string, date: string, timeSlot: string, partySize: number, branchId?: string) {
    // Basic logic: find tables that match the party size
    const tables = await this.prisma.restaurantTable.findMany({
      where: {
        restaurantId,
        ...(branchId ? { branchId } : {}),
        capacity: { gte: partySize },
        isAvailable: true,
      }
    });

    if (tables.length === 0) return false;

    // Check overlapping reservations
    const reservations = await this.prisma.tableReservation.findMany({
      where: {
        restaurantId,
        ...(branchId ? { branchId } : {}),
        date: new Date(date),
        timeSlot,
        status: { in: ['PENDING', 'CONFIRMED', 'SEATED'] }
      }
    });

    // If we have more free tables than reservations, we are good
    return tables.length > reservations.length;
  }

  async checkIn(confirmationCode: string, qrCodeUrl?: string) {
    const reservation = await this.prisma.tableReservation.findUnique({
      where: { confirmationCode },
      include: { table: true }
    });

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    // If QR code is provided, verify it matches the table
    if (qrCodeUrl && reservation.table && reservation.table.qrCodeUrl !== qrCodeUrl) {
      throw new Error('Invalid QR code for this table');
    }

    return this.prisma.tableReservation.update({
      where: { id: reservation.id },
      data: { status: 'SEATED' }
    });
  }

  findUserReservations(userId: string) {
    return this.prisma.tableReservation.findMany({ where: { userId } });
  }

  findRestaurantReservations(restaurantId: string, date?: string) {
    return this.prisma.tableReservation.findMany({
      where: {
        restaurantId,
        ...(date ? { date: { gte: new Date(date), lt: new Date(new Date(date).getTime() + 86400000) } } : {}),
      },
    });
  }

  updateStatus(id: string, status: string, tableNumber?: string) {
    return this.prisma.tableReservation.update({
      where: { id },
      data: { status, ...(tableNumber ? { tableNumber } : {}) },
    });
  }

  findAll(filters?: any) {
    const { page = 1, limit = 20, ...where } = filters || {};
    return this.prisma.tableReservation.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
