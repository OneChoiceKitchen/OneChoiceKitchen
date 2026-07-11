import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SeoService {
  constructor(private prisma: PrismaService) {}

  // --- SYSTEM SETTINGS ---
  async getSystemSettings() {
    let settings = await this.prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await this.prisma.systemSettings.create({
        data: {
          siteName: 'One Choice Kitchen',
          tagline: 'Online Home-Style Food, Tiffin & Meal Services',
        },
      });
    }
    return settings;
  }

  async updateSystemSettings(data: any) {
    const settings = await this.getSystemSettings();
    const { id, createdAt, updatedAt, ...updateData } = data;
    return this.prisma.systemSettings.update({
      where: { id: settings.id },
      data: updateData,
    });
  }

  // --- SEO METADATA ---
  async getAllSeoMetadata() {
    return this.prisma.seoMetadata.findMany();
  }

  async getSeoByPage(pageName: string) {
    let seo = await this.prisma.seoMetadata.findUnique({
      where: { pageName },
    });
    
    if (!seo) {
      seo = await this.prisma.seoMetadata.create({
        data: {
          pageName,
          title: `One Choice Kitchen | ${pageName}`,
        },
      });
    }
    return seo;
  }

  async updateSeoMetadata(pageName: string, data: any) {
    const seo = await this.prisma.seoMetadata.findUnique({
      where: { pageName },
    });
    const { id, createdAt, updatedAt, ...updateData } = data;
    if (!seo) {
      return this.prisma.seoMetadata.create({
        data: { ...updateData, pageName },
      });
    }
    return this.prisma.seoMetadata.update({
      where: { id: seo.id },
      data: updateData,
    });
  }
}
