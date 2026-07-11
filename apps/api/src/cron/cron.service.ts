import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private prisma: PrismaService) {}

  // Run every night at midnight to generate Delivery Schedules
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyDeliveryGeneration() {
    this.logger.debug('Generating daily delivery schedules for active subscriptions...');
    
    const activeSubscriptions = await this.prisma.customerSubscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      },
      include: { plan: true }
    });

    let count = 0;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    for (const sub of activeSubscriptions) {
      // Create a schedule for tomorrow
      await this.prisma.deliverySchedule.create({
        data: {
          subscriptionId: sub.id,
          date: tomorrow,
          mealType: sub.plan.mealType,
          status: 'PENDING'
        }
      });
      count++;
    }
    
    this.logger.debug(`Successfully generated ${count} delivery schedules for tomorrow.`);
  }

  // Run weekly to generate billing invoices
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyInvoicing() {
    this.logger.debug('Running weekly invoicing check...');
    // Billing logic here...
  }
}
