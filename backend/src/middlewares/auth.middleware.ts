import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { redis, connectRedis, getSession, isBlacklisted, setSession } from "../lib/redis";
import { cache } from "../lib/cache";

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
        department?: string | null;
      };
      sessionId?: string;
    }
  }
}

// JWT verification middleware with optimized caching
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
      ) as JwtPayload & { jti: string };

      // Check blacklist and session in parallel
      const [blacklisted, sessionData] = await Promise.all([
        isBlacklisted(decoded.jti),
        getSession(decoded.jti)
      ]);
      
      if (blacklisted) {
        throw new ApiError(401, "Unauthorized: Token has been revoked");
      }

      let userData = sessionData;
      
      if (!userData) {
        // Database lookup only if no session exists
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { 
            id: true, 
            email: true, 
            role: true,
            wardId: true,
            zoneId: true,
            isActive: true,
            department: true,
            fullName: true,
          },
        });

        if (!user || !user.isActive) {
          throw new ApiError(404, "Unauthorized: User not found or inactive");
        }

        userData = {
          userId: user.id,
          role: user.role,
          email: user.email,
          name: user.fullName,
          wardId: user.wardId || undefined,
          zoneId: user.zoneId || undefined,
          departmentId: user.department || undefined,
          lastActivity: Date.now(),
        };
        
        // Set session in Redis (fire and forget) - SINGLE SAVE
        setSession(decoded.jti, userData, 1800).catch(console.error);
      }

      req.user = {
        id: userData.userId,
        email: userData.email,
        role: userData.role,
        wardId: userData.wardId || null,
        zoneId: userData.zoneId || null,
        department: userData.departmentId || null,
      };
      req.sessionId = decoded.jti;
      
      next();
      
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, "TOKEN_EXPIRED");
      }
      if (err instanceof ApiError) throw err;
      throw new ApiError(401, "Unauthorized: Invalid token");
    }
  }
);