import { Injectable } from '@nestjs/common';

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
  constructor(private readonly prisma: PrismaService) {}

  async getBranding(): Promise<BrandingResponseDto> {
    const settings = await this.prisma.systemSettings.findFirst({
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
        primary: settings.primaryColor || DEFAULT_BRANDING.colors.primary,
        secondary: settings.secondaryColor || DEFAULT_BRANDING.colors.secondary,
        background: settings.backgroundColor || DEFAULT_BRANDING.colors.background,
        text: settings.textColor || DEFAULT_BRANDING.colors.text,
      },
    };
  }

  private optionalValue(value: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }
}
