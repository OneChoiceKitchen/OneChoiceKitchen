import { act, renderHook } from '@testing-library/react';

import { authStore, useModuleEntitlement, useUserContext } from './auth-store';
import type { UserContextResponse } from './user-context.types';

const USER_CONTEXT: UserContextResponse = {
  userId: 'user-1',
  displayName: 'Partner Owner',
  email: 'owner@example.com',
  portalCode: 'PARTNER',
  portalName: 'Partner Portal',
  siteTitle: 'One Choice Kitchen',
  tenantId: 'tenant-1',
  partnerName: 'Spice House',
  roles: ['PARTNER'],
  permissions: ['orders.read'],
};

describe('authStore', () => {
  beforeEach(() => authStore.clearSession());

  it('stores and exposes the typed login context', () => {
    const { result } = renderHook(() => useUserContext());

    act(() => {
      authStore.setSession({
        accessToken: 'jwt-token',
        userContext: USER_CONTEXT,
        entitlements: { HRMS: 'WRITE' },
      });
    });

    expect(result.current).toEqual(USER_CONTEXT);
    expect(authStore.getState()).toMatchObject({
      accessToken: 'jwt-token',
      entitlements: { HRMS: 'WRITE' },
    });
  });

  it('defaults missing module entitlements to PREVIEW and supports updates', () => {
    const { result } = renderHook(() => useModuleEntitlement('ANALYTICS'));
    expect(result.current).toBe('PREVIEW');

    act(() => authStore.setEntitlement('ANALYTICS', 'MANAGE'));
    expect(result.current).toBe('MANAGE');
  });

  it('clears all authentication and tenant context on logout', () => {
    authStore.setSession({
      accessToken: 'jwt-token',
      userContext: USER_CONTEXT,
    });

    act(() => authStore.clearSession());

    expect(authStore.getState()).toEqual({
      accessToken: null,
      userContext: null,
      entitlements: {},
    });
  });
});
