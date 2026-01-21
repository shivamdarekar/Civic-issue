/**
 * API Client for VMC Civic App
 * Centralized HTTP client with type-safe methods for authentication endpoints
 */

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const ADMIN_BASE_URL = `${API_BASE_URL}/admin`;

interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}

interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  data: null;
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error: any) {
    // Handle network errors or JSON parse errors
    if (error.message === 'Failed to fetch') {
      return {
        success: false,
        statusCode: 500,
        message: 'Network error. Please check your connection.',
        data: null,
      };
    }
    
    // Return API error response
    return error as ApiError;
  }
}

/**
 * Get authentication headers with JWT token
 */
function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}


// ============================================
// Type Definitions
// ============================================

export type UserRole = 'FIELD_WORKER' | 'WARD_ENGINEER' | 'ZONE_OFFICER' | 'SUPER_ADMIN';
export type Department = 'ROAD' | 'STORM_WATER_DRAINAGE' | 'STREET_LIGHT' | 'GARBAGE';

export interface Ward {
  wardNumber: number;
  name: string;
}

export interface Zone {
  name: string;
}

// ============================================
// Authentication API Methods
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    role: UserRole;
    department?: Department;
    wardId?: string;
    zoneId?: string;
    ward?: Ward;
    zone?: Zone;
    isActive: boolean;
  };
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  department?: Department;
  wardId?: string;
  zoneId?: string;
  ward?: Ward;
  zone?: Zone;
  isActive: boolean;
}

/**
 * Login user
 */
export async function login(
  email: string,
  password: string
): Promise<ApiResponse<LoginResponse>> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Get current user profile
 */
export async function getProfile(): Promise<ApiResponse<UserProfile>> {
  return apiRequest<UserProfile>('/auth/profile', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
}

/**
 * Logout user
 */
export async function logout(): Promise<ApiResponse<null>> {
  return apiRequest<null>('/auth/logout', {
    method: 'POST',
    headers: getAuthHeaders(),
  });
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  verified: boolean;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// ============================================
// Admin User Management Interfaces
// ============================================

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  department?: Department;
  isActive: boolean;
  wardId?: string;
  zoneId?: string;
  ward?: Ward;
  zone?: Zone;
  createdAt: string;
}

export interface UserStatistics {
  user: {
    id: string;
    fullName: string;
    role: UserRole;
    isActive: boolean;
  };
  statistics: {
    totalAssigned: number;
    activeIssues: number;
    resolvedIssues: number;
    avgResolutionDays: number;
    resolutionRate: number;
  };
}

export interface ReassignmentIssue {
  ticketNumber: string;
  status: string;
  priority: string;
}

export interface ReassignmentResult {
  message: string;
  reassignedCount: number;
  fromUser: {
    id: string;
    fullName: string;
    role: string;
  };
  toUser: {
    id: string;
    fullName: string;
    role: string;
  };
  issues: ReassignmentIssue[];
}

export interface UserFilterParams {
  role?: UserRole;
  wardId?: string;
  zoneId?: string;
  isActive?: boolean;
  department?: Department;
}

export interface UpdateUserData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: UserRole;
  wardId?: string;
  zoneId?: string;
  department?: Department;
}


/**
 * Request OTP for password reset
 */
export async function requestPasswordResetOtp(
  email: string
): Promise<ApiResponse<ForgotPasswordResponse>> {
  return apiRequest<ForgotPasswordResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Verify OTP code
 */
export async function verifyOtp(
  email: string,
  otp: string
): Promise<ApiResponse<VerifyOtpResponse>> {
  return apiRequest<VerifyOtpResponse>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
}

/**
 * Reset password with verified OTP
 */
export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<ApiResponse<ResetPasswordResponse>> {
  return apiRequest<ResetPasswordResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, otp, newPassword }),
  });
}

// ============================================
// Admin User Management API Methods
// ============================================

export interface RegisterUserRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
  department?: Department;
  wardId?: string;
  zoneId?: string;
}

export interface ZoneWithWards {
  id: string;
  name: string;
  wards: Array<{
    id: string;
    wardNumber: number;
    name: string;
  }>;
}

/**
 * Register new user (Super Admin only)
 */
export async function registerUser(
  userData: RegisterUserRequest
): Promise<ApiResponse<User>> {
  return apiRequest<User>('/admin/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(userData),
  });
}

/**
 * Get all departments (Super Admin only)
 */
export async function getDepartments(): Promise<ApiResponse<Array<{value: string, label: string}>>> {
  return apiRequest<Array<{value: string, label: string}>>(`${ADMIN_BASE_URL}/departments`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
}

/**
 * Get all zones (Super Admin only)
 */
export async function getZones(): Promise<ApiResponse<Array<{id: string, name: string}>>> {
  return apiRequest<Array<{id: string, name: string}>>(`${ADMIN_BASE_URL}/zones`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
}

/**
 * Get wards for a specific zone (Super Admin only)
 */
export async function getWardsForZone(zoneId: string): Promise<ApiResponse<Array<{wardId: string, wardNumber: number, name: string}>>> {
  return apiRequest<Array<{wardId: string, wardNumber: number, name: string}>>(`${ADMIN_BASE_URL}/zones/${zoneId}/wards`, {
    method: 'GET',
    headers: getAuthHeaders(),
   });
}

/**
 * Get zones and wards for dropdowns (Super Admin only)
 * @deprecated Use getZones() and getWardsForZone() instead
 */
export async function getZonesAndWards(): Promise<ApiResponse<ZoneWithWards[]>> {
  return apiRequest<ZoneWithWards[]>('/admin/zones-wards', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
}

/**
 * Get all users (Super Admin only)
 */
export async function getAllUsers(): Promise<ApiResponse<User[]>> {
  return apiRequest<User[]>(`${ADMIN_BASE_URL}/users`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
}

/**
 * Get user by ID (Super Admin only)
 */
export async function getUserById(userId: string): Promise<ApiResponse<User>> {
  return apiRequest<User>(`${ADMIN_BASE_URL}/users/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
}

/**
 * Update user details (Super Admin only)
 */
export async function updateUser(
  userId: string,
  data: UpdateUserData
): Promise<ApiResponse<User>> {
  return apiRequest<User>(`${ADMIN_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
}

/**
 * Get filtered users for reassignment dropdown (Super Admin only)
 */
export async function getFilteredUsers(
  filters: UserFilterParams
): Promise<ApiResponse<User[]>> {
  const queryParams = new URLSearchParams();
  
  if (filters.role) queryParams.append('role', filters.role);
  if (filters.wardId) queryParams.append('wardId', filters.wardId);
  if (filters.zoneId) queryParams.append('zoneId', filters.zoneId);
  if (filters.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
  if (filters.department) queryParams.append('department', filters.department);
  
  const queryString = queryParams.toString();
  const endpoint = queryString 
    ? `${ADMIN_BASE_URL}/users/filter/search?${queryString}`
    : `${ADMIN_BASE_URL}/users/filter/search`;
  
  return apiRequest<User[]>(endpoint, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
}

/**
 * Reassign user's work to another user (Super Admin only)
 */
export async function reassignUserWork(
  fromUserId: string,
  toUserId: string
): Promise<ApiResponse<ReassignmentResult>> {
  return apiRequest<ReassignmentResult>(`${ADMIN_BASE_URL}/users/${fromUserId}/reassign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ toUserId }),
  });
}

/**
 * Get user statistics (Super Admin only)
 */
export async function getUserStatistics(
  userId: string
): Promise<ApiResponse<UserStatistics>> {
  return apiRequest<UserStatistics>(`${ADMIN_BASE_URL}/users/${userId}/statistics`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
}

/**
 * Deactivate user (Super Admin only)
 */
export async function deactivateUser(userId: string): Promise<ApiResponse<User>> {
  return apiRequest<User>(`${ADMIN_BASE_URL}/users/${userId}/deactivate`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
}

/**
 * Reactivate user (Super Admin only)
 */
export async function reactivateUser(userId: string): Promise<ApiResponse<User>> {
  return apiRequest<User>(`${ADMIN_BASE_URL}/users/${userId}/reactivate`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
}


// Export API client object for organized imports
export const apiClient = {
  auth: {
    login,
    getProfile,
    logout,
    requestPasswordResetOtp,
    verifyOtp,
    resetPassword,
  },
  admin: {
    registerUser,
    getDepartments,
    getZones,
    getWardsForZone,
    getZonesAndWards, // deprecated
    getAllUsers,
    getUserById,
    updateUser,
    getFilteredUsers,
    reassignUserWork,
    getUserStatistics,
    deactivateUser,
    reactivateUser,
  },
};

export default apiClient;
