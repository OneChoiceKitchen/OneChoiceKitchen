'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export interface BrandColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface BrandingResponse {
  siteName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  colors: BrandColors;
}

export const DEFAULT_BRANDING: BrandingResponse = Object.freeze({
  siteName: 'One Choice Kitchen',
  logoUrl: '/branding/transparent-logo.png',
  faviconUrl: '/favicon.ico',
  colors: Object.freeze({
    primary: '#2563EB',
    secondary: '#DC2626',
    background: '#f3f4f8',
    text: '#0f172a',
  }),
});

export type BrandLoadStatus = 'loading' | 'ready' | 'fallback';

export interface BrandContextValue {
  brand: BrandingResponse;
  status: BrandLoadStatus;
  refresh: () => Promise<void>;
}

export interface BrandProviderProps {
  children: ReactNode;
  endpoint?: string;
  portalName?: string;
  fallback?: BrandingResponse;
  loadingFallback?: ReactNode;
  fetcher?: typeof fetch;
}

const BrandContext = createContext<BrandContextValue | null>(null);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function normalizeBranding(
  value: unknown,
  fallback: BrandingResponse = DEFAULT_BRANDING,
): BrandingResponse {
  if (!value || typeof value !== 'object') return fallback;

  const candidate = value as Partial<BrandingResponse>;
  const colors = candidate.colors ?? ({} as Partial<BrandColors>);

  return {
    siteName: isNonEmptyString(candidate.siteName)
      ? candidate.siteName
      : fallback.siteName,
    logoUrl:
      candidate.logoUrl === null || isNonEmptyString(candidate.logoUrl)
        ? candidate.logoUrl
        : fallback.logoUrl,
    faviconUrl:
      candidate.faviconUrl === null || isNonEmptyString(candidate.faviconUrl)
        ? candidate.faviconUrl
        : fallback.faviconUrl,
    colors: {
      primary: isNonEmptyString(colors.primary)
        ? colors.primary
        : fallback.colors.primary,
      secondary: isNonEmptyString(colors.secondary)
        ? colors.secondary
        : fallback.colors.secondary,
      background: isNonEmptyString(colors.background)
        ? colors.background
        : fallback.colors.background,
      text: isNonEmptyString(colors.text) ? colors.text : fallback.colors.text,
    },
  };
}

export function applyBrandingToDocument(
  brand: BrandingResponse,
  portalName?: string,
  targetDocument: Document | undefined = typeof document === 'undefined'
    ? undefined
    : document,
): void {
  if (!targetDocument) return;

  const rootStyle = targetDocument.documentElement.style;
  rootStyle.setProperty('--theme-primary', brand.colors.primary);
  rootStyle.setProperty('--theme-secondary', brand.colors.secondary);
  rootStyle.setProperty('--theme-background', brand.colors.background);
  rootStyle.setProperty('--theme-text', brand.colors.text);

  // Existing portal styles continue to work while they migrate to theme tokens.
  rootStyle.setProperty('--brand-blue', brand.colors.primary);
  rootStyle.setProperty('--brand-red', brand.colors.secondary);
  rootStyle.setProperty('--bg', brand.colors.background);
  rootStyle.setProperty('--text', brand.colors.text);

  targetDocument.title = portalName
    ? `${portalName} | ${brand.siteName}`
    : brand.siteName;

  if (brand.faviconUrl) {
    let favicon = targetDocument.querySelector<HTMLLinkElement>(
      "link[data-dynamic-brand-favicon='true']",
    );
    if (!favicon) {
      favicon = targetDocument.createElement('link');
      favicon.rel = 'icon';
      favicon.dataset.dynamicBrandFavicon = 'true';
      targetDocument.head.appendChild(favicon);
    }
    favicon.href = brand.faviconUrl;
  }
}

export async function fetchBranding(
  endpoint = '/api/v1/branding',
  fetcher: typeof fetch = fetch,
  fallback: BrandingResponse = DEFAULT_BRANDING,
  signal?: AbortSignal,
): Promise<{ brand: BrandingResponse; usedFallback: boolean }> {
  try {
    const response = await fetcher(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });
    if (!response.ok) {
      throw new Error(`Branding request failed: ${response.status}`);
    }

    return {
      brand: normalizeBranding(await response.json(), fallback),
      usedFallback: false,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError')
      throw error;
    return { brand: fallback, usedFallback: true };
  }
}

export async function initializeBranding(options?: {
  endpoint?: string;
  portalName?: string;
  fallback?: BrandingResponse;
  fetcher?: typeof fetch;
}): Promise<BrandingResponse> {
  const fallback = options?.fallback ?? DEFAULT_BRANDING;
  const result = await fetchBranding(
    options?.endpoint,
    options?.fetcher,
    fallback,
  );
  applyBrandingToDocument(result.brand, options?.portalName);
  return result.brand;
}

export function BrandProvider({
  children,
  endpoint = '/api/v1/branding',
  portalName,
  fallback = DEFAULT_BRANDING,
  loadingFallback = null,
  fetcher,
}: BrandProviderProps) {
  const [brand, setBrand] = useState<BrandingResponse>(fallback);
  const [status, setStatus] = useState<BrandLoadStatus>('loading');

  const refresh = useCallback(async (): Promise<void> => {
    setStatus('loading');
    const result = await fetchBranding(endpoint, fetcher, fallback);
    applyBrandingToDocument(result.brand, portalName);
    setBrand(result.brand);
    setStatus(result.usedFallback ? 'fallback' : 'ready');
  }, [endpoint, fallback, fetcher, portalName]);

  useEffect(() => {
    const controller = new AbortController();

    void fetchBranding(endpoint, fetcher, fallback, controller.signal).then(
      (result) => {
        if (controller.signal.aborted) return;
        applyBrandingToDocument(result.brand, portalName);
        setBrand(result.brand);
        setStatus(result.usedFallback ? 'fallback' : 'ready');
      },
    );

    return () => controller.abort();
  }, [endpoint, fallback, fetcher, portalName]);

  const value = useMemo<BrandContextValue>(
    () => ({ brand, status, refresh }),
    [brand, refresh, status],
  );

  return (
    <BrandContext.Provider value={value}>
      {status === 'loading' ? loadingFallback : children}
    </BrandContext.Provider>
  );
}

export function useBrand(): BrandContextValue {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider.');
  }
  return context;
}
