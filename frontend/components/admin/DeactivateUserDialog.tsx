"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserX, AlertTriangle, Users, ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUserStatistics, fetchUsersByFilter, reassignUserWork, deactivateUser } from "@/redux";

interface DeactivateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onUserDeactivated: () => void;
  user: any | null;
}

export default function DeactivateUserDialog({ open, onClose, onUserDeactivated, user }: DeactivateUserDialogProps) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(state => state.admin);
  
  const [step, setStep] = useState<'check' | 'reassign' | 'confirm'>('check');
  const [userStats, setUserStats] = useState<any>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [reassigning, setReassigning] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  useEffect(() => {
    if (open && user) {
      checkUserActiveIssues();
    }
  }, [open, user]);

  const checkUserActiveIssues = async () => {
    if (!user) return;
    
    try {
      const result = await dispatch(fetchUserStatistics(user.id)).unwrap();
      setUserStats(result);
      
      if (result.statistics.activeIssues > 0) {
        await loadAvailableUsers();
        setStep('reassign');
      } else {
        setStep('confirm');
      }
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      handleClose();
    }
  };

  const loadAvailableUsers = async () => {
    if (!user) return;
    
    const filters: any = {
      role: user.role,
      isActive: true
    };
    
    if (user.role === 'WARD_ENGINEER' || user.role === 'FIELD_WORKER') {
      filters.wardId = user.wardId;
    } else if (user.role === 'ZONE_OFFICER') {
      filters.zoneId = user.zoneId;
    }
    
    try {
      const result = await dispatch(fetchUsersByFilter(filters)).unwrap();
      const filtered = result.filter((u: any) => u.id !== user.id);
      setAvailableUsers(filtered);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const handleReassign = async () => {
    if (!selectedUserId || !user) return;
    
    setReassigning(true);
    try {
      await dispatch(reassignUserWork({ fromUserId: user.id, toUserId: selectedUserId })).unwrap();
      setStep('confirm');
      showToast('Tasks reassigned successfully!');
    } catch (error: any) {
      showToast(error || 'Failed to reassign tasks', 'error');
    } finally {
      setReassigning(false);
    }
  };

  const handleDeactivate = async () => {
    if (!user) return;
    
    setDeactivating(true);
    try {
      await dispatch(deactivateUser(user.id)).unwrap();
      onUserDeactivated();
      handleClose();
    } catch (error: any) {
      showToast(error || 'Failed to deactivate user', 'error');
    } finally {
      setDeactivating(false);
    }
  };

  const handleClose = () => {
    setStep('check');
    setUserStats(null);
    setAvailableUsers([]);
    setSelectedUserId('');
    setReassigning(false);
    setDeactivating(false);
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Deactivate User - {user.name}
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                {step === 'check' && 'Checking active assignments...'}
                {step === 'reassign' && 'Reassign active tasks before deactivation'}
                {step === 'confirm' && 'Confirm user deactivation'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.role.replace('_', ' ')} • {user.ward || user.zone || 'No assignment'}</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </div>

          {/* Step Content */}
          {step === 'reassign' && userStats && (
            <>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This user has {userStats.statistics.activeIssues} active issue(s) that must be reassigned before deactivation.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Select user to reassign tasks to:
                  </Label>
                  {availableUsers.length === 0 ? (
                    <Alert className="mt-2">
                      <Users className="h-4 w-4" />
                      <AlertDescription>
                        No available users found in the same {user.role === 'ZONE_OFFICER' ? 'zone' : 'ward'} with the same role.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose a user to reassign tasks to" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((availableUser) => (
                          <SelectItem key={availableUser.id} value={availableUser.id}>
                            {availableUser.fullName} - {availableUser.role.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {selectedUserId && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{userStats.statistics.activeIssues} active issues</span>
                      <ArrowRight className="w-4 h-4" />
                      <span className="font-medium">
                        {availableUsers.find(u => u.id === selectedUserId)?.fullName}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {step === 'confirm' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {userStats?.statistics.activeIssues > 0 
                  ? 'All active tasks have been reassigned. Ready to deactivate user.'
                  : 'This user has no active assignments. Ready to deactivate.'
                }
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="pt-6 border-t border-gray-200">
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={handleClose} disabled={reassigning || deactivating}>
              Cancel
            </Button>
            
            {step === 'reassign' && (
              <Button 
                onClick={handleReassign} 
                disabled={!selectedUserId || reassigning || availableUsers.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {reassigning ? 'Reassigning...' : 'Reassign Tasks'}
              </Button>
            )}
            
            {step === 'confirm' && (
              <Button 
                onClick={handleDeactivate} 
                disabled={deactivating}
                className="bg-red-600 hover:bg-red-700"
              >
                {deactivating ? 'Deactivating...' : 'Deactivate User'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}