"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Edit, Repeat, UserX, UserCheck } from "lucide-react";
import type { User, UserRole, Department } from "@/lib/api-client";

interface UserManagementTableProps {
  users: User[];
  loading?: boolean;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onReassign: (user: User) => void;
  onDeactivate: (user: User) => void;
  onReactivate: (user: User) => void;
}

export default function UserManagementTable({
  users,
  loading = false,
  onView,
  onEdit,
  onReassign,
  onDeactivate,
  onReactivate,
}: UserManagementTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber.includes(searchQuery);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-700';
      case 'ZONE_OFFICER': return 'bg-purple-100 text-purple-700';
      case 'WARD_ENGINEER': return 'bg-blue-100 text-blue-700';
      case 'FIELD_WORKER': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatRole = (role: UserRole) => {
    return role.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="FIELD_WORKER">Field Worker</SelectItem>
                <SelectItem value="WARD_ENGINEER">Ward Engineer</SelectItem>
                <SelectItem value="ZONE_OFFICER">Zone Officer</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Department Filter */}
          {filteredUsers.some(u => u.department) && (
            <div className="md:col-span-1">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="ROAD">Road</SelectItem>
                  <SelectItem value="STORM_WATER_DRAINAGE">Storm Water Drainage</SelectItem>
                  <SelectItem value="STREET_LIGHT">Street Light</SelectItem>
                  <SelectItem value="GARBAGE">Garbage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Showing <span className="font-semibold">{filteredUsers.length}</span> of{' '}
            <span className="font-semibold">{users.length}</span> users
          </div>
          {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || departmentFilter !== 'all') && (
            <Button
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
                setStatusFilter('all');
                setDepartmentFilter('all');
              }}
              variant="ghost"
              size="sm"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No users found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Assignment</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Department</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {/* Name */}
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-xs text-gray-500 font-mono">{user.id.substring(0, 8)}...</div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {formatRole(user.role)}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{user.email}</div>
                        <div className="text-gray-500">{user.phoneNumber}</div>
                      </div>
                    </td>

                    {/* Assignment */}
                    <td className="p-4">
                      <div className="text-sm">
                        {user.ward && (
                          <div className="text-gray-900">
                            Ward {user.ward.wardNumber} - {user.ward.name}
                          </div>
                        )}
                        {user.zone && (
                          <div className="text-gray-900">{user.zone.name}</div>
                        )}
                        {!user.ward && !user.zone && (
                          <span className="text-gray-400 italic">Not assigned</span>
                        )}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="p-4">
                      {user.department ? (
                        <div className="text-xs text-gray-700">
                          {user.department.replace(/_/g, ' ')}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">N/A</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.isActive ? '✅ Active' : '⏸️ Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => onView(user)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => onEdit(user)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {user.isActive && (
                          <>
                            <Button
                              onClick={() => onReassign(user)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              title="Reassign Work"
                            >
                              <Repeat className="w-4 h-4" />
                            </Button>
                            {user.role !== 'SUPER_ADMIN' && (
                              <Button
                                onClick={() => onDeactivate(user)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Deactivate User"
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                        {!user.isActive && (
                          <Button
                            onClick={() => onReactivate(user)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Reactivate User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
