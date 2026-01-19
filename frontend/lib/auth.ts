import apiClient from './apiClient';

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
}

export const authService = {
  // Login function
  login: async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      
      const { token, user } = response.data.data;
      
      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  },

  // Logout function
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
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

  // Register user (Admin only)
  registerUser: async (userData: any) => {
    try {
      const response = await apiClient.post('/admin/register', userData);
      return { success: true, data: response.data.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors || [],
      };
    }
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