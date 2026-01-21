import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/rbac.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import { uploadMultiple } from "../../utils/multer";
import { IssuesController } from "./issue.controller";
import { 
  createIssueSchema, 
  issueIdParamsSchema, 
  listIssuesQuerySchema, 
  addAfterMediaWithParamsSchema,
  updateStatusWithParamsSchema,
  addCommentWithParamsSchema,
  reassignIssueWithParamsSchema,
  verifyResolutionWithParamsSchema,
  statsQuerySchema,
  analyzeImageSchema
} from "./issue.schema";

const router = Router();

router.use(verifyJWT);

// Get issue categories (for dropdown in create form)
router.get(
  "/categories",
  requireRole(["FIELD_WORKER", "WARD_ENGINEER", "ZONE_OFFICER", "SUPER_ADMIN"]),
  IssuesController.getCategories
);

// Get issue statistics
router.get(
  "/stats",
  requireRole(["FIELD_WORKER", "WARD_ENGINEER", "ZONE_OFFICER", "SUPER_ADMIN"]),
  validateRequest(statsQuerySchema, 'query'),
  IssuesController.getStats
);

// Field worker can create
router.post(
  "/",
  requireRole(["FIELD_WORKER"]),
  validateRequest(createIssueSchema, 'body'),
  IssuesController.create
);

// List issues
router.get(
  "/",
  requireRole(["FIELD_WORKER", "WARD_ENGINEER", "ZONE_OFFICER", "SUPER_ADMIN"]),
  validateRequest(listIssuesQuerySchema, 'query'),
  IssuesController.list 
);

// Get issue by ID
router.get(
  "/:issueId",
  requireRole(["FIELD_WORKER", "WARD_ENGINEER", "ZONE_OFFICER", "SUPER_ADMIN"]),
  validateRequest(issueIdParamsSchema, 'params'),
  IssuesController.getById
);

// Upload after media
router.post(
  "/:issueId/after-media",
  requireRole(["FIELD_WORKER", "WARD_ENGINEER"]),
  validateRequest(addAfterMediaWithParamsSchema, 'all'),
  IssuesController.uploadAfterMedia
);

// Update issue status
router.patch(
  "/:issueId/status",
  requireRole(["WARD_ENGINEER", "ZONE_OFFICER", "SUPER_ADMIN"]),
  validateRequest(updateStatusWithParamsSchema, 'all'),
  IssuesController.updateStatus
);

// Add comment
router.post(
  "/:issueId/comments",
  requireRole(["FIELD_WORKER", "WARD_ENGINEER", "ZONE_OFFICER", "SUPER_ADMIN"]),
  validateRequest(addCommentWithParamsSchema, 'all'),
  IssuesController.addComment
);

// Reassign issue
router.patch(
  "/:issueId/reassign",
  requireRole(["WARD_ENGINEER", "ZONE_OFFICER", "SUPER_ADMIN"]),
  validateRequest(reassignIssueWithParamsSchema, 'all'),
  IssuesController.reassignIssue
);

// Verify/Reject resolution
router.patch(
  "/:issueId/verify",
  requireRole(["ZONE_OFFICER", "SUPER_ADMIN"]),
  validateRequest(verifyResolutionWithParamsSchema, 'all'),
  IssuesController.verifyResolution
);

// ============= IMAGE UPLOAD ROUTES =============

// Upload BEFORE images (for issue creation)
router.post(
  "/upload/before",
  requireRole(["FIELD_WORKER", "WARD_ENGINEER", "ZONE_OFFICER", "SUPER_ADMIN"]),
  uploadMultiple,
  IssuesController.uploadBeforeImages
);

// Upload AFTER images (for issue resolution)
router.post(
  "/upload/after",
  requireRole(["FIELD_WORKER", "WARD_ENGINEER"]),
  uploadMultiple,
  IssuesController.uploadAfterImages
);

// Delete image from cloud storage
router.delete(
  "/upload/delete",
  requireRole(["FIELD_WORKER", "WARD_ENGINEER", "ZONE_OFFICER", "SUPER_ADMIN"]),
  IssuesController.deleteImage
);

router.post(
  "/analyze-image",
  requireRole(["FIELD_WORKER", "WARD_ENGINEER", "ZONE_OFFICER", "SUPER_ADMIN"]),
  validateRequest(analyzeImageSchema, "body"),
  IssuesController.analyzeImage
);

export default router;