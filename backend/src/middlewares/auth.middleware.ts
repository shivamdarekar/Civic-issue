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

// JWT verification middleware
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
          zoneId: true,
          isActive: true
        },
      });

      if (!user || !user.isActive) {
        throw new ApiError(404, "Unauthorized: User not found or inactive");
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