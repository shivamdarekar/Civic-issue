"use client";

import { useAppSelector } from "@/redux/hooks";
import { User, Mail, Phone, MapPin, Building } from "lucide-react";
import VMCLoader from "@/components/ui/VMCLoader";

export default function FieldWorkerProfilePage() {
  const { user } = useAppSelector((state) => state.userState);

  // Debug log to see user data
  console.log('Field Worker user data:', user);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <VMCLoader size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-100 p-3 rounded-lg">
            <User className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
            <p className="text-gray-600">Your account information</p>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
              {user.fullName}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
              {user.email}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
              {user.phoneNumber || 'Not provided'}
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Role
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
              Field Worker
            </div>
          </div>

          {/* Ward Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ward Number
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
              {user.ward?.wardNumber || 'Not assigned'}
            </div>
          </div>

          {/* Ward Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ward Name
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
              {user.ward?.name || 'Not assigned'}
            </div>
          </div>

          {/* Zone Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Zone Name
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
              {user.zone?.name || 'Not assigned'}
            </div>
          </div>

          {/* Zone Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Zone Code
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
              {user.zone?.code || 'Not assigned'}
            </div>
          </div>

          {/* Account Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Account Status
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Member Since */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Member Since
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Profile information is read-only. Contact your administrator to make changes.
          </p>
        </div>
      </div>
    </div>
  );
}