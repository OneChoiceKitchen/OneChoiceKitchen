import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import type { BrandingResponseDto } from './branding.dto';

export const DEFAULT_BRANDING: Readonly<BrandingResponseDto> = Object.freeze({
  siteName: 'One Choice Kitchen',
  logoUrl: null,
  faviconUrl: null,
  colors: Object.freeze({
    primary: '#2563EB',
    secondary: '#DC2626',
    background: '#f3f4f8',
    text: '#0f172a',
  }),
});

@Injectable()
export class BrandingService {
  private readonly logger = new Logger(BrandingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getBranding(): Promise<BrandingResponseDto> {
    let settings: {
      siteName: string;
      logoUrl: string | null;
      faviconUrl: string | null;
      primaryColor: string;
      secondaryColor: string;
      backgroundColor: string;
      textColor: string;
    } | null;
    try {
      settings = await this.prisma.systemSettings.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: {
          siteName: true,
          logoUrl: true,
          faviconUrl: true,
          primaryColor: true,
          secondaryColor: true,
          backgroundColor: true,
          textColor: true,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Brand color settings are unavailable; serving legacy branding defaults: ${
          error instanceof Error ? error.message : 'unknown database error'
        }`,
      );
      return this.getLegacyBranding();
    }

    if (!settings) {
      return {
        ...DEFAULT_BRANDING,
        colors: { ...DEFAULT_BRANDING.colors },
      };
    }

    return {
      siteName: settings.siteName.trim() || DEFAULT_BRANDING.siteName,
      logoUrl: this.optionalValue(settings.logoUrl),
      faviconUrl: this.optionalValue(settings.faviconUrl),
      colors: {
        primary: this.colorValue(settings.primaryColor, DEFAULT_BRANDING.colors.primary),
        secondary: this.colorValue(
          settings.secondaryColor,
          DEFAULT_BRANDING.colors.secondary,
        ),
        background: this.colorValue(
          settings.backgroundColor,
          DEFAULT_BRANDING.colors.background,
        ),
        text: this.colorValue(settings.textColor, DEFAULT_BRANDING.colors.text),
      },
    };
  }

  private async getLegacyBranding(): Promise<BrandingResponseDto> {
    try {
      const settings = await this.prisma.systemSettings.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { siteName: true, logoUrl: true, faviconUrl: true },
      });
      if (settings) {
        return {
          siteName: settings.siteName.trim() || DEFAULT_BRANDING.siteName,
          logoUrl: this.optionalValue(settings.logoUrl),
          faviconUrl: this.optionalValue(settings.faviconUrl),
          colors: { ...DEFAULT_BRANDING.colors },
        };
      }
    } catch {
      // The public bootstrap endpoint must remain available during a DB outage.
    }

    return { ...DEFAULT_BRANDING, colors: { ...DEFAULT_BRANDING.colors } };
  }

  private optionalValue(value: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private colorValue(value: string, fallback: string): string {
    const normalized = value.trim();
    return /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(normalized)
      ? normalized
      : fallback;
  }
}
