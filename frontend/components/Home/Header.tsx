"use client";

import { Menu, X, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import AccessibilityPanel from "@/components/AccessibilityPanel";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  showNavigation?: boolean;
  onMenuClick?: () => void;
}

export default function Header({ showNavigation = false, onMenuClick }: HeaderProps) {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);

  return (
    <>
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-2 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 ml-2">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Image 
                  src="/VMC.webp" 
                  alt="VMC Logo" 
                  width={24} 
                  height={24} 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  {t('app.title')}
                </h1>
                <p className="text-xs text-blue-50">
                  {t('header.tagline')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAccessibility(true)}
                className="text-white hover:bg-white/10"
                title={t('header.accessibility')}
              >
                <Eye className="w-4 h-4" />
              </Button>

              <LanguageSelector />
              
              <Link
                href="/login"
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Login
              </Link>
              
              {showNavigation && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                    onMenuClick?.();
                  }}
                  className="text-white hover:bg-white/10"
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              )}
            </div>
          </div>

          {showNavigation && isMenuOpen && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <nav className="space-y-2">
                <a href="/field-worker" className="block px-3 py-2 text-sm text-blue-50 hover:text-white hover:bg-white/10 rounded">
                  {t('header.nav.field.worker')}
                </a>
                <a href="/ward-engineer" className="block px-3 py-2 text-sm text-blue-50 hover:text-white hover:bg-white/10 rounded">
                  {t('header.nav.ward.engineer')}
                </a>
                <a href="/zone-officer" className="block px-3 py-2 text-sm text-blue-50 hover:text-white hover:bg-white/10 rounded">
                  {t('header.nav.zone.officer')}
                </a>
                <a href="/admin" className="block px-3 py-2 text-sm text-blue-50 hover:text-white hover:bg-white/10 rounded">
                  {t('header.nav.admin')}
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>
      
      <AccessibilityPanel 
        isOpen={showAccessibility} 
        onClose={() => setShowAccessibility(false)} 
      />
    </>
  );
}