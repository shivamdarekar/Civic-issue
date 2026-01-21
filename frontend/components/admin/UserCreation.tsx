"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, UserPlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { registerUser, fetchDepartments, fetchZonesOverview, fetchWardsForZone } from "@/redux";

interface UserCreationProps {
  onUserCreated: () => void;
}

// Role requirements for fields
const ROLE_REQUIREMENTS = {
  SUPER_ADMIN: { showZone: false, showWard: false, showDepartment: false },
  ZONE_OFFICER: { showZone: true, showWard: false, showDepartment: false },
  WARD_ENGINEER: { showZone: true, showWard: true, showDepartment: true },
  FIELD_WORKER: { showZone: true, showWard: true, showDepartment: false },
};

export default function UserCreation({ onUserCreated }: UserCreationProps) {
  const dispatch = useAppDispatch();
  const { departments, zonesOverview: zones, wardsByZone, loading, loadingWards } = useAppSelector(state => state.admin);
  
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "TempPass@123",
    role: "",
    departmentId: "",
    wardId: "",
    zoneId: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch departments and zones when dialog opens
  useEffect(() => {
    if (showDialog) {
      dispatch(fetchDepartments());
      dispatch(fetchZonesOverview());
    }
  }, [showDialog, dispatch]);

  // Fetch wards when zone is selected
  const handleZoneChange = (zoneId: string) => {
    setFormData({ ...formData, zoneId, wardId: "" });
    setErrors({ ...errors, zoneId: "", wardId: "" });
    
    // Fetch wards if not already cached
    if (!wardsByZone[zoneId]) {
      dispatch(fetchWardsForZone(zoneId));
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Name is required";
    } else if (formData.fullName.length < 2 || formData.fullName.length > 100) {
      newErrors.fullName = "Name must be 2-100 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid Indian mobile number";
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    // Role-specific validation
    const roleReq = ROLE_REQUIREMENTS[formData.role as keyof typeof ROLE_REQUIREMENTS];
    if (roleReq) {
      if (roleReq.showDepartment && !formData.departmentId) {
        newErrors.departmentId = "Department is required for this role";
      }
      if (roleReq.showZone && !formData.zoneId) {
        newErrors.zoneId = "Zone is required for this role";
      }
      if (roleReq.showWard && !formData.wardId) {
        newErrors.wardId = "Ward is required for this role";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Prepare payload matching backend schema
      const payload: any = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: formData.role,
      };

      // Add optional fields only if they have values
      if (formData.departmentId) payload.department = formData.departmentId;
      if (formData.wardId) payload.wardId = formData.wardId;
      if (formData.zoneId) payload.zoneId = formData.zoneId;

      await dispatch(registerUser(payload)).unwrap();
      
      // Reset form and close dialog
      resetForm();
      setShowDialog(false);
      onUserCreated();
      alert('User created successfully!');
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(error || 'Failed to create user');
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "TempPass@123",
      role: "",
      departmentId: "",
      wardId: "",
      zoneId: ""
    });
    setErrors({});
  };

  const roleReq = ROLE_REQUIREMENTS[formData.role as keyof typeof ROLE_REQUIREMENTS];
  const currentWards = formData.zoneId ? (wardsByZone[formData.zoneId] || []) : [];

  return (
    <Dialog open={showDialog} onOpenChange={(open) => {
      setShowDialog(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Create New User
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Personal Information */}
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Full Name *"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
              
              <div>
                <Input
                  placeholder="Email Address *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <Input
                  placeholder="Phone Number *"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className={errors.phoneNumber ? "border-red-500" : ""}
                />
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
              </div>

              <div>
                <Input
                  placeholder="Temporary Password *"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>
          </Card>

          {/* Role & Department */}
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Role & Department</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({...formData, role: value, departmentId: "", wardId: "", zoneId: ""})}
                >
                  <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select Role *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIELD_WORKER">Field Worker</SelectItem>
                    <SelectItem value="WARD_ENGINEER">Ward Engineer</SelectItem>
                    <SelectItem value="ZONE_OFFICER">Zone Officer</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
              </div>

              {roleReq?.showDepartment && (
                <div>
                  <Select value={formData.departmentId} onValueChange={(value) => setFormData({...formData, departmentId: value})}>
                    <SelectTrigger className={errors.departmentId ? "border-red-500" : ""}>
                      <SelectValue placeholder={loading ? "Loading departments..." : "Select Department *"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept: any) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.departmentId && <p className="text-red-500 text-xs mt-1">{errors.departmentId}</p>}
                </div>
              )}
            </div>
          </Card>

          {/* Geographic Assignment */}
          {(roleReq?.showZone || roleReq?.showWard) && (
            <Card className="p-4">
              <h4 className="font-semibold mb-3">Geographic Assignment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleReq?.showZone && (
                  <div>
                    <Select value={formData.zoneId} onValueChange={handleZoneChange}>
                      <SelectTrigger className={errors.zoneId ? "border-red-500" : ""}>
                        <SelectValue placeholder={loading ? "Loading zones..." : "Select Zone *"} />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((zone: any, index: number) => (
                          <SelectItem key={`${zone.id}-${index}`} value={String(zone.id)}>
                            {zone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.zoneId && <p className="text-red-500 text-xs mt-1">{errors.zoneId}</p>}
                  </div>
                )}

                {roleReq?.showWard && (
                  <div>
                    <Select 
                      value={formData.wardId} 
                      onValueChange={(value) => setFormData({...formData, wardId: value})}
                      disabled={!formData.zoneId || loadingWards}
                    >
                      <SelectTrigger className={errors.wardId ? "border-red-500" : ""}>
                        <SelectValue placeholder={
                          !formData.zoneId 
                            ? "Select zone first" 
                            : loadingWards 
                            ? "Loading wards..." 
                            : "Select Ward *"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {currentWards.length === 0 && formData.zoneId && !loadingWards && (
                          <SelectItem value="" disabled>No wards for selected zone</SelectItem>
                        )}
                        {currentWards.map((ward: any) => (
                          <SelectItem key={ward.wardId} value={ward.wardId}>
                            Ward {ward.wardNumber} - {ward.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.wardId && <p className="text-red-500 text-xs mt-1">{errors.wardId}</p>}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => setShowDialog(false)} 
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}