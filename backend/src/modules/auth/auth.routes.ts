import { Router } from "express";
import { AuthController } from "./auth.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import { loginSchema, forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema } from "./auth.schema";

const router = Router();

// Public routes
router.post("/login", validateRequest(loginSchema, 'body'), AuthController.login);
router.post("/forgot-password", validateRequest(forgotPasswordSchema, 'body'), AuthController.forgotPassword);
router.post("/verify-otp", validateRequest(verifyOtpSchema, 'body'), AuthController.verifyOtp);
router.post("/reset-password", validateRequest(resetPasswordSchema, 'body'), AuthController.resetPassword);

// Protected routes
router.use(verifyJWT);
router.post("/logout", AuthController.logout);
router.get("/profile", AuthController.getProfile);

export default router;