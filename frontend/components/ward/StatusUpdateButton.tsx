import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/redux/hooks";
import { updateIssueStatus } from "@/redux/slices/issuesSlice";
import { useState } from "react";
import { Play, CheckCircle } from "lucide-react";

interface StatusUpdateButtonProps {
  issueId: string;
  currentStatus: string;
  hasAfterImages?: boolean;
  onStatusUpdate?: () => void;
}

export default function StatusUpdateButton({ 
  issueId, 
  currentStatus, 
  hasAfterImages = false,
  onStatusUpdate 
}: StatusUpdateButtonProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const handleStartWork = async () => {
    setLoading(true);
    try {
      await dispatch(updateIssueStatus({
        issueId,
        status: "IN_PROGRESS",
        comment: "Started working on this issue"
      })).unwrap();
      onStatusUpdate?.();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishWork = async () => {
    setLoading(true);
    try {
      await dispatch(updateIssueStatus({
        issueId,
        status: "RESOLVED",
        comment: "Work completed successfully"
      })).unwrap();
      onStatusUpdate?.();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show Start Work button if issue is ASSIGNED
  if (currentStatus === "ASSIGNED") {
    return (
      <Button 
        onClick={handleStartWork}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1 text-xs sm:text-sm"
        size="sm"
      >
        <Play className="w-3 h-3" />
        {loading ? "Starting..." : "Start Work"}
      </Button>
    );
  }

  // Show Finish Work button if issue is IN_PROGRESS
  if (currentStatus === "IN_PROGRESS") {
    return (
      <Button 
        onClick={handleFinishWork}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 flex items-center gap-1 text-xs sm:text-sm"
        size="sm"
      >
        <CheckCircle className="w-3 h-3" />
        {loading ? "Finishing..." : "Finish Work"}
      </Button>
    );
  }

  return null;
}