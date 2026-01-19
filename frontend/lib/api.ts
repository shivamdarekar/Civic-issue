// Mock API utility functions for admin user management (Frontend Development)
// Replace with actual API calls when backend is ready

import apiClient from './apiClient';

const API_BASE_URL = 'http://localhost:5000/api/v1/admin';

// Mock data for development
let mockUsers = [
  {
    id: 'user-1',
    fullName: 'Rajesh Kumar',
    email: 'rajesh.kumar@vmc.gov.in',
    phoneNumber: '9876543210',
    role: 'FIELD_WORKER',
    isActive: true,
    wardId: 'ward-1',
    ward: { wardNumber: 1, name: 'Fatehgunj' },
    zone: { name: 'North Zone' },
    createdAt: '2026-01-10T10:00:00.000Z'
  },
  {
    id: 'user-2',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@vmc.gov.in',
    phoneNumber: '9876543220',
    role: 'WARD_ENGINEER',
    department: 'ROAD',
    isActive: true,
    wardId: 'ward-1',
    zoneId: 'zone-1',
    ward: { wardNumber: 1, name: 'Fatehgunj' },
    zone: { name: 'North Zone' },
    createdAt: '2026-01-09T10:00:00.000Z'
  },
  {
    id: 'user-3',
    fullName: 'Amit Patel',
    email: 'amit.patel@vmc.gov.in',
    phoneNumber: '9876543230',
    role: 'ZONE_OFFICER',
    isActive: true,
    zoneId: 'zone-1',
    zone: { name: 'North Zone' },
    createdAt: '2026-01-08T10:00:00.000Z'
  },
  {
    id: 'user-4',
    fullName: 'Suresh Mehta',
    email: 'suresh.mehta@vmc.gov.in',
    phoneNumber: '9876543240',
    role: 'FIELD_WORKER',
    isActive: false,
    wardId: 'ward-2',
    ward: { wardNumber: 2, name: 'Alkapuri' },
    zone: { name: 'South Zone' },
    createdAt: '2026-01-07T10:00:00.000Z'
  },
  {
    id: 'user-5',
    fullName: 'Kavita Singh',
    email: 'kavita.singh@vmc.gov.in',
    phoneNumber: '9876543250',
    role: 'WARD_ENGINEER',
    department: 'STORM_WATER_DRAINAGE',
    isActive: true,
    wardId: 'ward-2',
    zoneId: 'zone-2',
    ward: { wardNumber: 2, name: 'Alkapuri' },
    zone: { name: 'South Zone' },
    createdAt: '2026-01-06T10:00:00.000Z'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API response wrapper
const mockApiResponse = (data: any, message: string = 'Success') => ({
  success: true,
  statusCode: 200,
  data,
  message
});

export const adminAPI = {
  // Get all users
  getAllUsers: async () => {
    await delay(500);
    return mockApiResponse([...mockUsers], 'Users retrieved successfully');
  },

  // Get user by ID
  getUserById: async (userId: string) => {
    await delay(300);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    return mockApiResponse({ ...user }, 'User retrieved successfully');
  },

  // Update user details - only send changed fields
  updateUser: async (userId: string, userData: any) => {
    await delay(800);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const currentUser = mockUsers[userIndex];
    
    // Check if user is SUPER_ADMIN
    if (currentUser.role === 'SUPER_ADMIN') {
      throw new Error('Cannot update Super Admin account');
    }
    
    // Validate email uniqueness
    if (userData.email && mockUsers.some(u => u.id !== userId && u.email === userData.email)) {
      throw new Error('Email or phone number already exists');
    }
    
    // Validate phone uniqueness
    if (userData.phoneNumber && mockUsers.some(u => u.id !== userId && u.phoneNumber === userData.phoneNumber)) {
      throw new Error('Email or phone number already exists');
    }
    
    // Role-specific validation
    if (userData.role === 'WARD_ENGINEER' && (!userData.wardId || !userData.department)) {
      throw new Error('Ward Engineer must have wardId and department');
    }
    if (userData.role === 'FIELD_WORKER' && !userData.wardId) {
      throw new Error('Field Worker must have wardId');
    }
    if (userData.role === 'ZONE_OFFICER' && !userData.zoneId) {
      throw new Error('Zone Officer must have zoneId');
    }
    
    // Update mock user with only provided fields
    const updatedUser = { ...currentUser, ...userData };
    
    // Update ward/zone info based on IDs
    if (userData.wardId) {
      const wards = {
        'ward-1': { wardNumber: 1, name: 'Fatehgunj' },
        'ward-2': { wardNumber: 2, name: 'Alkapuri' },
        'ward-3': { wardNumber: 3, name: 'Manjalpur' },
        'ward-4': { wardNumber: 4, name: 'Gotri' },
        'ward-5': { wardNumber: 5, name: 'Akota' }
      };
      updatedUser.ward = wards[userData.wardId as keyof typeof wards];
    }
    
    if (userData.zoneId) {
      const zones = {
        'zone-1': { name: 'North Zone' },
        'zone-2': { name: 'South Zone' },
        'zone-3': { name: 'East Zone' },
        'zone-4': { name: 'West Zone' }
      };
      updatedUser.zone = zones[userData.zoneId as keyof typeof zones];
    }
    
    mockUsers[userIndex] = updatedUser;
    return mockApiResponse({ ...updatedUser }, 'User updated successfully');
  },

  // Get filtered users for reassignment
  getFilteredUsers: async (params: Record<string, string>) => {
    await delay(400);
    let filtered = mockUsers.filter(user => {
      if (params.role && user.role !== params.role) return false;
      if (params.wardId && user.wardId !== params.wardId) return false;
      if (params.zoneId && user.zoneId !== params.zoneId) return false;
      if (params.isActive && user.isActive.toString() !== params.isActive) return false;
      if (params.department && user.department !== params.department) return false;
      return true;
    });
    return mockApiResponse([...filtered], 'Filtered users retrieved successfully');
  },

  // Reassign user's work
  reassignWork: async (fromUserId: string, toUserId: string) => {
    await delay(1000);
    const fromUser = mockUsers.find(u => u.id === fromUserId);
    const toUser = mockUsers.find(u => u.id === toUserId);
    
    if (!fromUser) {
      throw new Error('Source user not found');
    }
    if (!toUser) {
      throw new Error('Target user not found');
    }
    
    // Validate same role
    if (fromUser.role !== toUser.role) {
      throw new Error(`Cannot reassign work between different roles (${fromUser.role} → ${toUser.role})`);
    }
    
    // Validate same ward for Ward Engineer/Field Worker
    if ((fromUser.role === 'WARD_ENGINEER' || fromUser.role === 'FIELD_WORKER') && fromUser.wardId !== toUser.wardId) {
      throw new Error('Both users must be assigned to the same ward');
    }
    
    // Validate same zone for Zone Officer
    if (fromUser.role === 'ZONE_OFFICER' && fromUser.zoneId !== toUser.zoneId) {
      throw new Error('Both users must be assigned to the same zone');
    }
    
    // Validate target user is active
    if (!toUser.isActive) {
      throw new Error('Cannot reassign to inactive user');
    }
    
    const reassignedCount = Math.floor(Math.random() * 15) + 1;
    
    return mockApiResponse({
      message: `Successfully reassigned ${reassignedCount} active issue(s) from ${fromUser.fullName} to ${toUser.fullName}`,
      reassignedCount,
      fromUser: { id: fromUser.id, fullName: fromUser.fullName, role: fromUser.role },
      toUser: { id: toUser.id, fullName: toUser.fullName, role: toUser.role },
      issues: Array.from({ length: Math.min(reassignedCount, 3) }, (_, i) => ({
        ticketNumber: `VMC-2026-${String(Math.floor(Math.random() * 1000) + 1).padStart(6, '0')}`,
        status: Math.random() > 0.5 ? 'IN_PROGRESS' : 'ASSIGNED',
        priority: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)]
      }))
    }, 'Work reassigned successfully');
  },

  // Get user statistics
  getUserStatistics: async (userId: string) => {
    await delay(600);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const stats = {
      totalAssigned: Math.floor(Math.random() * 50) + 20,
      activeIssues: Math.floor(Math.random() * 15) + 5,
      resolvedIssues: Math.floor(Math.random() * 40) + 15,
      avgResolutionDays: Math.round((Math.random() * 5 + 1) * 10) / 10,
      resolutionRate: Math.floor(Math.random() * 30) + 70
    };
    
    return mockApiResponse({
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive
      },
      statistics: stats
    }, 'User statistics retrieved successfully');
  },

  // Deactivate user
  deactivateUser: async (userId: string) => {
    await delay(500);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    if (mockUsers[userIndex].role === 'SUPER_ADMIN') {
      throw new Error('Cannot deactivate Super Admin account');
    }
    
    mockUsers[userIndex].isActive = false;
    return mockApiResponse({ ...mockUsers[userIndex] }, 'User deactivated successfully');
  },

  // Reactivate user
  reactivateUser: async (userId: string) => {
    await delay(500);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    mockUsers[userIndex].isActive = true;
    return mockApiResponse({ ...mockUsers[userIndex] }, 'User reactivated successfully');
  },

  // Create new user
  createUser: async (userData: any) => {
    await delay(1000);
    
    // Validate required fields
    if (!userData.fullName || userData.fullName.length < 2 || userData.fullName.length > 100) {
      throw new Error('Full name must be between 2-100 characters');
    }
    
    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      throw new Error('Invalid email format');
    }
    
    if (!userData.phoneNumber || !/^[6-9]\d{9}$/.test(userData.phoneNumber)) {
      throw new Error('Invalid Indian mobile number');
    }
    
    // Check uniqueness
    if (mockUsers.some(u => u.email === userData.email)) {
      throw new Error('Email already exists');
    }
    
    if (mockUsers.some(u => u.phoneNumber === userData.phoneNumber)) {
      throw new Error('Phone number already exists');
    }
    
    // Role-specific validation
    if (userData.role === 'WARD_ENGINEER' && (!userData.wardId || !userData.department)) {
      throw new Error('Ward Engineer must have wardId and department');
    }
    if (userData.role === 'FIELD_WORKER' && !userData.wardId) {
      throw new Error('Field Worker must have wardId');
    }
    if (userData.role === 'ZONE_OFFICER' && !userData.zoneId) {
      throw new Error('Zone Officer must have zoneId');
    }
    
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    // Add ward/zone info
    if (userData.wardId) {
      const wards = {
        'ward-1': { wardNumber: 1, name: 'Fatehgunj' },
        'ward-2': { wardNumber: 2, name: 'Alkapuri' },
        'ward-3': { wardNumber: 3, name: 'Manjalpur' },
        'ward-4': { wardNumber: 4, name: 'Gotri' },
        'ward-5': { wardNumber: 5, name: 'Akota' }
      };
      newUser.ward = wards[userData.wardId as keyof typeof wards];
    }
    
    if (userData.zoneId) {
      const zones = {
        'zone-1': { name: 'North Zone' },
        'zone-2': { name: 'South Zone' },
        'zone-3': { name: 'East Zone' },
        'zone-4': { name: 'West Zone' }
      };
      newUser.zone = zones[userData.zoneId as keyof typeof zones];
    }
    
    mockUsers.push(newUser);
    return mockApiResponse({ ...newUser }, 'User created successfully');
  },
};

export type User = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'FIELD_WORKER' | 'WARD_ENGINEER' | 'ZONE_OFFICER' | 'SUPER_ADMIN';
  department?: string;
  isActive: boolean;
  wardId?: string;
  zoneId?: string;
  ward?: {
    wardNumber: number;
    name: string;
  };
  zone?: {
    name: string;
  };
  createdAt: string;
};

export type UserStatistics = {
  totalAssigned: number;
  activeIssues: number;
  resolvedIssues: number;
  avgResolutionDays: number;
  resolutionRate: number;
};