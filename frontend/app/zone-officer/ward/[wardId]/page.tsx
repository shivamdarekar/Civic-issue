"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchWardDetail } from "@/redux";
import WardDetail from "@/components/zone/WardDetail";
import { WardDetailSkeleton } from "@/components/ui/loading-skeletons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

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
      <div className="p-3 sm:p-4 lg:p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentWardDetail) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Ward not found
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <WardDetail wardDetail={currentWardDetail} wardId={wardId} />;
}