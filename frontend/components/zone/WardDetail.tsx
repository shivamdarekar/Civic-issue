"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
  Eye,
  ExternalLink,
  BarChart3,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchIssues } from "@/redux";
import ViewUserDialog from "@/components/admin/ViewUserDialog";
import IssueDetailModal from "@/components/admin/IssueDetailModal";
import UserStatsDialog from "@/components/admin/UserStatsDialog";
import VerificationButton from "@/components/zone/VerificationButton";
import ReopenButton from "@/components/zone/ReopenButton";
import AllEngineersDialog from "@/components/zone/AllEngineersDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";

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
  };
  wardId: string;
}

export default function WardDetail({ wardDetail, wardId }: WardDetailProps) {
  const dispatch = useAppDispatch();
  const { issues, loading: issuesLoading, pagination } = useAppSelector((state) => state.issues);
  const { user } = useAppSelector(state => state.userState);
  
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState<string | undefined>(undefined);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalLoading, setModalLoading] = useState(false);
  const pageSize = 10;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch issues when component mounts or filters change
  const fetchIssuesData = useCallback(() => {
    const params: Record<string, string | number> = {
      wardId,
      page: currentPage,
      pageSize,
    };
    
    if (statusFilter && statusFilter !== "all") params.status = statusFilter;
    if (priorityFilter && priorityFilter !== "all") params.priority = priorityFilter;
    if (debouncedSearchQuery.trim()) params.q = debouncedSearchQuery.trim();
    
    dispatch(fetchIssues(params));
  }, [dispatch, wardId, currentPage, statusFilter, priorityFilter, debouncedSearchQuery]);

  useEffect(() => {
    fetchIssuesData();
  }, [fetchIssuesData]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, debouncedSearchQuery]);

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowViewDialog(true);
  };

  const handleViewStats = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setShowStatsDialog(true);
  };

  const handleIssueClick = (issueId: string) => {
    setModalLoading(true);
    setSelectedIssueId(issueId);
  };

  const handleIssueStatusUpdate = useCallback(() => {
    fetchIssuesData();
  }, [fetchIssuesData]);

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
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <Link href="/zone-officer">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Back to Zone Overview
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800">
              Ward {wardDetail.wardNumber} - {wardDetail.wardName}
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">{wardDetail.zoneName}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-2 sm:p-3 lg:p-6">
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Total Issues</p>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900">
                  {wardDetail.totalIssues || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-2 sm:p-3 lg:p-6">
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-orange-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">SLA Breached</p>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900">
                  {wardDetail.slaBreached || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-2 sm:p-3 lg:p-6">
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              <TrendingUp className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 flex-shrink-0 ${
                getSlaColor(wardDetail.slaCompliance || 0)
              }`} />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">SLA Compliance</p>
                <p className={`text-sm sm:text-lg lg:text-2xl font-bold ${
                  getSlaColor(wardDetail.slaCompliance || 0)
                }`}>
                  {wardDetail.slaCompliance ? `${wardDetail.slaCompliance.toFixed(1)}%` : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-2 sm:p-3 lg:p-6">
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Engineers</p>
                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900">
                  {wardDetail.totalEngineers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base lg:text-lg">Issue Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-1 sm:gap-2 lg:gap-4">
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
                <p className="text-xs sm:text-sm lg:text-xl font-bold">{status.value || 0}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engineers and Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">Ward Engineers</CardTitle>
              {wardDetail.engineers && wardDetail.engineers.length > 3 && (
                <AllEngineersDialog 
                  engineers={wardDetail.engineers}
                  onViewProfile={handleViewUser}
                  onViewStats={handleViewStats}
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {wardDetail.engineers && wardDetail.engineers.length > 0 ? (
              <div className="space-y-3">
                {wardDetail.engineers.slice(0, 3).map((engineer) => (
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
                            <DropdownMenuItem onClick={() => handleViewStats(engineer.id, engineer.fullName)}>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Stats
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
                {wardDetail.engineers.length > 3 && (
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-500">
                      Showing 3 of {wardDetail.engineers.length} engineers
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No engineers assigned</p>
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

      {/* Ward Issues with Filters and Pagination */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex flex-col gap-3 sm:gap-4">
            <CardTitle className="text-sm sm:text-base lg:text-lg">Ward Issues</CardTitle>
            <div className="flex flex-col gap-2 sm:gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                <Input
                  placeholder="Search by ticket number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 sm:pl-10 text-sm"
                />
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="ASSIGNED">Assigned</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="REOPENED">Reopened</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {issuesLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading issues...</p>
            </div>
          ) : issues && issues.length > 0 ? (
            <>
              <div className="space-y-3">
                {issues.map((issue) => (
                  <div key={issue.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                            {issue.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={`text-xs ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">#{issue.ticketNumber}</span>
                        </div>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          {issue.category?.name || 'Unknown Category'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {issue.category?.department || 'Unknown Department'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(issue.createdAt).toLocaleDateString()}
                          {issue.assignee && (
                            <span className="ml-2">• Assigned to: {issue.assignee.fullName}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Zone Officer Verification Buttons */}
                        {user?.role === 'ZONE_OFFICER' && issue.status === 'RESOLVED' && (
                          <VerificationButton
                            issueId={issue.id}
                            currentStatus={issue.status}
                            hasAfterImages={issue.media?.some(m => m.type === 'AFTER') || false}
                            onStatusUpdate={handleIssueStatusUpdate}
                          />
                        )}
                        
                        {/* Zone Officer Reopen Button for Verified Issues */}
                        {user?.role === 'ZONE_OFFICER' && issue.status === 'VERIFIED' && (
                          <ReopenButton
                            issueId={issue.id}
                            onSuccess={handleIssueStatusUpdate}
                          />
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleIssueClick(issue.id)}
                          className="flex items-center gap-1 text-xs"
                          disabled={modalLoading && selectedIssueId === issue.id}
                        >
                          <ExternalLink className="w-3 h-3" />
                          {modalLoading && selectedIssueId === issue.id ? 'Loading...' : 'View'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} issues
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No issues found</p>
              {(statusFilter && statusFilter !== "all" || priorityFilter && priorityFilter !== "all" || searchQuery) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    setStatusFilter("all");
                    setPriorityFilter("all");
                    setSearchQuery("");
                    setDebouncedSearchQuery("");
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              )}
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

      {/* User Stats Dialog */}
      <UserStatsDialog
        open={showStatsDialog}
        onClose={() => setShowStatsDialog(false)}
        userId={selectedUserId}
        userName={selectedUserName}
      />

      {/* Issue Detail Modal */}
      {selectedIssueId && (
        <IssueDetailModal 
          isOpen={!!selectedIssueId}
          onClose={() => {
            setSelectedIssueId(null);
            setModalLoading(false);
          }}
          issueId={selectedIssueId}
        />
      )}
    </div>
  );
}