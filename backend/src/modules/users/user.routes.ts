import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/rbac.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import { 
  updateProfileSchema, 
  changePasswordSchema 
} from "./user.schema";
import { UserDashboardController } from "./user.controller";

const router = Router();

router.use(verifyJWT);

// Dashboard endpoints
router.get("/dashboard/field-worker", requireRole(["FIELD_WORKER"]), UserDashboardController.fieldWorker);
router.get("/dashboard/ward-engineer", requireRole(["WARD_ENGINEER"]), UserDashboardController.wardEngineer);
router.get("/dashboard/assigned", requireRole(["FIELD_WORKER", "WARD_ENGINEER"]), UserDashboardController.assigned);

// Profile management (all authenticated users)
router.patch("/profile", validateRequest(updateProfileSchema, 'body'), UserDashboardController.updateProfile);
router.post("/change-password", validateRequest(changePasswordSchema, 'body'), UserDashboardController.changePassword);
router.get("/activity", UserDashboardController.getActivityLog);

export default router;