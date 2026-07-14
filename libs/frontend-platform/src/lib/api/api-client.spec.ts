import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios';

import type { AuthState } from '../auth/auth-store';
import type { UserContextResponse } from '../auth/user-context.types';
import { createApiClient, PREVIEW_MODE_WRITE_ERROR } from './api-client';

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
  permissions: [],
};

const AUTH_STATE: AuthState = {
  accessToken: 'jwt-token',
  userContext: USER_CONTEXT,
  entitlements: {},
};

function rejectingAdapter(status: number, data: unknown): AxiosAdapter {
  return async (config) => {
    throw new AxiosError('Request failed', undefined, config, undefined, {
      config,
      data,
      headers: new AxiosHeaders(),
      status,
      statusText: 'Request failed',
    });
  };
}

describe('createApiClient', () => {
  it('adds JWT, portal, and tenant headers from current auth state', async () => {
    let captured: InternalAxiosRequestConfig | undefined;
    const adapter: AxiosAdapter = async (config) => {
      captured = config;
      return {
        config,
        data: { ok: true },
        headers: new AxiosHeaders(),
        status: 200,
        statusText: 'OK',
      };
    };
    const client = createApiClient({
      getAuthState: () => AUTH_STATE,
      axiosConfig: { adapter },
    });

    await client.get('/orders');
    expect(captured?.headers.get('Authorization')).toBe('Bearer jwt-token');
    expect(captured?.headers.get('x-portal-code')).toBe('PARTNER');
    expect(captured?.headers.get('x-tenant-id')).toBe('tenant-1');
  });

  it('runs the unauthorized handler and preserves the rejected response', async () => {
    const onUnauthorized = jest.fn();
    const client = createApiClient({
      getAuthState: () => AUTH_STATE,
      onUnauthorized,
      axiosConfig: {
        adapter: rejectingAdapter(401, { message: 'Unauthorized' }),
      },
    });

    await expect(client.get('/private')).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('routes preview-mode 403 errors to the subscription handler', async () => {
    const onPreviewForbidden = jest.fn();
    const client = createApiClient({
      getAuthState: () => AUTH_STATE,
      onPreviewForbidden,
      axiosConfig: {
        adapter: rejectingAdapter(403, { message: PREVIEW_MODE_WRITE_ERROR }),
      },
    });

    await expect(client.post('/hrms', {})).rejects.toMatchObject({
      response: { status: 403 },
    });
    expect(onPreviewForbidden).toHaveBeenCalledWith(
      PREVIEW_MODE_WRITE_ERROR,
      expect.any(AxiosError),
    );
  });

  it('uses the generic callback for other forbidden responses', async () => {
    const onForbidden = jest.fn();
    const client = createApiClient({
      getAuthState: () => AUTH_STATE,
      onForbidden,
      axiosConfig: {
        adapter: rejectingAdapter(403, { message: 'Permission denied' }),
      },
    });

    await expect(client.get('/admin-only')).rejects.toBeInstanceOf(AxiosError);
    expect(onForbidden).toHaveBeenCalledTimes(1);
  });
});
