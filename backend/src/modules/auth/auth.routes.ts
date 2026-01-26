import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "./auth.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import { loginSchema, forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema } from "./auth.schema";

const router = Router();

// Auth-specific rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 OTP requests per window
  message: { error: 'Too many OTP requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes with rate limiting
router.post("/login", authLimiter, validateRequest(loginSchema, 'body'), AuthController.login);
router.post("/forgot-password", otpLimiter, validateRequest(forgotPasswordSchema, 'body'), AuthController.forgotPassword);
router.post("/verify-otp", authLimiter, validateRequest(verifyOtpSchema, 'body'), AuthController.verifyOtp);
router.post("/reset-password", authLimiter, validateRequest(resetPasswordSchema, 'body'), AuthController.resetPassword);

// Protected routes
router.use(verifyJWT);
router.post("/logout", AuthController.logout);
router.get("/profile", AuthController.getProfile); // 15 min cache

export default router;