import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios';

import { authStore, type AuthState } from '../auth/auth-store';

export const PREVIEW_MODE_WRITE_ERROR =
  'Subscription required. Module is currently in read-only preview mode.';

export const API_CLIENT_PREVIEW_EVENT = 'ock:subscription-preview-forbidden';

export interface ApiClientOptions {
  baseURL?: string;
  getAuthState?: () => AuthState;
  onUnauthorized?: (error: AxiosError) => void | Promise<void>;
  onPreviewForbidden?: (message: string, error: AxiosError) => void;
  onForbidden?: (error: AxiosError) => void;
  axiosConfig?: Omit<AxiosRequestConfig, 'baseURL'>;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function readErrorMessage(error: AxiosError): string | null {
  const data = error.response?.data;
  if (typeof data === 'string') return data;
  if (!data || typeof data !== 'object') return null;

  const message = (data as { message?: unknown }).message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message)) return message.filter(isString).join(' ');
  return null;
}

function defaultUnauthorizedHandler(): void {
  authStore.clearSession();
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

function defaultPreviewForbiddenHandler(message: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(API_CLIENT_PREVIEW_EVENT, { detail: { message } }),
  );
}

export function createApiClient(options: ApiClientOptions = {}): AxiosInstance {
  const instance = axios.create({
    baseURL: options.baseURL ?? '/api',
    timeout: 30_000,
    ...options.axiosConfig,
  });
  const getAuthState = options.getAuthState ?? authStore.getState;

  instance.interceptors.request.use((config) => {
    const authState = getAuthState();
    const userContext = authState.userContext;

    if (authState.accessToken) {
      config.headers.set('Authorization', `Bearer ${authState.accessToken}`);
    }
    if (userContext?.portalCode) {
      config.headers.set('x-portal-code', userContext.portalCode);
    }
    if (userContext?.tenantId) {
      config.headers.set('x-tenant-id', userContext.tenantId);
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        if (options.onUnauthorized) await options.onUnauthorized(error);
        else defaultUnauthorizedHandler();
      }

      if (error.response?.status === 403) {
        const message = readErrorMessage(error);
        if (message?.includes(PREVIEW_MODE_WRITE_ERROR)) {
          (options.onPreviewForbidden ?? defaultPreviewForbiddenHandler)(
            PREVIEW_MODE_WRITE_ERROR,
            error,
          );
        } else {
          options.onForbidden?.(error);
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

export const apiClient = createApiClient();
