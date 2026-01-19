import { z } from "zod";

// Validation patterns
const PHONE_REGEX = /^(\+91)?[6-9]\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

// Update profile schema
export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100).optional(),
  phoneNumber: z.string().refine(val => PHONE_REGEX.test(val), { 
    message: "Invalid Indian phone number format" 
  }).optional()
}).refine(data => data.fullName || data.phoneNumber, {
  message: "At least one field (fullName or phoneNumber) must be provided"
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .refine(val => PASSWORD_REGEX.test(val), { 
      message: "Password must contain uppercase, lowercase and number" 
    })
}).refine(data => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password"
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
