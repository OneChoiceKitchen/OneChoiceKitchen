import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OneChoiceKitchen — AI‑Powered Restaurant SaaS Platform",
  description:
    "India's most advanced food delivery platform. Manage restaurants, tiffin subscriptions, riders, and customers with powerful AI automation. Built for scale.",
  keywords: "food delivery, restaurant SaaS, tiffin subscription, India, restaurant management",
  openGraph: {
    title: "OneChoiceKitchen — AI‑Powered Restaurant SaaS",
    description: "India's most advanced food delivery & restaurant management platform.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "OneChoiceKitchen — AI‑Powered Restaurant SaaS",
    description: "India's most advanced food delivery & restaurant management platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
