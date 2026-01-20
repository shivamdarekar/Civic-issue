"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, CheckCircle } from "lucide-react";
import type { User, UserStatistics } from "@/lib/api-client";
import { getUserStatistics, deactivateUser, reactivateUser } from "@/lib/api-client";

interface DeactivationConfirmationProps {
  user: User;
  action: 'deactivate' | 'reactivate';
  onClose: () => void;
  onSuccess: () => void;
  onNeedReassignment: () => void;
}

export default function DeactivationConfirmation({
  user,
  action,
  onClose,
  onSuccess,
  onNeedReassignment,
}: DeactivationConfirmationProps) {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (action === 'deactivate') {
      checkActiveIssues();
    } else {
      setLoading(false);
    }
  }, []);

  const checkActiveIssues = async () => {
    try {
      const response = await getUserStatistics(user.id);
      
      if (response.success && response.data) {
        setStatistics(response.data);
        
        if (response.data.statistics.activeIssues > 0) {
          // User has active issues - needs reassignment first
          setError(`This user has ${response.data.statistics.activeIssues} active issue(s) that must be reassigned first.`);
        }
      } else {
        setError(response.message || 'Failed to load user statistics');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (user.role === 'SUPER_ADMIN' && action === 'deactivate') {
      setError('Cannot deactivate Super Admin account');
      return;
    }

    if (action === 'deactivate' && statistics && statistics.statistics.activeIssues > 0) {
      // Redirect to reassignment workflow
      onNeedReassignment();
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const response = action === 'deactivate' 
        ? await deactivateUser(user.id)
        : await reactivateUser(user.id);
      
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || `Failed to ${action} user`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {action === 'deactivate' ? 'Deactivate User' : 'Reactivate User'}
            </h2>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Checking user status...</p>
            </div>
          ) : (
            <>
              {/* Deactivation - With Active Issues */}
              {action === 'deactivate' && statistics && statistics.statistics.activeIssues > 0 && (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-1">Action Required</h4>
                        <p className="text-sm text-yellow-800">{error}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <h4 className="font-semibold">User Statistics:</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-600">Total Assigned</div>
                        <div className="font-bold text-lg">{statistics.statistics.totalAssigned}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Active Issues</div>
                        <div className="font-bold text-lg text-orange-600">
                          {statistics.statistics.activeIssues}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Resolved</div>
                        <div className="font-bold text-lg text-green-600">
                          {statistics.statistics.resolvedIssues}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Success Rate</div>
                        <div className="font-bold text-lg">{statistics.statistics.resolutionRate}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-900">
                      💡 <span className="font-semibold">Next Step:</span> Reassign the active issues to another user 
                      before proceeding with deactivation.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={onNeedReassignment}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Reassign Work Now
                    </Button>
                    <Button onClick={onClose} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Deactivation - No Active Issues */}
              {action === 'deactivate' && (!statistics || statistics.statistics.activeIssues === 0) && !error && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-900 mb-1">Confirm Deactivation</h4>
                        <p className="text-sm text-red-800">
                          Are you sure you want to deactivate <span className="font-bold">{user.fullName}</span>?
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded space-y-2 text-sm">
                    <h4 className="font-semibold">What happens when you deactivate:</h4>
                    <ul className="space-y-1 ml-4 list-disc text-gray-700">
                      <li>User will not be able to log in</li>
                      <li>No new issues can be assigned to this user</li>
                      <li>All historical data will be preserved</li>
                      <li>User can be reactivated later if needed</li>
                    </ul>
                  </div>

                  {statistics && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-green-900">
                          ✅ No active issues - safe to deactivate
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleConfirm}
                      disabled={processing || user.role === 'SUPER_ADMIN'}
                      variant="destructive"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {processing ? 'Deactivating...' : 'Confirm Deactivation'}
                    </Button>
                    <Button onClick={onClose} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Reactivation */}
              {action === 'reactivate' && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-900 mb-1">Reactivate User</h4>
                        <p className="text-sm text-green-800">
                          Reactivate <span className="font-bold">{user.fullName}</span> to allow them to log in and 
                          receive new issue assignments.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded space-y-2 text-sm">
                    <h4 className="font-semibold">What happens when you reactivate:</h4>
                    <ul className="space-y-1 ml-4 list-disc text-gray-700">
                      <li>User will be able to log in again</li>
                      <li>New issues can be assigned to this user</li>
                      <li>All historical data remains intact</li>
                      <li>User can access their previous work</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleConfirm}
                      disabled={processing}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {processing ? 'Reactivating...' : 'Confirm Reactivation'}
                    </Button>
                    <Button onClick={onClose} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && action !== 'deactivate' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
