import { apiClient } from './api-client';
import { AppDispatch } from '@/redux/store';
import { setUserState, clearUserState } from '@/redux';
import { clearAuth } from '@/redux';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: 'FIELD_WORKER' | 'WARD_ENGINEER' | 'ZONE_OFFICER' | 'SUPER_ADMIN';
  department?: string | null;
  wardId?: string | null;
  zoneId?: string | null;
  ward?: {
    id: string;
    wardNumber: number;
    name: string;
    zone?: {
      id: string;
      name: string;
      code: string;
    };
  } | null;
  zone?: {
    id: string;
    name: string;
    code: string;
  } | null;
  gamification?: {
    points: number;
    badges: string[];
  } | null;
  isActive?: boolean;
  createdAt?: string;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  message?: string;
  token?: string;
}

export const authService = {
  // Login function using Redux dispatch
  login: async (email: string, password: string, dispatch: AppDispatch): Promise<LoginResult> => {
    const response = await apiClient.auth.login(email, password);
    
    if (response.success && response.data) {
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      
      // Set user in Redux state
      dispatch(setUserState(user as User));
      
      return { success: true, user: user as User, token };
    }
    
    return {
      success: false,
      message: response.message || 'Login failed',
    };
  },

  // Logout function with Redux dispatch
  logout: async (dispatch: AppDispatch) => {
    try {
      await apiClient.auth.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear token and Redux state
      localStorage.removeItem('authToken');
      dispatch(clearAuth());
      dispatch(clearUserState());
      // Force a hard redirect to ensure clean state
      window.location.replace('/login');
    }
  },

  // Fetch fresh user profile with Redux dispatch
  fetchProfile: async (dispatch: AppDispatch): Promise<User | null> => {
    const response = await apiClient.auth.getProfile();
    
    if (response.success && response.data) {
      dispatch(setUserState(response.data as User));
      return response.data as User;
    }
    
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  // Get user role from Redux state
  getUserRole: (user: User | null): string | null => {
    return user?.role || null;
  },

  // Get dashboard redirect URL based on role
  getDashboardUrl: (role: string): string => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '/admin';
      case 'ZONE_OFFICER':
        return '/zone-officer';
      case 'WARD_ENGINEER':
        return '/ward-engineer';
      case 'FIELD_WORKER':
        return '/field-worker';
      default:
        return '/';
    }
  }
};
