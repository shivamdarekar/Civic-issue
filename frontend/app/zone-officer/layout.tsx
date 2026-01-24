"use client";

import { useState, useEffect } from "react";
import { Shield, BarChart3, Menu, X, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/zone/Header";
import ProtectWrapper from "@/components/auth/ProtectWrapper";

export default function ZoneOfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    {
      name: "Zone Overview",
      href: "/zone-officer",
      icon: BarChart3,
      current: pathname === "/zone-officer",
    },
    {
      name: "Profile",
      href: "/zone-officer/profile",
      icon: Shield,
      current: pathname === "/zone-officer/profile",
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
            <Card className="h-full rounded-none border-r">
              <CardContent className="p-0">
                <nav className="mt-8 px-4">
                  <div className="space-y-2">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.name}
                          asChild
                          variant={item.current ? "default" : "ghost"}
                          className="w-full justify-start"
                        >
                          <Link href={item.href}>
                            <Icon className="w-5 h-5 mr-3" />
                            {item.name}
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className={`lg:hidden fixed top-16 left-0 bottom-0 w-72 sm:w-80 bg-background shadow-lg transform transition-transform duration-300 ease-in-out z-30 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <Card className="h-full rounded-none">
              <CardContent className="p-0">
                <div className="flex items-center justify-between h-16 px-4 border-b">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    <Badge variant="outline" className="text-xs sm:text-sm">Zone Officer</Badge>
                  </div>
                  <Button
                    onClick={() => setSidebarOpen(false)}
                    variant="ghost"
                    size="sm"
                    className="p-2 hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
                
                <nav className="mt-4 px-3 sm:px-4">
                  <div className="space-y-1">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.name}
                          asChild
                          variant={item.current ? "default" : "ghost"}
                          className="w-full justify-start text-sm"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Link href={item.href}>
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                            {item.name}
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                </nav>
              </CardContent>
            </Card>
          </div>

          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 top-16 bg-black bg-opacity-50 backdrop-blur-sm z-20"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
            <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectWrapper>
  );
}