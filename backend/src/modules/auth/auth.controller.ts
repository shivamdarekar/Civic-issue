import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { AuthService } from "./auth.service";

export class AuthController {
  // super Admin registers other users
  static registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { fullName, email, phoneNumber, password, role, wardId, zoneId } = req.body;
    
    const user = await AuthService.registerUser(
      { fullName, email, phoneNumber, password, role, wardId, zoneId },
      req.user!.id
    );

    res.status(201).json(
      new ApiResponse(201, user, "User registered successfully")
    );
  });


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


  // get all users (Super Admin only)
  static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await AuthService.getAllUsers();

    res.status(200).json(
      new ApiResponse(200, users, "Users retrieved successfully")
    );
  });


  // get zones and wards for registration form
  static getZonesAndWards = asyncHandler(async (req: Request, res: Response) => {
    const data = await AuthService.getZonesAndWards();

    res.status(200).json(
      new ApiResponse(200, data, "Zones and wards retrieved successfully")
    );
  });


  // logout
  static logout = asyncHandler(async (req: Request, res: Response) => {
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