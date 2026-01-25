"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchIssues } from "@/redux/slices/issuesSlice";
import { Activity, Filter, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import VMCLoader from "@/components/ui/VMCLoader";
import IssueDetailModal from "@/components/admin/IssueDetailModal";

export default function ActivityPage() {
  const dispatch = useAppDispatch();
  const { issues, error, pagination } = useAppSelector((state) => state.issues);
  const { user } = useAppSelector((state) => state.userState);
  
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    search: "",
    page: 1
  });

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setPageLoading(true);
      dispatch(fetchIssues({
        assigneeId: user.id,
        page: filters.page,
        pageSize: 20,
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.priority !== "all" && { priority: filters.priority })
      })).finally(() => setPageLoading(false));
    }
  }, [dispatch, user?.id, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleViewIssue = (issueId: string) => {
    setSelectedIssueId(issueId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIssueId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'bg-green-100 text-green-800';
      case 'RESOLVED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED': return 'bg-purple-100 text-purple-800';
      case 'REOPENED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <VMCLoader size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
        <p className="text-red-800 text-sm sm:text-base">Error loading activity: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-blue-100 p-3 sm:p-4 rounded-full">
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Activity</h1>
            <p className="text-sm md:text-base text-gray-600">Track all your assigned issue activities and updates</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 flex-1">
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(value) => handleFilterChange("priority", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>

            <div className="sm:col-span-2 lg:col-span-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by ticket number..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
            Assigned Issues Activity ({pagination.total})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {issues.map((issue) => (
            <div key={issue.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <span className="font-medium text-gray-900 text-sm sm:text-base">#{issue.ticketNumber}</span>
                    <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                      {issue.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={`text-xs ${getPriorityColor(issue.priority)}`}>
                      {issue.priority}
                    </Badge>
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {issue.category?.name || 'N/A'}
                  </h4>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {issue.description || 'No description provided'}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                    <span>Created: {formatDate(issue.createdAt)}</span>
                    <span>Updated: {formatDate(issue.updatedAt)}</span>
                    {issue.assignedAt && (
                      <span>Assigned: {formatDate(issue.assignedAt)}</span>
                    )}
                    {issue.reporter && (
                      <span>Reporter: {issue.reporter.fullName}</span>
                    )}
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 w-full sm:w-auto"
                  onClick={() => handleViewIssue(issue.id)}
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="text-xs sm:text-sm"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="text-xs sm:text-sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {issues.length === 0 && (
          <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
            <Activity className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">No assigned issues found</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">Your assigned issue activities will appear here</p>
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      {selectedIssueId && (
        <IssueDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          issueId={selectedIssueId}
        />
      )}
    </div>
  );
}