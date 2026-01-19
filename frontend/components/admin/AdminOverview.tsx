"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import ZonePerformance from "./ZonePerformance";
import Loading from "@/components/ui/loading";
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  XCircle,
  Activity,
  MapPin,
  Shield,
  BarChart3,
  RefreshCw
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalIssues: number;
  criticalIssues: number;
  slaPerformance: number;
  avgResolutionTime: number;
  systemHealth: number;
}

interface ZonePerformance {
  name: string;
  openIssues: number;
  slaCompliance: number;
  activeUsers: number;
}

interface RecentActivity {
  id: string;
  type: 'user_created' | 'user_deactivated' | 'work_reassigned' | 'issue_escalated';
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'success' | 'error';
}

export default function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalIssues: 0,
    criticalIssues: 0,
    slaPerformance: 0,
    avgResolutionTime: 0,
    systemHealth: 0
  });

  const [zonePerformance, setZonePerformance] = useState<ZonePerformance[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalUsers: 156,
        activeUsers: 142,
        totalIssues: 1247,
        criticalIssues: 23,
        slaPerformance: 87,
        avgResolutionTime: 4.2,
        systemHealth: 94
      });

      setZonePerformance([
        { name: 'North Zone', openIssues: 45, slaCompliance: 89, activeUsers: 38 },
        { name: 'South Zone', openIssues: 32, slaCompliance: 92, activeUsers: 35 },
        { name: 'East Zone', openIssues: 28, slaCompliance: 85, activeUsers: 34 },
        { name: 'West Zone', openIssues: 41, slaCompliance: 88, activeUsers: 35 }
      ]);

      setRecentActivity([
        {
          id: '1',
          type: 'user_created',
          message: 'New Field Worker "Rajesh Kumar" added to Ward 5',
          timestamp: '2 minutes ago',
          severity: 'success'
        },
        {
          id: '2',
          type: 'work_reassigned',
          message: '12 issues reassigned from Amit Patel to Priya Sharma',
          timestamp: '15 minutes ago',
          severity: 'info'
        },
        {
          id: '3',
          type: 'issue_escalated',
          message: 'Critical drainage issue escalated in Ward 3',
          timestamp: '1 hour ago',
          severity: 'warning'
        },
        {
          id: '4',
          type: 'user_deactivated',
          message: 'User "Suresh Mehta" deactivated due to transfer',
          timestamp: '2 hours ago',
          severity: 'error'
        }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_created': return <Users className="w-4 h-4" />;
      case 'user_deactivated': return <XCircle className="w-4 h-4" />;
      case 'work_reassigned': return <RefreshCw className="w-4 h-4" />;
      case 'issue_escalated': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getSLAColor = (sla: number) => {
    if (sla >= 90) return 'text-green-600';
    if (sla >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-3 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600">Vadodara Municipal Corporation - System Overview</p>
          </div>
        </div>
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toString()} 
          icon={<Users className="w-6 h-6" />} 
          color="blue"
          subtitle={`${stats.activeUsers} active`}
        />
        <StatCard 
          title="Total Issues" 
          value={stats.totalIssues.toString()} 
          icon={<FileText className="w-6 h-6" />} 
          color="emerald"
          subtitle="All time"
        />
        <StatCard 
          title="SLA Performance" 
          value={`${stats.slaPerformance}%`} 
          icon={<TrendingUp className="w-6 h-6" />} 
          color="purple"
          subtitle="This month"
        />
        <StatCard 
          title="Critical Issues" 
          value={stats.criticalIssues.toString()} 
          icon={<AlertTriangle className="w-6 h-6" />} 
          color="red"
          subtitle="Needs attention"
        />
      </div>

      {/* System Health & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 h-fit">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Overall Health</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.systemHealth}%` }}
                  ></div>
                </div>
                <span className="font-bold text-green-600">{stats.systemHealth}%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Active Users</span>
              <Badge className="bg-green-100 text-green-700">
                {stats.activeUsers}/{stats.totalUsers}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Avg Resolution Time</span>
              <Badge className="bg-blue-100 text-blue-700">
                {stats.avgResolutionTime}h
              </Badge>
            </div>
          </div>
        </Card>

        <ZonePerformance />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`p-2 rounded-full ${getActivityColor(activity.severity)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
                </div>
                <div className="text-sm text-gray-600">User Activity Rate</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(((stats.totalIssues - stats.criticalIssues) / stats.totalIssues) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Issues Resolved</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Field Workers</span>
                <span className="font-medium">68 active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Ward Engineers</span>
                <span className="font-medium">45 active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Zone Officers</span>
                <span className="font-medium">16 active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Super Admins</span>
                <span className="font-medium">3 active</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Critical Alerts */}
      {stats.criticalIssues > 0 && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Critical Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">High Priority Issues</span>
                <Badge className="bg-red-100 text-red-700">{stats.criticalIssues}</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Issues requiring immediate attention from zone officers
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">SLA Breaches</span>
                <Badge className="bg-orange-100 text-orange-700">7</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Issues that have exceeded resolution time limits
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}