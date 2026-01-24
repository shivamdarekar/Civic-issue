"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Users, AlertTriangle, TrendingUp, User, Shield } from "lucide-react";

interface ZoneDetail {
  zoneName: string;
  zoneOfficer: string;
  totalWards: number;
  totalIssues: number;
  slaCompliance: number;
}

interface ZoneOverviewProps {
  zoneDetail: ZoneDetail | null;
}

export default function ZoneOverview({ zoneDetail }: ZoneOverviewProps) {
  if (!zoneDetail) {
    return (
      <Card>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 sm:h-20" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSlaColor = (compliance: number) => {
    if (compliance >= 90) return "bg-green-50 hover:bg-green-100";
    if (compliance >= 70) return "bg-yellow-50 hover:bg-yellow-100";
    return "bg-red-50 hover:bg-red-100";
  };

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl xl:text-3xl">
                {zoneDetail.zoneName || 'Zone Dashboard'}
              </CardTitle>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">Zone Management Overview</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs sm:text-sm w-fit">
            Zone Overview
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <Card className="bg-blue-50 hover:bg-blue-100 transition-colors">
            <CardContent className="p-2 sm:p-3 lg:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <User className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Zone Officer</p>
                  <p className="font-semibold text-xs sm:text-sm lg:text-base truncate">
                    {zoneDetail.zoneOfficer || 'Not Assigned'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 hover:bg-green-100 transition-colors">
            <CardContent className="p-2 sm:p-3 lg:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Wards</p>
                  <p className="font-bold text-sm sm:text-lg lg:text-xl">
                    {zoneDetail.totalWards || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 hover:bg-purple-100 transition-colors">
            <CardContent className="p-2 sm:p-3 lg:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Issues</p>
                  <p className="font-bold text-sm sm:text-lg lg:text-xl">
                    {zoneDetail.totalIssues || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={`transition-colors ${
            getSlaColor(zoneDetail.slaCompliance || 0)
          }`}>
            <CardContent className="p-2 sm:p-3 lg:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm">SLA Compliance</p>
                  <p className="font-bold text-sm sm:text-lg lg:text-xl">
                    {zoneDetail.slaCompliance ? `${zoneDetail.slaCompliance.toFixed(1)}%` : '0%'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}