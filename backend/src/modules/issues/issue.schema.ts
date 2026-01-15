import { z } from "zod";
import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

export const createIssueSchema = z.object({
  categoryId: z.string().uuid(),
  description: z.string().trim().min(1).max(5000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  metaData: z.record(z.string(), z.any()).optional(), // Json
  aiTags: z.array(z.string().trim().min(1)).max(50).optional(),

  // location
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().trim().max(500).optional(),
  eloc: z.string().trim().max(32).optional(),

  // media urls from frontend (already uploaded somewhere)
  media: z
    .array(
      z.object({
        type: z.enum(["BEFORE", "AFTER"]),
        url: z.string().url(),
        mimeType: z.string().trim().max(100).optional(),
        fileSize: z.number().int().positive().optional(),
      })
    )
    .max(20)
    .optional(),
});

export const issueIdParamsSchema = z.object({
  issueId: z.string().uuid(),
});

export const listIssuesQuerySchema = z.object({
  status: z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "VERIFIED", "REOPENED", "REJECTED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  wardId: z.string().uuid().optional(),
  zoneId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  reporterId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  department: z.enum(["ROAD", "STORM_WATER_DRAINAGE", "SEWAGE_DISPOSAL", "WATER_WORKS", "STREET_LIGHT", "BRIDGE_CELL"]).optional(),

  q: z.string().trim().max(100).optional(), // ticketNumber search

  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const addAfterMediaSchema = z
  .object({
    // allow uploading 1..10 "after" photos in one call
    media: z
      .array(
        z.object({
          url: z.string().url(),
          mimeType: z.string().trim().max(100).optional(),
          fileSize: z.number().int().positive().optional(),
        })
      )
      .min(1)
      .max(10),

    // if true, endpoint will mark issue RESOLVED + set resolvedAt
    markResolved: z.boolean().optional().default(true),
  })
  .strict();

  
export const validateBody =
  (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error?.issues || [{ message: error?.message ?? "Invalid request body" }],
      });
    }
  };

export const validateQuery =
  (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error?.issues || [{ message: error?.message ?? "Invalid query params" }],
      });
    }
  };

export const validateParams =
  (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error?.issues || [{ message: error?.message ?? "Invalid route params" }],
      });
    }
  };