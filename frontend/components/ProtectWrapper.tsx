"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCurrentUser, initializeAuth } from "@/redux/slices/authSlice";
import Loading from "@/components/ui/loading";
import DashboardHeader from "@/components/DashboardHeader";
import AdminOverview from "@/components/admin/AdminOverview";
import FieldWorkerDashboard from "@/components/dashboards/FieldWorkerDashboard";
import WardEngineerDashboard from "@/components/dashboards/WardEngineerDashboard";
import ZoneOfficerDashboard from "@/components/dashboards/ZoneOfficerDashboard";

interface ProtectWrapperProps {
  children: React.ReactNode;
}

export default function ProtectWrapper({ children }: ProtectWrapperProps) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { user, authLoading, isAuthenticated } = useAppSelector((state) => state.auth);

  // Don't initialize auth on auth pages
  const isAuthPage = pathname?.startsWith('/login') || 
                    pathname?.startsWith('/register') || 
                    pathname?.startsWith('/forgot-password') || 
                    pathname?.startsWith('/verify-email');

  useEffect(() => {
    if (!isAuthPage) {
      // Initialize auth from localStorage first
      dispatch(initializeAuth());
    }
  }, [dispatch, isAuthPage]);

  useEffect(() => {
    if (!isAuthPage) {
      // If user is null but we have a token, fetch current user
      const token = localStorage.getItem('authToken');
      if (!user && !authLoading && token) {
        dispatch(fetchCurrentUser());
      }
    }
  }, [dispatch, user, authLoading, isAuthPage]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  // If not authenticated, show children (login page, etc.)
  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  // Show role-based dashboard
  const renderDashboard = () => {
    switch (user.role) {
      case 'SUPER_ADMIN':
        return <AdminOverview />;
      case 'FIELD_WORKER':
        return <FieldWorkerDashboard />;
      case 'WARD_ENGINEER':
        return <WardEngineerDashboard />;
      case 'ZONE_OFFICER':
        return <ZoneOfficerDashboard />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {renderDashboard()}
      </main>
    </div>
  );
}