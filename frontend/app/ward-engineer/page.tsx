"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchWardEngineerDashboard } from "@/redux";
import WardOverview from "@/components/ward/WardOverview";
import { WardOverviewSkeleton } from "@/components/ui/loading-skeletons";
import { AlertTriangle } from "lucide-react";

export default function WardEngineerPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.userState);
  const { wardEngineerDashboard, loading, error } = useAppSelector((state) => state.user);

  // Debug logging
  useEffect(() => {
    console.log('Ward Engineer Dashboard Data:', wardEngineerDashboard);
  }, [wardEngineerDashboard]);

  useEffect(() => {
    if (user?.wardId && user?.department) {
      dispatch(fetchWardEngineerDashboard());
    }
  }, [dispatch, user?.wardId, user?.department]);

  // Wait for user data to be loaded with ward and department info
  if (!user || !user.wardId || !user.department) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 sm:h-20 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }



  if (loading && !wardEngineerDashboard) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <WardOverviewSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            <h2 className="text-base sm:text-lg font-semibold text-red-800">Error Loading Data</h2>
          </div>
          <p className="text-red-700 mb-4 text-sm sm:text-base">{error}</p>
          <button 
            onClick={() => dispatch(fetchWardEngineerDashboard())}
            className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <WardOverview wardDashboard={wardEngineerDashboard} user={user} />
    </div>
  );
}