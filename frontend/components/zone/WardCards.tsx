"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

interface ZoneWard {
  wardId: string;
  wardNumber: number;
  name: string;
  open: number;
  inProgress: number;
  slaBreached: number;
  totalIssues: number;
  engineer: string;
}

interface WardCardsProps {
  wards: ZoneWard[];
  loading: boolean;
}

export default function WardCards({ wards, loading }: WardCardsProps) {
  const getStatusColor = (status: string, count: number) => {
    if (count === 0) return "bg-gray-100 text-gray-600";
    switch (status) {
      case "open": return "bg-red-100 text-red-700";
      case "inProgress": return "bg-yellow-100 text-yellow-700";
      case "slaBreached": return "bg-orange-100 text-orange-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  const getUrgencyLevel = (ward: ZoneWard) => {
    if (ward.slaBreached > 0) return { level: 'critical', color: 'border-red-500 bg-red-50' };
    if (ward.open > 5) return { level: 'high', color: 'border-orange-500 bg-orange-50' };
    if (ward.inProgress > 0) return { level: 'medium', color: 'border-yellow-500 bg-yellow-50' };
    return { level: 'normal', color: 'border-gray-200 bg-white' };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-12 bg-gray-100 rounded"></div>
                  <div className="h-12 bg-gray-100 rounded"></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-12 bg-gray-100 rounded"></div>
                  <div className="h-12 bg-gray-100 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (wards.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 sm:p-8 lg:p-12">
          <div className="text-center space-y-3">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto" />
            <p className="text-gray-500 text-base sm:text-lg font-medium">No wards found</p>
            <p className="text-gray-400 text-xs sm:text-sm">This zone doesn&apos;t have any wards assigned yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
      {wards.map((ward) => {
        const urgency = getUrgencyLevel(ward);
        return (
          <Link key={ward.wardId} href={`/zone-officer/ward/${ward.wardId}`}>
            <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 ${urgency.color} group`}>
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                    Ward {ward.wardNumber}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {ward.name || 'Unnamed'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 lg:space-y-4">
                
                <div className="grid grid-cols-2 gap-1 sm:gap-2 lg:gap-3">
                  <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <AlertTriangle className="w-3 h-3 text-gray-500" />
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <p className="font-bold text-xs sm:text-sm lg:text-base text-gray-900">
                      {ward.totalIssues || 0}
                    </p>
                  </div>
                  <div className={`text-center p-2 sm:p-3 rounded-lg transition-colors ${
                    getStatusColor("open", ward.open)
                  }`}>
                    <p className="text-xs font-medium">Open</p>
                    <p className="font-bold text-xs sm:text-sm lg:text-base">{ward.open || 0}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-1 sm:gap-2 lg:gap-3">
                  <div className={`text-center p-2 sm:p-3 rounded-lg transition-colors ${
                    getStatusColor("inProgress", ward.inProgress)
                  }`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3" />
                    </div>
                    <p className="text-xs font-medium">In Progress</p>
                    <p className="font-bold text-xs sm:text-sm lg:text-base">{ward.inProgress || 0}</p>
                  </div>
                  <div className={`text-center p-2 sm:p-3 rounded-lg transition-colors ${
                    getStatusColor("slaBreached", ward.slaBreached)
                  }`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="w-3 h-3" />
                    </div>
                    <p className="text-xs font-medium">SLA Breach</p>
                    <p className="font-bold text-xs sm:text-sm lg:text-base">{ward.slaBreached || 0}</p>
                  </div>
                </div>

                {urgency.level === 'critical' && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-red-700 font-medium">Requires Immediate Attention</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}