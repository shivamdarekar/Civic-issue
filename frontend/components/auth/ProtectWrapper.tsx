"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, clearAuth, initializeAuth } from '@/redux';
import { clearUserState } from '@/redux';
import { authService } from '@/lib/auth';
import VMCLoader from '@/components/ui/VMCLoader';
import type { RootState, AppDispatch } from '@/redux';

interface ProtectWrapperProps {
  children: React.ReactNode;
}

export default function ProtectWrapper({ children }: ProtectWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, authLoading } = useSelector((state: RootState) => state.auth);
  const { user } = useSelector((state: RootState) => state.userState);

  useEffect(() => {
    const checkAuth = async () => {
      // Initialize auth state from localStorage
      dispatch(initializeAuth());
      
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        dispatch(clearAuth());
        dispatch(clearUserState());
        window.location.replace('/login');
        return;
      }

      // If we have token but no user data, fetch profile
      if (!user) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          // Clear everything on auth failure
          localStorage.removeItem('authToken');
          dispatch(clearAuth());
          dispatch(clearUserState());
          window.location.replace('/login');
          return;
        }
      }
      
      setIsLoading(false);
    };

    // Only run if we're still loading or don't have user data
    if (isLoading || (!user && localStorage.getItem('authToken'))) {
      checkAuth();
    }
  }, [dispatch, router, isLoading]);

  // Separate effect to handle when user data is loaded
  useEffect(() => {
    if (user && isLoading) {
      setIsLoading(false);
    }
  }, [user, isLoading]);

  // Console log current user state
  useEffect(() => {
    console.log('Current userState:', user);
  }, [user]);

  // Redirect to appropriate dashboard based on role
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const expectedPath = authService.getDashboardUrl(user.role);
      
      // If user is on login page or root, redirect to their dashboard
      if (pathname === '/login' || pathname === '/') {
        router.push(expectedPath);
        return;
      }
      
      // Check if user is accessing the correct role-based route
      const isOnCorrectRoute = pathname.startsWith(expectedPath);
      
      if (!isOnCorrectRoute) {
        // Allow access to common routes like profile, settings, etc.
        const allowedCommonRoutes = ['/profile', '/settings', '/help'];
        const isCommonRoute = allowedCommonRoutes.some(route => pathname.startsWith(route));
        
        if (!isCommonRoute) {
          router.push(expectedPath);
          return;
        }
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <VMCLoader size={48} className="mx-auto mb-4" />
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
}