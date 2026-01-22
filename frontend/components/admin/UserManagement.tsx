"use client";

import { useState } from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UserManagementProps {
  users: any[];
  onUsersChange: (users: any[]) => void;
  onViewUser?: (userId: string) => void;
  onEditUser?: (userId: string) => void;
  departments: any[];
  zones: any[];
}

export default function UserManagement({ users, onUsersChange, onViewUser, onEditUser }: UserManagementProps) {
  const [viewingUser, setViewingUser] = useState<any>(null);

  const handleEditUser = (user: any) => {
    if (onEditUser) {
      onEditUser(user.id);
    } else {
      // TODO: Implement edit functionality
      console.log('Edit user:', user);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      onUsersChange(users.filter(u => u.id !== userId));
      alert('User deleted successfully!');
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
                <div><span className="font-medium text-gray-700">Status:</span> <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">{viewingUser.status}</span></div>
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
        <h4 className="text-lg font-semibold mb-4 text-gray-900">Active Users</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 text-gray-900 font-semibold">ID</th>
                <th className="text-left p-2 text-gray-900 font-semibold">Name</th>
                <th className="text-left p-2 text-gray-900 font-semibold">Role</th>
                <th className="text-left p-2 text-gray-900 font-semibold">Ward/Zone</th>
                <th className="text-left p-2 text-gray-900 font-semibold">Phone</th>
                <th className="text-left p-2 text-gray-900 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium text-gray-900">{user.id}</td>
                  <td className="p-2 text-gray-800">{user.name}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' :
                      user.role === 'ZONE_OFFICER' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'WARD_ENGINEER' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-2 text-gray-800">{user.ward || user.zone}</td>
                  <td className="p-2 text-gray-800">{user.phone}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Button onClick={() => handleViewProfile(user)} size="sm" variant="outline" className="text-xs">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button onClick={() => handleEditUser(user)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button onClick={() => handleDeleteUser(user.id)} size="sm" className="text-xs bg-red-600 hover:bg-red-700 text-white">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}