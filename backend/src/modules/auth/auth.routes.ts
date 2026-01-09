import { Router } from "express";
import { AuthController } from "./auth.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/rbac.middleware";

const router = Router();

// public routes
router.post("/login", AuthController.login);

// protected routes
router.use(verifyJWT); // All routes below require authentication

// super admin only routes
router.post("/register", 
  requireRole(["SUPER_ADMIN"]), 
  AuthController.registerUser
);

router.get("/users", 
  requireRole(["SUPER_ADMIN"]), 
  AuthController.getAllUsers
);

router.get("/zones-wards", 
  requireRole(["SUPER_ADMIN"]), 
  AuthController.getZonesAndWards
);

// general authenticated routes
router.post("/logout", AuthController.logout);
router.get("/profile", AuthController.getProfile);

export default router;