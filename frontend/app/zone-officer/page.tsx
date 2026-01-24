"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchZoneOfficerDetail, fetchZoneOfficerWards } from "@/redux";
import ZoneOverview from "@/components/zone/ZoneOverview";
import WardCards from "@/components/zone/WardCards";
import { ZoneOverviewSkeleton } from "@/components/ui/loading-skeletons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin } from "lucide-react";

export default function ZoneOfficerPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.userState);
  const { zoneDetail, zoneWards, loading, error } = useAppSelector((state) => state.zone);

  useEffect(() => {
    if (user?.zoneId) {
      dispatch(fetchZoneOfficerDetail(user.zoneId));
      dispatch(fetchZoneOfficerWards(user.zoneId));
    }
  }, [dispatch, user?.zoneId]);

  if (!user?.zoneId) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No zone assigned to this user. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading && !zoneDetail) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <ZoneOverviewSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => {
            if (user?.zoneId) {
              dispatch(fetchZoneOfficerDetail(user.zoneId));
              dispatch(fetchZoneOfficerWards(user.zoneId));
            }
          }}
          variant="destructive"
          size="sm"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Zone Overview */}
      <ZoneOverview zoneDetail={zoneDetail} />

      {/* Wards Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                Wards in {zoneDetail?.zoneName || 'Zone'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                {zoneWards.length} ward{zoneWards.length !== 1 ? 's' : ''} under management
              </p>
            </div>
          </div>
          {zoneWards.length > 0 && (
            <div className="text-center sm:text-right">
              <p className="text-xs sm:text-sm text-gray-500">Total Issues</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {zoneWards.reduce((sum, ward) => sum + (ward.totalIssues || 0), 0)}
              </p>
            </div>
          )}
        </div>
        
        <WardCards wards={zoneWards} loading={loading} />
      </div>
    </div>
  );
}