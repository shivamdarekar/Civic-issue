"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchIssues } from "@/redux/slices/issuesSlice";
import { Eye, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VMCLoader from "@/components/ui/VMCLoader";
import IssueDetailModal from "@/components/admin/IssueDetailModal";

export default function MyIssuesPage() {
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
  const [modalLoading, setModalLoading] = useState(false);

  const handleViewIssue = (issueId: string) => {
    setModalLoading(true);
    setSelectedIssueId(issueId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIssueId(null);
    setModalLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      setPageLoading(true);
      dispatch(fetchIssues({
        reporterId: user.id,
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
        <p className="text-red-800 text-sm sm:text-base">Error loading issues: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">My Issues</h1>
        <p className="text-sm sm:text-base text-gray-600">All issues created by you</p>
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
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
                <SelectItem value="REOPENED">Reopened</SelectItem>
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

            <div className="sm:col-span-2">
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

      {/* Issues Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
            Issues ({pagination.total})
          </h3>
        </div>
        
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          <div className="divide-y divide-gray-200">
            {issues.map((issue) => (
              <div key={issue.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      issue.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                      issue.status === 'RESOLVED' ? 'bg-blue-100 text-blue-800' :
                      issue.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                      issue.status === 'ASSIGNED' ? 'bg-purple-100 text-purple-800' :
                      issue.status === 'REOPENED' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      issue.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      issue.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      issue.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {issue.priority}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">#{issue.ticketNumber}</p>
                    <p className="text-sm text-gray-600">{issue.category?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2 w-full"
                    onClick={() => handleViewIssue(issue.id)}
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {issue.ticketNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      issue.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                      issue.status === 'RESOLVED' ? 'bg-blue-100 text-blue-800' :
                      issue.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                      issue.status === 'ASSIGNED' ? 'bg-purple-100 text-purple-800' :
                      issue.status === 'REOPENED' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      issue.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      issue.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      issue.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {issue.category?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => handleViewIssue(issue.id)}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <p className="text-gray-500 text-sm sm:text-base">No issues found</p>
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