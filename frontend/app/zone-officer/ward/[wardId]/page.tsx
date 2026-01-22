"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchWardDetail } from "@/redux";
import WardDetail from "@/components/zone/WardDetail";
import { WardDetailSkeleton } from "@/components/ui/loading-skeletons";

export default function WardDetailPage() {
  const params = useParams();
  const wardId = params.wardId as string;
  const dispatch = useAppDispatch();
  const { currentWardDetail, loading, error } = useAppSelector((state) => state.admin);

  useEffect(() => {
    if (wardId) {
      dispatch(fetchWardDetail(wardId));
    }
  }, [dispatch, wardId]);

  if (loading) {
    return <WardDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!currentWardDetail) {
    return (
      <div className="p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-800">Ward not found</p>
        </div>
      </div>
    );
  }

  return <WardDetail wardDetail={currentWardDetail} />;
}