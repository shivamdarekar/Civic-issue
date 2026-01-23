import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { prisma } from "../lib/prisma";

// Role-based access control
export const requireRole = (allowedRoles: string[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Insufficient permissions");
    }

    next();
  });
};

// Ward-specific access control
export const requireWardAccess = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const { wardId } = req.params;
    const wardIdStr = Array.isArray(wardId) ? wardId[0] : wardId;
    
    // Super admin can access all wards
    if (req.user.role === "SUPER_ADMIN") {
      return next();
    }

    // Zone officers can access wards in their zone
    if (req.user.role === "ZONE_OFFICER" && req.user.zoneId) {
      const ward = await prisma.ward.findUnique({
        where: { id: wardIdStr },
        select: { zoneId: true }
      });
      
      if (ward?.zoneId === req.user.zoneId) {
        return next();
      }
    }

    // Ward engineers can only access their ward
    if (req.user.role === "WARD_ENGINEER" && req.user.wardId === wardIdStr) {
      return next();
    }

    throw new ApiError(403, "Access denied to this ward");
  }
);