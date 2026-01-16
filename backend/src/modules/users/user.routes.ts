import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/rbac.middleware";
import { UserDashboardController } from "./user.controller";

const router = Router();

router.use(verifyJWT);

// /api/dashboard/field-worker (FIELD_WORKER only)
router.get("/field-worker", requireRole(["FIELD_WORKER"]), UserDashboardController.fieldWorker);

// /api/dashboard/ward-engineer (WARD_ENGINEER only)
router.get("/ward-engineer", requireRole(["WARD_ENGINEER"]), UserDashboardController.wardEngineer);

// /api/dashboard/assigned (FIELD_WORKER + WARD_ENGINEER)
router.get("/assigned", requireRole(["FIELD_WORKER", "WARD_ENGINEER"]), UserDashboardController.assigned);

export default router;