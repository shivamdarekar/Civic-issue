import { Router } from "express";
import { AdminController } from "./admin.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/rbac.middleware";

const router = Router();

router.use(verifyJWT);

router.get("/dashboard", requireRole(["SUPER_ADMIN"]), AdminController.getDashboard);
router.get("/zones", requireRole(["SUPER_ADMIN"]), AdminController.getZonesOverview);
router.get("/zones/:zoneId", requireRole(["SUPER_ADMIN"]), AdminController.getZoneDetail);
router.get("/zones/:zoneId/wards", requireRole(["SUPER_ADMIN"]), AdminController.getZoneWards);
router.get("/wards/:wardId", requireRole(["SUPER_ADMIN"]), AdminController.getWardDetail);
router.get("/wards/:wardId/issues", requireRole(["SUPER_ADMIN"]), AdminController.getWardIssues);

export default router;