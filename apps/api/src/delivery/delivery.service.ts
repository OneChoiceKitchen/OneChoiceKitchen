import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeliveryService {

  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.deliverySetting.findFirst();
    
    if (!settings) {
      settings = await this.prisma.deliverySetting.create({
        data: {
          restaurantAddress: "One Choice Kitchen, Patna",
          restaurantLat: 25.5941,
          restaurantLng: 85.1376,
          enableDistanceCharges: true,
          freeDeliveryDistance: 3.0,
          perKmCharge: 8.0,
          minimumDeliveryCharge: 0.0,
          enableDistanceMargin: false,
          distanceMarginValue: 0.0,
          applyMarginBeforeCharge: true,
        }
      });
    }
    
    return settings;
  }

  async updateSettings(data: any) {
    const existing = await this.prisma.deliverySetting.findFirst();
    
    if (existing) {
      return this.prisma.deliverySetting.update({ where: { id: existing.id }, data });
    } else {
      return this.prisma.deliverySetting.create({ data });
    }
  }

  // ── Surge Pricing ──────────────────────────────────────────────────────

  getSurgePricingRules() {
    return this.prisma.surgePricing.findMany({ orderBy: { createdAt: 'desc' } });
  }

  createSurgePricingRule(data: any) {
    return this.prisma.surgePricing.create({ data });
  }

  updateSurgePricingRule(id: string, data: any) {
    return this.prisma.surgePricing.update({ where: { id }, data });
  }

  deleteSurgePricingRule(id: string) {
    return this.prisma.surgePricing.delete({ where: { id } });
  }

  async getActiveSurgeMultiplier(zone?: string): Promise<number> {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7; // 1=Mon, 7=Sun
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const rules = await this.prisma.surgePricing.findMany({ where: { isActive: true } });
    for (const rule of rules) {
      const days = rule.daysOfWeek.split(',').map(Number);
      if (!days.includes(dayOfWeek)) continue;
      if (timeStr < rule.startTime || timeStr > rule.endTime) continue;
      if (zone && rule.zone && !rule.zone.toLowerCase().includes(zone.toLowerCase())) continue;
      return rule.multiplier;
    }
    return 1.0;
  }

  // ── SLA Configuration ──────────────────────────────────────────────────

  getSlaConfigs() {
    return this.prisma.sLAConfig.findMany({ orderBy: { createdAt: 'desc' } });
  }

  upsertSlaConfig(data: any) {
    const { priority, ...rest } = data;
    return this.prisma.sLAConfig.upsert({
      where: { priority },
      update: rest,
      create: { priority, ...rest },
    });
  }

  deleteSlaConfig(id: string) {
    return this.prisma.sLAConfig.delete({ where: { id } });
  }
}
