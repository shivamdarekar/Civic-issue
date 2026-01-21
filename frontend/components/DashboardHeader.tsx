"use client";

import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logoutUser } from "@/redux/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, User, Settings, Eye } from "lucide-react";
import Image from "next/image";
import AccessibilityPanel from "@/components/AccessibilityPanel";

export default function DashboardHeader() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [showProfile, setShowProfile] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    if (showProfile) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfile]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'FIELD_WORKER': return 'Field Worker';
      case 'WARD_ENGINEER': return 'Ward Engineer';
      case 'ZONE_OFFICER': return 'Zone Officer';
      default: return role;
    }
  };

  return (
    <>
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
                  VMC CiviSense
                </h1>
                <p className="text-xs text-blue-50">
                  Vadodara Municipal Corporation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAccessibility(true)}
                className="text-white hover:bg-white/10"
                title="Accessibility Options"
              >
                <Eye className="w-4 h-4" />
              </Button>

              <div className="relative" ref={profileRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProfile(!showProfile)}
                  className="text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user?.fullName}</span>
                </Button>

                {showProfile && (
                  <Card className="absolute right-0 top-full mt-2 w-64 p-4 z-50">
                    <div className="space-y-3">
                      <div className="border-b pb-3">
                        <p className="font-medium">{user?.fullName}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <p className="text-xs text-blue-600">{getRoleDisplayName(user?.role || '')}</p>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        {user?.phoneNumber && (
                          <p><span className="text-gray-500">Phone:</span> {user.phoneNumber}</p>
                        )}
                        {user?.department && (
                          <p><span className="text-gray-500">Department:</span> {user.department}</p>
                        )}
                        {user?.wardId && (
                          <p><span className="text-gray-500">Ward:</span> {user.wardId}</p>
                        )}
                        {user?.zoneId && (
                          <p><span className="text-gray-500">Zone:</span> {user.zoneId}</p>
                        )}
                      </div>

                      <div className="border-t pt-3 space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
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