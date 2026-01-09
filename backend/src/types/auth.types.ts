import { UserRole } from "@prisma/client";

// Auth request/response types
export interface RegisterUserData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
  wardId?: string;
  zoneId?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  wardId?: string;
  zoneId?: string;
}

// Request body validation types
export interface RegisterRequestBody {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
  wardId?: string;
  zoneId?: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}