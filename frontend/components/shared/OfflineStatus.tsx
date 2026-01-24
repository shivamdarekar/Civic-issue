"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi, Upload, AlertCircle, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { syncService } from "@/lib/sync-service";
import { toast } from "sonner";

export default function OfflineStatus() {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    const updateCounts = async () => {
      const count = await syncService.getPendingCount();
      setPendingCount(count);
      
      const failedIssues = await syncService.getFailedIssues();
      setFailedCount(failedIssues.length);
      
      // Get the last error for display
      if (failedIssues.length > 0 && failedIssues[0].lastError) {
        setLastError(failedIssues[0].lastError);
      } else {
        setLastError(null);
      }
    };

    updateCounts();
    
    // Update count every 10 seconds
    const interval = setInterval(updateCounts, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRetrySync = async () => {
    if (!isOnline) {
      toast.error("Cannot sync while offline");
      return;
    }

    setIsRetrying(true);
    try {
      // Debug: show current issues before sync
      await syncService.debugIssues();
      
      await syncService.retryFailedIssues();
      
      // Update counts after sync
      const count = await syncService.getPendingCount();
      setPendingCount(count);
      const failedIssues = await syncService.getFailedIssues();
      setFailedCount(failedIssues.length);
      
      if (failedIssues.length > 0) {
        toast.error(`${failedIssues.length} issue(s) failed to sync. Check console for details.`);
        if (failedIssues[0].lastError) {
          setLastError(failedIssues[0].lastError);
        }
      } else if (count === 0) {
        toast.success("All issues synced successfully!");
        setLastError(null);
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to retry sync");
    } finally {
      setIsRetrying(false);
    }
  };

  const handleClearFailed = async () => {
    if (confirm("This will permanently delete all failed offline issues. Continue?")) {
      await syncService.clearFailedIssues();
      const count = await syncService.getPendingCount();
      setPendingCount(count);
      setFailedCount(0);
      setLastError(null);
      toast.success("Failed issues cleared");
    }
  };

  const handleClearAll = async () => {
    if (confirm("This will permanently delete ALL offline issues (pending and failed). Continue?")) {
      await syncService.clearAllIssues();
      setPendingCount(0);
      setFailedCount(0);
      setLastError(null);
      toast.success("All offline issues cleared");
    }
  };

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg max-w-sm ${
      isOnline ? 'bg-blue-50 border border-blue-200' : 'bg-orange-50 border border-orange-200'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-blue-600" />
        ) : (
          <WifiOff className="w-4 h-4 text-orange-600" />
        )}
        <span className={`text-sm font-medium ${
          isOnline ? 'text-blue-700' : 'text-orange-700'
        }`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {pendingCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              {pendingCount} issue{pendingCount > 1 ? 's' : ''} pending sync
            </span>
          </div>
          
          {failedCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-600">
                {failedCount} failed
              </span>
            </div>
          )}

          {lastError && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              <strong>Error:</strong> {lastError}
            </div>
          )}
          
          {isOnline && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetrySync}
                disabled={isRetrying}
                className="flex-1"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Syncing...' : 'Sync Now'}
              </Button>
              
              {failedCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearFailed}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}

          {/* Debug: Clear all button */}
          {pendingCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearAll}
              className="w-full text-xs text-gray-400 hover:text-red-600"
            >
              Clear All Offline Issues
            </Button>
          )}
        </div>
      )}

      {!isOnline && (
        <p className="text-xs text-orange-600">
          Issues will sync automatically when back online
        </p>
      )}
    </div>
  );
}