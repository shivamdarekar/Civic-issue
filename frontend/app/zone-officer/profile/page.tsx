"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Phone, MapPin, Building, Shield, AlertTriangle } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.userState);

  if (!user) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No user data available
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-700';
      case 'ZONE_OFFICER': return 'bg-blue-100 text-blue-700';
      case 'WARD_ENGINEER': return 'bg-green-100 text-green-700';
      case 'FIELD_WORKER': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-blue-100 p-3 sm:p-4 rounded-full">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Profile</h1>
            <p className="text-sm sm:text-base text-gray-600">View your account information</p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 pt-0">
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-base sm:text-lg font-semibold text-gray-900">{user.fullName}</p>
            </div>
            
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-500">Email Address</label>
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                <p className="text-sm sm:text-base text-gray-900 break-all">{user.email}</p>
              </div>
            </div>
            
            {user.phoneNumber && (
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">Phone Number</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <p className="text-sm sm:text-base text-gray-900">{user.phoneNumber}</p>
                </div>
              </div>
            )}
            
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-500">Role</label>
              <div className="mt-1">
                <Badge className={getRoleBadgeColor(user.role)}>
                  <Shield className="w-3 h-3 mr-1" />
                  <span className="text-xs sm:text-sm">{user.role.replace('_', ' ')}</span>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Building className="w-4 h-4 sm:w-5 sm:h-5" />
              Work Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 pt-0">
            {user.department && (
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">Department</label>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {user.department.replace('_', ' ')} Department
                </p>
              </div>
            )}
            
            {user.zone && (
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">Zone</label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <p className="text-sm sm:text-base text-gray-900">{user.zone.name}</p>
                </div>
              </div>
            )}
            
            {user.ward && (
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">Ward</label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <p className="text-sm sm:text-base text-gray-900">Ward {user.ward.wardNumber} - {user.ward.name}</p>
                </div>
              </div>
            )}
            
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge className={user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  <span className="text-xs sm:text-sm">{user.isActive ? 'Active' : 'Inactive'}</span>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}