import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/rbac.middleware";
import { addAfterMediaSchema, validateBody, validateParams, validateQuery } from "./issue.schema";
import { IssuesController } from "./issue.controller";
import { createIssueSchema, issueIdParamsSchema, listIssuesQuerySchema } from "./issue.schema";

const router = Router();

router.use(verifyJWT);

// Field worker can create
router.post(
  "/",
  requireRole(["FIELD_WORKER"]),
  validateBody(createIssueSchema),
  IssuesController.create
);

// List (role-based filtering is up to you; this is generic)
router.get(
  "/",
  requireRole(["FIELD_WORKER", "WARD_ENGINEER", "ZONE_OFFICER", "SUPER_ADMIN"]),
  validateQuery(listIssuesQuerySchema),
  IssuesController.list 
);

// Dedicated issue get endpoint (all related info)
router.get(
  "/:issueId",
  requireRole(["FIELD_WORKER", "WARD_ENGINEER", "ZONE_OFFICER", "SUPER_ADMIN"]),
  validateParams(issueIdParamsSchema),
  IssuesController.getById
);

router.post(
  "/:issueId/after-media",
  requireRole(["FIELD_WORKER", ]),
  validateParams(issueIdParamsSchema),
  validateBody(addAfterMediaSchema),
  IssuesController.uploadAfterMedia
);
export default router;