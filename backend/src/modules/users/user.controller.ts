import type { Request, Response } from "express";
import { Department } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
import { UserDashboardService } from "./user.service";

function parseLimit(req: Request): number {
  const raw = req.query.limit;
  if (raw === undefined) return 10;

  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1 || n > 50) {
    throw new ApiError(400, "limit must be a number between 1 and 50");
  }
  return n;
}

export class UserDashboardController {
  static fieldWorker = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const limit = parseLimit(req);

    const data = await UserDashboardService.getFieldWorkerDashboard(userId, limit);
    return res.status(200).json(new ApiResponse(200, data, "Field worker dashboard retrieved"));
  });

  static wardEngineer = asyncHandler(async (req: Request, res: Response) => {
    const { wardId, department } = req.user!;

    UserDashboardService.assertWardEngineerScope(wardId, department);

    // Validate department is a real Prisma enum value
    if (!Object.values(Department).includes(department as Department)) {
      throw new ApiError(400, "Invalid department on user profile");
    }

    const data = await UserDashboardService.getWardEngineerDashboard({
      wardId: wardId as string,
      department: department as Department,
    });

    return res.status(200).json(new ApiResponse(200, data, "Ward engineer dashboard retrieved"));
  });

  static assigned = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const userDepartment = req.user!.department as Department | null;
    const limit = parseLimit(req);

    const data = await UserDashboardService.getAssignedIssuesDashboard(userId, userDepartment, limit);
    return res.status(200).json(new ApiResponse(200, data, "Assigned issues dashboard retrieved"));
  });

  // Update own profile
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { fullName, phoneNumber } = req.body;

    const updatedUser = await UserDashboardService.updateOwnProfile(userId, { fullName, phoneNumber });
    return res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
  });

  // Change own password
  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    const result = await UserDashboardService.changeOwnPassword(userId, currentPassword, newPassword);
    return res.status(200).json(new ApiResponse(200, result, "Password changed successfully"));
  });

  // Get own activity log
  static getActivityLog = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const limit = parseLimit(req);

    const activities = await UserDashboardService.getUserActivityLog(userId, limit);
    return res.status(200).json(new ApiResponse(200, activities, "Activity log retrieved successfully"));
  });
}