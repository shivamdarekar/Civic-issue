"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, CheckCircle, Clock, Target } from "lucide-react";
import type { UserStatistics as UserStatsType } from "@/lib/api-client";

interface UserStatisticsProps {
  statistics: UserStatsType;
  compact?: boolean;
}

export default function UserStatistics({ statistics, compact = false }: UserStatisticsProps) {
  const stats = statistics.statistics;
  
  // Calculate percentage for progress bars
  const resolutionPercent = stats.resolutionRate;
  const activePercent = stats.totalAssigned > 0 
    ? Math.round((stats.activeIssues / stats.totalAssigned) * 100) 
    : 0;

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalAssigned}</div>
          <div className="text-xs text-gray-600">Total Assigned</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.activeIssues}</div>
          <div className="text-xs text-gray-600">Active Issues</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.resolvedIssues}</div>
          <div className="text-xs text-gray-600">Resolved</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.resolutionRate}%</div>
          <div className="text-xs text-gray-600">Resolution Rate</div>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-600" />
        Performance Statistics
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Assigned */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Total Assigned</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{stats.totalAssigned}</span>
          </div>
          <p className="text-xs text-gray-500">All issues assigned to this user</p>
        </div>

        {/* Active Issues */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Active Issues</span>
            </div>
            <span className={`text-2xl font-bold ${
              stats.activeIssues > 10 ? 'text-red-600' : 'text-orange-600'
            }`}>
              {stats.activeIssues}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                stats.activeIssues > 10 ? 'bg-red-500' : 'bg-orange-500'
              }`}
              style={{ width: `${Math.min(activePercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">Currently assigned or in progress</p>
        </div>

        {/* Resolved Issues */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Resolved Issues</span>
            </div>
            <span className="text-2xl font-bold text-green-600">{stats.resolvedIssues}</span>
          </div>
          <p className="text-xs text-gray-500">Successfully completed issues</p>
        </div>

        {/* Resolution Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Resolution Rate</span>
            </div>
            <span className="text-2xl font-bold text-purple-600">{stats.resolutionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: `${resolutionPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">Percentage of resolved vs total assigned</p>
        </div>

        {/* Average Resolution Time */}
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium">Average Resolution Time</span>
            </div>
            <span className="text-2xl font-bold text-indigo-600">
              {stats.avgResolutionDays.toFixed(1)} days
            </span>
          </div>
          <div className="flex items-center gap-2">
            {stats.avgResolutionDays < 3 ? (
              <TrendingDown className="w-4 h-4 text-green-500" />
            ) : stats.avgResolutionDays > 5 ? (
              <TrendingUp className="w-4 h-4 text-red-500" />
            ) : (
              <TrendingUp className="w-4 h-4 text-yellow-500" />
            )}
            <p className="text-xs text-gray-500">
              {stats.avgResolutionDays < 3 
                ? 'Excellent performance - faster than average' 
                : stats.avgResolutionDays > 5 
                ? 'Slower than target - may need support'
                : 'Meeting expectations - on track'}
            </p>
          </div>
        </div>
      </div>

      {/* Warning if user has activeIssues */}
      {stats.activeIssues > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ <span className="font-semibold">Cannot deactivate</span> - This user has {stats.activeIssues} active issue{stats.activeIssues > 1 ? 's' : ''}. 
            Please reassign them first before deactivation.
          </p>
        </div>
      )}
    </Card>
  );
}
