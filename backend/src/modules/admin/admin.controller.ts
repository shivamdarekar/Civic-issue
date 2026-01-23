import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { AdminService } from "./admin.service";
import { serializeBigInt } from "../../utils/bigint-serializer";
import { prisma } from "../../lib/prisma";

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
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;
    const user = await AdminService.getUserById(userIdStr);

    res.status(200).json(
      new ApiResponse(200, user, "User retrieved successfully")
    );
  });


  static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;
    const updateData = req.body;

    const user = await AdminService.updateUser(userIdStr, updateData, req.user!.id);

    res.status(200).json(
      new ApiResponse(200, user, "User updated successfully")
    );
  });


  static reassignUserWork = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;
    const { toUserId } = req.body;

    const result = await AdminService.reassignUserWork(userIdStr, toUserId, req.user!.id);

    res.status(200).json(
      new ApiResponse(200, result, "Work reassigned successfully")
    );
  });


  static deactivateUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;

    const user = await AdminService.deactivateUser(userIdStr, req.user!.id);

    res.status(200).json(
      new ApiResponse(200, user, "User deactivated successfully")
    );
  });


  static reactivateUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;

    const user = await AdminService.reactivateUser(userIdStr, req.user!.id);

    res.status(200).json(
      new ApiResponse(200, user, "User reactivated successfully")
    );
  });


  static getUserStatistics = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;

    const statistics = await AdminService.getUserStatistics(userIdStr);
    const serializedStatistics = serializeBigInt(statistics);

    res.status(200).json(
      new ApiResponse(200, serializedStatistics, "User statistics retrieved successfully")
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
    const serializedData = serializeBigInt(data);
    res.status(200).json(new ApiResponse(200, serializedData, "Dashboard overview retrieved"));
  });


  static getZonesOverview = asyncHandler(async (_req: Request, res: Response) => {
    const data = await AdminService.getZonesOverview();
    const serializedData = serializeBigInt(data);
    res.status(200).json(new ApiResponse(200, serializedData, "Zones overview retrieved"));
  });


  static getZoneDetail = asyncHandler(async (req: Request, res: Response) => {
    const { zoneId } = req.params;
    const zoneIdStr = Array.isArray(zoneId) ? zoneId[0] : zoneId;
    
    // Access control: Zone officers can only access their own zone
    if (req.user!.role === "ZONE_OFFICER" && req.user!.zoneId !== zoneIdStr) {
      return res.status(403).json(new ApiResponse(403, null, "Access denied to this zone"));
    }
    
    const data = await AdminService.getZoneDetail(zoneIdStr);

    if (!data) {
      return res.status(404).json(new ApiResponse(404, null, "Zone not found"));
    }

    const serializedData = serializeBigInt(data);
    return res.status(200).json(new ApiResponse(200, serializedData, "Zone detail retrieved"));
  });


  static getZoneWards = asyncHandler(async (req: Request, res: Response) => {
    const { zoneId } = req.params;
    const zoneIdStr = Array.isArray(zoneId) ? zoneId[0] : zoneId;
    
    // Access control: Zone officers can only access their own zone
    if (req.user!.role === "ZONE_OFFICER" && req.user!.zoneId !== zoneIdStr) {
      return res.status(403).json(new ApiResponse(403, null, "Access denied to this zone"));
    }
    
    const data = await AdminService.getZoneWards(zoneIdStr);
    const serializedData = serializeBigInt(data);
    return res.status(200).json(new ApiResponse(200, serializedData, "Zone wards overview retrieved"));
  });


  static getWardDetail = asyncHandler(async (req: Request, res: Response) => {
    const { wardId } = req.params;
    const wardIdStr = Array.isArray(wardId) ? wardId[0] : wardId;
    
    // Access control: Zone officers can only access wards in their zone, Ward engineers can only access their ward
    if (req.user!.role === "ZONE_OFFICER") {
      // Check if ward belongs to zone officer's zone
      const ward = await prisma.ward.findUnique({
        where: { id: wardIdStr },
        select: { zoneId: true }
      });
      if (!ward || ward.zoneId !== req.user!.zoneId) {
        return res.status(403).json(new ApiResponse(403, null, "Access denied to this ward"));
      }
    } else if (req.user!.role === "WARD_ENGINEER") {
      if (req.user!.wardId !== wardIdStr) {
        return res.status(403).json(new ApiResponse(403, null, "Access denied to this ward"));
      }
    }
    
    const data = await AdminService.getWardDetail(wardIdStr);

    if (!data) {
      return res.status(404).json(new ApiResponse(404, null, "Ward not found"));
    }

    const serializedData = serializeBigInt(data);
    return res.status(200).json(new ApiResponse(200, serializedData, "Ward detail retrieved"));
  });


  static getWardIssues = asyncHandler(async (req: Request, res: Response) => {
    const { wardId } = req.params;
    const wardIdStr = Array.isArray(wardId) ? wardId[0] : wardId;
    
    // Access control: Zone officers can only access wards in their zone, Ward engineers can only access their ward
    if (req.user!.role === "ZONE_OFFICER") {
      // Check if ward belongs to zone officer's zone
      const ward = await prisma.ward.findUnique({
        where: { id: wardIdStr },
        select: { zoneId: true }
      });
      if (!ward || ward.zoneId !== req.user!.zoneId) {
        return res.status(403).json(new ApiResponse(403, null, "Access denied to this ward"));
      }
    } else if (req.user!.role === "WARD_ENGINEER") {
      if (req.user!.wardId !== wardIdStr) {
        return res.status(403).json(new ApiResponse(403, null, "Access denied to this ward"));
      }
    }

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

    const data = await AdminService.getWardIssues(wardIdStr, filters);
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Ward issues retrieved"));
  });
}