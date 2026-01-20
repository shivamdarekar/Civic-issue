"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MapPin, Layers, Building2, Calendar, Activity, X } from "lucide-react";
import UserStatistics from "./UserStatistics";
import type { User as UserType, UserStatistics as UserStatsType } from "@/lib/api-client";

interface UserProfileViewProps {
  user: UserType;
  statistics?: UserStatsType;
  onClose: () => void;
  onEdit: () => void;
  onReassign: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}

export default function UserProfileView({
  user,
  statistics,
  onClose,
  onEdit,
  onReassign,
  onDeactivate,
  onReactivate,
}: UserProfileViewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-700 border-red-200';
      case 'ZONE_OFFICER': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'WARD_ENGINEER': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'FIELD_WORKER': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatRole = (role: string) => {
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-4xl bg-white my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.fullName}</h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                  {formatRole(user.role)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  user.isActive 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}>
                  {user.isActive ? '✅ Active' : '⏸️ Inactive'}
                </span>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Information & Work Assignment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Phone Number</div>
                    <div className="font-medium">{user.phoneNumber}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Joined On</div>
                    <div className="font-medium">{formatDate(user.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">User ID</div>
                    <div className="font-mono text-sm">{user.id}</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Work Assignment */}
            <Card className="p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Work Assignment
              </h3>
              <div className="space-y-3">
                {user.ward && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Ward</div>
                      <div className="font-medium">Ward {user.ward.wardNumber} - {user.ward.name}</div>
                    </div>
                  </div>
                )}
                {user.zone && (
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Zone</div>
                      <div className="font-medium">{user.zone.name}</div>
                    </div>
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Department</div>
                      <div className="font-medium">
                        {user.department.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                      </div>
                    </div>
                  </div>
                )}
                {!user.ward && !user.zone && !user.department && (
                  <p className="text-sm text-gray-500 italic">No assignment information available</p>
                )}
              </div>
            </Card>
          </div>

          {/* Statistics Section */}
          {statistics && (
            <UserStatistics statistics={statistics} />
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <Button 
              onClick={onEdit} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Edit User Details
            </Button>
            
            {user.isActive && statistics && statistics.statistics.activeIssues > 0 && (
              <Button 
                onClick={onReassign}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Reassign Work ({statistics.statistics.activeIssues} issues)
              </Button>
            )}
            
            {user.isActive && user.role !== 'SUPER_ADMIN' && (
              <Button 
                onClick={onDeactivate}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                Deactivate User
              </Button>
            )}
            
            {!user.isActive && (
              <Button 
                onClick={onReactivate}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Reactivate User
              </Button>
            )}
            
            <Button 
              onClick={onClose}
              variant="outline"
              className="ml-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
