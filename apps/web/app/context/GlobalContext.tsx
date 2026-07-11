'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  item: any;
  qty: number;
}

interface GlobalContextType {
  cart: { [key: string]: CartItem };
  setCart: React.Dispatch<React.SetStateAction<{ [key: string]: CartItem }>>;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  totalCartItems: number;
  loggedIn: boolean;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  isLoginModalOpen: boolean;
  setLoginModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => void;
  deliveryLocation: { lat: number, lng: number } | null;
  setDeliveryLocation: React.Dispatch<React.SetStateAction<{ lat: number, lng: number } | null>>;
  deliveryAddress: string;
  setDeliveryAddress: React.Dispatch<React.SetStateAction<string>>;
  clearCart: () => void;
}

export const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<{ [key: string]: CartItem }>({});
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Initialize from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('saas_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    
    const savedLogin = localStorage.getItem('saas_loggedIn');
    const savedToken = localStorage.getItem('customer_token');
    if (savedLogin === 'true' && savedToken) {
      setLoggedIn(true);
    }
    
    const savedLocation = localStorage.getItem('saas_deliveryLocation');
    if (savedLocation) {
      try {
        setDeliveryLocation(JSON.parse(savedLocation));
      } catch (e) {
        console.error("Failed to parse delivery location", e);
      }
    }
    const savedAddress = localStorage.getItem('saas_deliveryAddress');
    if (savedAddress) {
      setDeliveryAddress(savedAddress);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('saas_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (deliveryLocation) {
      localStorage.setItem('saas_deliveryLocation', JSON.stringify(deliveryLocation));
    } else {
      localStorage.removeItem('saas_deliveryLocation');
    }
  }, [deliveryLocation]);

  useEffect(() => {
    if (deliveryAddress) {
      localStorage.setItem('saas_deliveryAddress', deliveryAddress);
    } else {
      localStorage.removeItem('saas_deliveryAddress');
    }
  }, [deliveryAddress]);

  const logout = () => {
    setLoggedIn(false);
    localStorage.removeItem('saas_loggedIn');
    localStorage.removeItem('customer_token');
    
    // Smart logout routing
    const protectedRoutes = ['/profile', '/loyalty', '/referral', '/reviews', '/support'];
    const currentPath = window.location.pathname;
    
    if (protectedRoutes.includes(currentPath)) {
      window.location.href = '/';
    }
  };

  const totalCartItems = Object.values(cart).reduce((sum, current) => sum + current.qty, 0);

  const clearCart = () => {
    setCart({});
  };

  return (
    <GlobalContext.Provider value={{ 
      cart, setCart, cartDrawerOpen, setCartDrawerOpen, totalCartItems,
      loggedIn, setLoggedIn, isLoginModalOpen, setLoginModalOpen, logout,
      deliveryLocation, setDeliveryLocation, deliveryAddress, setDeliveryAddress, clearCart
    }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
}
