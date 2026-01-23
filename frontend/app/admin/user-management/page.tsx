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
import { fetchDepartments, fetchZonesOverview, fetchAllUsers } from "@/redux";

export default function UserManagementPage() {
  const dispatch = useAppDispatch();
  const { departments, zonesOverview: zones, users: apiUsers, usersPagination, loading } = useAppSelector(state => state.admin);
  const [users, setUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllUsers({ page: currentPage, limit: 18 }));
    dispatch(fetchDepartments());
    dispatch(fetchZonesOverview());
  }, [dispatch, currentPage]);

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
    dispatch(fetchAllUsers({ page: currentPage, limit: 18 }));
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
    dispatch(fetchAllUsers({ page: currentPage, limit: 18 }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</CardTitle>
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
            <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
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
        departments={departments}
        zones={zones}
      />

      {/* Pagination */}
      {usersPagination && usersPagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * 18) + 1} to {Math.min(currentPage * 18, usersPagination.totalUsers)} of {usersPagination.totalUsers} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!usersPagination.hasPreviousPage || loading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, usersPagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (usersPagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= usersPagination.totalPages - 2) {
                      pageNum = usersPagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!usersPagination.hasNextPage || loading}
                >
                  Next
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