"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, Building } from "lucide-react";
import { authService } from "@/lib/auth";

interface UserProfileProps {
  userId?: string;
  role: 'FIELD_WORKER' | 'WARD_ENGINEER' | 'ZONE_OFFICER';
}

export default function UserProfile({ userId = 'current-user', role }: UserProfileProps) {
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUserInfo(currentUser);
      } else {
        // Set dummy data if no user found
        const dummyData = {
          id: 'DEMO-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          fullName: role === 'WARD_ENGINEER' ? 'Rajesh Kumar' : 'Priya Sharma',
          email: role === 'WARD_ENGINEER' ? 'rajesh.kumar@vmc.gov.in' : 'priya.sharma@vmc.gov.in',
          phoneNumber: role === 'WARD_ENGINEER' ? '+91 98765 43210' : '+91 98765 43211',
          role: role,
          department: role === 'WARD_ENGINEER' ? 'ROAD' : role === 'ZONE_OFFICER' ? 'SOLID_WASTE_MANAGEMENT' : undefined,
          wardId: role === 'WARD_ENGINEER' ? 'ward-12' : undefined,
          zoneId: role === 'ZONE_OFFICER' ? 'zone-3' : undefined,
          isActive: true
        };
        setUserInfo(dummyData);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ZONE_OFFICER': return 'bg-purple-100 text-purple-700';
      case 'WARD_ENGINEER': return 'bg-blue-100 text-blue-700';
      case 'FIELD_WORKER': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!userInfo) {
    return (
      <Card className="p-6">
        <div className="flex justify-center py-4">
          <img 
            src="/VMC.webp" 
            alt="VMC Logo" 
            className="w-12 h-12 animate-pulse"
          />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-blue-100 p-3 rounded-full">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{userInfo.fullName}</h2>
          <Badge className={getRoleBadgeColor(userInfo.role)}>
            {userInfo.role.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{userInfo.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{userInfo.phoneNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="font-medium">{userInfo.id}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {userInfo.department && (
            <div className="flex items-center gap-3">
              <Building className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{userInfo.department.replace(/_/g, ' ')}</p>
              </div>
            </div>
          )}

          {userInfo.wardId && (
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Ward Assignment</p>
                <p className="font-medium">{userInfo.wardId.replace('ward-', 'Ward ')}</p>
              </div>
            </div>
          )}
          
          {userInfo.zoneId && (
            <div className="flex items-center gap-3">
              <Building className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Zone</p>
                <p className="font-medium">{userInfo.zoneId.replace('zone-', 'Zone ').replace('1', 'North').replace('2', 'South').replace('3', 'East').replace('4', 'West')}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${userInfo.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{userInfo.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Profile information can only be updated by system administrators. 
          Contact your admin for any changes to personal details or role assignments.
        </p>
      </div>
    </Card>
  );
}