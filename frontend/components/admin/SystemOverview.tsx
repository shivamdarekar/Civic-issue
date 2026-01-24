"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleZoneClick = (zoneId: string) => {
    router.push(`/admin/zones/${zoneId}`);
  };
  if (!dashboard) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Alert>
          <AlertDescription className="text-sm sm:text-base">Loading dashboard data...</AlertDescription>
        </Alert>
      </div>
    );
  }

  const resolvedIssues = dashboard.totalIssues - dashboard.open - dashboard.inProgress;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Zone Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {zonesOverview && zonesOverview.length > 0 ? (
          zonesOverview.map((zone) => (
            <Card 
              key={zone.zoneId} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleZoneClick(zone.zoneId)}
            >
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg truncate">{zone.name}</CardTitle>
                  <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 pt-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Total Issues</span>
                  <Badge variant="outline" className="text-xs text-blue-600">{zone.totalIssues}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Open Issues</span>
                  <Badge variant="secondary" className="text-xs text-orange-600">{zone.openIssues}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">SLA Compliance</span>
                  <Badge variant={
                    zone.slaCompliance >= 90 ? 'default' : 
                    zone.slaCompliance >= 70 ? 'secondary' : 'destructive'
                  } className="text-xs">
                    {zone.slaCompliance}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 truncate">{zone.zoneOfficer}</span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Alert className="col-span-full">
            <AlertDescription>No zones data available</AlertDescription>
          </Alert>
        )}
      </div>

      {/* System Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">System Health Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                {((resolvedIssues / dashboard.totalIssues) * 100).toFixed(1)}%
              </div>
              <div className="text-xs sm:text-sm text-green-700">Issues Resolved</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-1">
                {((dashboard.slaBreached / dashboard.totalIssues) * 100).toFixed(1)}%
              </div>
              <div className="text-xs sm:text-sm text-orange-700">SLA Breach Rate</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                {Number(dashboard.avgSlaTimeHours).toFixed(0)}h
              </div>
              <div className="text-xs sm:text-sm text-blue-700">Avg Response Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}