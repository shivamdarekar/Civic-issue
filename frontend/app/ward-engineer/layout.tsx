"use client";

import { useState, useEffect } from "react";
import { Shield, BarChart3, Menu, X, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/components/ward/Header";
import ProtectWrapper from "@/components/auth/ProtectWrapper";

export default function WardEngineerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    {
      name: "Ward Overview",
      href: "/ward-engineer",
      icon: BarChart3,
      current: pathname === "/ward-engineer",
    },
    {
      name: "Profile",
      href: "/ward-engineer/profile",
      icon: Shield,
      current: pathname === "/ward-engineer/profile",
    },
  ];

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
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex h-[calc(100vh-4rem)] pt-0">
          <div className="hidden lg:block lg:fixed lg:top-16 lg:left-0 lg:bottom-0 lg:w-64 lg:z-10">
            <div className="h-full bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
              <nav className="mt-8 px-4">
                <div className="space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                          item.current
                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>

          <div className={`lg:hidden fixed top-16 left-0 bottom-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-30 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="flex items-center justify-between h-20 px-4 border-b border-gray-200 mt-4">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <span className="font-semibold text-gray-800">Ward Engineer</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="mt-8 px-4">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        item.current
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>

          {sidebarOpen && (
            <div
              className="lg:hidden fixed top-16 left-0 right-0 bottom-0 backdrop-blur-lg z-20"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectWrapper>
  );
}