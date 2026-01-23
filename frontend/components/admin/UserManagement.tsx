"use client";

import { useState, useMemo } from "react";
import { Edit, Trash2, Eye, MoreHorizontal, UserX, UserCheck, Filter } from "lucide-react";
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

interface UserManagementProps {
  users: any[];
  onUsersChange: (users: any[]) => void;
  onViewUser?: (userId: string) => void;
  onEditUser?: (userId: string) => void;
  departments: any[];
  zones: any[];
}

export default function UserManagement({ users, onUsersChange, onViewUser, onEditUser }: UserManagementProps) {
  const dispatch = useAppDispatch();
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<any>(null);
  const [showReactivateConfirm, setShowReactivateConfirm] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('Active');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const statusMatch = statusFilter === 'All' || user.status === statusFilter;
      const roleMatch = roleFilter === 'All' || user.role === roleFilter;
      return statusMatch && roleMatch;
    });
  }, [users, statusFilter, roleFilter]);

  const uniqueRoles = useMemo(() => {
    const roles = [...new Set(users.map(user => user.role))];
    return roles.sort();
  }, [users]);

  const handleEditUser = (user: any) => {
    if (onEditUser) {
      onEditUser(user.id);
    } else {
      // TODO: Implement edit functionality
      console.log('Edit user:', user);
    }
  };

  const handleDeleteUser = (userId: string) => {
    onUsersChange(users.filter(u => u.id !== userId));
    setUserToDelete(null);
    toast.success('User deleted successfully!');
  };

  const handleDeactivateUser = (user: any) => {
    setUserToDeactivate(user);
    setShowDeactivateDialog(true);
  };

  const handleReactivateUser = async (user: any) => {
    try {
      await dispatch(reactivateUser(user.id)).unwrap();
      onUsersChange(users.map(u => u.id === user.id ? { ...u, status: 'Active' } : u));
      toast.success('User reactivated successfully!');
      setShowReactivateConfirm(null);
    } catch (error: any) {
      toast.error(error || 'Failed to reactivate user');
    }
  };

  const handleUserDeactivated = () => {
    if (userToDeactivate) {
      onUsersChange(users.map(u => u.id === userToDeactivate.id ? { ...u, status: 'Inactive' } : u));
      toast.success('User deactivated successfully!');
    }
  };

  const handleViewProfile = (user: any) => {
    if (onViewUser) {
      onViewUser(user.id);
    } else {
      setViewingUser(user);
    }
  };

  return (
    <div className="space-y-6">
      {viewingUser && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900">User Profile - {viewingUser.name}</h4>
            <Button onClick={() => setViewingUser(null)} variant="outline" size="sm">Close</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold mb-3 text-gray-900">Personal Information</h5>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium text-gray-700">Employee ID:</span> <span className="text-gray-900">{viewingUser.id}</span></div>
                <div><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900">{viewingUser.name}</span></div>
                <div><span className="font-medium text-gray-700">Role:</span> <span className="text-gray-900">{viewingUser.role.replace('_', ' ')}</span></div>
                <div><span className="font-medium text-gray-700">Phone:</span> <span className="text-gray-900">{viewingUser.phone}</span></div>
                <div><span className="font-medium text-gray-700">Status:</span> <Badge variant={viewingUser.status === 'Active' ? 'default' : 'destructive'}>{viewingUser.status}</Badge></div>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-3 text-gray-900">Work Assignment</h5>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium text-gray-700">Ward:</span> <span className="text-gray-900">{viewingUser.ward || 'Not assigned'}</span></div>
                <div><span className="font-medium text-gray-700">Zone:</span> <span className="text-gray-900">{viewingUser.zone || 'Not assigned'}</span></div>
                <div><span className="font-medium text-gray-700">Issues Reported:</span> <span className="text-gray-900">{Math.floor(Math.random() * 50) + 10}</span></div>
                <div><span className="font-medium text-gray-700">Issues Resolved:</span> <span className="text-gray-900">{Math.floor(Math.random() * 40) + 5}</span></div>
                <div><span className="font-medium text-gray-700">Success Rate:</span> <span className="text-gray-900">{Math.floor(Math.random() * 20) + 80}%</span></div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h4 className="text-lg font-semibold text-gray-900">User Management</h4>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Label className="text-sm font-medium text-gray-700">Status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
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
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Roles</SelectItem>
                  {uniqueRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {filteredUsers.length === 0 ? (
          <Alert>
            <AlertDescription>
              No users found matching the selected filters.
            </AlertDescription>
          </Alert>
        ) : (
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
              {filteredUsers.map((user) => (
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
                            <Button variant="ghost" size="sm">
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
                    
                    <AlertDialog open={userToDelete === user.id} onOpenChange={(open) => !open && setUserToDelete(null)}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {user.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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