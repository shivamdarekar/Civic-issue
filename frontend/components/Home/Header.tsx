"use client";

import { Menu, X, Eye, Download, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import AccessibilityPanel from "@/components/AccessibilityPanel";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  showNavigation?: boolean;
  onMenuClick?: () => void;
}

export default function Header({ showNavigation = false, onMenuClick }: HeaderProps) {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const { install, isInstallable } = usePWAInstall();

  return (
    <>
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 ml-1 sm:ml-2">
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm">
                <Image 
                  src="/VMC.webp" 
                  alt="VMC Logo" 
                  width={24} 
                  height={24} 
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
                  {t('app.title')}
                </h1>
                <p className="text-xs text-blue-50 hidden sm:block">
                  {t('header.tagline')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAccessibility(true)}
                className="text-white hover:bg-white/10 p-2 hidden sm:flex"
                title={t('header.accessibility')}
              >
                <Eye className="w-4 h-4" />
              </Button>

              <LanguageSelector />
              
              {/* More Options Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 p-2"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 sm:w-48">
                  {isInstallable && (
                    <DropdownMenuItem onClick={install}>
                      <Download className="w-4 h-4 mr-2" />
                      Install App
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setShowAccessibility(true)} className="sm:hidden">
                    <Eye className="w-4 h-4 mr-2" />
                    Accessibility
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Link
                href="/login"
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
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
                  className="text-white hover:bg-white/10 p-2"
                >
                  {isMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
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