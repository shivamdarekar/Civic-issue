import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { AdminService } from "./admin.service";

export class AdminController {
  // User Management Functions
  static registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { fullName, email, phoneNumber, password, role, wardId, zoneId, department } = req.body;

    const user = await AdminService.registerUser(
      { fullName, email, phoneNumber, password, role, wardId, zoneId, department },
      req.user!.id
    );

    res.status(201).json(
      new ApiResponse(201, user, "User registered successfully")
    );
  });


  static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await AdminService.getAllUsers();

    res.status(200).json(
      new ApiResponse(200, users, "Users retrieved successfully")
    );
  });


  static getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await AdminService.getUserById(userId);

    res.status(200).json(
      new ApiResponse(200, user, "User retrieved successfully")
    );
  });


  static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const updateData = req.body;

    const user = await AdminService.updateUser(userId, updateData, req.user!.id);

    res.status(200).json(
      new ApiResponse(200, user, "User updated successfully")
    );
  });


  static reassignUserWork = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { toUserId } = req.body;

    const result = await AdminService.reassignUserWork(userId, toUserId, req.user!.id);

    res.status(200).json(
      new ApiResponse(200, result, "Work reassigned successfully")
    );
  });


  static deactivateUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const user = await AdminService.deactivateUser(userId, req.user!.id);

    res.status(200).json(
      new ApiResponse(200, user, "User deactivated successfully")
    );
  });


  static reactivateUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const user = await AdminService.reactivateUser(userId, req.user!.id);

    res.status(200).json(
      new ApiResponse(200, user, "User reactivated successfully")
    );
  });


  static getUserStatistics = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const statistics = await AdminService.getUserStatistics(userId);

    res.status(200).json(
      new ApiResponse(200, statistics, "User statistics retrieved successfully")
    );
  });


  static getUsersByFilter = asyncHandler(async (req: Request, res: Response) => {
    const { role, wardId, zoneId, isActive, department } = req.query;

    const users = await AdminService.getUsersByFilter({
      role: role as string,
      wardId: wardId as string,
      zoneId: zoneId as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      department: department as string
    });

    res.status(200).json(
      new ApiResponse(200, users, "Filtered users retrieved successfully")
    );
  });


  static getDepartments = asyncHandler(async (req: Request, res: Response) => {
    const data = await AdminService.getDepartments();

    res.status(200).json(
      new ApiResponse(200, data, "Departments retrieved successfully")
    );
  });


  // Dashboard Functions
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