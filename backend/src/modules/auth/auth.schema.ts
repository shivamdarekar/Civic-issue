import { z } from "zod";

// Validation patterns
const OTP_REGEX = /^\d{6}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email format").transform(val => val.toLowerCase()),
  password: z.string().min(1, "Password is required")
});

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format").transform(val => val.toLowerCase())
});

// Verify OTP validation schema
export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email format").transform(val => val.toLowerCase()),
  otp: z.string().length(6, "OTP must be 6 digits").refine(val => OTP_REGEX.test(val), { message: "OTP must contain only numbers" })
});

// Reset password validation schema
export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email format").transform(val => val.toLowerCase()),
  otp: z.string().length(6, "OTP must be 6 digits").refine(val => OTP_REGEX.test(val), { message: "OTP must contain only numbers" }),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .refine(val => PASSWORD_REGEX.test(val), { message: "Password must contain uppercase, lowercase and number" })
});
