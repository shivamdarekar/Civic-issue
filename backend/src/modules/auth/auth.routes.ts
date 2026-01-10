import { Router } from "express";
import { AuthController } from "./auth.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { validateLogin, validateForgotPassword, validateVerifyOtp, validateResetPassword } from "./auth.schema";

const router = Router();

// public routes
router.post("/login", validateLogin, AuthController.login);
router.post("/forgot-password", validateForgotPassword, AuthController.forgotPassword);
router.post("/verify-otp", validateVerifyOtp, AuthController.verifyOtp);
router.post("/reset-password", validateResetPassword, AuthController.resetPassword);

// protected routes
router.use(verifyJWT); // All routes below require authentication

// general authenticated routes
router.post("/logout", AuthController.logout);
router.get("/profile", AuthController.getProfile);

export default router;