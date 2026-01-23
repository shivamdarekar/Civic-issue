"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Mail, Phone, Shield, Building, MapPin, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { registerUser, fetchWardsForZone } from "@/redux";
import VMCLoader from "@/components/ui/VMCLoader";
import { toast } from "sonner";

const ROLE_REQUIREMENTS = {
  SUPER_ADMIN: { showZone: false, showWard: false, showDepartment: false },
  ZONE_OFFICER: { showZone: true, showWard: false, showDepartment: false },
  WARD_ENGINEER: { showZone: true, showWard: true, showDepartment: true },
  FIELD_WORKER: { showZone: true, showWard: true, showDepartment: false },
};

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onUserAdded: (user: any) => void;
  departments: any[];
  zones: any[];
}

export default function AddUserDialog({ open, onClose, onUserAdded, departments, zones }: AddUserDialogProps) {
  const dispatch = useAppDispatch();
  const { wardsByZone, loading, loadingWards } = useAppSelector(state => state.admin);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: 'TempPassword@123',
    role: '',
    department: '',
    wardId: '',
    zoneId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleZoneChange = (zoneId: string) => {
    setFormData({ ...formData, zoneId, wardId: '' });
    setErrors({ ...errors, zoneId: '', wardId: '' });
    
    if (!wardsByZone[zoneId]) {
      dispatch(fetchWardsForZone(zoneId));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.phoneNumber.trim() || !/^[6-9]\d{9}$/.test(formData.phoneNumber.trim())) newErrors.phoneNumber = "Invalid phone";
    if (!formData.role) newErrors.role = "Role is required";

    const roleReq = ROLE_REQUIREMENTS[formData.role as keyof typeof ROLE_REQUIREMENTS];
    if (roleReq) {
      if (roleReq.showDepartment && !formData.department) newErrors.department = "Department required";
      if (roleReq.showZone && !formData.zoneId) newErrors.zoneId = "Zone required";
      if (roleReq.showWard && !formData.wardId) newErrors.wardId = "Ward required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const payload: any = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        role: formData.role,
      };

      if (formData.department) payload.department = formData.department;
      if (formData.wardId) payload.wardId = formData.wardId;
      if (formData.zoneId) payload.zoneId = formData.zoneId;

      const result = await dispatch(registerUser(payload)).unwrap();
      
      onUserAdded({
        id: result.id,
        name: result.fullName,
        email: result.email,
        role: result.role,
        phone: result.phoneNumber,
        department: result.department,
        ward: result.ward?.name ? `Ward ${result.ward.wardNumber} - ${result.ward.name}` : null,
        zone: result.zone?.name || null,
        status: result.isActive ? 'Active' : 'Inactive'
      });
      
      handleClose();
      toast.success('User added successfully!');
    } catch (error: any) {
      toast.error(error || 'Error adding user');
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: 'TempPassword@123',
      role: '',
      department: '',
      wardId: '',
      zoneId: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">Add New User</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">Create a new user account with appropriate permissions</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name *</Label>
                <Input 
                  id="fullName"
                  placeholder="Enter full name" 
                  value={formData.fullName} 
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                  className={`h-10 bg-white text-gray-900 ${errors.fullName ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
                />
                {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email *
                </Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="Enter email address" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  className={`h-10 bg-white text-gray-900 ${errors.email ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone Number *
                </Label>
                <Input 
                  id="phone"
                  placeholder="Enter 10-digit phone number" 
                  value={formData.phoneNumber} 
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                  className={`h-10 bg-white text-gray-900 ${errors.phoneNumber ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
                />
                {errors.phoneNumber && <p className="text-red-500 text-xs">{errors.phoneNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Role *
                </Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({...formData, role: value, department: '', wardId: '', zoneId: ''})}
                >
                  <SelectTrigger className={`h-10 bg-white text-gray-900 ${errors.role ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900">
                    <SelectItem value="SUPER_ADMIN" className="text-gray-900">Super Admin</SelectItem>
                    <SelectItem value="ZONE_OFFICER" className="text-gray-900">Zone Officer</SelectItem>
                    <SelectItem value="WARD_ENGINEER" className="text-gray-900">Ward Engineer</SelectItem>
                    <SelectItem value="FIELD_WORKER" className="text-gray-900">Field Worker</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
              </div>
            </div>
          </div>

          {/* Assignment Information Section */}
          {(ROLE_REQUIREMENTS[formData.role as keyof typeof ROLE_REQUIREMENTS]?.showDepartment || 
            ROLE_REQUIREMENTS[formData.role as keyof typeof ROLE_REQUIREMENTS]?.showZone || 
            ROLE_REQUIREMENTS[formData.role as keyof typeof ROLE_REQUIREMENTS]?.showWard) && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-medium text-gray-900">Assignment Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ROLE_REQUIREMENTS[formData.role as keyof typeof ROLE_REQUIREMENTS]?.showDepartment && (
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Building className="w-3 h-3" /> Department *
                      </Label>
                      <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                        <SelectTrigger className={`h-10 bg-white text-gray-900 ${errors.department ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-gray-900">
                          <SelectItem value="ROAD" className="text-gray-900">Road</SelectItem>
                          <SelectItem value="STORM_WATER_DRAINAGE" className="text-gray-900">Storm Water Drainage</SelectItem>
                          <SelectItem value="SEWAGE_DISPOSAL" className="text-gray-900">Sewage Disposal</SelectItem>
                          <SelectItem value="WATER_WORKS" className="text-gray-900">Water Works</SelectItem>
                          <SelectItem value="STREET_LIGHT" className="text-gray-900">Street Light</SelectItem>
                          <SelectItem value="BRIDGE_CELL" className="text-gray-900">Bridge Cell</SelectItem>
                          <SelectItem value="SOLID_WASTE_MANAGEMENT" className="text-gray-900">Solid Waste Management</SelectItem>
                          <SelectItem value="HEALTH" className="text-gray-900">Health</SelectItem>
                          <SelectItem value="TOWN_PLANNING" className="text-gray-900">Town Planning</SelectItem>
                          <SelectItem value="PARKS_GARDENS" className="text-gray-900">Parks & Gardens</SelectItem>
                          <SelectItem value="ENCROACHMENT" className="text-gray-900">Encroachment</SelectItem>
                          <SelectItem value="FIRE" className="text-gray-900">Fire</SelectItem>
                          <SelectItem value="ELECTRICAL" className="text-gray-900">Electrical</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.department && <p className="text-red-500 text-xs">{errors.department}</p>}
                    </div>
                  )}

                  {ROLE_REQUIREMENTS[formData.role as keyof typeof ROLE_REQUIREMENTS]?.showZone && (
                    <div className="space-y-2">
                      <Label htmlFor="zone" className="text-sm font-medium text-gray-700">Zone *</Label>
                      <Select value={formData.zoneId} onValueChange={handleZoneChange}>
                        <SelectTrigger className={`h-10 bg-white text-gray-900 ${errors.zoneId ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}>
                          <SelectValue placeholder="Select zone" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-gray-900">
                          {zones.map((zone: any) => (
                            <SelectItem key={zone.zoneId} value={zone.zoneId} className="text-gray-900">{zone.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.zoneId && <p className="text-red-500 text-xs">{errors.zoneId}</p>}
                    </div>
                  )}

                  {ROLE_REQUIREMENTS[formData.role as keyof typeof ROLE_REQUIREMENTS]?.showWard && (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="ward" className="text-sm font-medium text-gray-700">Ward *</Label>
                      <Select 
                        value={formData.wardId} 
                        onValueChange={(value) => setFormData({...formData, wardId: value})}
                        disabled={!formData.zoneId || loadingWards}
                      >
                        <SelectTrigger className={`h-10 bg-white text-gray-900 ${errors.wardId ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"} ${(!formData.zoneId || loadingWards) ? "opacity-50" : ""}`}>
                          <SelectValue placeholder={
                            !formData.zoneId ? "Select zone first" :
                            loadingWards ? "Loading wards..." :
                            "Select ward"
                          } />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-gray-900">
                          {wardsByZone[formData.zoneId]?.map((ward: any) => (
                            <SelectItem key={ward.wardId} value={ward.wardId} className="text-gray-900">
                              Ward {ward.wardNumber} - {ward.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.wardId && <p className="text-red-500 text-xs">{errors.wardId}</p>}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="pt-6 border-t border-gray-200">
          <div className="flex gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              disabled={loading}
              className="flex-1 sm:flex-none h-10 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="flex-1 sm:flex-none h-10 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <VMCLoader size={16} />
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add User
                </div>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}