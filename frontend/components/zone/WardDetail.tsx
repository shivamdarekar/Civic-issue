"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MapPin, 
  Users, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  ArrowLeft,
  Phone,
  Mail,
  MoreVertical,
  Eye
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ViewUserDialog from "@/components/admin/ViewUserDialog";

interface WardDetailProps {
  wardDetail: {
    wardNumber: number;
    wardName: string;
    zoneName: string;
    engineers: Array<{
      id: string;
      fullName: string;
      email: string;
      phoneNumber: string;
      isActive: boolean;
      department: string;
    }>;
    totalEngineers: number;
    totalIssues: number;
    open: number;
    inProgress: number;
    assigned: number;
    resolved: number;
    verified: number;
    reopened: number;
    rejected: number;
    slaBreached: number;
    slaCompliance: number;
    priorities: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    avgOpenDays: number;
    oldestOpenDays: number;
    issues: Array<{
      id: string;
      status: string;
      priority: string;
      categoryName: string;
      department: string;
      createdAt: string;
      resolvedAt: string | null;
      slaTargetAt: string | null;
      priorityWeight: number;
      hasBeforeImage: boolean;
      hasAfterImage: boolean;
    }>;
  };
}

export default function WardDetail({ wardDetail }: WardDetailProps) {
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowViewDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-red-100 text-red-700";
      case "ASSIGNED": return "bg-blue-100 text-blue-700";
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-700";
      case "RESOLVED": return "bg-green-100 text-green-700";
      case "VERIFIED": return "bg-emerald-100 text-emerald-700";
      case "REOPENED": return "bg-orange-100 text-orange-700";
      case "REJECTED": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return "bg-red-100 text-red-700";
      case "HIGH": return "bg-orange-100 text-orange-700";
      case "MEDIUM": return "bg-yellow-100 text-yellow-700";
      case "LOW": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getSlaColor = (compliance: number) => {
    if (compliance >= 90) return "text-green-600";
    if (compliance >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <Link href="/zone-officer">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Zone Overview
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Ward {wardDetail.wardNumber} - {wardDetail.wardName}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">{wardDetail.zoneName}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Total Issues</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {wardDetail.totalIssues || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">SLA Breached</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {wardDetail.slaBreached || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <TrendingUp className={`w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 ${
                getSlaColor(wardDetail.slaCompliance || 0)
              }`} />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">SLA Compliance</p>
                <p className={`text-lg sm:text-2xl font-bold ${
                  getSlaColor(wardDetail.slaCompliance || 0)
                }`}>
                  {wardDetail.slaCompliance ? `${wardDetail.slaCompliance.toFixed(1)}%` : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Engineers</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {wardDetail.totalEngineers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Issue Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-4">
            {[
              { label: 'Open', value: wardDetail.open, color: 'bg-red-50 text-red-700' },
              { label: 'Assigned', value: wardDetail.assigned, color: 'bg-blue-50 text-blue-700' },
              { label: 'In Progress', value: wardDetail.inProgress, color: 'bg-yellow-50 text-yellow-700' },
              { label: 'Resolved', value: wardDetail.resolved, color: 'bg-green-50 text-green-700' },
              { label: 'Verified', value: wardDetail.verified, color: 'bg-emerald-50 text-emerald-700' },
              { label: 'Reopened', value: wardDetail.reopened, color: 'bg-orange-50 text-orange-700' },
              { label: 'Rejected', value: wardDetail.rejected, color: 'bg-gray-50 text-gray-700' }
            ].map((status) => (
              <div key={status.label} className={`text-center p-2 sm:p-3 rounded-lg ${status.color}`}>
                <p className="text-xs sm:text-sm font-medium">{status.label}</p>
                <p className="text-sm sm:text-xl font-bold">{status.value || 0}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engineers and Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Ward Engineers</CardTitle>
          </CardHeader>
          <CardContent>
            {wardDetail.engineers && wardDetail.engineers.length > 0 ? (
              <div className="space-y-3">
                {wardDetail.engineers.map((engineer) => (
                  <div key={engineer.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{engineer.fullName}</p>
                        <p className="text-xs sm:text-sm text-gray-600">{engineer.department}</p>
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{engineer.email}</span>
                          </div>
                          {engineer.phoneNumber && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Phone className="w-3 h-3" />
                              <span>{engineer.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={engineer.isActive ? "default" : "secondary"} className="text-xs">
                          {engineer.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewUser(engineer.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No engineers assigned</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Critical', value: wardDetail.priorities?.critical, color: 'bg-red-50 text-red-700' },
                { label: 'High', value: wardDetail.priorities?.high, color: 'bg-orange-50 text-orange-700' },
                { label: 'Medium', value: wardDetail.priorities?.medium, color: 'bg-yellow-50 text-yellow-700' },
                { label: 'Low', value: wardDetail.priorities?.low, color: 'bg-green-50 text-green-700' }
              ].map((priority) => (
                <div key={priority.label} className={`flex items-center justify-between p-3 rounded-lg ${priority.color}`}>
                  <span className="font-medium">{priority.label}</span>
                  <span className="text-lg sm:text-xl font-bold">{priority.value || 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Recent Issues</CardTitle>
        </CardHeader>
        <CardContent>
          {wardDetail.issues && wardDetail.issues.length > 0 ? (
            <div className="space-y-3">
              {wardDetail.issues.slice(0, 10).map((issue) => (
                <div key={issue.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </Badge>
                      </div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{issue.categoryName}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{issue.department}</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(issue.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {issue.hasBeforeImage && (
                        <CheckCircle className="w-4 h-4 text-green-600" title="Has before image" />
                      )}
                      {issue.hasAfterImage && (
                        <CheckCircle className="w-4 h-4 text-blue-600" title="Has after image" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No issues found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <ViewUserDialog
        open={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        userId={selectedUserId}
      />
    </div>
  );
}