import { render, screen } from '@testing-library/react';

import {
  BrandProvider,
  DEFAULT_BRANDING,
  initializeBranding,
  useBrand,
  type BrandingResponse,
} from './brand-provider';

const API_BRAND: BrandingResponse = {
  siteName: 'Hospitality Cloud',
  logoUrl: '/assets/logo.svg',
  faviconUrl: '/assets/favicon.svg',
  colors: {
    primary: '#112233',
    secondary: '#445566',
    background: '#f7f7f7',
    text: '#111111',
  },
};

function responseWith(data: unknown): Response {
  return { ok: true, status: 200, json: async () => data } as Response;
}

function BrandConsumer() {
  const { brand, status } = useBrand();
  return <div>{`${status}:${brand.siteName}`}</div>;
}

describe('BrandProvider', () => {
  it('applies API branding before rendering children', async () => {
    const fetcher = jest.fn().mockResolvedValue(responseWith(API_BRAND));
    render(
      <BrandProvider
        fetcher={fetcher as typeof fetch}
        portalName="Partner Portal"
      >
        <BrandConsumer />
      </BrandProvider>,
    );

    expect(await screen.findByText('ready:Hospitality Cloud')).toBeTruthy();
    expect(
      document.documentElement.style.getPropertyValue('--theme-primary'),
    ).toBe('#112233');
    expect(document.title).toBe('Partner Portal | Hospitality Cloud');
  });
  it('uses the default theme when the endpoint fails', async () => {
    const fetcher = jest
      .fn()
      .mockRejectedValue(new Error('network unavailable'));
    render(
      <BrandProvider fetcher={fetcher as typeof fetch}>
        <BrandConsumer />
      </BrandProvider>,
    );

    expect(
      await screen.findByText(`fallback:${DEFAULT_BRANDING.siteName}`),
    ).toBeTruthy();
    expect(
      document.documentElement.style.getPropertyValue('--theme-primary'),
    ).toBe(DEFAULT_BRANDING.colors.primary);
  });

  it('supports awaitable initialization before createRoot or hydration', async () => {
    const fetcher = jest.fn().mockResolvedValue(responseWith(API_BRAND));
    await initializeBranding({ fetcher: fetcher as typeof fetch });

    expect(document.title).toBe('Hospitality Cloud');
    expect(
      document.documentElement.style.getPropertyValue('--theme-background'),
    ).toBe('#f7f7f7');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('style');
    document.querySelector("link[data-dynamic-brand-favicon='true']")?.remove();
    document.title = '';
  });
});
