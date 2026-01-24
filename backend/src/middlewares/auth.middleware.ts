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

// JWT verification middleware with Redis session
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

      // Check if token is blacklisted
      const blacklisted = await isBlacklisted(decoded.jti);
      if (blacklisted) {
        throw new ApiError(401, "Unauthorized: Token has been revoked");
      }

      // Get session from Redis first
      let sessionData = await getSession(decoded.jti);
      
      if (!sessionData) {
        // Fallback to database if session not in Redis
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

        // Recreate session in Redis
        sessionData = {
          userId: user.id,
          role: user.role,
          email: user.email,
          name: user.fullName,
          wardId: user.wardId || undefined,
          zoneId: user.zoneId || undefined,
          departmentId: user.department || undefined,
          lastActivity: Date.now(),
        };
        
        await setSession(decoded.jti, sessionData, 1800);
      }

      req.user = {
        id: sessionData.userId,
        email: sessionData.email,
        role: sessionData.role,
        wardId: sessionData.wardId || null,
        zoneId: sessionData.zoneId || null,
        department: sessionData.departmentId || null,
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