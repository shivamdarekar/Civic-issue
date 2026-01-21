import { apiClient } from './api-client';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'FIELD_WORKER' | 'WARD_ENGINEER' | 'ZONE_OFFICER' | 'SUPER_ADMIN';
  department?: string;
  wardId?: string;
  zoneId?: string;
  isActive: boolean;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  message?: string;
  token?: string;
}

export const authService = {
  // Login function using the API client
  login: async (email: string, password: string): Promise<LoginResult> => {
    const response = await apiClient.auth.login(email, password);
    
    if (response.success && response.data) {
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user, token };
    }
    
    return {
      success: false,
      message: response.message || 'Login failed',
    };
  },

  // Logout function with API call
  logout: async () => {
    try {
      await apiClient.auth.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Fetch fresh user profile from API
  fetchProfile: async (): Promise<User | null> => {
    const response = await apiClient.auth.getProfile();
    
    if (response.success && response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }
    
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  // Get user role
  getUserRole: (): string | null => {
    const user = authService.getCurrentUser();
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
