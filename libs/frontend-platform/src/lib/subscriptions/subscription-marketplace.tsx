'use client';

import { CreditCard, Lock, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { apiClient } from '../api/api-client';
import { authStore } from '../auth/auth-store';
import type { EntitlementLevel } from '../auth/user-context.types';
import { PreviewGuard } from '../entitlements/preview-guard';

export interface ModuleCatalogItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface TenantEntitlementSummary {
  moduleId: string;
  moduleCode?: string;
  accessLevel: EntitlementLevel;
  isPreview?: boolean;
}

export interface SubscriptionApprovalResponse {
  id: string;
  status?: string;
  referenceId?: string;
}

export interface MarketplaceClient {
  get<T>(url: string): Promise<{ data: T }>;
  post<T>(url: string, body?: unknown): Promise<{ data: T }>;
}

export interface MarketplaceEndpoints {
  modules: string;
  entitlements: string;
  subscriptionApproval: string;
}

export interface CheckoutResult {
  paymentReference: string;
}

export interface SubscriptionMarketplaceProps {
  client?: MarketplaceClient;
  endpoints?: Partial<MarketplaceEndpoints>;
  onCheckout?: (module: ModuleCatalogItem) => Promise<CheckoutResult>;
  previewSlot?: ReactNode;
}

const DEFAULT_ENDPOINTS: MarketplaceEndpoints = {
  modules: '/module-catalog',
  entitlements: '/tenant-entitlements',
  subscriptionApproval: '/approval-cases/subscription',
};

function normalizeModules(
  data: ModuleCatalogItem[] | { items?: ModuleCatalogItem[] },
) {
  const modules = Array.isArray(data) ? data : (data.items ?? []);
  return [...modules].sort(
    (a, b) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name),
  );
}

function normalizeEntitlements(
  data: TenantEntitlementSummary[] | { items?: TenantEntitlementSummary[] },
) {
  return Array.isArray(data) ? data : (data.items ?? []);
}

function entitlementKey(module: ModuleCatalogItem): string[] {
  return [module.id, module.code].filter(Boolean);
}

function isLocked(level: EntitlementLevel): boolean {
  return level === 'PREVIEW';
}

async function defaultCheckout(
  module: ModuleCatalogItem,
): Promise<CheckoutResult> {
  return { paymentReference: `stub-checkout-${module.id}` };
}

const shellStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--sp-4)',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--sp-4)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
};

const cardStyle: CSSProperties = {
  background: 'var(--surf)',
  border: '1px solid var(--bdr)',
  borderRadius: 'var(--r-md)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--sp-3)',
  padding: 'var(--sp-4)',
};

const buttonStyle: CSSProperties = {
  alignItems: 'center',
  border: 0,
  borderRadius: 'var(--r-sm)',
  cursor: 'pointer',
  display: 'inline-flex',
  font: 'inherit',
  fontWeight: 700,
  gap: '0.45rem',
  justifyContent: 'center',
  minHeight: 40,
  padding: '0.55rem 0.8rem',
};

const secondaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: 'var(--surf)',
  border: '1px solid var(--bdr)',
  color: 'var(--text)',
};

const primaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: 'var(--brand-blue)',
  color: 'var(--surf)',
};

export function SubscriptionMarketplace({
  client = apiClient,
  endpoints,
  onCheckout = defaultCheckout,
  previewSlot,
}: SubscriptionMarketplaceProps) {
  const resolvedEndpoints = useMemo(
    () => ({ ...DEFAULT_ENDPOINTS, ...endpoints }),
    [endpoints],
  );
  const [modules, setModules] = useState<ModuleCatalogItem[]>([]);
  const [entitlements, setEntitlements] = useState<
    Record<string, EntitlementLevel>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribingModuleId, setSubscribingModuleId] = useState<string | null>(
    null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [modulesResponse, entitlementsResponse] = await Promise.all([
        client.get<ModuleCatalogItem[] | { items?: ModuleCatalogItem[] }>(
          resolvedEndpoints.modules,
        ),
        client.get<
          TenantEntitlementSummary[] | { items?: TenantEntitlementSummary[] }
        >(resolvedEndpoints.entitlements),
      ]);
      const nextModules = normalizeModules(modulesResponse.data);
      const nextEntitlements = normalizeEntitlements(
        entitlementsResponse.data,
      ).reduce<Record<string, EntitlementLevel>>((acc, entitlement) => {
        acc[entitlement.moduleId] = entitlement.accessLevel;
        if (entitlement.moduleCode)
          acc[entitlement.moduleCode] = entitlement.accessLevel;
        return acc;
      }, {});

      nextModules.forEach((module) => {
        entitlementKey(module).forEach((key) => {
          nextEntitlements[key] = nextEntitlements[key] ?? 'PREVIEW';
        });
      });

      setModules(nextModules);
      setEntitlements(nextEntitlements);
      authStore.setEntitlements(nextEntitlements);
    } catch {
      setError('Unable to load subscription marketplace.');
    } finally {
      setIsLoading(false);
    }
  }, [client, resolvedEndpoints]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleSubscribe = async (module: ModuleCatalogItem) => {
    setSubscribingModuleId(module.id);
    setError(null);
    setNotice(null);
    try {
      const checkout = await onCheckout(module);
      await client.post<SubscriptionApprovalResponse>(
        resolvedEndpoints.subscriptionApproval,
        {
          moduleId: module.id,
          moduleCode: module.code,
          paymentReference: checkout.paymentReference,
          type: 'SUBSCRIPTION',
        },
      );
      setNotice(`${module.name} subscription request submitted for approval.`);
    } catch {
      setError('Unable to start subscription approval.');
    } finally {
      setSubscribingModuleId(null);
    }
  };

  const previewModule = modules.find((module) =>
    isLocked(entitlements[module.code] ?? entitlements[module.id] ?? 'PREVIEW'),
  );

  return (
    <section
      aria-labelledby="subscription-marketplace-title"
      style={shellStyle}
    >
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h2 id="subscription-marketplace-title">Subscription Marketplace</h2>
          <p>Review available platform modules and request access upgrades.</p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          style={secondaryButtonStyle}
        >
          <RefreshCw size={16} aria-hidden="true" /> Refresh
        </button>
      </div>

      {error ? <div role="alert">{error}</div> : null}
      {notice ? <div role="status">{notice}</div> : null}
      {isLoading ? (
        <div role="status">Loading subscription marketplace...</div>
      ) : null}

      {!isLoading && modules.length === 0 ? (
        <div role="status">No modules are available.</div>
      ) : null}

      <div style={gridStyle}>
        {modules.map((module) => {
          const accessLevel =
            entitlements[module.code] ?? entitlements[module.id] ?? 'PREVIEW';
          const locked = isLocked(accessLevel);
          return (
            <article
              key={module.id}
              aria-label={`${module.name} module`}
              style={cardStyle}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 'var(--sp-3)',
                }}
              >
                <div>
                  <h3>{module.name}</h3>
                  <p>
                    {module.description ?? 'Enterprise hospitality module.'}
                  </p>
                </div>
                {locked ? <Lock size={20} aria-label="Preview access" /> : null}
              </div>
              <strong>{accessLevel}</strong>
              {locked ? (
                <button
                  type="button"
                  disabled={subscribingModuleId === module.id}
                  onClick={() => void handleSubscribe(module)}
                  style={primaryButtonStyle}
                >
                  <CreditCard size={16} aria-hidden="true" /> Subscribe
                </button>
              ) : (
                <span>Included in your subscription.</span>
              )}
            </article>
          );
        })}
      </div>

      {previewModule ? (
        <PreviewGuard moduleId={previewModule.code} requiredEntitlement="WRITE">
          {previewSlot ?? (
            <button type="button" style={secondaryButtonStyle}>
              <Lock size={16} aria-hidden="true" /> Save Locked Feature
            </button>
          )}
        </PreviewGuard>
      ) : null}
    </section>
  );
}
