import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BrandFooter, ModalProvider } from "@org/ui-design-system";
import { GlobalProvider } from "./context/GlobalContext";
import GlobalHeader from "./components/GlobalHeader";
import GlobalMobileNav from "./components/GlobalMobileNav";
import GlobalLayoutWrapper from "./components/GlobalLayoutWrapper";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#2563EB",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [seoRes, settingsRes] = await Promise.all([
      fetch('http://localhost:3000/api/seo/metadata/home', { cache: 'no-store' }),
      fetch('http://localhost:3000/api/seo/settings', { cache: 'no-store' })
    ]);
    
    if (!seoRes.ok || !settingsRes.ok) throw new Error('API failed');
    const seoData = await seoRes.json();
    const settingsData = await settingsRes.json();

    const finalTitle = seoData.title || `${settingsData.siteName || 'One Choice Kitchen'} - ${settingsData.tagline || 'Online Home-Style Food, Tiffin & Meal Services'}`;

    return {
      title: finalTitle,
      description: seoData.description || settingsData.tagline || "Online Home-Style Food, Tiffin & Meal Services.",
      keywords: seoData.keywords,
      manifest: "/manifest.json",
      openGraph: {
        title: seoData.ogTitle || finalTitle,
        description: seoData.ogDescription || seoData.description,
      },
      twitter: {
        title: seoData.twitterTitle || finalTitle,
        description: seoData.twitterDescription || seoData.description,
      },
      icons: settingsData.faviconUrl ? [
        { url: settingsData.faviconUrl }
      ] : {
        icon: [
          { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
          { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' }
        ],
        apple: [
          { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
        ]
      }
    };
  } catch (error) {
    return {
      title: "One Choice Kitchen - Online Home-Style Food, Tiffin & Meal Services",
      description: "Online Home-Style Food, Tiffin & Meal Services.",
      manifest: "/manifest.json",
      icons: {
        icon: [
          { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
          { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' }
        ],
        apple: [
          { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
        ]
      }
    };
  }
}

import LoginModal from "./components/LoginModal";
import AiChatWidget from "./components/AiChatWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} data-scroll-behavior="smooth">
      <body>
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator && '${process.env.NODE_ENV}' === 'production') {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            } else if ('serviceWorker' in navigator && '${process.env.NODE_ENV}' === 'development') {
              // Unregister any existing service workers in development
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                  registration.unregister();
                }
              });
            }
          `}
        </Script>
        <GlobalProvider>
          <ModalProvider>
            <GlobalHeader />
            <GlobalLayoutWrapper>
              {children}
            </GlobalLayoutWrapper>
            <BrandFooter />
            <GlobalMobileNav />
            <LoginModal />
            <AiChatWidget />
          </ModalProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}
