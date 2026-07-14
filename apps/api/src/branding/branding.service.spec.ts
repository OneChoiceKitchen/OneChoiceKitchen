import { BrandingService, DEFAULT_BRANDING } from './branding.service';

describe('BrandingService', () => {
  const findFirst = jest.fn();
  const prisma = { systemSettings: { findFirst } };
  let service: BrandingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BrandingService(prisma as never);
  });

  it('returns only the public branding contract', async () => {
    findFirst.mockResolvedValue({
      siteName: ' One Choice Enterprise ',
      logoUrl: ' /logo.svg ',
      faviconUrl: '',
      primaryColor: '#111111',
      secondaryColor: '#222222',
      backgroundColor: '#333333',
      textColor: '#444444',
      contactEmail: 'must-not-leak@example.com',
    });

    await expect(service.getBranding()).resolves.toEqual({
      siteName: 'One Choice Enterprise',
      logoUrl: '/logo.svg',
      faviconUrl: null,
      colors: {
        primary: '#111111',
        secondary: '#222222',
        background: '#333333',
        text: '#444444',
      },
    });
    expect(findFirst).toHaveBeenCalledWith({
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
  });

  it('returns safe defaults without creating settings when no row exists', async () => {
    findFirst.mockResolvedValue(null);

    await expect(service.getBranding()).resolves.toEqual(DEFAULT_BRANDING);
  });

  it('rejects malformed CSS color settings', async () => {
    findFirst.mockResolvedValue({
      siteName: 'One Choice Kitchen',
      logoUrl: null,
      faviconUrl: null,
      primaryColor: 'red; background: url(javascript:alert(1))',
      secondaryColor: '  #abc  ',
      backgroundColor: '#123456',
      textColor: '#12345',
    });

    await expect(service.getBranding()).resolves.toEqual(
      expect.objectContaining({
        colors: {
          primary: DEFAULT_BRANDING.colors.primary,
          secondary: '#abc',
          background: '#123456',
          text: DEFAULT_BRANDING.colors.text,
        },
      }),
    );
  });

  it('serves legacy branding while color columns are being migrated', async () => {
    findFirst
      .mockRejectedValueOnce(new Error('missing primaryColor column'))
      .mockResolvedValueOnce({
        siteName: 'Legacy Brand',
        logoUrl: '/legacy-logo.svg',
        faviconUrl: '/legacy.ico',
      });

    await expect(service.getBranding()).resolves.toEqual({
      siteName: 'Legacy Brand',
      logoUrl: '/legacy-logo.svg',
      faviconUrl: '/legacy.ico',
      colors: { ...DEFAULT_BRANDING.colors },
    });
  });
});
