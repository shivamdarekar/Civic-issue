"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { adminAPI, User, UserStatistics } from "@/lib/api";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  UserCheck, 
  UserX, 
  RefreshCw,
  Search,
  Filter,
  BarChart3
} from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Form states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [reassignCandidates, setReassignCandidates] = useState<User[]>([]);
  const [selectedReassignUser, setSelectedReassignUser] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "",
    department: "",
    wardId: "",
    zoneId: ""
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber.includes(searchTerm)
      );
    }

    if (roleFilter !== "ALL") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(user => 
        statusFilter === "ACTIVE" ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  };

  const handleEditUser = async (user: User) => {
    try {
      const response = await adminAPI.getUserById(user.id);
      const userData = response.data;
      
      setEditingUser(userData);
      setFormData({
        fullName: userData.fullName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        department: userData.department || "",
        wardId: userData.wardId || "",
        zoneId: userData.zoneId || ""
      });
      setShowEditDialog(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Failed to load user details');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const updateData: any = {};
      
      // Only include changed fields
      if (formData.fullName !== editingUser.fullName) updateData.fullName = formData.fullName;
      if (formData.email !== editingUser.email) updateData.email = formData.email;
      if (formData.phoneNumber !== editingUser.phoneNumber) updateData.phoneNumber = formData.phoneNumber;
      if (formData.role !== editingUser.role) updateData.role = formData.role;
      if (formData.department !== (editingUser.department || "")) updateData.department = formData.department;
      if (formData.wardId !== (editingUser.wardId || "")) updateData.wardId = formData.wardId;
      if (formData.zoneId !== (editingUser.zoneId || "")) updateData.zoneId = formData.zoneId;

      await adminAPI.updateUser(editingUser.id, updateData);
      
      setShowEditDialog(false);
      setEditingUser(null);
      loadUsers();
      alert('User updated successfully');
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert(error.message || 'Failed to update user');
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      if (user.isActive) {
        await adminAPI.deactivateUser(user.id);
        alert(`${user.fullName} has been deactivated`);
      } else {
        await adminAPI.reactivateUser(user.id);
        alert(`${user.fullName} has been reactivated`);
      }
      loadUsers();
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      alert(error.message || 'Failed to update user status');
    }
  };

  const handleViewStats = async (user: User) => {
    try {
      const response = await adminAPI.getUserStatistics(user.id);
      setUserStats(response.data.statistics);
      setEditingUser(user);
      setShowStatsDialog(true);
    } catch (error) {
      console.error('Error loading user statistics:', error);
      alert('Failed to load user statistics');
    }
  };

  const handleReassignWork = async (user: User) => {
    try {
      // Get eligible users for reassignment
      const params: Record<string, string> = {
        role: user.role,
        isActive: 'true'
      };
      
      // Add ward/zone constraints based on role
      if (user.role === 'WARD_ENGINEER' || user.role === 'FIELD_WORKER') {
        if (user.wardId) params.wardId = user.wardId;
      }
      if (user.role === 'ZONE_OFFICER') {
        if (user.zoneId) params.zoneId = user.zoneId;
      }

      const response = await adminAPI.getFilteredUsers(params);
      const candidates = response.data.filter((candidate: User) => candidate.id !== user.id);
      
      if (candidates.length === 0) {
        alert('No eligible users found for reassignment. Users must have the same role and assignment.');
        return;
      }
      
      setReassignCandidates(candidates);
      setEditingUser(user);
      setShowReassignDialog(true);
    } catch (error) {
      console.error('Error loading reassignment candidates:', error);
      alert('Failed to load reassignment candidates');
    }
  };

  const handleConfirmReassign = async () => {
    if (!editingUser || !selectedReassignUser) return;

    try {
      const response = await adminAPI.reassignWork(editingUser.id, selectedReassignUser);
      
      setShowReassignDialog(false);
      setSelectedReassignUser("");
      alert(`Successfully reassigned ${response.data.reassignedCount} issues`);
    } catch (error: any) {
      console.error('Error reassigning work:', error);
      alert(error.message || 'Failed to reassign work');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-700';
      case 'ZONE_OFFICER': return 'bg-purple-100 text-purple-700';
      case 'WARD_ENGINEER': return 'bg-blue-100 text-blue-700';
      case 'FIELD_WORKER': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <img src="/VMC.webp" alt="Loading" className="w-12 h-12 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">User Management</h2>
        </div>
        <Button onClick={loadUsers} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="FIELD_WORKER">Field Worker</SelectItem>
              <SelectItem value="WARD_ENGINEER">Ward Engineer</SelectItem>
              <SelectItem value="ZONE_OFFICER">Zone Officer</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Assignment</th>
                <th className="text-left p-3">Contact</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div>
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-gray-500 text-xs">{user.email}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                    {user.department && (
                      <div className="text-xs text-gray-500 mt-1">{user.department}</div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      {user.ward && <div>Ward {user.ward.wardNumber} - {user.ward.name}</div>}
                      {user.zone && <div>{user.zone.name}</div>}
                      {!user.ward && !user.zone && <span className="text-gray-400">Not assigned</span>}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      <div>{user.phoneNumber}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge className={user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleViewStats(user)}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                      >
                        <BarChart3 className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        onClick={() => handleEditUser(user)}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>

                      {user.role !== 'SUPER_ADMIN' && (
                        <>
                          {user.isActive && (
                            <Button
                              onClick={() => handleReassignWork(user)}
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              title="Reassign Work"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </Button>
                          )}

                          <Button
                            onClick={() => handleToggleUserStatus(user)}
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            {user.isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User - {editingUser?.fullName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
            <Input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Input
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            />
            <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIELD_WORKER">Field Worker</SelectItem>
                <SelectItem value="WARD_ENGINEER">Ward Engineer</SelectItem>
                <SelectItem value="ZONE_OFFICER">Zone Officer</SelectItem>
              </SelectContent>
            </Select>
            
            {(formData.role === 'WARD_ENGINEER') && (
              <>
                <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROAD">Road</SelectItem>
                    <SelectItem value="STORM_WATER_DRAINAGE">Storm Water Drainage</SelectItem>
                    <SelectItem value="SOLID_WASTE_MANAGEMENT">Solid Waste Management</SelectItem>
                    <SelectItem value="WATER_SUPPLY">Water Supply</SelectItem>
                    <SelectItem value="STREET_LIGHTING">Street Lighting</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={formData.wardId} onValueChange={(value) => setFormData({...formData, wardId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Ward" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ward-1">Ward 1 - Fatehgunj</SelectItem>
                    <SelectItem value="ward-2">Ward 2 - Alkapuri</SelectItem>
                    <SelectItem value="ward-3">Ward 3 - Manjalpur</SelectItem>
                    <SelectItem value="ward-4">Ward 4 - Gotri</SelectItem>
                    <SelectItem value="ward-5">Ward 5 - Akota</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            
            {formData.role === 'FIELD_WORKER' && (
              <Select value={formData.wardId} onValueChange={(value) => setFormData({...formData, wardId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Ward" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ward-1">Ward 1 - Fatehgunj</SelectItem>
                  <SelectItem value="ward-2">Ward 2 - Alkapuri</SelectItem>
                  <SelectItem value="ward-3">Ward 3 - Manjalpur</SelectItem>
                  <SelectItem value="ward-4">Ward 4 - Gotri</SelectItem>
                  <SelectItem value="ward-5">Ward 5 - Akota</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            {formData.role === 'ZONE_OFFICER' && (
              <Select value={formData.zoneId} onValueChange={(value) => setFormData({...formData, zoneId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zone-1">North Zone</SelectItem>
                  <SelectItem value="zone-2">South Zone</SelectItem>
                  <SelectItem value="zone-3">East Zone</SelectItem>
                  <SelectItem value="zone-4">West Zone</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="flex gap-2">
              <Button onClick={handleUpdateUser} className="flex-1">
                Update User
              </Button>
              <Button onClick={() => setShowEditDialog(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Statistics Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Statistics - {editingUser?.fullName}</DialogTitle>
          </DialogHeader>
          {userStats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">{userStats.totalAssigned}</div>
                <div className="text-sm text-gray-600">Total Assigned</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded">
                <div className="text-2xl font-bold text-orange-600">{userStats.activeIssues}</div>
                <div className="text-sm text-gray-600">Active Issues</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">{userStats.resolvedIssues}</div>
                <div className="text-sm text-gray-600">Resolved Issues</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded">
                <div className="text-2xl font-bold text-purple-600">{userStats.resolutionRate}%</div>
                <div className="text-sm text-gray-600">Resolution Rate</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reassign Work Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Work - {editingUser?.fullName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select a user to reassign all active issues from {editingUser?.fullName}:
            </p>
            
            <Select value={selectedReassignUser} onValueChange={setSelectedReassignUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select user to reassign to" />
              </SelectTrigger>
              <SelectContent>
                {reassignCandidates.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.fullName} - {candidate.role.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {reassignCandidates.length === 0 && (
              <p className="text-sm text-red-600">
                No eligible users found for reassignment. Users must have the same role and assignment.
              </p>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleConfirmReassign} 
                disabled={!selectedReassignUser}
                className="flex-1"
              >
                Confirm Reassignment
              </Button>
              <Button onClick={() => setShowReassignDialog(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}