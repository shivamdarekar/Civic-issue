import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/redux/hooks";
import { updateIssueStatus } from "@/redux/slices/issuesSlice";
import { useState } from "react";

interface StatusUpdateButtonProps {
  issueId: string;
  currentStatus: string;
  onStatusUpdate?: () => void;
}

export default function StatusUpdateButton({ 
  issueId, 
  currentStatus, 
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

  // Only show button if issue is ASSIGNED
  if (currentStatus !== "ASSIGNED") return null;

  return (
    <Button 
      onClick={handleStartWork}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700"
    >
      {loading ? "Starting..." : "Start Work"}
    </Button>
  );
}