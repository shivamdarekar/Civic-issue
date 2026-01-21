"use client";

import "./globals.css";
import PWAInstaller from "@/components/PWAInstaller";
import { LanguageProvider } from "@/lib/language-context";
import { useOfflineInit } from "@/lib/useOfflineInit";
import { ReduxProvider } from "@/redux";
import ProtectWrapper from "@/components/ProtectWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VMC CiviSense" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="bg-gray-50 text-gray-800">
        <ReduxProvider>
          <LanguageProvider>
            <OfflineInitializer />
            <ProtectWrapper>
              {children}
            </ProtectWrapper>
            <PWAInstaller />
          </LanguageProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

function OfflineInitializer() {
  useOfflineInit();
  
  // Unregister any existing service workers during development
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
        console.log('Service worker unregistered for development');
      });
    });
  }
  
  return null;
}
