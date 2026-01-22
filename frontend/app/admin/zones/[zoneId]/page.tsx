"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Users, AlertTriangle, TrendingUp, Building, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchZoneDetail, fetchWardsForZone, clearAdminError } from "@/redux";
import { ErrorState, EmptyState } from "@/components/admin/ErrorBoundary";

export default function ZoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentZoneDetail, wardsByZone, loading, loadingWards, error } = useAppSelector(state => state.admin);
  
  const zoneId = params.zoneId as string;
  const wards = wardsByZone[zoneId] || [];

  useEffect(() => {
    if (zoneId) {
      dispatch(clearAdminError());
      dispatch(fetchZoneDetail(zoneId));
      dispatch(fetchWardsForZone(zoneId));
    }
  }, [dispatch, zoneId]);

  const handleWardClick = (wardId: string) => {
    router.push(`/admin/zones/${zoneId}/wards/${wardId}`);
  };

  const handleRetry = () => {
    dispatch(clearAdminError());
    dispatch(fetchZoneDetail(zoneId));
    dispatch(fetchWardsForZone(zoneId));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10" />
          <div className="space-y-2">
            <Skeleton className="w-48 h-8" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Zone Details</h1>
        </div>
        <ErrorState 
          title="Failed to load zone details"
          message={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (!currentZoneDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Zone Details</h1>
        </div>
        <EmptyState 
          title="Zone not found"
          message="The requested zone could not be found. It may have been removed or you may not have permission to view it."
          icon={<Building className="w-8 h-8 text-gray-400" />}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
            <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{currentZoneDetail.zoneName}</h1>
            <p className="text-sm sm:text-base text-gray-600">Zone Officer: {currentZoneDetail.zoneOfficer || 'Not assigned'}</p>
          </div>
        </div>
      </div>

      {/* Zone Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Building className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Total Wards</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{currentZoneDetail.totalWards}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Total Issues</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-600">{currentZoneDetail.totalIssues}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <TrendingUp className={`w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 ${
                currentZoneDetail.slaCompliance >= 90 ? 'text-green-600' :
                currentZoneDetail.slaCompliance >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`} />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">SLA Compliance</p>
                <p className={`text-lg sm:text-2xl font-bold ${
                  currentZoneDetail.slaCompliance >= 90 ? 'text-green-600' :
                  currentZoneDetail.slaCompliance >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {currentZoneDetail.slaCompliance}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Zone Officer</p>
                <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                  {currentZoneDetail.zoneOfficer || 'Not assigned'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wards List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MapPin className="w-5 h-5" />
            Wards in {currentZoneDetail.zoneName}
            {loadingWards && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingWards ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : wards.length === 0 ? (
            <EmptyState 
              title="No wards found"
              message="This zone currently has no wards assigned to it."
              icon={<MapPin className="w-8 h-8 text-gray-400" />}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wards.map((ward) => {
                const getUrgencyLevel = (ward: any) => {
                  if (ward.slaBreached > 0) return { level: 'critical', color: 'border-red-500 bg-red-50' };
                  if (ward.open > 5) return { level: 'high', color: 'border-orange-500 bg-orange-50' };
                  if (ward.inProgress > 0) return { level: 'medium', color: 'border-yellow-500 bg-yellow-50' };
                  return { level: 'normal', color: 'border-gray-200 bg-white' };
                };
                const urgency = getUrgencyLevel(ward);
                return (
                  <Card 
                    key={ward.wardId} 
                    className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 ${urgency.color} group`}
                    onClick={() => handleWardClick(ward.wardId)}
                  >
                    <CardHeader className="pb-2 sm:pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base sm:text-lg font-bold text-gray-900">
                          Ward {ward.wardNumber}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {ward.name || 'Unnamed'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <AlertTriangle className="w-3 h-3 text-gray-500" />
                            <p className="text-xs text-gray-500">Total</p>
                          </div>
                          <p className="font-bold text-sm sm:text-base text-gray-900">
                            {ward.totalIssues || 0}
                          </p>
                        </div>
                        <div className={`text-center p-2 sm:p-3 rounded-lg transition-colors ${
                          ward.open === 0 ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-700"
                        }`}>
                          <p className="text-xs font-medium">Open</p>
                          <p className="font-bold text-sm sm:text-base">{ward.open || 0}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className={`text-center p-2 sm:p-3 rounded-lg transition-colors ${
                          ward.inProgress === 0 ? "bg-gray-100 text-gray-600" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp className="w-3 h-3" />
                          </div>
                          <p className="text-xs font-medium">In Progress</p>
                          <p className="font-bold text-sm sm:text-base">{ward.inProgress || 0}</p>
                        </div>
                        <div className={`text-center p-2 sm:p-3 rounded-lg transition-colors ${
                          ward.slaBreached === 0 ? "bg-gray-100 text-gray-600" : "bg-orange-100 text-orange-700"
                        }`}>
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="w-3 h-3" />
                          </div>
                          <p className="text-xs font-medium">SLA Breach</p>
                          <p className="font-bold text-sm sm:text-base">{ward.slaBreached || 0}</p>
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
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}