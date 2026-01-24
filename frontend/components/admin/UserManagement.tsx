"use client";

import { useState } from "react";
import { Edit, Eye, MoreHorizontal, UserX, UserCheck, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DeactivateUserDialog from "./DeactivateUserDialog";
import { useAppDispatch } from "@/redux/hooks";
import { reactivateUser } from "@/redux";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  department?: string;
  ward?: string;
  zone?: string;
  status: string;
  createdAt?: string;
}

interface Department {
  id: string;
  name: string;
}

interface Zone {
  zoneId: string;
  name: string;
}

interface UserManagementProps {
  users: User[];
  onUsersChange: (users: User[]) => void;
  onViewUser?: (userId: string) => void;
  onEditUser?: (userId: string) => void;
  departments: Department[];
  zones: Zone[];
  onFiltersChange: (filters: { status: string; role: string }) => void;
  allRoles: string[];
}

export default function UserManagement({ users, onUsersChange, onViewUser, onEditUser, onFiltersChange, allRoles }: UserManagementProps) {
  const dispatch = useAppDispatch();
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
  const [showReactivateConfirm, setShowReactivateConfirm] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('Active');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  // Handle filter changes
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    onFiltersChange({ status: value, role: roleFilter });
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    onFiltersChange({ status: statusFilter, role: value });
  };

  const handleEditUser = (user: User) => {
    if (onEditUser) {
      onEditUser(user.id);
    } else {
      console.log('Edit user:', user);
    }
  };

  const handleDeleteUser = (userId: string) => {
    onUsersChange(users.filter(u => u.id !== userId));
    setUserToDelete(null);
    toast.success('User deleted successfully!');
  };

  const handleDeactivateUser = (user: User) => {
    setUserToDeactivate(user);
    setShowDeactivateDialog(true);
  };

  const handleReactivateUser = async (user: User) => {
    try {
      await dispatch(reactivateUser(user.id)).unwrap();
      onUsersChange(users.map(u => u.id === user.id ? { ...u, status: 'Active' } : u));
      toast.success('User reactivated successfully!');
      setShowReactivateConfirm(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reactivate user';
      toast.error(errorMessage);
    }
  };

  const handleUserDeactivated = () => {
    if (userToDeactivate) {
      onUsersChange(users.map(u => u.id === userToDeactivate.id ? { ...u, status: 'Inactive' } : u));
      toast.success('User deactivated successfully!');
    }
  };

  const handleViewProfile = (user: User) => {
    if (onViewUser) {
      onViewUser(user.id);
    } else {
      setViewingUser(user);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {viewingUser && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900">User Profile - {viewingUser.name}</h4>
            <Button onClick={() => setViewingUser(null)} variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px]">
              Close
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h5 className="font-semibold mb-3 text-gray-900 text-sm sm:text-base">Personal Information</h5>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium text-gray-700">Employee ID:</span> <span className="text-gray-900">{viewingUser.id}</span></div>
                <div><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900">{viewingUser.name}</span></div>
                <div><span className="font-medium text-gray-700">Role:</span> <span className="text-gray-900">{viewingUser.role.replace('_', ' ')}</span></div>
                <div><span className="font-medium text-gray-700">Phone:</span> <span className="text-gray-900">{viewingUser.phone}</span></div>
                <div><span className="font-medium text-gray-700">Status:</span> <Badge variant={viewingUser.status === 'Active' ? 'default' : 'destructive'}>{viewingUser.status}</Badge></div>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-3 text-gray-900 text-sm sm:text-base">Work Assignment</h5>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium text-gray-700">Ward:</span> <span className="text-gray-900">{viewingUser.ward || 'Not assigned'}</span></div>
                <div><span className="font-medium text-gray-700">Zone:</span> <span className="text-gray-900">{viewingUser.zone || 'Not assigned'}</span></div>
                <div><span className="font-medium text-gray-700">Issues Reported:</span> <span className="text-gray-900">0</span></div>
                <div><span className="font-medium text-gray-700">Issues Resolved:</span> <span className="text-gray-900">0</span></div>
                <div><span className="font-medium text-gray-700">Success Rate:</span> <span className="text-gray-900">0%</span></div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900">User Management</h4>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Label className="text-sm font-medium text-gray-700">Status:</Label>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-32 min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-700">Role:</Label>
              <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                <SelectTrigger className="w-40 min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Roles</SelectItem>
                  {allRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {users.length === 0 ? (
          <Alert>
            <AlertDescription className="text-sm sm:text-base">
              No users found matching the selected filters.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3">
              {users.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h5 className="font-medium text-gray-900 text-sm truncate">{user.name}</h5>
                        <p className="text-xs text-gray-500 truncate">{user.id.slice(0, 8)}...</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">Role:</span>
                        <div className={`mt-1 px-2 py-1 rounded-full text-xs font-medium inline-block ${
                          user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' :
                          user.role === 'ZONE_OFFICER' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'WARD_ENGINEER' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {user.role.replace('_', ' ')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <p className="text-gray-900 mt-1">{user.phone}</p>
                      </div>
                    </div>
                    
                    <div className="text-xs">
                      <span className="text-gray-500">Assignment:</span>
                      <p className="text-gray-900 mt-1">{user.ward || user.zone || 'Not assigned'}</p>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewProfile(user)}
                        className="flex-1 min-h-[44px]"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditUser(user)}
                        className="flex-1 min-h-[44px]"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px] px-2">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.status === 'Active' ? (
                            <DropdownMenuItem onClick={() => handleDeactivateUser(user)}>
                              <UserX className="w-4 h-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => setShowReactivateConfirm(user.id)}>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-900 font-semibold">ID</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Name</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Role</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Ward/Zone</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Phone</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Status</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-gray-900">{user.id.slice(0, 6)}...</TableCell>
                      <TableCell className="text-gray-800">{user.name}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' :
                          user.role === 'ZONE_OFFICER' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'WARD_ENGINEER' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-800">{user.ward || user.zone || 'Not assigned'}</TableCell>
                      <TableCell className="text-gray-800">{user.phone}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="min-h-[44px] min-w-[44px]">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>User actions</p>
                            </TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewProfile(user)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === 'Active' ? (
                              <DropdownMenuItem onClick={() => handleDeactivateUser(user)}>
                                <UserX className="w-4 h-4 mr-2" />
                                Deactivate User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => setShowReactivateConfirm(user.id)}>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Reactivate User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </Card>

      {/* Reactivate Confirmation Dialog */}
      <AlertDialog open={!!showReactivateConfirm} onOpenChange={(open) => !open && setShowReactivateConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reactivate this user? They will regain access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                const user = users.find(u => u.id === showReactivateConfirm);
                if (user) handleReactivateUser(user);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Reactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate User Dialog */}
      <DeactivateUserDialog
        open={showDeactivateDialog}
        onClose={() => {
          setShowDeactivateDialog(false);
          setUserToDeactivate(null);
        }}
        onUserDeactivated={handleUserDeactivated}
        user={userToDeactivate}
      />
    </div>
  );
}