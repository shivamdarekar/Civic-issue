import { Router } from "express";
import { AdminController } from "./admin.controller";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/rbac.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import { 
  registerUserSchema, 
  updateUserWithParamsSchema, 
  reassignWorkWithParamsSchema, 
  getUsersByFilterSchema,
  userIdParamsSchema,
  zoneIdParamsSchema,
  wardIdParamsSchema
} from "./admin.schema";

const router = Router();

router.use(verifyJWT);

// User Management Routes (Super Admin only)
router.post("/register", 
  requireRole(["SUPER_ADMIN"]),
  validateRequest(registerUserSchema, 'body'),
  AdminController.registerUser
);

router.get("/users", 
  requireRole(["SUPER_ADMIN"]), 
  AdminController.getAllUsers
);

router.get("/users/:userId", 
  requireRole(["SUPER_ADMIN", "ZONE_OFFICER"]),
  validateRequest(userIdParamsSchema, 'params'),
  AdminController.getUserById
);

router.put("/users/:userId", 
  requireRole(["SUPER_ADMIN"]),
  validateRequest(updateUserWithParamsSchema, 'all'),
  AdminController.updateUser
);

router.post("/users/:userId/reassign", 
  requireRole(["SUPER_ADMIN"]),
  validateRequest(reassignWorkWithParamsSchema, 'all'),
  AdminController.reassignUserWork
);

router.patch("/users/:userId/deactivate", 
  requireRole(["SUPER_ADMIN"]),
  validateRequest(userIdParamsSchema, 'params'),
  AdminController.deactivateUser
);

router.patch("/users/:userId/reactivate", 
  requireRole(["SUPER_ADMIN"]),
  validateRequest(userIdParamsSchema, 'params'),
  AdminController.reactivateUser
);

router.get("/users/:userId/statistics", 
  requireRole(["SUPER_ADMIN"]),
  validateRequest(userIdParamsSchema, 'params'),
  AdminController.getUserStatistics
);

router.get("/users/filter/search", 
  requireRole(["SUPER_ADMIN"]),
  validateRequest(getUsersByFilterSchema, 'query'),
  AdminController.getUsersByFilter
);

router.get("/departments", 
  requireRole(["SUPER_ADMIN"]), 
  AdminController.getDepartments
);

// Dashboard Routes (Super Admin only)
router.get("/dashboard", requireRole(["SUPER_ADMIN"]), AdminController.getDashboard);
router.get("/zones", requireRole(["SUPER_ADMIN"]), AdminController.getZonesOverview);
router.get("/zones/:zoneId", requireRole(["SUPER_ADMIN", "ZONE_OFFICER"]), validateRequest(zoneIdParamsSchema, 'params'), AdminController.getZoneDetail);
router.get("/zones/:zoneId/wards", requireRole(["SUPER_ADMIN", "ZONE_OFFICER"]), validateRequest(zoneIdParamsSchema, 'params'), AdminController.getZoneWards);
router.get("/wards/:wardId", requireRole(["SUPER_ADMIN", "ZONE_OFFICER", "WARD_ENGINEER"]), validateRequest(wardIdParamsSchema, 'params'), AdminController.getWardDetail);
router.get("/wards/:wardId/issues", requireRole(["SUPER_ADMIN", "ZONE_OFFICER", "WARD_ENGINEER"]), validateRequest(wardIdParamsSchema, 'params'), AdminController.getWardIssues);

export default router;