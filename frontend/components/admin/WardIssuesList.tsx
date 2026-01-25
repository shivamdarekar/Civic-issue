"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Search, Filter, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchIssues } from "@/redux";
import IssueDetailModal from "./IssueDetailModal";

interface WardIssuesListProps {
  wardId: string;
}

export default function WardIssuesList({ wardId }: WardIssuesListProps) {
  const dispatch = useAppDispatch();
  const { issues, pagination, loading, error } = useAppSelector(state => state.issues);
  
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalLoading, setModalLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "ALL_STATUS",
    priority: "ALL_PRIORITY",
    categoryId: "ALL_CATEGORY",
    search: ""
  });

  const pageSize = 10;

  useEffect(() => {
    loadIssues();
  }, [wardId, currentPage, filters]);

  const loadIssues = () => {
    const params = {
      wardId,
      page: currentPage,
      pageSize,
      ...(filters.status !== "ALL_STATUS" && { status: filters.status }),
      ...(filters.priority !== "ALL_PRIORITY" && { priority: filters.priority }),
      ...(filters.categoryId !== "ALL_CATEGORY" && { categoryId: filters.categoryId }),
      ...(filters.search && { q: filters.search })
    };
    
    dispatch(fetchIssues(params));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: "ALL_STATUS", priority: "ALL_PRIORITY", categoryId: "ALL_CATEGORY", search: "" });
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = pagination.totalPages || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Ward Issues</span>
          <Badge variant="outline" className="text-sm">
            {pagination.total || 0} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Ticket number..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_STATUS">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Priority</Label>
            <Select value={filters.priority} onValueChange={(value) => handleFilterChange("priority", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_PRIORITY">All Priority</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" onClick={clearFilters} className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Issues Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadIssues} variant="outline">
              Retry
            </Button>
          </div>
        ) : issues?.length ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues.map((issue: any) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium">
                      {issue.ticketNumber}
                    </TableCell>
                    <TableCell>{issue.category?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{issue.assignee?.fullName || 'Unassigned'}</TableCell>
                    <TableCell>{formatDate(issue.createdAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setModalLoading(true);
                          setSelectedIssueId(issue.id);
                        }}
                        disabled={modalLoading && selectedIssueId === issue.id}
                      >
                        <Eye className="w-4 h-4" />
                        {modalLoading && selectedIssueId === issue.id ? 'Loading...' : ''}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} issues
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No issues found</p>
          </div>
        )}
      </CardContent>

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
    </Card>
  );
}