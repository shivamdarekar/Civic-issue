"use client";

import { useState, useEffect } from "react";
import { Users, Plus } from "lucide-react";
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
  const { departments, zonesOverview: zones, users: apiUsers, loading } = useAppSelector(state => state.admin);
  const [users, setUsers] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(fetchDepartments());
    dispatch(fetchZonesOverview());
  }, [dispatch]);

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
    dispatch(fetchAllUsers());
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
    dispatch(fetchAllUsers());
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
                <p className="text-sm sm:text-base text-gray-600">Manage system users and their permissions</p>
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