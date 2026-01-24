"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Building, Shield } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import VMCLoader from "@/components/ui/VMCLoader";

export default function FieldWorkerProfilePage() {
  const { user } = useAppSelector((state) => state.userState);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <VMCLoader size={48} />
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
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
        <Card className="h-fit">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-4 sm:p-6 pt-2">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Full Name</label>
              <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">{user.fullName}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Email Address</label>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-900 break-all text-sm sm:text-base">{user.email}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Phone Number</label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <p className="text-gray-900">{user.phoneNumber || 'Not provided'}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Role</label>
              <div className="mt-1">
                <Badge className={getRoleBadgeColor(user.role)}>
                  <Shield className="w-3 h-3 mr-1" />
                  {user.role.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card className="h-fit">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Building className="w-4 h-4 sm:w-5 sm:h-5" />
              Work Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-4 sm:p-6 pt-2">
            {user.zone && (
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Zone</label>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-900 break-words">{user.zone.name}</p>
                </div>
              </div>
            )}
            
            {user.ward && (
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Ward</label>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-900 break-words">Ward {user.ward.wardNumber} - {user.ward.name}</p>
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Status</label>
              <div className="mt-1">
                <Badge className={user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            
            {user.createdAt && (
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Member Since</label>
                <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}