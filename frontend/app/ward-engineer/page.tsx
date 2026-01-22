"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchWardEngineerDashboard } from "@/redux";
import WardOverview from "@/components/ward/WardOverview";
import AssignedIssues from "@/components/ward/AssignedIssues";
import { WardOverviewSkeleton } from "@/components/ui/loading-skeletons";
import { AlertTriangle } from "lucide-react";

export default function WardEngineerPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.userState);
  const { wardEngineerDashboard, loading, error } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (user?.wardId) {
      dispatch(fetchWardEngineerDashboard());
    }
  }, [dispatch, user?.wardId]);

  // Debug logging
  useEffect(() => {
    console.log('Ward Engineer Dashboard Data:', wardEngineerDashboard);
  }, [wardEngineerDashboard]);

  if (!user?.wardId) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-800">Access Restricted</h2>
          </div>
          <p className="text-red-700">No ward assigned to this user. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  if (loading && !wardEngineerDashboard) {
    return (
      <div className="p-4 sm:p-6">
        <WardOverviewSkeleton />
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
            onClick={() => dispatch(fetchWardEngineerDashboard())}
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
      <WardOverview wardDashboard={wardEngineerDashboard} user={user} />
      <AssignedIssues limit={10} />
    </div>
  );
}