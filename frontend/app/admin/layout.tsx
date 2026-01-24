"use client";

import { useState, useEffect } from "react";
import { Shield, BarChart3, Users, Menu, X, MapPin, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/components/admin/Header";
import ProtectWrapper from "@/components/auth/ProtectWrapper";
import { useAppSelector } from "@/redux/hooks";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.userState);

  const navigation = [
    {
      name: "System Overview",
      href: "/admin",
      icon: BarChart3,
      current: pathname === "/admin",
    },
    {
      name: "User Management",
      href: "/admin/user-management",
      icon: Users,
      current: pathname === "/admin/user-management",
    },
  ];

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [sidebarOpen]);

  return (
    <ProtectWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* Header - Always on top */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Layout container - accounts for header height */}
        <div className="flex h-[calc(100vh-4rem)] pt-0">
          {/* Desktop Sidebar - Fixed below header */}
          <div className="hidden lg:block lg:fixed lg:top-16 lg:left-0 lg:bottom-0 lg:w-72 lg:z-10">
            <div className="h-full bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
              {/* User Profile in Sidebar */}
              {user && (
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{user.fullName}</p>
                      <p className="text-xs text-gray-500">Super Admin</p>
                    </div>
                  </div>
                </div>
              )}
              
              <nav className="mt-6 px-4">
                <div className="space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors min-h-[44px] ${
                          item.current
                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>

          {/* Mobile Sidebar - Overlay */}
          <div className={`lg:hidden fixed top-16 left-0 bottom-0 w-72 sm:w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-30 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <span className="font-semibold text-gray-800 text-sm sm:text-base">Admin Panel</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Mobile User Profile */}
            {user && (
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{user.fullName}</p>
                    <p className="text-xs text-gray-500">Super Admin</p>
                  </div>
                </div>
              </div>
            )}
            
            <nav className="mt-6 px-4 sm:px-6">
              <div className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors min-h-[44px] ${
                        item.current
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Mobile Overlay - Below header */}
          {sidebarOpen && (
            <div
              className="lg:hidden fixed top-16 left-0 right-0 bottom-0 backdrop-blur-lg z-20"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main content - Account for fixed sidebar on desktop */}
          <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
            <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectWrapper>
  );
}