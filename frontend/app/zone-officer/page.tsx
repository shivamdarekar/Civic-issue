"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchZoneOfficerDetail, fetchZoneOfficerWards } from "@/redux";
import ZoneOverview from "@/components/zone/ZoneOverview";
import WardCards from "@/components/zone/WardCards";
import { ZoneOverviewSkeleton } from "@/components/ui/loading-skeletons";
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
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-800">Access Restricted</h2>
          </div>
          <p className="text-red-700">No zone assigned to this user. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  if (loading && !zoneDetail) {
    return (
      <div className="p-4 sm:p-6">
        <ZoneOverviewSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-800">Error Loading Data</h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => {
              if (user?.zoneId) {
                dispatch(fetchZoneOfficerDetail(user.zoneId));
                dispatch(fetchZoneOfficerWards(user.zoneId));
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Zone Overview */}
      <ZoneOverview zoneDetail={zoneDetail} />

      {/* Wards Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Wards in {zoneDetail?.zoneName || 'Zone'}
              </h2>
              <p className="text-sm text-gray-600">
                {zoneWards.length} ward{zoneWards.length !== 1 ? 's' : ''} under management
              </p>
            </div>
          </div>
          {zoneWards.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Issues</p>
              <p className="text-xl font-bold text-gray-900">
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