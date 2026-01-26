import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/apiError";
import { generateTokenWithUser } from "../../utils/tokens";
import { comparePassword, hashPassword } from "./auth.utils";
import { LoginData, AuthResponse, ForgotPasswordResponse, VerifyOtpResponse, ResetPasswordResponse, LogoutResponse } from "../../types";
import { EmailService } from "../../services/email/emailService";
import { redis, connectRedis, setSession, getSession, delSession, blacklist, isBlacklisted } from "../../lib/redis";
import { cache } from "../../lib/cache";
import jwt from "jsonwebtoken";

export class AuthService {
  // Login functionality with Redis session and database retry
  static async login(loginData: LoginData): Promise<AuthResponse> {
    const { email, password } = loginData;

    // Optimized user query with retry logic
    const user = await this.retryDatabaseOperation(async () => {
      return prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          fullName: true,
          email: true,
          hashedPassword: true,
          role: true,
          department: true,
          isActive: true,
          wardId: true,
          zoneId: true
        }
      });
    });

    if (!user || !user.isActive) {
      throw new ApiError(401, user ? "Account is deactivated" : "Invalid credentials");
    }

    // Verify password using utility
    const isPasswordValid = await comparePassword(password, user.hashedPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Generate token with JTI
    const { token, user: userInfo } = await generateTokenWithUser(user.id);
    
    // Extract JTI from token
    const decoded = jwt.decode(token) as any;
    const jti = decoded.jti;

    // Safe parallel operations - no data dependencies
    const sessionData = {
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.fullName,
      wardId: user.wardId || undefined,
      zoneId: user.zoneId || undefined,
      departmentId: user.department || undefined,
      lastActivity: Date.now(),
    };
    
    // These operations are independent - safe to run in parallel
    await Promise.allSettled([
      setSession(jti, sessionData, 1800), // Redis operation
      this.retryDatabaseOperation(async () => {
        return prisma.auditLog.create({              // Database operation
          data: {
            userId: user.id,
            action: "LOGIN",
            metadata: { loginTime: new Date(), sessionId: jti }
          }
        });
      })
    ]);

    return { token, user: userInfo };
  }

  // Database retry helper
  private static async retryDatabaseOperation<T>(operation: () => Promise<T>, maxRetries = 2): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        if (attempt === maxRetries || !error.message?.includes('timeout')) {
          throw error;
        }
        console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    }
    throw new Error('Max retries exceeded');
  }

  // Forgot password - send OTP with proper sequencing
  static async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    // Find user by email with minimal fields
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, fullName: true, email: true, role: true }
    });

    if (!user) {
      // Don't reveal if email exists - security best practice
      return { message: "If email exists, OTP has been sent" };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Sequential operations to avoid race condition
    // First invalidate existing OTPs
    await prisma.passwordReset.updateMany({
      where: { userId: user.id, isUsed: false },
      data: { isUsed: true }
    });

    // Then create new OTP and log in parallel (safe operations)
    await Promise.all([
      prisma.passwordReset.create({
        data: {
          userId: user.id,
          otp,
          expiresAt
        }
      }),
      prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "PASSWORD_RESET_OTP_REQUEST",
          metadata: { requestTime: new Date() }
        }
      })
    ]);

    // Send OTP email (non-blocking)
    EmailService.sendPasswordResetOTP(user.email, user.fullName, otp)
      .catch(emailError => {
        console.error('Failed to send OTP email:', emailError);
      });

    return {
      message: "If email exists, OTP has been sent",
      // For development only - remove in production
      ...(process.env.NODE_ENV === 'development' && { otp })
    };
  }

  // Verify OTP
  static async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, fullName: true }
    });

    if (!user) {
      throw new ApiError(400, "Invalid email or OTP");
    }

    // Find the most recent unused OTP for this user
    const otpRecord = await prisma.passwordReset.findFirst({
      where: {
        userId: user.id,
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      throw new ApiError(400, "No valid OTP found. Please request a new one");
    }

    // Check attempts limit (max 3 attempts)
    if (otpRecord.attempts >= 3) {
      await prisma.passwordReset.update({
        where: { id: otpRecord.id },
        data: { isUsed: true }
      });
      throw new ApiError(400, "Too many failed attempts. Please request a new OTP");
    }

    // Verify OTP matches
    if (otpRecord.otp !== otp) {
      // Increment attempts for failed verification
      await prisma.passwordReset.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } }
      });

      const remainingAttempts = 3 - (otpRecord.attempts + 1);
      throw new ApiError(400, `Invalid OTP. ${remainingAttempts} attempt(s) remaining`);
    }

    // Log OTP verification
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_OTP_VERIFIED",
        metadata: { verifyTime: new Date() }
      }
    });

    return {
      message: "OTP verified successfully",
      verified: true
    };
  }

  // Reset password with OTP - optimized transaction
  static async resetPassword(email: string, otp: string, newPassword: string): Promise<ResetPasswordResponse> {
    // Single transaction for all operations
    const result = await prisma.$transaction(async (tx) => {
      // Find user by email
      const user = await tx.user.findUnique({
        where: { email },
        select: { id: true, email: true, fullName: true }
      });

      if (!user) {
        throw new ApiError(400, "Invalid email or OTP");
      }

      // Find valid OTP
      const otpRecord = await tx.passwordReset.findFirst({
        where: {
          userId: user.id,
          otp,
          isUsed: false,
          expiresAt: { gt: new Date() }
        }
      });

      if (!otpRecord) {
        throw new ApiError(400, "Invalid or expired OTP");
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user password and mark OTP as used in parallel
      await Promise.all([
        tx.user.update({
          where: { id: user.id },
          data: { hashedPassword }
        }),
        tx.passwordReset.update({
          where: { id: otpRecord.id },
          data: { isUsed: true }
        }),
        tx.auditLog.create({
          data: {
            userId: user.id,
            action: "PASSWORD_RESET_COMPLETE",
            metadata: { resetTime: new Date() }
          }
        })
      ]);

      return user;
    });

    // Invalidate user cache after password reset
    await cache.invalidateUserCache(result.id);

    return { message: "Password reset successfully" };
  }

  // Logout functionality with Redis cleanup - safe parallel operations
  static async logout(userId: string, sessionId?: string): Promise<LogoutResponse> {
    // If sessionId provided, cleanup session and cache
    if (sessionId) {
      // These operations are independent - safe to run in parallel
      await Promise.all([
        blacklist(sessionId, 1800),        // Redis blacklist
        delSession(sessionId),             // Redis session delete
        cache.invalidateUserCache(userId)  // Cache invalidation
      ]);
    }

    // Log logout (separate operation)
    await prisma.auditLog.create({
      data: {
        userId,
        action: "LOGOUT",
        metadata: { logoutTime: new Date(), sessionId }
      }
    });

    return { success: true };
  }

  // Get user profile with enhanced caching
  static async getProfile(userId: string) {
    return cache.getOrSet(
      { ttl: 1800, prefix: 'user:profile' }, // 30 min cache
      userId,
      async () => {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
            department: true,
            isActive: true,
            wardId: true,
            zoneId: true,
            ward: {
              select: {
                id: true,
                wardNumber: true,
                name: true,
                zone: {
                  select: {
                    id: true,
                    name: true,
                    code: true
                  }
                }
              }
            },
            zone: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            gamification: {
              select: {
                points: true,
                badges: true
              }
            },
            createdAt: true
          }
        });

        if (!user) {
          throw new ApiError(404, "User not found");
        }

        return user;
      }
    );
  }
}