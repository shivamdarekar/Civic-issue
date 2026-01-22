"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Phone, Shield, Building, MapPin, Users, Calendar } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUserById } from "@/redux";

interface ViewUserDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
}

export default function ViewUserDialog({ open, onClose, userId }: ViewUserDialogProps) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(state => state.admin);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (open && userId) {
      fetchUser();
    }
  }, [open, userId]);

  const fetchUser = async () => {
    if (!userId) return;
    
    try {
      const result = await dispatch(fetchUserById(userId)).unwrap();
      setUserData(result);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleClose = () => {
    setUserData(null);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">User Details</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">View user information and assignments</p>
            </div>
          </div>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-gray-600">Loading user details...</span>
          </div>
        ) : userData ? (
          <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-900">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900">{userData.fullName}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </Label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900">{userData.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone Number
                  </Label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900">{userData.phoneNumber}</p>
                  </div>
                </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Role
                    </Label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <Badge variant={
                        userData.role === 'SUPER_ADMIN' ? 'destructive' :
                        userData.role === 'ZONE_OFFICER' ? 'secondary' :
                        userData.role === 'WARD_ENGINEER' ? 'default' :
                        'outline'
                      }>
                        {userData.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <Badge variant={userData.isActive ? 'default' : 'destructive'}>
                        {userData.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Created At
                  </Label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900">{formatDate(userData.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment Information Section */}
            {(userData.department || userData.zone || userData.ward) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <h3 className="text-sm font-medium text-gray-900">Assignment Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userData.department && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <Building className="w-3 h-3" /> Department
                        </Label>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-gray-900">{userData.department.replace('_', ' ')}</p>
                        </div>
                      </div>
                    )}

                    {userData.zone && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Zone</Label>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-gray-900">{userData.zone.name}</p>
                        </div>
                      </div>
                    )}

                    {userData.ward && (
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Ward</Label>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-gray-900">Ward {userData.ward.wardNumber} - {userData.ward.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Skeleton for Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="w-32 h-4" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="w-20 h-4" />
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <Skeleton className="w-full h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Skeleton for Assignment Details */}
            <div className="space-y-4">
              <Separator />
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="w-32 h-4" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="w-16 h-4" />
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <Skeleton className="w-full h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="pt-6 border-t border-gray-200">
          <Button 
            onClick={handleClose} 
            className="w-full sm:w-auto h-10 bg-gray-600 hover:bg-gray-700 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}