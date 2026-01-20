"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, CheckCircle, AlertCircle, Users, ArrowRight } from "lucide-react";
import type { User, UserStatistics, ReassignmentResult } from "@/lib/api-client";
import { getUserStatistics, getFilteredUsers, reassignUserWork } from "@/lib/api-client";

interface ReassignmentModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReassignmentModal({ user, onClose, onSuccess }: ReassignmentModalProps) {
  const [step, setStep] = useState<'loading' | 'validation' | 'selection' | 'confirmation' | 'success' | 'error'>('loading');
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [candidates, setCandidates] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [result, setResult] = useState<ReassignmentResult | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserStatistics();
  }, []);

  const loadUserStatistics = async () => {
    setStep('loading');
    try {
      const response = await getUserStatistics(user.id);
      
      if (response.success && response.data) {
        setStatistics(response.data);
        
        if (response.data.statistics.activeIssues === 0) {
          setError('This user has no active issues to reassign');
          setStep('error');
        } else {
          setStep('validation');
          loadCandidates();
        }
      } else {
        setError(response.message || 'Failed to load user statistics');
        setStep('error');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setStep('error');
    }
  };

  const loadCandidates = async () => {
    try {
      const filters: any = {
        role: user.role,
        isActive: true,
      };

      // Add ward/zone filter based on role
      if (user.role === 'FIELD_WORKER' || user.role === 'WARD_ENGINEER') {
        if (user.wardId) filters.wardId = user.wardId;
        if (user.department) filters.department = user.department;
      } else if (user.role === 'ZONE_OFFICER') {
        if (user.zoneId) filters.zoneId = user.zoneId;
      }

      const response = await getFilteredUsers(filters);
      
      if (response.success && response.data) {
        // Filter out current user
        const eligible = response.data.filter((u) => u.id !== user.id);
        setCandidates(eligible);
        
        if (eligible.length === 0) {
          setError(`No eligible ${user.role.toLowerCase().replace('_', ' ')}s found in the same ${
            user.wardId ? 'ward' : 'zone'
          }`);
          setStep('error');
        } else {
          setStep('selection');
        }
      } else {
        setError(response.message || 'Failed to load candidates');
        setStep('error');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setStep('error');
    }
  };

  const handleReassign = async () => {
    if (!selectedUserId) {
      setError('Please select a user to reassign work to');
      return;
    }

    setLoading(true);
    setStep('confirmation');

    try {
      const response = await reassignUserWork(user.id, selectedUserId);
      
      if (response.success && response.data) {
        setResult(response.data);
        setStep('success');
      } else {
        setError(response.message || 'Failed to reassign work');
        setStep('error');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const selectedCandidate = candidates.find((c) => c.id === selectedUserId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Reassign Work</h2>
              <p className="text-sm text-gray-600 mt-1">
                Transferring active issues from {user.fullName}
              </p>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Loading State */}
          {step === 'loading' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading user statistics...</p>
            </div>
          )}

          {/* Validation Step */}
          {step === 'validation' && statistics && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Active Issues Found</h3>
                <p className="text-sm text-blue-800">
                  This user has <span className="font-bold">{statistics.statistics.activeIssues}</span> active issue(s) 
                  that need to be reassigned before deactivation.
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-2xl font-bold text-gray-700">{statistics.statistics.totalAssigned}</div>
                  <div className="text-xs text-gray-600">Total Assigned</div>
                </div>
                <div className="p-3 bg-orange-50 rounded">
                  <div className="text-2xl font-bold text-orange-600">{statistics.statistics.activeIssues}</div>
                  <div className="text-xs text-gray-600">Active</div>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">{statistics.statistics.resolvedIssues}</div>
                  <div className="text-xs text-gray-600">Resolved</div>
                </div>
              </div>

              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Finding eligible users...</p>
              </div>
            </div>
          )}

          {/* Selection Step */}
          {step === 'selection' && (
            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Important</h4>
                    <p className="text-sm text-yellow-800">
                      {statistics?.statistics.activeIssues} active issue(s) will be transferred to the selected user. 
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Target User <span className="text-red-500">*</span>
                </label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user to receive the work" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{candidate.fullName}</span>
                          <span className="text-xs text-gray-500">
                            {candidate.ward && `Ward ${candidate.ward.wardNumber}`}
                            {candidate.zone && candidate.zone.name}
                            {candidate.department && ` - ${candidate.department}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Showing {candidates.length} eligible user(s) with same role and assignment area
                </p>
              </div>

              {/* Preview */}
              {selectedCandidate && (
                <Card className="p-4 bg-gray-50">
                  <h4 className="font-semibold mb-3">Reassignment Preview</h4>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">From</div>
                      <div className="font-semibold">{user.fullName}</div>
                      <div className="text-xs text-gray-500">{user.role.replace('_', ' ')}</div>
                    </div>
                    
                    <ArrowRight className="w-8 h-8 text-blue-600" />
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-600">To</div>
                      <div className="font-semibold">{selectedCandidate.fullName}</div>
                      <div className="text-xs text-gray-500">{selectedCandidate.role.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold text-orange-600">{statistics?.statistics.activeIssues}</span> 
                      {' '}active issue(s) will be reassigned
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleReassign}
                  disabled={!selectedUserId || loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                >
                  {loading ? 'Reassigning...' : 'Confirm Reassignment'}
                </Button>
                <Button onClick={onClose} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && result && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Reassignment Successful!</h3>
                <p className="text-gray-600">
                  Successfully reassigned <span className="font-bold">{result.reassignedCount}</span> issue(s)
                </p>
              </div>

              <Card className="p-4 bg-blue-50">
                <p className="text-sm text-blue-900">{result.message}</p>
              </Card>

              {result.issues.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Reassigned Issues:</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.issues.slice(0, 5).map((issue) => (
                      <div key={issue.ticketNumber} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <span className="font-mono">{issue.ticketNumber}</span>
                        <div className="flex gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            issue.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                            issue.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {issue.priority}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700">
                            {issue.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {result.issues.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        and {result.issues.length - 5} more...
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={() => { onSuccess(); onClose(); }} className="flex-1 bg-green-600 hover:bg-green-700">
                  Done
                </Button>
              </div>
            </div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <div className="space-y-4">
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Unable to Reassign</h3>
                <p className="text-gray-600">{error}</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={loadUserStatistics} variant="outline" className="flex-1">
                  Try Again
                </Button>
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
