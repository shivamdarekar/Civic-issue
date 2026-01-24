import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppDispatch } from "@/redux/hooks";
import { verifyResolution } from "@/redux/slices/issuesSlice";
import { useState } from "react";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

interface VerificationButtonProps {
  issueId: string;
  currentStatus: string;
  hasAfterImages: boolean;
  onStatusUpdate?: () => void;
}

export default function VerificationButton({ 
  issueId, 
  currentStatus, 
  hasAfterImages,
  onStatusUpdate 
}: VerificationButtonProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await dispatch(verifyResolution({
        issueId,
        approved: true,
        comment: "Issue verified and approved"
      })).unwrap();
      onStatusUpdate?.();
    } catch (error) {
      console.error("Failed to verify issue:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await dispatch(verifyResolution({
        issueId,
        approved: false,
        comment: "Issue rejected - needs rework"
      })).unwrap();
      onStatusUpdate?.();
    } catch (error) {
      console.error("Failed to reject issue:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show verification buttons only for RESOLVED issues
  if (currentStatus === "RESOLVED") {
    return (
      <div className="flex flex-col gap-1">
        <Button 
          onClick={handleVerify}
          disabled={loading || !hasAfterImages}
          variant="default"
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <CheckCircle className="w-3 h-3 mr-1" />
          )}
          {loading ? "Verifying..." : "Verify"}
        </Button>
        {!hasAfterImages && (
          <Alert className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <span className="hidden sm:inline">Worker hasn&apos;t uploaded after images yet</span>
              <span className="sm:hidden">No after images</span>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return null;
}