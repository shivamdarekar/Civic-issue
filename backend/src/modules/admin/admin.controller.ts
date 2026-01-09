import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { AdminService } from "./admin.service";

export class AdminController {
  static getDashboard = asyncHandler(async (_req: Request, res: Response) => {
    const data = await AdminService.getDashboard();
    res.status(200).json(new ApiResponse(200, data, "Dashboard overview retrieved"));
  });

  static getZonesOverview = asyncHandler(async (_req: Request, res: Response) => {
    const data = await AdminService.getZonesOverview();
    res.status(200).json(new ApiResponse(200, data, "Zones overview retrieved"));
  });

  static getZoneDetail = asyncHandler(async (req: Request, res: Response) => {
    const { zoneId } = req.params;
    const data = await AdminService.getZoneDetail(zoneId);

    if (!data) {
      return res.status(404).json(new ApiResponse(404, null, "Zone not found"));
    }

    return res.status(200).json(new ApiResponse(200, data, "Zone detail retrieved"));
  });

  static getZoneWards = asyncHandler(async (req: Request, res: Response) => {
    const { zoneId } = req.params;
    const data = await AdminService.getZoneWards(zoneId);
    return res.status(200).json(new ApiResponse(200, data, "Zone wards overview retrieved"));
  });

  static getWardDetail = asyncHandler(async (req: Request, res: Response) => {
    const { wardId } = req.params;
    const data = await AdminService.getWardDetail(wardId);

    if (!data) {
      return res.status(404).json(new ApiResponse(404, null, "Ward not found"));
    }

    return res.status(200).json(new ApiResponse(200, data, "Ward detail retrieved"));
  }); 
  
 static getWardIssues = asyncHandler(async (req: Request, res: Response) => {
    const { wardId } = req.params;

    // Parse and validate query filters
    const statusQ = req.query.status as string | undefined;
    const priorityQ = req.query.priority as string | undefined;
    const categoryIdQ = req.query.categoryId as string | undefined;

    const allowedStatus = new Set([
      "OPEN",
      "ASSIGNED",
      "IN_PROGRESS",
      "RESOLVED",
      "VERIFIED",
      "REOPENED",
      "REJECTED",
    ]);
    const allowedPriority = new Set(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

    const filters = {
      status: statusQ && allowedStatus.has(statusQ) ? (statusQ as any) : undefined,
      priority:
        priorityQ && allowedPriority.has(priorityQ) ? (priorityQ as any) : undefined,
      categoryId: categoryIdQ || undefined,
    };

    const data = await AdminService.getWardIssues(wardId, filters);
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Ward issues retrieved"));
  });  
}