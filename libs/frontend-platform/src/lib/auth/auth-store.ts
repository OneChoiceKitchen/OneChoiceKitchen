'use client';

import { useSyncExternalStore } from 'react';

import type {
  AuthSession,
  EntitlementLevel,
  ModuleEntitlements,
  UserContextResponse,
} from './user-context.types';

export interface AuthState {
  accessToken: string | null;
  userContext: UserContextResponse | null;
  entitlements: ModuleEntitlements;
}

type AuthListener = () => void;

const EMPTY_ENTITLEMENTS: ModuleEntitlements = Object.freeze({});
const INITIAL_STATE: AuthState = Object.freeze({
  accessToken: null,
  userContext: null,
  entitlements: EMPTY_ENTITLEMENTS,
});

let state: AuthState = INITIAL_STATE;
const listeners = new Set<AuthListener>();

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

function replaceState(nextState: AuthState): void {
  state = Object.freeze(nextState);
  emitChange();
}

export const authStore = {
  getState(): AuthState {
    return state;
  },

  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setSession(session: AuthSession): void {
    replaceState({
      accessToken: session.accessToken,
      userContext: session.userContext,
      entitlements: Object.freeze({ ...(session.entitlements ?? {}) }),
    });
  },

  updateUserContext(userContext: UserContextResponse): void {
    replaceState({ ...state, userContext });
  },

  setEntitlements(entitlements: ModuleEntitlements): void {
    replaceState({
      ...state,
      entitlements: Object.freeze({ ...entitlements }),
    });
  },

  setEntitlement(moduleId: string, level: EntitlementLevel): void {
    replaceState({
      ...state,
      entitlements: Object.freeze({
        ...state.entitlements,
        [moduleId]: level,
      }),
    });
  },

  clearSession(): void {
    replaceState(INITIAL_STATE);
  },
};

export function useAuthStore<T>(selector: (authState: AuthState) => T): T {
  return useSyncExternalStore(
    authStore.subscribe,
    () => selector(authStore.getState()),
    () => selector(INITIAL_STATE),
  );
}

export function useUserContext(): UserContextResponse | null {
  return useAuthStore((authState) => authState.userContext);
}

export function useModuleEntitlement(moduleId: string): EntitlementLevel {
  return useAuthStore(
    (authState) => authState.entitlements[moduleId] ?? 'PREVIEW',
  );
}
