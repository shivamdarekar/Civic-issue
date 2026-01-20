"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, UserPlus } from "lucide-react";
import { adminAPI } from "@/lib/api";
import { authService } from "@/lib/auth";

interface UserCreationProps {
  onUserCreated: () => void;
}

export default function UserCreation({ onUserCreated }: UserCreationProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "",
    department: "",
    wardId: "",
    zoneId: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.length < 2 || formData.fullName.length > 100) {
      newErrors.fullName = "Full name must be between 2-100 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid Indian mobile number";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    // Role-specific validations
    if (formData.role === 'WARD_ENGINEER') {
      if (!formData.department) {
        newErrors.department = "Department is required for Ward Engineers";
      }
      if (!formData.wardId) {
        newErrors.wardId = "Ward assignment is required for Ward Engineers";
      }
    }

    if (formData.role === 'FIELD_WORKER') {
      if (!formData.wardId) {
        newErrors.wardId = "Ward assignment is required for Field Workers";
      }
    }

    if (formData.role === 'ZONE_OFFICER') {
      if (!formData.zoneId) {
        newErrors.zoneId = "Zone assignment is required for Zone Officers";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare data for API
      const userData: any = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
      };

      if (formData.department) userData.department = formData.department;
      if (formData.wardId) userData.wardId = formData.wardId;
      if (formData.zoneId) userData.zoneId = formData.zoneId;

      // Call the actual API
      const result = await authService.registerUser(userData);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        role: "",
        department: "",
        wardId: "",
        zoneId: ""
      });
      
      setShowDialog(false);
      onUserCreated();
      alert('User created successfully!');
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      role: "",
      department: "",
      wardId: "",
      zoneId: ""
    });
    setErrors({});
  };

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
            </div>
          </Card>

          {/* Role & Department */}
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Role & Department</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({...formData, role: value, department: "", wardId: "", zoneId: ""})}
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

              {(formData.role === 'WARD_ENGINEER' || formData.role === 'ZONE_OFFICER') && (
                <div>
                  <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                    <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                      <SelectValue placeholder={`Select Department ${formData.role === 'WARD_ENGINEER' ? '*' : ''}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROAD">Road</SelectItem>
                      <SelectItem value="STORM_WATER_DRAINAGE">Storm Water Drainage</SelectItem>
                      <SelectItem value="SOLID_WASTE_MANAGEMENT">Solid Waste Management</SelectItem>
                      <SelectItem value="WATER_SUPPLY">Water Supply</SelectItem>
                      <SelectItem value="STREET_LIGHTING">Street Lighting</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                </div>
              )}
            </div>
          </Card>

          {/* Assignment */}
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Assignment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(formData.role === 'WARD_ENGINEER' || formData.role === 'FIELD_WORKER') && (
                        <div>
                          <Select value={formData.wardId} onValueChange={(value) => setFormData({...formData, wardId: value})}>
                            <SelectTrigger className={errors.wardId ? "border-red-500" : ""}>
                              <SelectValue placeholder="Select Ward *" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ward-1">Ward 1 - Fatehgunj</SelectItem>
                              <SelectItem value="ward-2">Ward 2 - Alkapuri</SelectItem>
                              <SelectItem value="ward-3">Ward 3 - Manjalpur</SelectItem>
                              <SelectItem value="ward-4">Ward 4 - Gotri</SelectItem>
                              <SelectItem value="ward-5">Ward 5 - Akota</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.wardId && <p className="text-red-500 text-xs mt-1">{errors.wardId}</p>}
                        </div>
                      )}

                      {formData.role === 'ZONE_OFFICER' && (
                        <div>
                          <Select value={formData.zoneId} onValueChange={(value) => setFormData({...formData, zoneId: value})}>
                            <SelectTrigger className={errors.zoneId ? "border-red-500" : ""}>
                              <SelectValue placeholder="Select Zone *" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="zone-1">North Zone</SelectItem>
                              <SelectItem value="zone-2">South Zone</SelectItem>
                              <SelectItem value="zone-3">East Zone</SelectItem>
                              <SelectItem value="zone-4">West Zone</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.zoneId && <p className="text-red-500 text-xs mt-1">{errors.zoneId}</p>}
                        </div>
                      )}
            </div>
          </Card>

          {/* Role Information */}
          {formData.role && (
            <Card className="p-4 bg-blue-50">
              <h4 className="font-semibold mb-2">Role Information</h4>
              <div className="text-sm text-gray-600">
                {formData.role === 'FIELD_WORKER' && (
                  <p>Field Workers handle on-ground issue resolution and data collection within assigned wards.</p>
                )}
                {formData.role === 'WARD_ENGINEER' && (
                  <p>Ward Engineers supervise technical aspects of issue resolution and manage field workers in their department and ward.</p>
                )}
                {formData.role === 'ZONE_OFFICER' && (
                  <p>Zone Officers oversee multiple wards within a zone and coordinate between different departments.</p>
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