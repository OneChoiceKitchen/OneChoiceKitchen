'use client';

import type {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from 'react';

import { useModuleEntitlement } from '../auth/auth-store';
import type { EntitlementLevel } from '../auth/user-context.types';

export interface PreviewGuardProps {
  moduleId: string;
  requiredEntitlement: EntitlementLevel;
  children: ReactNode;
  mode?: 'disable' | 'hide';
  fallback?: ReactNode;
  onSubscribe?: (moduleId: string) => void;
  subscribeLabel?: string;
}

const ENTITLEMENT_RANK: Record<EntitlementLevel, number> = {
  PREVIEW: 0,
  READ: 1,
  WRITE: 2,
  MANAGE: 3,
};

export function hasRequiredEntitlement(
  actual: EntitlementLevel,
  required: EntitlementLevel,
): boolean {
  // PREVIEW is deliberately allowed to render GET/read-only module content.
  if (required === 'READ' && actual === 'PREVIEW') return true;
  return ENTITLEMENT_RANK[actual] >= ENTITLEMENT_RANK[required];
}

const guardStyle: CSSProperties = { position: 'relative' };

const disabledContentStyle: CSSProperties = {
  opacity: 0.55,
  pointerEvents: 'none',
  userSelect: 'none',
};

const noticeStyle: CSSProperties = {
  alignItems: 'center',
  background: 'var(--surf, #ffffff)',
  border: '1px solid var(--bdr, #e2e8f0)',
  borderRadius: 'var(--r-md, 8px)',
  boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,.06))',
  color: 'var(--text, #0f172a)',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  justifyContent: 'space-between',
  marginTop: '0.5rem',
  padding: '0.75rem 1rem',
};

const subscribeButtonStyle: CSSProperties = {
  alignItems: 'center',
  background: 'var(--theme-primary, var(--brand-blue))',
  border: 0,
  borderRadius: 'var(--r-sm, 6px)',
  color: '#ffffff',
  cursor: 'pointer',
  display: 'inline-flex',
  font: 'inherit',
  fontWeight: 600,
  gap: '0.4rem',
  minHeight: 44,
  padding: '0.55rem 0.85rem',
};

export function PreviewGuard({
  moduleId,
  requiredEntitlement,
  children,
  mode = 'disable',
  fallback,
  onSubscribe,
  subscribeLabel = 'Subscribe to Unlock',
}: PreviewGuardProps) {
  const actualEntitlement = useModuleEntitlement(moduleId);
  const allowed = hasRequiredEntitlement(
    actualEntitlement,
    requiredEntitlement,
  );

  if (allowed) return children;
  if (mode === 'hide') return fallback ?? null;

  const preventInteraction = (
    event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
  ): void => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      data-module-id={moduleId}
      data-required-entitlement={requiredEntitlement}
      data-actual-entitlement={actualEntitlement}
      style={guardStyle}
    >
      <div
        aria-hidden="true"
        aria-disabled="true"
        onClickCapture={preventInteraction}
        onKeyDownCapture={preventInteraction}
        style={disabledContentStyle}
      >
        {children}
      </div>
      <div
        role="note"
        aria-label={`${moduleId} subscription required`}
        style={noticeStyle}
      >
        <span>
          <span aria-hidden="true">Lock:</span> This feature is available in
          read-only preview mode.
        </span>
        <button
          type="button"
          onClick={() => onSubscribe?.(moduleId)}
          style={subscribeButtonStyle}
        >
          <span aria-hidden="true">Lock</span>
          {subscribeLabel}
        </button>
      </div>
    </div>
  );
}
