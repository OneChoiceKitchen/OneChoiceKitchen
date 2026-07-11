/**
 * BottomNav — Shared Bottom Navigation Component
 * Single source of truth for both Customer Web Portal (mobile view) and Customer Mobile App.
 *
 * Design tokens, nav config, and rendering all live here.
 * Each platform passes its own adapter (onNavigate / cartCount / isActive / etc.)
 * via props — zero platform-specific code inside this component.
 */
'use client';
import React, { useCallback } from 'react';

// ─────────────────────────────────────────────
// Design Tokens (centralised, theme-aware)
// ─────────────────────────────────────────────
export const NAV_TOKENS = {
  colorActive:      '#2563EB',
  colorActiveLabel: '#2563EB',
  colorInactive:    '#94a3b8',
  colorBg:          '#ffffff',
  colorBgDark:      '#0f172a',
  colorBadge:       '#DC2626',
  colorBadgeText:   '#ffffff',
  colorBorder:      'rgba(0,0,0,0.06)',
  colorShadow:      '0 -8px 24px -4px rgba(0,0,0,0.08)',
  colorIndicator:   '#2563EB',
  height:           68,            // px (excluding safe-area)
  iconSize:         22,            // px
  fontSize:         '0.65rem',
  fontWeight:       600,
  fontWeightActive: 700,
  borderRadius:     '20px 20px 0 0',
  transitionMs:     200,
} as const;

// ─────────────────────────────────────────────
// Nav Item Config — Single Source of Truth
// ─────────────────────────────────────────────
export interface NavItemConfig {
  id:       string;
  label:    string;
  /** Render function for the icon; receives { active, size } */
  icon:     (opts: { active: boolean; size: number }) => React.ReactNode;
  /** For web: href to navigate to. For mobile: tab id. */
  route:    string;
  badge?:   boolean;   // if true, shows cart badge from cartCount prop
  ariaLabel?: string;
}

/**
 * Inline SVG icons — no external icon library required in the shared lib,
 * keeping the bundle lean. Each icon renders a filled variant when active.
 */
const HomeIcon = ({ active, size }: { active: boolean; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? NAV_TOKENS.colorActive : 'none'}
    stroke={active ? NAV_TOKENS.colorActive : 'currentColor'} strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
    <polyline points="9 21 9 12 15 12 15 21"/>
  </svg>
);

const MenuIcon = ({ active, size }: { active: boolean; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={active ? NAV_TOKENS.colorActive : 'currentColor'} strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M3 12h18M3 18h18"/>
    {active && <circle cx="19" cy="6" r="2" fill={NAV_TOKENS.colorActive} stroke="none"/>}
  </svg>
);

const DineInIcon = ({ active, size }: { active: boolean; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? NAV_TOKENS.colorActive : 'none'}
    stroke={active ? NAV_TOKENS.colorActive : 'currentColor'} strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

const TiffinIcon = ({ active, size }: { active: boolean; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? NAV_TOKENS.colorActive : 'none'}
    stroke={active ? NAV_TOKENS.colorActive : 'currentColor'} strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
    <line x1="10" y1="14" x2="14" y2="14"/>
  </svg>
);

const CartIcon = ({ active, size }: { active: boolean; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? NAV_TOKENS.colorActive : 'none'}
    stroke={active ? NAV_TOKENS.colorActive : 'currentColor'} strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const ProfileIcon = ({ active, size }: { active: boolean; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? NAV_TOKENS.colorActive : 'none'}
    stroke={active ? NAV_TOKENS.colorActive : 'currentColor'} strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

/** The canonical nav items — SAME on both platforms. Order matters. */
export const NAV_ITEMS: NavItemConfig[] = [
  {
    id:       'home',
    label:    'Home',
    icon:     (opts) => <HomeIcon    {...opts} />,
    route:    '/',
    ariaLabel: 'Go to Home',
  },
  {
    id:       'menu',
    label:    'Menu',
    icon:     (opts) => <MenuIcon    {...opts} />,
    route:    '/menu',
    ariaLabel: 'Browse Menu',
  },
  {
    id:       'dinein',
    label:    'Dine-In',
    icon:     (opts) => <DineInIcon  {...opts} />,
    route:    '/reservations',
    ariaLabel: 'Book a Table',
  },
  {
    id:       'tiffin',
    label:    'Tiffin',
    icon:     (opts) => <TiffinIcon  {...opts} />,
    route:    '/tiffin',
    ariaLabel: 'Tiffin Plans',
  },
  {
    id:       'cart',
    label:    'Cart',
    icon:     (opts) => <CartIcon    {...opts} />,
    route:    '/cart',
    badge:    true,
    ariaLabel: 'Open Cart',
  },
  {
    id:       'profile',
    label:    'Profile',
    icon:     (opts) => <ProfileIcon {...opts} />,
    route:    '/profile',
    ariaLabel: 'My Profile',
  },
];

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
export interface BottomNavProps {
  /** Which tab/route is currently active. Match against NavItemConfig.id */
  activeId:    string;
  /** Called when user taps a nav item. Receives the NavItemConfig. */
  onNavigate:  (item: NavItemConfig) => void;
  /** Number of items in cart (for badge display) */
  cartCount?:  number;
  /** Optionally override nav items (for future extensibility) */
  items?:      NavItemConfig[];
  /** Dark theme */
  darkMode?:   boolean;
  /** Additional wrapper class */
  className?:  string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export const BottomNav: React.FC<BottomNavProps> = ({
  activeId,
  onNavigate,
  cartCount = 0,
  items = NAV_ITEMS,
  darkMode = false,
  className = '',
}) => {
  const bg     = darkMode ? NAV_TOKENS.colorBgDark : NAV_TOKENS.colorBg;
  const inact  = darkMode ? '#64748b' : NAV_TOKENS.colorInactive;

  const handleKeyDown = useCallback((e: React.KeyboardEvent, item: NavItemConfig) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigate(item);
    }
  }, [onNavigate]);

  const badgeLabel = (n: number) => n > 99 ? '99+' : String(n);

  return (
    <>
      {/* Inject critical styles via a <style> tag so the component is self-contained
          and works in both Next.js app router and React Native Web environments */}
      <style>{`
        .ock-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: ${bg};
          border-top: 1px solid ${NAV_TOKENS.colorBorder};
          box-shadow: ${NAV_TOKENS.colorShadow};
          border-radius: ${NAV_TOKENS.borderRadius};
          padding-bottom: env(safe-area-inset-bottom, 0px);
          display: flex;
          align-items: stretch;
          min-height: ${NAV_TOKENS.height}px;
          /* GPU-accelerated for smooth 60 fps */
          will-change: transform;
          transform: translateZ(0);
        }
        /* For customer-mobile: constrain to 480px centred */
        .ock-bottom-nav--mobile-app {
          max-width: 480px;
          left: 50%;
          transform: translateX(-50%);
          right: auto;
          width: 100%;
        }
        .ock-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          min-height: 48px;      /* WCAG min touch target */
          padding: 10px 4px 8px;
          background: none;
          border: none;
          cursor: pointer;
          position: relative;
          -webkit-tap-highlight-color: transparent;
          outline: none;
          transition: color ${NAV_TOKENS.transitionMs}ms ease,
                      transform ${NAV_TOKENS.transitionMs}ms ease;
        }
        .ock-nav-item:focus-visible {
          outline: 2px solid ${NAV_TOKENS.colorActive};
          outline-offset: -2px;
          border-radius: 12px;
        }
        .ock-nav-item:active {
          transform: scale(0.9);
        }
        /* Active indicator bar above icon */
        .ock-nav-item--active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 28px;
          height: 3px;
          background: ${NAV_TOKENS.colorIndicator};
          border-radius: 0 0 4px 4px;
          animation: ock-indicator-in ${NAV_TOKENS.transitionMs}ms ease forwards;
        }
        @keyframes ock-indicator-in {
          from { width: 0; opacity: 0; }
          to   { width: 28px; opacity: 1; }
        }
        .ock-nav-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          transition: background ${NAV_TOKENS.transitionMs}ms ease,
                      transform  ${NAV_TOKENS.transitionMs}ms ease;
        }
        .ock-nav-item--active .ock-nav-icon-wrap {
          background: rgba(0,56,147,0.08);
          transform: translateY(-2px) scale(1.05);
        }
        .ock-nav-label {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Outfit', Roboto, sans-serif;
          font-size: ${NAV_TOKENS.fontSize};
          font-weight: ${NAV_TOKENS.fontWeight};
          line-height: 1;
          letter-spacing: 0.01em;
          transition: color    ${NAV_TOKENS.transitionMs}ms ease,
                      font-weight ${NAV_TOKENS.transitionMs}ms ease;
          /* Prevent text from jumping when weight changes */
          min-width: 36px;
          text-align: center;
        }
        /* Cart badge */
        .ock-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: ${NAV_TOKENS.colorBadge};
          color: ${NAV_TOKENS.colorBadgeText};
          font-size: 0.58rem;
          font-weight: 800;
          min-width: 17px;
          height: 17px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          border: 2px solid ${bg};
          line-height: 1;
          animation: ock-badge-pop 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        @keyframes ock-badge-pop {
          from { transform: scale(0); }
          to   { transform: scale(1); }
        }
        /* Landscape: reduce height slightly */
        @media (max-height: 500px) {
          .ock-bottom-nav { min-height: 52px; }
          .ock-nav-item { padding: 6px 4px 4px; }
        }
        /* High-contrast / forced-colors mode */
        @media (forced-colors: active) {
          .ock-nav-item--active::before { background: Highlight; }
          .ock-badge { background: Highlight; color: HighlightText; }
        }
      `}</style>

      <nav
        className={`ock-bottom-nav ${className}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          const showBadge = item.badge && cartCount > 0;

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              role="button"
              aria-label={item.ariaLabel || item.label}
              aria-current={isActive ? 'page' : undefined}
              aria-pressed={isActive}
              tabIndex={0}
              className={`ock-nav-item${isActive ? ' ock-nav-item--active' : ''}`}
              style={{ color: isActive ? NAV_TOKENS.colorActive : inact }}
              onClick={() => onNavigate(item)}
              onKeyDown={(e) => handleKeyDown(e, item)}
            >
              <div className="ock-nav-icon-wrap">
                {item.icon({ active: isActive, size: NAV_TOKENS.iconSize })}
                {showBadge && (
                  <span
                    className="ock-badge"
                    aria-label={`${cartCount} item${cartCount !== 1 ? 's' : ''} in cart`}
                    role="status"
                  >
                    {badgeLabel(cartCount)}
                  </span>
                )}
              </div>
              <span
                className="ock-nav-label"
                style={{
                  color:      isActive ? NAV_TOKENS.colorActiveLabel : inact,
                  fontWeight: isActive ? NAV_TOKENS.fontWeightActive  : NAV_TOKENS.fontWeight,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default BottomNav;
