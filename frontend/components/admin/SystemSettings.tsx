"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Settings, 
  Database, 
  Users, 
  Download, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  FileText,
  Shield
} from "lucide-react";

export default function SystemSettings() {
  const [bulkAction, setBulkAction] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const systemStats = {
    totalUsers: 156,
    activeUsers: 142,
    inactiveUsers: 14,
    totalIssues: 1247,
    pendingApprovals: 8,
    systemHealth: 94
  };

  const bulkOperations = [
    { value: 'deactivate', label: 'Deactivate Users', icon: <Users className="w-4 h-4" />, color: 'text-red-600' },
    { value: 'reactivate', label: 'Reactivate Users', icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-600' },
    { value: 'reassign_zone', label: 'Bulk Zone Reassignment', icon: <RefreshCw className="w-4 h-4" />, color: 'text-blue-600' },
    { value: 'export_data', label: 'Export User Data', icon: <Download className="w-4 h-4" />, color: 'text-purple-600' }
  ];

  const handleBulkOperation = async () => {
    if (!bulkAction || selectedUsers.length === 0) {
      alert('Please select an operation and users');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowBulkDialog(false);
      setBulkAction("");
      setSelectedUsers([]);
      alert(`Bulk operation completed for ${selectedUsers.length} users`);
    } catch (error) {
      alert('Bulk operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = async (type: string) => {
    try {
      setLoading(true);
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, this would trigger a download
      const filename = `vmc_${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
      alert(`Export completed: ${filename}`);
    } catch (error) {
      alert('Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemMaintenance = async (action: string) => {
    if (!confirm(`Are you sure you want to ${action}? This may affect system performance.`)) {
      return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert(`${action} completed successfully`);
    } catch (error) {
      alert(`${action} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-gray-600" />
        <h2 className="text-2xl font-bold">System Settings</h2>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">System Health</h3>
            <Badge className={systemStats.systemHealth >= 90 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
              {systemStats.systemHealth}%
            </Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Database Status</span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex justify-between">
              <span>API Response Time</span>
              <span className="text-green-600">120ms</span>
            </div>
            <div className="flex justify-between">
              <span>Active Connections</span>
              <span className="text-blue-600">45</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">User Statistics</h3>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Users</span>
              <span className="font-medium">{systemStats.totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Users</span>
              <span className="text-green-600">{systemStats.activeUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Inactive Users</span>
              <span className="text-red-600">{systemStats.inactiveUsers}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Pending Actions</h3>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>User Approvals</span>
              <Badge className="bg-orange-100 text-orange-700">{systemStats.pendingApprovals}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Role Changes</span>
              <Badge className="bg-blue-100 text-blue-700">3</Badge>
            </div>
            <div className="flex justify-between">
              <span>System Updates</span>
              <Badge className="bg-purple-100 text-purple-700">1</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Bulk Operations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Bulk Operations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {bulkOperations.map((operation) => (
            <Button
              key={operation.value}
              onClick={() => {
                setBulkAction(operation.value);
                setShowBulkDialog(true);
              }}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <div className={operation.color}>{operation.icon}</div>
              <span className="text-sm font-medium">{operation.label}</span>
            </Button>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">Bulk Operation Warning</span>
          </div>
          <p className="text-sm text-yellow-700">
            Bulk operations affect multiple users simultaneously. Please ensure you have proper authorization and have reviewed the selected users before proceeding.
          </p>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Data Management
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Export Data</h4>
            <div className="space-y-2">
              <Button 
                onClick={() => handleDataExport('users')} 
                variant="outline" 
                className="w-full justify-start"
                disabled={loading}
              >
                <Download className="w-4 h-4 mr-2" />
                Export All Users
              </Button>
              <Button 
                onClick={() => handleDataExport('issues')} 
                variant="outline" 
                className="w-full justify-start"
                disabled={loading}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Issue Reports
              </Button>
              <Button 
                onClick={() => handleDataExport('analytics')} 
                variant="outline" 
                className="w-full justify-start"
                disabled={loading}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Analytics Data
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Import Data</h4>
            <div className="space-y-2">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Drag & drop CSV files or click to browse</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Select Files
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Supported formats: CSV, Excel. Maximum file size: 10MB
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* System Maintenance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          System Maintenance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={() => handleSystemMaintenance('Clear Cache')}
            variant="outline"
            disabled={loading}
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Clear Cache</span>
            <span className="text-xs text-gray-500">Refresh system cache</span>
          </Button>

          <Button 
            onClick={() => handleSystemMaintenance('Database Cleanup')}
            variant="outline"
            disabled={loading}
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <Database className="w-5 h-5" />
            <span>Database Cleanup</span>
            <span className="text-xs text-gray-500">Remove old logs</span>
          </Button>

          <Button 
            onClick={() => handleSystemMaintenance('System Backup')}
            variant="outline"
            disabled={loading}
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span>System Backup</span>
            <span className="text-xs text-gray-500">Create full backup</span>
          </Button>
        </div>
      </Card>

      {/* Bulk Operation Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Operation</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Selected Operation</label>
              <p className="text-sm text-gray-600">
                {bulkOperations.find(op => op.value === bulkAction)?.label}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Select Users</label>
              <Select value="" onValueChange={(value) => {
                if (value && !selectedUsers.includes(value)) {
                  setSelectedUsers([...selectedUsers, value]);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Add users to operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user1">Rajesh Kumar (Field Worker)</SelectItem>
                  <SelectItem value="user2">Priya Sharma (Ward Engineer)</SelectItem>
                  <SelectItem value="user3">Amit Patel (Zone Officer)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedUsers.length > 0 && (
              <div>
                <label className="text-sm font-medium">Selected Users ({selectedUsers.length})</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedUsers.map((userId) => (
                    <Badge 
                      key={userId} 
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setSelectedUsers(selectedUsers.filter(id => id !== userId))}
                    >
                      {userId} ×
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleBulkOperation}
                disabled={loading || selectedUsers.length === 0}
                className="flex-1"
              >
                {loading ? 'Processing...' : 'Execute Operation'}
              </Button>
              <Button 
                onClick={() => setShowBulkDialog(false)}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}