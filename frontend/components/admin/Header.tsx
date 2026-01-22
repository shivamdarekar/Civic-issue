"use client";

import { Menu, Eye, Shield, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/hooks";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showAccessibility, setShowAccessibility] = useState(false);
  const { user } = useAppSelector((state) => state.userState);

  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-900 shadow-lg sticky top-0 z-40">
      <div className="max-w-full mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="text-white hover:bg-white/10 lg:hidden p-1 sm:p-2"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm flex-shrink-0">
                <Image 
                  src="/VMC.webp" 
                  alt="VMC Logo" 
                  width={20} 
                  height={20} 
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-white truncate">
                  VMC CiviSense
                </h1>
                <p className="text-xs text-blue-50 hidden sm:block">
                  Admin Panel - Vadodara Municipal Corporation
                </p>
                <p className="text-xs text-blue-50 sm:hidden">
                  Admin Panel
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {user && (
              <div className="hidden md:flex items-center gap-2 text-white">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium truncate max-w-32">{user.fullName}</span>
                <span className="text-xs text-blue-200">({user.role})</span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAccessibility(true)}
              className="text-white hover:bg-white/10 p-1 sm:p-2"
              title="Accessibility Options"
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            <Link
              href="/login"
              className="bg-red-600 border border-red-500 text-white hover:bg-red-700 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Exit</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}