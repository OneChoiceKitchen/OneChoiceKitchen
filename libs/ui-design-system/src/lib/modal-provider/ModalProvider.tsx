/**
 * ModalProvider — Global Modal & Toast System
 * ============================================
 * Single source of truth for all application notifications.
 * Provides two hooks:
 *   - useToast()   → toast.success / toast.error / toast.warning / toast.info
 *   - useConfirm() → await confirm({ title, message, variant })
 *
 * Usage:
 *   Wrap your app root with <ModalProvider> once.
 *   Then in any component:
 *     const toast = useToast();
 *     toast.success('Saved!');
 *
 *     const confirm = useConfirm();
 *     const ok = await confirm({ title: 'Delete?', variant: 'danger' });
 */
'use client';
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ConfirmVariant = 'danger' | 'warning' | 'default';

export interface ToastItem {
  id:      string;
  type:    ToastType;
  title?:  string;
  message: string;
}

export interface ConfirmOptions {
  title?:         string;
  message:        string;
  confirmLabel?:  string;
  cancelLabel?:   string;
  variant?:       ConfirmVariant;
  confirmText?:   string;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

// ─────────────────────────────────────────────
// Contexts
// ─────────────────────────────────────────────
const ToastContext   = createContext<ReturnType<typeof makeToast>   | null>(null);
const ConfirmContext = createContext<ReturnType<typeof makeConfirm> | null>(null);

function makeToast(fn: (item: Omit<ToastItem, 'id'>) => void) {
  return {
    success: (message: string, title?: string) => fn({ type: 'success', message, title }),
    error:   (message: string, title?: string) => fn({ type: 'error',   message, title }),
    warning: (message: string, title?: string) => fn({ type: 'warning', message, title }),
    info:    (message: string, title?: string) => fn({ type: 'info',    message, title }),
  };
}

function makeConfirm(fn: (opts: ConfirmOptions) => Promise<boolean>) {
  return fn;
}

// ─────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ModalProvider>');
  return ctx;
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ModalProvider>');
  return ctx;
}

// ─────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────
const TOKENS = {
  success: { bg: '#f0fdf4', border: '#86efac', icon: '✅', accent: '#16a34a' },
  error:   { bg: '#fef2f2', border: '#fca5a5', icon: '❌', accent: '#dc2626' },
  warning: { bg: '#fffbeb', border: '#fcd34d', icon: '⚠️', accent: '#d97706' },
  info:    { bg: '#eff6ff', border: '#93c5fd', icon: 'ℹ️', accent: '#2563eb' },
  danger:  { confirm: '#dc2626', confirmHover: '#b91c1c', confirmText: '#fff' },
  warningConfirm: { confirm: '#d97706', confirmHover: '#b45309', confirmText: '#fff' },
  default: { confirm: '#2563EB', confirmHover: '#002570', confirmText: '#fff' },
};

// ─────────────────────────────────────────────
// Toast Component
// ─────────────────────────────────────────────
function ToastItem_({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const t = TOKENS[item.type];
  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderLeft: `4px solid ${t.accent}`,
        borderRadius: '12px',
        padding: '14px 16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        minWidth: '300px',
        maxWidth: '420px',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        animation: 'ock-toast-in 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}
    >
      <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0, marginTop: '1px' }}>{t.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {item.title && (
          <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
            {item.title}
          </p>
        )}
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, wordBreak: 'break-word' }}>
          {item.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#94a3b8', fontSize: '18px', lineHeight: 1,
          padding: '0 0 0 4px', flexShrink: 0,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#475569')}
        onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
      >
        ×
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Confirm Dialog Component
// ─────────────────────────────────────────────
function ConfirmDialog_({
  state,
  onResolve,
}: {
  state: ConfirmState;
  onResolve: (value: boolean) => void;
}) {
  const variant = state.variant ?? 'default';
  const confirmColors =
    variant === 'danger'  ? TOKENS.danger :
    variant === 'warning' ? TOKENS.warningConfirm :
                            TOKENS.default;

  const icon =
    variant === 'danger'  ? '🗑️' :
    variant === 'warning' ? '⚠️' : 'ℹ️';

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onResolve(false);
  };

  // Keyboard: Esc = cancel
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onResolve(false);
      if (e.key === 'Enter')  onResolve(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onResolve]);

  return (
    <div
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ock-confirm-title"
      aria-describedby="ock-confirm-msg"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'ock-backdrop-in 0.18s ease forwards',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          animation: 'ock-dialog-in 0.24s cubic-bezier(0.34,1.56,0.64,1) forwards',
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: variant === 'danger'  ? '#fef2f2' :
                      variant === 'warning' ? '#fffbeb' : '#eff6ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', margin: '0 auto 1.25rem',
        }}>
          {icon}
        </div>

        {/* Title */}
        {state.title && (
          <h2 id="ock-confirm-title" style={{
            margin: '0 0 0.5rem',
            fontSize: '1.25rem', fontWeight: 800, color: '#0f172a',
          }}>
            {state.title}
          </h2>
        )}

        {/* Message */}
        <p id="ock-confirm-msg" style={{
          margin: '0 0 1.75rem',
          fontSize: '0.925rem', color: '#475569', lineHeight: 1.6,
        }}>
          {state.message}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            autoFocus
            onClick={() => onResolve(false)}
            style={{
              flex: 1, padding: '0.75rem 1.5rem',
              background: '#f1f5f9', color: '#475569',
              border: '1px solid #e2e8f0', borderRadius: '10px',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; }}
          >
            {state.cancelLabel ?? 'Cancel'}
          </button>
          <button
            onClick={() => onResolve(true)}
            style={{
              flex: 1, padding: '0.75rem 1.5rem',
              background: confirmColors.confirm,
              color: confirmColors.confirmText,
              border: 'none', borderRadius: '10px',
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: `0 4px 12px ${confirmColors.confirm}40`,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = confirmColors.confirmHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = confirmColors.confirm; }}
          >
            {state.confirmLabel ?? (variant === 'danger' ? 'Delete' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [toasts,  setToasts]  = useState<ToastItem[]>([]);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const counterRef = useRef(0);

  // Toast API
  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = `toast-${++counterRef.current}`;
    setToasts(prev => [...prev, { ...item, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toastApi = React.useMemo(() => makeToast(addToast), [addToast]);

  // Confirm API
  const confirmApi = useCallback(
    (opts: ConfirmOptions): Promise<boolean> =>
      new Promise(resolve => {
        setConfirm({ ...opts, resolve });
      }),
    []
  );

  const handleConfirmResolve = useCallback((value: boolean) => {
    confirm?.resolve(value);
    setConfirm(null);
  }, [confirm]);

  return (
    <ToastContext.Provider value={toastApi}>
      <ConfirmContext.Provider value={confirmApi}>
        <>
          <style>{`
            @keyframes ock-toast-in {
              from { opacity: 0; transform: translateX(40px) scale(0.95); }
              to   { opacity: 1; transform: translateX(0)     scale(1);    }
            }
            @keyframes ock-backdrop-in {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            @keyframes ock-dialog-in {
              from { opacity: 0; transform: scale(0.85) translateY(20px); }
              to   { opacity: 1; transform: scale(1)    translateY(0);    }
            }
          `}</style>

          {children}

          {/* Toast Container */}
          <div
            aria-live="polite"
            aria-atomic="false"
            style={{
              position: 'fixed',
              top: '1.25rem',
              right: '1.25rem',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              pointerEvents: 'none',
            }}
          >
            {toasts.map(t => (
              <div key={t.id} style={{ pointerEvents: 'all' }}>
                <ToastItem_ item={t} onDismiss={dismissToast} />
              </div>
            ))}
          </div>

          {/* Confirm Dialog */}
          {confirm && (
            <ConfirmDialog_ state={confirm} onResolve={handleConfirmResolve} />
          )}
        </>
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
}

export default ModalProvider;
