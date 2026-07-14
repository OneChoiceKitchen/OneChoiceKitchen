import { BrandingController } from './branding.controller';
import type { BrandingService } from './branding.service';

describe('BrandingController', () => {
  it('delegates the public response to BrandingService', async () => {
    const response = {
      siteName: 'One Choice Kitchen',
      logoUrl: null,
      faviconUrl: null,
      colors: {
        primary: '#2563EB',
        secondary: '#DC2626',
        background: '#f3f4f8',
        text: '#0f172a',
      },
    };
    const brandingService = {
      getBranding: jest.fn().mockResolvedValue(response),
    } as unknown as BrandingService;
    const controller = new BrandingController(brandingService);

    await expect(controller.getBranding()).resolves.toEqual(response);
    expect(brandingService.getBranding).toHaveBeenCalledTimes(1);
  });
});
