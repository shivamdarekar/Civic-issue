import { z } from "zod";

// Validation patterns
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const URL_REGEX = /^https?:\/\/.+/;

export const createIssueSchema = z.object({
  categoryId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }),
  description: z.string().trim().min(1).max(5000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  metaData: z.record(z.string(), z.any()).optional(),
  aiTags: z.array(z.string().trim().min(1)).max(50).optional(),

  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().trim().max(500).optional(),
  eloc: z.string().trim().max(32).optional(),

  media: z
    .array(
      z.object({
        type: z.enum(["BEFORE", "AFTER"]),
        url: z.string().refine(val => URL_REGEX.test(val), { message: "Invalid URL" }),
        mimeType: z.string().trim().max(100).optional(),
        fileSize: z.number().int().positive().optional(),
      })
    )
    .max(20)
    .optional(),
});

export const issueIdParamsSchema = z.object({
  issueId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }),
});

export const listIssuesQuerySchema = z.object({
  status: z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "VERIFIED", "REOPENED", "REJECTED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  wardId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }).optional(),
  zoneId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }).optional(),
  categoryId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }).optional(),
  reporterId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }).optional(),
  assigneeId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }).optional(),
  department: z.enum(["ROAD", "STORM_WATER_DRAINAGE", "SEWAGE_DISPOSAL", "WATER_WORKS", "STREET_LIGHT", "BRIDGE_CELL", "SOLID_WASTE_MANAGEMENT", "HEALTH", "TOWN_PLANNING", "PARKS_GARDENS", "ENCROACHMENT", "FIRE", "ELECTRICAL"]).optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// Combined schemas for routes with both params and body (using 'all' source)
export const addAfterMediaWithParamsSchema = z.object({
  issueId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }),
  media: z
    .array(
      z.object({
        url: z.string().refine(val => URL_REGEX.test(val), { message: "Invalid URL" }),
        mimeType: z.string().trim().max(100).optional(),
        fileSize: z.number().int().positive().optional(),
      })
    )
    .min(1)
    .max(10),
  markResolved: z.boolean().optional().default(true),
});

export const updateStatusWithParamsSchema = z.object({
  issueId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }),
  status: z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "VERIFIED", "REOPENED", "REJECTED"]),
  comment: z.string().trim().min(1).max(1000).optional()
});

export const addCommentWithParamsSchema = z.object({
  issueId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }),
  comment: z.string().trim().min(1).max(1000)
});

export const reassignIssueWithParamsSchema = z.object({
  issueId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }),
  assigneeId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }),
  reason: z.string().trim().min(1).max(500).optional()
});

export const verifyResolutionWithParamsSchema = z.object({
  issueId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }),
  approved: z.boolean(),
  comment: z.string().trim().min(1).max(1000).optional()
});

export const statsQuerySchema = z.object({
  wardId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }).optional(),
  zoneId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }).optional(),
  assigneeId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }).optional()
});

export const analyzeImageSchema = z.object({
  imageUrl: z.string().refine((val) => URL_REGEX.test(val), { message: "Invalid URL" }),
});
