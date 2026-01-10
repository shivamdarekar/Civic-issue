import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { AuthService } from "./auth.service";

export class AuthController {
  // login
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    const result = await AuthService.login({ email, password });

    // Set token in cookie (optional - for dual storage strategy)
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json(
      new ApiResponse(200, result, "Login successful")
    );
  });

  // Forgot password
  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    
    const result = await AuthService.forgotPassword(email);

    res.status(200).json(
      new ApiResponse(200, result, "OTP sent successfully")
    );
  });

  // Verify OTP
  static verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    
    const result = await AuthService.verifyOtp(email, otp);

    res.status(200).json(
      new ApiResponse(200, result, "OTP verified successfully")
    );
  });

  // Reset password
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    
    const result = await AuthService.resetPassword(email, otp, newPassword);

    res.status(200).json(
      new ApiResponse(200, result, "Password reset successful")
    );
  });

  // logout
  static logout = asyncHandler(async (req: Request, res: Response) => {
    await AuthService.logout(req.user!.id);
    res.clearCookie("token");
    
    res.status(200).json(
      new ApiResponse(200, null, "Logout successful")
    );
  });

  // get current user profile
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    
    res.status(200).json(
      new ApiResponse(200, user, "Profile retrieved successfully")
    );
  });
}