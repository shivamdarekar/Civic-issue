import type { NextFunction, Request, Response } from "express";
import { IssuesService } from "./issue.service";
import { IssueUploadService } from "./issue.upload.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
import { analyzeImageSchema } from "./issue.schema";

export class IssuesController {
  // Get all issue categories
  static getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await IssuesService.getCategories();

    res.status(200).json(
      new ApiResponse(200, categories, "Categories retrieved successfully")
    );
  });

  // Get issue statistics
  static getStats = asyncHandler(async (req: Request, res: Response) => {
    const { wardId, zoneId, assigneeId } = req.query;

    const stats = await IssuesService.getIssueStats({
      wardId: wardId as string,
      zoneId: zoneId as string,
      assigneeId: assigneeId as string,
    });

    res.status(200).json(
      new ApiResponse(200, stats, "Issue statistics retrieved successfully")
    );
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const start = Date.now();
    const reporterId = req.user!.id;

    const issue = await IssuesService.createIssue({
      reporterId,
      ...req.body,
    });

    const duration = Date.now() - start;
    res.setHeader('X-Create-Time', `${duration}ms`);

    res.status(201).json(
      new ApiResponse(201, issue, "Issue created successfully")
    );
  });

  static list = asyncHandler(async (req: Request, res: Response) => {
    // Query params are already validated and transformed by middleware
    // Ensure defaults are set if validation didn't populate them
    const query = req.query as any;
    const input = {
      ...query,
      page: Number(query.page) || 1,
      pageSize: Number(query.pageSize) || 20
    };
    
    const result = await IssuesService.listIssues(input);

    res.status(200).json(
      new ApiResponse(200, result, "Issues retrieved successfully")
    );
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const issueIdStr = Array.isArray(req.params.issueId) ? req.params.issueId[0] : req.params.issueId;
    const issue = await IssuesService.getIssueById(issueIdStr);

    res.status(200).json(
      new ApiResponse(200, issue, "Issue retrieved successfully")
    );
  });

  static uploadAfterMedia = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role as any; // Cast to handle role type
    const issueIdStr = Array.isArray(req.params.issueId) ? req.params.issueId[0] : req.params.issueId;

    const updated = await IssuesService.addAfterMediaIssue({
      issueId: issueIdStr,
      userId,
      userRole,
      media: req.body.media,
      markResolved: req.body.markResolved || false, // Ensure default false
    });

    res.status(200).json(
      new ApiResponse(200, updated, "After media uploaded successfully")
    );
  });

  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { status, comment } = req.body;
    const issueIdStr = Array.isArray(req.params.issueId) ? req.params.issueId[0] : req.params.issueId;

    const updated = await IssuesService.updateIssueStatus({
      issueId: issueIdStr,
      userId,
      newStatus: status,
      comment
    });

    res.status(200).json(
      new ApiResponse(200, updated, "Issue status updated successfully")
    );
  });

  static addComment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { comment } = req.body;
    const issueIdStr = Array.isArray(req.params.issueId) ? req.params.issueId[0] : req.params.issueId;

    const result = await IssuesService.addComment({
      issueId: issueIdStr,
      userId,
      comment
    });

    res.status(201).json(
      new ApiResponse(201, result, "Comment added successfully")
    );
  });

  static reassignIssue = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { assigneeId, reason } = req.body;
    const issueIdStr = Array.isArray(req.params.issueId) ? req.params.issueId[0] : req.params.issueId;

    const updated = await IssuesService.reassignIssue({
      issueId: issueIdStr,
      reassignedBy: userId,
      newAssigneeId: assigneeId,
      reason
    });

    res.status(200).json(
      new ApiResponse(200, updated, "Issue reassigned successfully")
    );
  });

  static verifyResolution = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { approved, comment } = req.body;
    const issueIdStr = Array.isArray(req.params.issueId) ? req.params.issueId[0] : req.params.issueId;

    const updated = await IssuesService.verifyResolution({
      issueId: issueIdStr,
      verifiedBy: userId,
      approved,
      comment
    });

    res.status(200).json(
      new ApiResponse(200, updated, approved ? "Issue verified successfully" : "Issue reopened for rework")
    );
  });

  static reopenIssue = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { comment } = req.body;
    const issueIdStr = Array.isArray(req.params.issueId) ? req.params.issueId[0] : req.params.issueId;

    const result = await IssuesService.reopenIssue({
      issueId: issueIdStr,
      reopenedBy: userId,
      comment
    });

    // Delete after images from Cloudinary (outside transaction)
    if (result.deletedImages && result.deletedImages.length > 0) {
      try {
        const imageUrls = result.deletedImages.map(img => img.url);
        await IssueUploadService.deleteMultipleImages(imageUrls);
        console.log(`✅ Deleted ${imageUrls.length} after images from Cloudinary`);
      } catch (error) {
        console.error('❌ Error deleting images from Cloudinary:', error);
      }
    }

    res.status(200).json(
      new ApiResponse(200, result.updated, "Issue reopened successfully")
    );
  });

  // Upload images for issue creation (BEFORE images)
  static uploadBeforeImages = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      throw new ApiError(400, "No files uploaded");
    }

    const uploadedImages = await IssueUploadService.uploadMultipleImages(files, "BEFORE");

    res.status(200).json(
      new ApiResponse(200, uploadedImages, `${uploadedImages.length} image(s) uploaded successfully`)
    );
  });

  // Upload images after issue resolution (AFTER images)
  static uploadAfterImages = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      throw new ApiError(400, "No files uploaded");
    }

    const uploadedImages = await IssueUploadService.uploadMultipleImages(files, "AFTER");

    res.status(200).json(
      new ApiResponse(200, uploadedImages, `${uploadedImages.length} after image(s) uploaded successfully`)
    );
  });

  // Delete an image from cloud storage
  static deleteImage = asyncHandler(async (req: Request, res: Response) => {
    const { publicId, url } = req.body;

    if (!publicId && !url) {
      throw new ApiError(400, "publicId or url is required");
    }

    await IssueUploadService.deleteImage(publicId || url);

    res.status(200).json(
      new ApiResponse(200, { deleted: true }, "Image deleted successfully")
    );
  });

    static analyzeImage = asyncHandler(async (req: Request, res: Response) => {
    const { imageUrl } = analyzeImageSchema.parse(req.body);
    const analysis = await IssueUploadService.analyzeImageWithAI(imageUrl);

    res.status(200).json(
      new ApiResponse(200, analysis, "Image analyzed successfully")
    );
  });
}