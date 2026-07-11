'use client';
import React, { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BottomNav, NAV_ITEMS, NavItemConfig } from '@org/ui-design-system';
import { useGlobalContext } from '../context/GlobalContext';

/**
 * Web Portal adapter for the shared BottomNav component.
 *
 * Responsibilities:
 *  - Maps the current URL pathname → activeId
 *  - Handles Cart (opens drawer) and Profile (auth-gate) specially
 *  - Passes cartCount from GlobalContext badge
 *  - Delegates all rendering to the shared BottomNav
 */
export default function GlobalMobileNav() {
  const router   = useRouter();
  const pathname = usePathname();
  const { totalCartItems, setCartDrawerOpen, setLoginModalOpen, loggedIn } = useGlobalContext();

  /** Derive active tab id from current path */
  const activeId = (() => {
    if (pathname === '/')                                    return 'home';
    if (pathname.startsWith('/menu'))                       return 'menu';
    if (pathname.startsWith('/reservations') || pathname.startsWith('/dinein')) return 'dinein';
    if (pathname.startsWith('/tiffin'))                     return 'tiffin';
    if (pathname.startsWith('/cart'))                       return 'cart';
    if (pathname.startsWith('/profile'))                    return 'profile';
    return 'home';
  })();

  const handleNavigate = useCallback((item: NavItemConfig) => {
    switch (item.id) {
      case 'cart':
        setCartDrawerOpen(true);
        return;
      case 'profile':
        if (!loggedIn) {
          setLoginModalOpen(true);
          return;
        }
        router.push('/profile');
        return;
      default:
        router.push(item.route);
    }
  }, [router, loggedIn, setCartDrawerOpen, setLoginModalOpen]);

  return (
    <BottomNav
      activeId={activeId}
      onNavigate={handleNavigate}
      cartCount={totalCartItems}
      items={NAV_ITEMS}
      className="ock-web-mobile-nav"
    />
  );
}
