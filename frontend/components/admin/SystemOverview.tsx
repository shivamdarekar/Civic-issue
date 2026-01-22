"use client";

import { Card } from "@/components/ui/card";
import { User, Shield } from "lucide-react";

interface ZoneData {
  zoneId: string;
  name: string;
  totalIssues: number;
  openIssues: number;
  slaCompliance: number;
  zoneOfficer: string;
}

interface SystemOverviewProps {
  dashboard: {
    totalIssues: number;
    open: number;
    inProgress: number;
    slaBreached: number;
    avgSlaTimeHours: number;
    resolutionRatePercent: number;
  } | null;
  zonesOverview: ZoneData[];
}

export default function SystemOverview({ dashboard, zonesOverview }: SystemOverviewProps) {
  if (!dashboard) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-gray-500">Loading dashboard data...</p>
        </Card>
      </div>
    );
  }

  const resolvedIssues = dashboard.totalIssues - dashboard.open - dashboard.inProgress;

  return (
    <div className="space-y-6">
      {/* Zone Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {zonesOverview && zonesOverview.length > 0 ? (
          zonesOverview.map((zone) => (
            <Card key={zone.zoneId} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Issues</span>
                  <span className="text-lg font-bold text-blue-600">{zone.totalIssues}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Open Issues</span>
                  <span className="text-lg font-bold text-orange-600">{zone.openIssues}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">SLA Compliance</span>
                  <span className={`text-lg font-bold ${
                    zone.slaCompliance >= 90 ? 'text-green-600' : 
                    zone.slaCompliance >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {zone.slaCompliance}%
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 truncate">{zone.zoneOfficer}</span>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 col-span-full">
            <p className="text-gray-500 text-center">No zones data available</p>
          </Card>
        )}
      </div>

      {/* System Health Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">System Health Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {((resolvedIssues / dashboard.totalIssues) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-green-700">Issues Resolved</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {((dashboard.slaBreached / dashboard.totalIssues) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-orange-700">SLA Breach Rate</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {Number(dashboard.avgSlaTimeHours).toFixed(0)}h
            </div>
            <div className="text-sm text-blue-700">Avg Response Time</div>
          </div>
        </div>
      </Card>
    </div>
  );
}