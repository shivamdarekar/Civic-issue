"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Users, FileText, Map, Layers, Settings, BarChart3, Plus, Shield, AlertTriangle, Clock, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import SLAMonitoring from "@/components/admin/SLAMonitoring";
import CommunicationHub from "@/components/admin/CommunicationHub";
import AdvancedAnalytics from "@/components/admin/AdvancedAnalytics";
import AdminOverview from "@/components/admin/AdminOverview";
import SystemSettings from "@/components/admin/SystemSettings";
import UserProfileView from "@/components/admin/UserProfileView";
import UserEditModal from "@/components/admin/UserEditModal";
import ReassignmentModal from "@/components/admin/ReassignmentModal";
import DeactivationConfirmation from "@/components/admin/DeactivationConfirmation";
import { offlineStorage } from "@/lib/offline-storage";
import BaseMap from "@/components/maps/BaseMap";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserForm, setShowUserForm] = useState(false);
  const [statistics, setStatistics] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0, resolutionRate: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ id: '', name: '', role: '', ward: '', zone: '', phone: '', email: '' });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  
  // Modal states
  const [showProfileView, setShowProfileView] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [deactivationAction, setDeactivationAction] = useState<'deactivate' | 'reactivate'>('deactivate');
  
  // Mock data for wards and zones
  const wards = [
    { id: 'W1', wardNumber: 1, name: 'Ward 1' },
    { id: 'W2', wardNumber: 2, name: 'Ward 2' },
    { id: 'W3', wardNumber: 3, name: 'Ward 3' },
    { id: 'W4', wardNumber: 4, name: 'Ward 4' },
    { id: 'W5', wardNumber: 5, name: 'Ward 5' }
  ];
  const zones = [
    { id: 'ZA', name: 'Zone A' },
    { id: 'ZB', name: 'Zone B' },
    { id: 'ZC', name: 'Zone C' },
    { id: 'ZD', name: 'Zone D' }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const stats = await offlineStorage.getStatistics();
      setStatistics(stats);
      
      // Load users (in real app, this would be from API)
      const mockUsers = [
        { id: 'FW001', name: 'Rajesh Kumar', role: 'FIELD_WORKER', ward: 'Ward 1', zone: 'Zone A', phone: '9876543210', status: 'Active' },
        { id: 'WE001', name: 'R.K. Patel', role: 'WARD_ENGINEER', ward: 'Ward 1', zone: 'Zone A', phone: '9876543220', status: 'Active' },
        { id: 'ZO001', name: 'Dr. A.K. Mehta', role: 'ZONE_OFFICER', zone: 'Zone A', phone: '9876543230', status: 'Active' }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.id || !newUser.name || !newUser.role) {
      alert('Please fill all required fields');
      return;
    }
    
    try {
      const userToAdd = { ...newUser, status: 'Active' };
      setUsers([...users, userToAdd]);
      setNewUser({ id: '', name: '', role: '', ward: '', zone: '', phone: '', email: '' });
      setShowUserForm(false);
      alert('User added successfully!');
    } catch (error) {
      alert('Error adding user');
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setNewUser(user);
    setShowUserForm(true);
  };

  const handleUpdateUser = async () => {
    try {
      const updatedUsers = users.map(u => u.id === editingUser.id ? { ...newUser, status: u.status } : u);
      setUsers(updatedUsers);
      setNewUser({ id: '', name: '', role: '', ward: '', zone: '', phone: '', email: '' });
      setEditingUser(null);
      setShowUserForm(false);
      alert('User updated successfully!');
    } catch (error) {
      alert('Error updating user');
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
      alert('User deleted successfully!');
    }
  };

  const handleViewProfile = (user: any) => {
    setViewingUser(user);
  };

  const handleDeactivateUser = (user: any) => {
    setDeactivationAction('deactivate');
    setSelectedUser(user);
    setShowDeactivateModal(true);
  };

  const handleReactivateUser = (user: any) => {
    setDeactivationAction('reactivate');
    setSelectedUser(user);
    setShowDeactivateModal(true);
  };

  const handleUserUpdated = () => {
    loadDashboardData(); // Reload data after user update
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleReassignmentSuccess = () => {
    loadDashboardData(); // Reload data after reassignment
    setShowReassignModal(false);
    setSelectedUser(null);
  };

  const handleDeactivationSuccess = () => {
    loadDashboardData(); // Reload data after deactivation
    setShowDeactivateModal(false);
    setSelectedUser(null);
  };

  const handleNeedReassignment = () => {
    setShowDeactivateModal(false);
    setShowReassignModal(true);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Issues" value={statistics.total.toString()} icon={<FileText className="w-6 h-6" />} color="blue" />
        <StatCard title="Active Users" value={users.length.toString()} icon={<Users className="w-6 h-6" />} color="emerald" />
        <StatCard title="SLA Performance" value={`${statistics.resolutionRate}%`} icon={<TrendingUp className="w-6 h-6" />} color="purple" />
        <StatCard title="Critical Issues" value="12" icon={<AlertTriangle className="w-6 h-6" />} color="red" />
      </div>

      {/* Geographic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Zone Performance</h3>
          <div className="space-y-3">
            {['Zone A', 'Zone B', 'Zone C', 'Zone D'].map((zone, i) => (
              <div key={zone} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">{zone}</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-orange-600">{25 + i * 5} Open</span>
                  <span className="text-green-600">{85 + i * 2}% SLA</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Issue Heatmap</h3>
          <div className="h-64">
            <BaseMap heatmap={true} />
          </div>
        </Card>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">User Management</h3>
        <Button onClick={() => setShowUserForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </div>

      {showUserForm && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">{editingUser ? 'Edit User' : 'Add New User'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Employee ID" value={newUser.id} onChange={(e) => setNewUser({...newUser, id: e.target.value})} disabled={!!editingUser} />
            <Input placeholder="Full Name" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} />
            <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
              <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FIELD_WORKER">Field Worker</SelectItem>
                <SelectItem value="WARD_ENGINEER">Ward Engineer</SelectItem>
                <SelectItem value="ZONE_OFFICER">Zone Officer</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Ward (if applicable)" value={newUser.ward} onChange={(e) => setNewUser({...newUser, ward: e.target.value})} />
            <Input placeholder="Zone" value={newUser.zone} onChange={(e) => setNewUser({...newUser, zone: e.target.value})} />
            <Input placeholder="Phone Number" value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} />
            <Input placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={editingUser ? handleUpdateUser : handleAddUser} className="bg-green-600 hover:bg-green-700">
              {editingUser ? 'Update User' : 'Add User'}
            </Button>
            <Button onClick={() => { setShowUserForm(false); setEditingUser(null); setNewUser({ id: '', name: '', role: '', ward: '', zone: '', phone: '', email: '' }); }} variant="outline">Cancel</Button>
          </div>
        </Card>
      )}

      {viewingUser && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">User Profile - {viewingUser.name}</h4>
            <Button onClick={() => setViewingUser(null)} variant="outline" size="sm">Close</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold mb-3">Personal Information</h5>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Employee ID:</span> {viewingUser.id}</div>
                <div><span className="font-medium">Name:</span> {viewingUser.name}</div>
                <div><span className="font-medium">Role:</span> {viewingUser.role.replace('_', ' ')}</div>
                <div><span className="font-medium">Phone:</span> {viewingUser.phone}</div>
                <div><span className="font-medium">Email:</span> {viewingUser.email || 'Not provided'}</div>
                <div><span className="font-medium">Status:</span> <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">{viewingUser.status}</span></div>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Work Assignment</h5>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Ward:</span> {viewingUser.ward || 'Not assigned'}</div>
                <div><span className="font-medium">Zone:</span> {viewingUser.zone || 'Not assigned'}</div>
                <div><span className="font-medium">Issues Reported:</span> {Math.floor(Math.random() * 50) + 10}</div>
                <div><span className="font-medium">Issues Resolved:</span> {Math.floor(Math.random() * 40) + 5}</div>
                <div><span className="font-medium">Success Rate:</span> {Math.floor(Math.random() * 20) + 80}%</div>
                <div><span className="font-medium">Last Active:</span> {new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4">Active Users</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Role</th>
                <th className="text-left p-2">Ward/Zone</th>
                <th className="text-left p-2">Phone</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{user.id}</td>
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' :
                      user.role === 'ZONE_OFFICER' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'WARD_ENGINEER' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-2">{user.ward || user.zone}</td>
                  <td className="p-2">{user.phone}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Button onClick={() => handleViewProfile(user)} size="sm" variant="outline" className="text-xs">View</Button>
                      <Button onClick={() => handleEditUser(user)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">Edit</Button>
                      <Button onClick={() => handleDeleteUser(user.id)} size="sm" variant="destructive" className="text-xs">Delete</Button>
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

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Issue Categories</h4>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Potholes</span><span className="font-bold">45%</span></div>
            <div className="flex justify-between"><span>Garbage</span><span className="font-bold">30%</span></div>
            <div className="flex justify-between"><span>Drainage</span><span className="font-bold">15%</span></div>
            <div className="flex justify-between"><span>Others</span><span className="font-bold">10%</span></div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Resolution Time</h4>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Critical</span><span className="font-bold">2.1h</span></div>
            <div className="flex justify-between"><span>High</span><span className="font-bold">4.5h</span></div>
            <div className="flex justify-between"><span>Medium</span><span className="font-bold">12h</span></div>
            <div className="flex justify-between"><span>Low</span><span className="font-bold">24h</span></div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Top Performers</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Rajesh Kumar</span>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="font-bold">98%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Priya Sharma</span>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-gray-400" />
                <span className="font-bold">95%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Amit Patel</span>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-orange-500" />
                <span className="font-bold">92%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showNavigation={true} />
      
      <main className="flex-1 p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
              <p className="text-gray-600">Vadodara Municipal Corporation - Complete system oversight and management</p>
            </div>
          </div>
          
          <div className="flex gap-4 border-b">
            <button onClick={() => setActiveTab('overview')} className={`pb-2 px-1 ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>Overview</button>
            <button onClick={() => setActiveTab('users')} className={`pb-2 px-1 ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>User Management</button>
            <button onClick={() => setActiveTab('sla')} className={`pb-2 px-1 ${activeTab === 'sla' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>SLA Monitoring</button>
            <button onClick={() => setActiveTab('communication')} className={`pb-2 px-1 ${activeTab === 'communication' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>Communications</button>
            <button onClick={() => setActiveTab('analytics')} className={`pb-2 px-1 ${activeTab === 'analytics' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>Advanced Analytics</button>
          </div>
        </div>

        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'users' && renderUserManagement()}
        {activeTab === 'sla' && <SLAMonitoring />}
        {activeTab === 'communication' && <CommunicationHub />}
        {activeTab === 'analytics' && <AdvancedAnalytics />}
        {activeTab === 'settings' && <SystemSettings />}
      </main>

      {/* Modals */}
      {showProfileView && selectedUser && (
        <UserProfileView
          user={selectedUser}
          statistics={userStats || undefined}
          onClose={() => { setShowProfileView(false); setSelectedUser(null); setUserStats(null); }}
          onEdit={() => { setShowProfileView(false); setShowEditModal(true); }}
          onReassign={() => { setShowProfileView(false); setShowReassignModal(true); }}
          onDeactivate={() => { setShowProfileView(false); handleDeactivateUser(selectedUser); }}
          onReactivate={() => { setShowProfileView(false); handleReactivateUser(selectedUser); }}
        />
      )}

      {showEditModal && selectedUser && (
        <UserEditModal
          user={selectedUser}
          wards={wards}
          zones={zones}
          onClose={() => { setShowEditModal(false); setSelectedUser(null); }}
          onSuccess={handleUserUpdated}
        />
      )}

      {showReassignModal && selectedUser && (
        <ReassignmentModal
          user={selectedUser}
          onClose={() => { setShowReassignModal(false); setSelectedUser(null); }}
          onSuccess={handleReassignmentSuccess}
        />
      )}

      {showDeactivateModal && selectedUser && (
        <DeactivationConfirmation
          user={selectedUser}
          action={deactivationAction}
          onClose={() => { setShowDeactivateModal(false); setSelectedUser(null); }}
          onSuccess={handleDeactivationSuccess}
          onNeedReassignment={handleNeedReassignment}
        />
      )}
    </div>
  );
}
