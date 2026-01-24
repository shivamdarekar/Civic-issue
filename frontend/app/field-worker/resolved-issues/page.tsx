"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchIssues } from "@/redux/slices/issuesSlice";
import { Camera, Upload, CheckCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import VMCLoader from "@/components/ui/VMCLoader";
import IssueDetailModal from "@/components/admin/IssueDetailModal";
import AfterImageUploadDialog from "@/components/field-worker/AfterImageUploadDialog";

export default function ResolvedIssuesPage() {
  const dispatch = useAppDispatch();
  const { issues, loading, error, pagination } = useAppSelector((state) => state.issues);
  const { user } = useAppSelector((state) => state.userState);
  
  const [filters, setFilters] = useState({
    page: 1
  });
  
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleViewIssue = (issueId: string) => {
    setSelectedIssueId(issueId);
    setIsDetailModalOpen(true);
  };

  const handleAddImages = (issueId: string) => {
    setSelectedIssueId(issueId);
    setIsUploadDialogOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedIssueId(null);
  };

  const handleCloseUploadDialog = () => {
    setIsUploadDialogOpen(false);
    setSelectedIssueId(null);
  };

  const handleImageUploadSuccess = () => {
    // Refresh the issues list after successful upload
    if (user?.id) {
      dispatch(fetchIssues({
        reporterId: user.id,
        status: "RESOLVED",
        page: filters.page,
        pageSize: 20
      }));
    }
    handleCloseUploadDialog();
  };

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchIssues({
        reporterId: user.id,
        status: "RESOLVED",
        page: filters.page,
        pageSize: 20
      }));
    }
  }, [dispatch, user?.id, filters]);

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <VMCLoader size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
        <p className="text-red-800 text-sm sm:text-base">Error loading resolved issues: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-green-100 p-3 sm:p-4 rounded-full">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Resolved Issues</h1>
            <p className="text-sm sm:text-base text-gray-600">Add after images to completed work</p>
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
            Resolved Issues ({pagination.total})
          </h3>
        </div>
        
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          <div className="divide-y divide-gray-200">
            {issues.map((issue) => {
              const hasAfterImages = issue.media?.some(m => m.type === 'AFTER');
              return (
                <div key={issue.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        issue.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        issue.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        issue.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {issue.priority}
                      </span>
                      {hasAfterImages ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Images Added
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Images Pending
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">#{issue.ticketNumber}</p>
                      <p className="text-sm text-gray-600">{issue.category?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">
                        Resolved: {issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-2 w-full sm:w-auto"
                        onClick={() => handleViewIssue(issue.id)}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      {!hasAfterImages && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-2 w-full sm:w-auto"
                          onClick={() => handleAddImages(issue.id)}
                        >
                          <Camera className="w-4 h-4" />
                          Add Images
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resolved Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  After Images
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {issues.map((issue) => {
                const hasAfterImages = issue.media?.some(m => m.type === 'AFTER');
                return (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {issue.ticketNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {issue.category?.name || 'N/A'}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasAfterImages ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Added
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-2"
                          onClick={() => handleViewIssue(issue.id)}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        {!hasAfterImages && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-2"
                            onClick={() => handleAddImages(issue.id)}
                          >
                            <Camera className="w-4 h-4" />
                            Add Images
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">No resolved issues found</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">Issues will appear here once they are resolved by ward engineers</p>
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      {selectedIssueId && (
        <IssueDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          issueId={selectedIssueId}
        />
      )}

      {/* After Image Upload Dialog */}
      {selectedIssueId && (
        <AfterImageUploadDialog
          isOpen={isUploadDialogOpen}
          onClose={handleCloseUploadDialog}
          issueId={selectedIssueId}
          onSuccess={handleImageUploadSuccess}
        />
      )}
    </div>
  );
}