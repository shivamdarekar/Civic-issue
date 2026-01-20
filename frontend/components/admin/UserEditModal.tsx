"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import type { User, UserRole, Department, UpdateUserData } from "@/lib/api-client";
import { updateUser } from "@/lib/api-client";

interface UserEditModalProps {
  user: User;
  wards: Array<{ id: string; wardNumber: number; name: string }>;
  zones: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSuccess: (updatedUser: User) => void;
}

export default function UserEditModal({ user, wards, zones, onClose, onSuccess }: UserEditModalProps) {
  const [formData, setFormData] = useState<UpdateUserData>({
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    wardId: user.wardId,
    zoneId: user.zoneId,
    department: user.department,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName || formData.fullName.length < 2 || formData.fullName.length > 100) {
      errors.fullName = "Full name must be between 2 and 100 characters";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (formData.phoneNumber && !/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone must be 10 digits starting with 6-9";
    }

    // Role-specific validations
    if (formData.role === 'WARD_ENGINEER') {
      if (!formData.wardId) errors.wardId = "Ward Engineer must have a ward assigned";
      if (!formData.department) errors.department = "Ward Engineer must have a department";
    }

    if (formData.role === 'FIELD_WORKER' && !formData.wardId) {
      errors.wardId = "Field Worker must have a ward assigned";
    }

    if (formData.role === 'ZONE_OFFICER' && !formData.zoneId) {
      errors.zoneId = "Zone Officer must have a zone assigned";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (user.role === 'SUPER_ADMIN') {
      setError("Cannot update Super Admin account");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError (null);

    try {
      const response = await updateUser(user.id, formData);
      
      if (response.success && response.data) {
        onSuccess(response.data);
        onClose();
      } else {
        setError(response.message || "Failed to update user");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while updating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-3xl bg-white my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Edit User Details</h2>
              <p className="text-sm text-gray-600 mt-1">Update information for {user.fullName}</p>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter full name"
                className={validationErrors.fullName ? 'border-red-500' : ''}
              />
              {validationErrors.fullName && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@vmc.gov.in"
                className={validationErrors.email ? 'border-red-500' : ''}
              />
              {validationErrors.email && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="9876543210"
                maxLength={10}
                className={validationErrors.phoneNumber ? 'border-red-500' : ''}
              />
              {validationErrors.phoneNumber && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.phoneNumber}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIELD_WORKER">Field Worker</SelectItem>
                  <SelectItem value="WARD_ENGINEER">Ward Engineer</SelectItem>
                  <SelectItem value="ZONE_OFFICER">Zone Officer</SelectItem>
                  {user.role === 'SUPER_ADMIN' && <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {/* Department (for Ward Engineers) */}
            {(formData.role === 'WARD_ENGINEER') && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value as Department })}
                >
                  <SelectTrigger className={validationErrors.department ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROAD">Road</SelectItem>
                    <SelectItem value="STORM_WATER_DRAINAGE">Storm Water Drainage</SelectItem>
                    <SelectItem value="STREET_LIGHT">Street Light</SelectItem>
                    <SelectItem value="GARBAGE">Garbage</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.department && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.department}</p>
                )}
              </div>
            )}

            {/* Ward (for Field Workers and Ward Engineers) */}
            {(formData.role === 'FIELD_WORKER' || formData.role === 'WARD_ENGINEER') && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ward <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.wardId}
                  onValueChange={(value) => setFormData({ ...formData, wardId: value })}
                >
                  <SelectTrigger className={validationErrors.wardId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.id}>
                        Ward {ward.wardNumber} - {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.wardId && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.wardId}</p>
                )}
              </div>
            )}

            {/* Zone (for Zone Officers) */}
            {formData.role === 'ZONE_OFFICER' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Zone <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.zoneId}
                  onValueChange={(value) => setFormData({ ...formData, zoneId: value })}
                >
                  <SelectTrigger className={validationErrors.zoneId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.zoneId && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.zoneId}</p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleSubmit}
              disabled={loading || user.role === 'SUPER_ADMIN'}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? 'Updating...' : 'Update User'}
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
