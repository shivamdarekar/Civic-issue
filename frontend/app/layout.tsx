import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";
import { ReduxProvider } from "@/redux";
import { Toaster } from "@/components/ui/toaster";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import SyncInitializer from "@/components/SyncInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Civic Sense",
  description: "Report and track civic issues in your area",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CivicSense",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/VMC.webp" />
        {/* Globals CSS is imported by Next; don't preload /globals.css manually */}
        {/* Preconnect to Google Fonts for font performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <ReduxProvider>
          <SyncInitializer />
          {children}
          </ReduxProvider>
        </LanguageProvider>
        <Toaster />
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
