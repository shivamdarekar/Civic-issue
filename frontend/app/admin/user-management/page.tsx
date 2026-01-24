"use client";

import { useState, useEffect } from "react";
import { Users, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserManagement from "@/components/admin/UserManagement";
import AddUserDialog from "@/components/admin/AddUserDialog";
import ViewUserDialog from "@/components/admin/ViewUserDialog";
import EditUserDialog from "@/components/admin/EditUserDialog";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchDepartments, fetchZonesOverview, fetchAllUsers, fetchAvailableRoles } from "@/redux";

export default function UserManagementPage() {
  const dispatch = useAppDispatch();
  const { departments, zonesOverview: zones, users: apiUsers, usersPagination, availableRoles, loading } = useAppSelector(state => state.admin);
  const [users, setUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ status: 'Active', role: 'All' });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllUsers({ 
      page: currentPage, 
      limit: 18, 
      status: filters.status !== 'All' ? filters.status : undefined,
      role: filters.role !== 'All' ? filters.role : undefined
    }));
    dispatch(fetchDepartments());
    dispatch(fetchZonesOverview());
    dispatch(fetchAvailableRoles());
  }, [dispatch, currentPage, filters]);

  useEffect(() => {
    if (apiUsers) {
      // Transform API data to match UI expectations
      const transformedUsers = apiUsers.map((user: any) => ({
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phoneNumber,
        department: user.department,
        ward: user.ward?.name ? `Ward ${user.ward.wardNumber} - ${user.ward.name}` : null,
        zone: user.zone?.name || null,
        status: user.isActive ? 'Active' : 'Inactive',
        createdAt: user.createdAt
      }));
      setUsers(transformedUsers);
    }
  }, [apiUsers]);

  const handleUserAdded = (newUser: any) => {
    // Refresh users list after adding new user
    dispatch(fetchAllUsers({ 
      page: currentPage, 
      limit: 18, 
      status: filters.status !== 'All' ? filters.status : undefined,
      role: filters.role !== 'All' ? filters.role : undefined
    }));
  };

  const handleFiltersChange = (newFilters: { status: string; role: string }) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowViewDialog(true);
  };

  const handleEditUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowEditDialog(true);
  };

  const handleUserUpdated = () => {
    dispatch(fetchAllUsers({ 
      page: currentPage, 
      limit: 18, 
      status: filters.status !== 'All' ? filters.status : undefined,
      role: filters.role !== 'All' ? filters.role : undefined
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-0">
      {/* Header */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">User Management</CardTitle>
                <p className="text-sm sm:text-base text-gray-600">
                  Manage system users and their permissions
                  {usersPagination && (
                    <span className="ml-2 text-blue-600">
                      ({usersPagination.totalUsers} total users)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto min-h-[44px]">
              <Plus className="w-4 h-4 mr-2" /> Add User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Management Component */}
      <UserManagement 
        users={users} 
        onUsersChange={setUsers}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
        onFiltersChange={handleFiltersChange}
        allRoles={availableRoles}
        departments={departments}
        zones={zones}
      />

      {/* Pagination */}
      {usersPagination && usersPagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Showing {((currentPage - 1) * 18) + 1} to {Math.min(currentPage * 18, usersPagination.totalUsers)} of {usersPagination.totalUsers} users
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!usersPagination.hasPreviousPage || loading}
                  className="px-2 sm:px-3 min-h-[44px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Previous</span>
                </Button>
                <div className="flex items-center gap-1">
                  {(() => {
                    const maxPages = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5;
                    return Array.from({ length: Math.min(maxPages, usersPagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (usersPagination.totalPages <= maxPages) {
                        pageNum = i + 1;
                      } else if (currentPage <= Math.floor(maxPages/2) + 1) {
                        pageNum = i + 1;
                      } else if (currentPage >= usersPagination.totalPages - Math.floor(maxPages/2)) {
                        pageNum = usersPagination.totalPages - maxPages + 1 + i;
                      } else {
                        pageNum = currentPage - Math.floor(maxPages/2) + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className="w-8 h-8 sm:w-9 sm:h-9 p-0 text-xs sm:text-sm min-h-[44px] min-w-[44px]"
                        >
                          {pageNum}
                        </Button>
                      );
                    });
                  })()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!usersPagination.hasNextPage || loading}
                  className="px-2 sm:px-3 min-h-[44px]"
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add User Dialog */}
      <AddUserDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onUserAdded={handleUserAdded}
        departments={departments}
        zones={zones}
      />

      {/* View User Dialog */}
      <ViewUserDialog
        open={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        userId={selectedUserId}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onUserUpdated={handleUserUpdated}
        userId={selectedUserId}
        departments={departments}
        zones={zones}
      />
    </div>
  );
}