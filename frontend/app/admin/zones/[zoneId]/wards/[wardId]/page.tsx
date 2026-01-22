"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, AlertTriangle, Clock, TrendingUp, Building, MapPin, ExternalLink, MoreVertical, Eye, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchWardDetail, getWardIssues, clearAdminError } from "@/redux";
import { ErrorState, EmptyState } from "@/components/admin/ErrorBoundary";
import IssueDetailModal from "@/components/admin/IssueDetailModal";
import ViewUserDialog from "@/components/admin/ViewUserDialog";

export default function WardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentWardDetail, wardIssues, loading, loadingIssues, error } = useAppSelector(state => state.admin);
  
  const wardId = params.wardId as string;
  const zoneId = params.zoneId as string;
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowViewDialog(true);
  };

  useEffect(() => {
    if (wardId) {
      dispatch(clearAdminError());
      dispatch(fetchWardDetail(wardId));
      dispatch(getWardIssues({ wardId, filters: {} }));
    }
  }, [dispatch, wardId]);

  const handleRetry = () => {
    dispatch(clearAdminError());
    dispatch(fetchWardDetail(wardId));
    dispatch(getWardIssues({ wardId, filters: {} }));
  };

  const handleIssueClick = (issueId: string) => {
    setSelectedIssueId(issueId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'VERIFIED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10" />
          <div className="space-y-2">
            <Skeleton className="w-64 h-8" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/zones/${zoneId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Zone
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Ward Details</h1>
        </div>
        <ErrorState 
          title="Failed to load ward details"
          message={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (!currentWardDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/zones/${zoneId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Zone
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Ward Details</h1>
        </div>
        <EmptyState 
          title="Ward not found"
          message="The requested ward could not be found. It may have been removed or you may not have permission to view it."
          icon={<Building className="w-8 h-8 text-gray-400" />}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/zones/${zoneId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Zone
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Ward {currentWardDetail.wardNumber} - {currentWardDetail.wardName}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">{currentWardDetail.zoneName}</p>
          </div>
        </div>
      </div>

      {/* Ward Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Total Issues</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {currentWardDetail.totalIssues || 0}
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
                  {currentWardDetail.slaBreached || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <TrendingUp className={`w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 ${
                (currentWardDetail.slaCompliance || 0) >= 90 ? 'text-green-600' :
                (currentWardDetail.slaCompliance || 0) >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`} />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">SLA Compliance</p>
                <p className={`text-lg sm:text-2xl font-bold ${
                  (currentWardDetail.slaCompliance || 0) >= 90 ? 'text-green-600' :
                  (currentWardDetail.slaCompliance || 0) >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {currentWardDetail.slaCompliance ? `${currentWardDetail.slaCompliance.toFixed(1)}%` : '0%'}
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
                  {currentWardDetail.totalEngineers || 0}
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
              { label: 'Open', value: currentWardDetail.open, color: 'bg-red-50 text-red-700' },
              { label: 'Assigned', value: currentWardDetail.assigned, color: 'bg-blue-50 text-blue-700' },
              { label: 'In Progress', value: currentWardDetail.inProgress, color: 'bg-yellow-50 text-yellow-700' },
              { label: 'Resolved', value: currentWardDetail.resolved, color: 'bg-green-50 text-green-700' },
              { label: 'Verified', value: currentWardDetail.verified, color: 'bg-emerald-50 text-emerald-700' },
              { label: 'Reopened', value: currentWardDetail.reopened, color: 'bg-orange-50 text-orange-700' },
              { label: 'Rejected', value: currentWardDetail.rejected, color: 'bg-gray-50 text-gray-700' }
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
            {currentWardDetail.engineers && currentWardDetail.engineers.length > 0 ? (
              <div className="space-y-3">
                {currentWardDetail.engineers.map((engineer) => (
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
                { label: 'Critical', value: currentWardDetail.priorities?.critical, color: 'bg-red-50 text-red-700' },
                { label: 'High', value: currentWardDetail.priorities?.high, color: 'bg-orange-50 text-orange-700' },
                { label: 'Medium', value: currentWardDetail.priorities?.medium, color: 'bg-yellow-50 text-yellow-700' },
                { label: 'Low', value: currentWardDetail.priorities?.low, color: 'bg-green-50 text-green-700' }
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
          <CardTitle className="text-base sm:text-lg">Latest Issues</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingIssues ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : wardIssues.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No issues found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {wardIssues.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10).map((issue) => (
                <div key={issue.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(issue.priority)}`}>
                          {issue.priority || 'N/A'}
                        </Badge>
                      </div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{issue.category || 'N/A'}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{issue.department?.replace('_', ' ') || 'N/A'}</p>
                      <p className="text-xs text-gray-500">
                        Updated: {formatDate(issue.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleIssueClick(issue.id)}
                        className="flex items-center gap-1 text-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issue Detail Modal */}
      {selectedIssueId && (
        <IssueDetailModal 
          isOpen={!!selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
          issueId={selectedIssueId}
        />
      )}

      {/* View User Dialog */}
      <ViewUserDialog
        open={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        userId={selectedUserId}
      />
    </div>
  );
}