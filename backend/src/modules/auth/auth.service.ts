import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/apiError";
import { generateTokenWithUser } from "../../utils/tokens";
import { comparePassword, hashPassword } from "./auth.utils";
import { LoginData } from "../../types";
import { EmailService } from "../../services/email/emailService";
import * as crypto from "crypto";

export class AuthService {
  // Login functionality
  static async login(loginData: LoginData) {
    const { email, password } = loginData;

    // Find user
    const user = await prisma.user.findUnique({
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

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (!user.isActive) {
      throw new ApiError(401, "Account is deactivated");
    }

    // Verify password using utility
    const isPasswordValid = await comparePassword(password, user.hashedPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Generate token
    const { token, user: userInfo } = await generateTokenWithUser(user.id);

    // Log login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        metadata: { loginTime: new Date() }
      }
    });

    return { token, user: userInfo };
  }

  // Forgot password - send OTP
  static async forgotPassword(email: string) {
    // Find user by email
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

    // Invalidate any existing OTPs for this user
    await prisma.passwordReset.updateMany({
      where: { userId: user.id, isUsed: false },
      data: { isUsed: true }
    });

    // Create new OTP record
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        otp,
        expiresAt
      }
    });

    // Log password reset request
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_OTP_REQUEST",
        metadata: { requestTime: new Date() }
      }
    });

    // Send OTP email
    try {
      await EmailService.sendPasswordResetOTP(user.email, user.fullName, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Continue execution - don't fail the request if email fails
    }

    return { 
      message: "If email exists, OTP has been sent",
      // For development only - remove in production
      ...(process.env.NODE_ENV === 'development' && { otp })
    };
  }

  // Verify OTP
  static async verifyOtp(email: string, otp: string) {
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

  // Reset password with OTP
  static async resetPassword(email: string, otp: string, newPassword: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, fullName: true }
    });

    if (!user) {
      throw new ApiError(400, "Invalid email or OTP");
    }

    // Find valid OTP
    const otpRecord = await prisma.passwordReset.findFirst({
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

    // Update user password and mark OTP as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { hashedPassword }
      }),
      prisma.passwordReset.update({
        where: { id: otpRecord.id },
        data: { isUsed: true }
      })
    ]);

    // Log password reset completion
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_COMPLETE",
        metadata: { resetTime: new Date() }
      }
    });

    return { message: "Password reset successfully" };
  }

  // Logout functionality
  static async logout(userId: string) {
    // Log logout
    await prisma.auditLog.create({
      data: {
        userId,
        action: "LOGOUT",
        metadata: { logoutTime: new Date() }
      }
    });

    return { success: true };
  }
}