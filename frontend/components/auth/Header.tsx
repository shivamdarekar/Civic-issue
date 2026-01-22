"use client";

import { ArrowLeft, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import AccessibilityPanel from "@/components/AccessibilityPanel";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  showBackButton?: boolean;
  backUrl?: string;
}

export default function Header({ showBackButton = false, backUrl = "/" }: HeaderProps) {
  const { t } = useLanguage();
  const [showAccessibility, setShowAccessibility] = useState(false);

  return (
    <>
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Link 
                  href={backUrl}
                  className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium text-white">Back</span>
                </Link>
              )}
              
              <div className="flex items-center gap-3">
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
                    {t('app.title') || 'VMC CiviSense'}
                  </h1>
                  <p className="text-xs text-blue-50">
                    {t('header.tagline') || 'Vadodara Municipal Corporation'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAccessibility(true)}
                className="text-white hover:text-blue-100 hover:bg-white/10"
                title={t('header.accessibility') || 'Accessibility Options'}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <AccessibilityPanel 
        isOpen={showAccessibility} 
        onClose={() => setShowAccessibility(false)} 
      />
    </>
  );
}