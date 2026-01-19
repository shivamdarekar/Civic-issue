// Barrel export for all types
// This allows clean imports like: import { RegisterUserData, IssueType } from '../types'

// Auth types
export * from './auth.types';

// Admin types
export * from './admin.types';

// Issue types
export * from './issues.types';

// User types
export * from './user.types';

// Common/shared types
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: any[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}