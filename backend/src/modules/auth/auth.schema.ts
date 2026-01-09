import { z } from "zod";
import { UserRole } from "@prisma/client";

// Register user validation schema
export const registerUserSchema = z.object({
  fullName: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),
  
  email: z.string()
    .email("Invalid email format")
    .transform(val => val.toLowerCase()),
  
  phoneNumber: z.string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase and number"),
  
  role: z.nativeEnum(UserRole),
  
  wardId: z.string().uuid().optional(),
  zoneId: z.string().uuid().optional()
}).refine((data) => {
  // Ward Engineer and Field Worker must have wardId
  if ((data.role === "WARD_ENGINEER" || data.role === "FIELD_WORKER") && !data.wardId) {
    return false;
  }
  // Zone Officer must have zoneId
  if (data.role === "ZONE_OFFICER" && !data.zoneId) {
    return false;
  }
  return true;
}, {
  message: "Ward ID required for Ward Engineer/Field Worker, Zone ID required for Zone Officer"
});

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email format").transform(val => val.toLowerCase()),
  password: z.string().min(1, "Password is required")
});

// Validation middleware
export const validateRegisterUser = (req: any, res: any, next: any) => {
  try {
    registerUserSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues
      });
    }
    next(error);
  }
};

export const validateLogin = (req: any, res: any, next: any) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues
      });
    }
    next(error);
  }
};