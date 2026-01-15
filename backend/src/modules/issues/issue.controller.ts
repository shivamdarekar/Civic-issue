import type { NextFunction, Request, Response } from "express";
import { IssuesService } from "./issue.service";

export class IssuesController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      // assumes verifyJWT sets req.user = { id, role, ... }
      const reporterId = (req as any).user?.id as string;

      const issue = await IssuesService.createIssue({
        reporterId,
        ...req.body,
      });

      return res.status(201).json({ success: true, data: issue });
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await IssuesService.listIssues(req.query as any);
      return res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const issue = await IssuesService.getIssueById(req.params.issueId);
      return res.json({ success: true, data: issue });
    } catch (err) {
      next(err);
    }
  }

  static async uploadAfterMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id as string;
      const userRole = (req as any).user?.role as string;

      const updated = await IssuesService.addAfterMediaIssue({
        issueId: req.params.issueId,
        userId,
        userRole,
        media: req.body.media,
        markResolved: req.body.markResolved,
      });

      return res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
}