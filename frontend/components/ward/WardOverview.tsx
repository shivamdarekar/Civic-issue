"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, AlertTriangle, TrendingUp, Clock, CheckCircle, User, Building } from "lucide-react";

interface WardEngineerDashboard {
  wardId: string;
  department: string;
  totalIssues: number;
  issuesByStatus: Record<string, number>;
  issuesByPriority: Record<string, number>;
  sla: {
    withinSla: number;
    breachedSla: number;
  };
  averageResolutionTimeHours: number | null;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  department?: string | null;
  wardId?: string | null;
  zoneId?: string | null;
  ward?: {
    wardNumber: number;
    name: string;
  } | null;
  zone?: {
    name: string;
  } | null;
  isActive?: boolean;
}

interface WardOverviewProps {
  wardDashboard: WardEngineerDashboard | null;
  user: User;
}

export default function WardOverview({ wardDashboard, user }: WardOverviewProps) {
  // Show loading state if user data or ward dashboard is not available
  if (!wardDashboard || !user || !user.ward) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 sm:h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getSlaColor = (breached: number, total: number) => {
    const compliance = total > 0 ? ((total - breached) / total) * 100 : 100;
    if (compliance >= 90) return "text-green-600 bg-green-50";
    if (compliance >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const totalSlaIssues = wardDashboard.sla.withinSla + wardDashboard.sla.breachedSla;
  const slaCompliance = totalSlaIssues > 0 ? (wardDashboard.sla.withinSla / totalSlaIssues) * 100 : 100;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
              <Building className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">
                Ward {user.ward.wardNumber} - {user.ward.name}
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                {wardDashboard.department.replace('_', ' ')} Department
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs sm:text-sm w-fit">
            Ward Engineer Dashboard
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Total Issues</p>
                <p className="font-bold text-sm sm:text-lg lg:text-xl text-gray-900">
                  {wardDashboard.totalIssues}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-orange-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">SLA Breached</p>
                <p className="font-bold text-sm sm:text-lg lg:text-xl text-gray-900">
                  {wardDashboard.sla.breachedSla}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-2 sm:p-3 lg:p-4">
            <div className={`flex items-center gap-2 sm:gap-3 p-2 rounded-lg ${getSlaColor(wardDashboard.sla.breachedSla, totalSlaIssues)}`}>
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm truncate">SLA Compliance</p>
                <p className="font-bold text-sm sm:text-lg lg:text-xl">
                  {slaCompliance.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Avg Resolution</p>
                <p className="font-bold text-sm sm:text-lg lg:text-xl text-gray-900">
                  {wardDashboard.averageResolutionTimeHours 
                    ? `${wardDashboard.averageResolutionTimeHours.toFixed(1)}h`
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status and Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base lg:text-lg">Issues by Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 sm:space-y-3">
              {Object.entries(wardDashboard.issuesByStatus).map(([status, count]) => {
                const getStatusColor = (status: string) => {
                  switch (status.toUpperCase()) {
                    case 'OPEN': return 'bg-red-50 text-red-700';
                    case 'ASSIGNED': return 'bg-blue-50 text-blue-700';
                    case 'IN_PROGRESS': return 'bg-yellow-50 text-yellow-700';
                    case 'RESOLVED': return 'bg-green-50 text-green-700';
                    case 'VERIFIED': return 'bg-emerald-50 text-emerald-700';
                    default: return 'bg-gray-50 text-gray-700';
                  }
                };
                
                return (
                  <div key={status} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${getStatusColor(status)}`}>
                    <span className="font-medium capitalize text-xs sm:text-sm">{status.replace('_', ' ')}</span>
                    <span className="text-sm sm:text-lg font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base lg:text-lg">Issues by Priority</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 sm:space-y-3">
              {Object.entries(wardDashboard.issuesByPriority).map(([priority, count]) => {
                const getPriorityColor = (priority: string) => {
                  switch (priority.toUpperCase()) {
                    case 'CRITICAL': return 'bg-red-50 text-red-700';
                    case 'HIGH': return 'bg-orange-50 text-orange-700';
                    case 'MEDIUM': return 'bg-yellow-50 text-yellow-700';
                    case 'LOW': return 'bg-green-50 text-green-700';
                    default: return 'bg-gray-50 text-gray-700';
                  }
                };
                
                return (
                  <div key={priority} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${getPriorityColor(priority)}`}>
                    <span className="font-medium capitalize text-xs sm:text-sm">{priority}</span>
                    <span className="text-sm sm:text-lg font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}