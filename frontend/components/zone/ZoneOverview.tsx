"use client";

import { Badge } from "@/components/ui/badge";
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getSlaColor = (compliance: number) => {
    if (compliance >= 90) return "text-green-600 bg-green-50";
    if (compliance >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {zoneDetail.zoneName || 'Zone Dashboard'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Zone Management Overview</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs sm:text-sm w-fit">
          Zone Overview
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
          <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-gray-600">Zone Officer</p>
            <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
              {zoneDetail.zoneOfficer || 'Not Assigned'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 sm:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
          <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Total Wards</p>
            <p className="font-bold text-lg sm:text-xl text-gray-900">
              {zoneDetail.totalWards || 0}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 sm:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
          <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Total Issues</p>
            <p className="font-bold text-lg sm:text-xl text-gray-900">
              {zoneDetail.totalIssues || 0}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg transition-colors ${
          getSlaColor(zoneDetail.slaCompliance || 0)
        }`}>
          <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
          <div>
            <p className="text-xs sm:text-sm">SLA Compliance</p>
            <p className="font-bold text-lg sm:text-xl">
              {zoneDetail.slaCompliance ? `${zoneDetail.slaCompliance.toFixed(1)}%` : '0%'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}