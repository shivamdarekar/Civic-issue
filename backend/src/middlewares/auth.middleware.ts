import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";

// Global augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        wardId?: string | null;
        zoneId?: string | null;
      };
    }
  }
}

export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized: Token not provided");
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { 
          id: true, 
          email: true, 
          role: true,
          wardId: true,
          zoneId: true
        },
      });

      if (!user) {
        throw new ApiError(404, "Unauthorized: User not found");
      }

      req.user = user;
      next();
      
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, "TOKEN_EXPIRED");
      }
      throw new ApiError(401, "Unauthorized: Invalid token");
    }
  }
);



// Ward-specific access control
export const requireWardAccess = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const { wardId } = req.params;
    
    // Super admin can access all wards
    if (req.user.role === "SUPER_ADMIN") {
      return next();
    }

    // Zone officers can access wards in their zone
    if (req.user.role === "ZONE_OFFICER" && req.user.zoneId) {
      const ward = await prisma.ward.findUnique({
        where: { id: wardId },
        select: { zoneId: true }
      });
      
      if (ward?.zoneId === req.user.zoneId) {
        return next();
      }
    }

    // Ward engineers can only access their ward
    if (req.user.role === "WARD_ENGINEER" && req.user.wardId === wardId) {
      return next();
    }

    throw new ApiError(403, "Access denied to this ward");
  }
);