import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { authStore } from '../auth/auth-store';
import type {
  MarketplaceClient,
  ModuleCatalogItem,
  TenantEntitlementSummary,
} from './subscription-marketplace';
import { SubscriptionMarketplace } from './subscription-marketplace';

const MODULES: ModuleCatalogItem[] = [
  {
    id: 'module-hrms',
    code: 'HRMS',
    name: 'HRMS',
    description: 'Employee management tools.',
    sortOrder: 2,
  },
  {
    id: 'module-crm',
    code: 'CRM',
    name: 'CRM',
    description: 'Customer relationship tools.',
    sortOrder: 1,
  },
];

const ENTITLEMENTS: TenantEntitlementSummary[] = [
  { moduleId: 'module-crm', moduleCode: 'CRM', accessLevel: 'WRITE' },
  { moduleId: 'module-hrms', moduleCode: 'HRMS', accessLevel: 'PREVIEW' },
];

function createClient(options?: {
  modules?: ModuleCatalogItem[];
  entitlements?: TenantEntitlementSummary[];
}): MarketplaceClient & { get: jest.Mock; post: jest.Mock } {
  const modules = options?.modules ?? MODULES;
  const entitlements = options?.entitlements ?? ENTITLEMENTS;
  return {
    get: jest.fn((url: string) => {
      if (url.includes('module')) return Promise.resolve({ data: modules });
      return Promise.resolve({ data: entitlements });
    }),
    post: jest.fn().mockResolvedValue({ data: { id: 'approval-1', status: 'PENDING' } }),
  };
}

describe('SubscriptionMarketplace', () => {
  beforeEach(() => authStore.clearSession());

  it('renders modules with subscribe CTAs for preview entitlements', async () => {
    render(<SubscriptionMarketplace client={createClient()} />);

    expect(await screen.findByLabelText('CRM module')).toBeTruthy();
    expect(screen.getByLabelText('HRMS module')).toBeTruthy();
    expect(screen.getByText('Included in your subscription.')).toBeTruthy();
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeTruthy();
    expect(screen.getByRole('note', { name: 'HRMS subscription required' })).toBeTruthy();
  });

  it('runs checkout and creates a subscription approval case', async () => {
    const client = createClient();
    const onCheckout = jest.fn().mockResolvedValue({ paymentReference: 'payment-1' });
    render(<SubscriptionMarketplace client={client} onCheckout={onCheckout} />);

    await screen.findByLabelText('HRMS module');
    fireEvent.click(screen.getByRole('button', { name: /subscribe/i }));

    await waitFor(() => {
      expect(onCheckout).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'module-hrms', code: 'HRMS' }),
      );
      expect(client.post).toHaveBeenCalledWith('/approval-cases/subscription', {
        moduleId: 'module-hrms',
        moduleCode: 'HRMS',
        paymentReference: 'payment-1',
        type: 'SUBSCRIPTION',
      });
    });
    expect(
      screen.getByText('HRMS subscription request submitted for approval.'),
    ).toBeTruthy();
  });

  it('syncs fetched entitlements to the shared auth store for PreviewGuard', async () => {
    render(<SubscriptionMarketplace client={createClient()} />);

    await screen.findByLabelText('HRMS module');
    expect(authStore.getState().entitlements.HRMS).toBe('PREVIEW');
    expect(authStore.getState().entitlements.CRM).toBe('WRITE');
  });

  it('shows empty and error states', async () => {
    const emptyClient = createClient({ modules: [], entitlements: [] });
    const { unmount } = render(<SubscriptionMarketplace client={emptyClient} />);

    expect(await screen.findByText('No modules are available.')).toBeTruthy();
    unmount();

    const failingClient = createClient();
    failingClient.get.mockRejectedValue(new Error('failed'));
    render(<SubscriptionMarketplace client={failingClient} />);

    expect(
      await screen.findByText('Unable to load subscription marketplace.'),
    ).toBeTruthy();
  });
});
