import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/apiError";
import { generateTokenWithUser } from "../../utils/tokens";
import { hashPassword, comparePassword } from "./auth.utils";
import { RegisterUserData, LoginData } from "../../types";

export class AuthService {
  // Super Admin registers other users
  static async registerUser(userData: RegisterUserData, registeredBy: string) {
    const { fullName, email, phoneNumber, password, role, wardId, zoneId } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }]
      }
    });

    if (existingUser) {
      throw new ApiError(400, "User with this email or phone already exists");
    }

    // Validate ward/zone existence
    if (wardId) {
      const ward = await prisma.ward.findUnique({ where: { id: wardId } });
      if (!ward) {
        throw new ApiError(400, "Invalid ward ID");
      }
    }

    if (zoneId) {
      const zone = await prisma.zone.findUnique({ where: { id: zoneId } });
      if (!zone) {
        throw new ApiError(400, "Invalid zone ID");
      }
    }

    // Hash password using utility
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phoneNumber,
        hashedPassword,
        role,
        wardId: wardId || null,
        zoneId: zoneId || null
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        wardId: true,
        zoneId: true,
        ward: {
          select: { wardNumber: true, name: true }
        },
        zone: {
          select: { name: true }
        }
      }
    });

    // Log the registration
    await prisma.auditLog.create({
      data: {
        userId: registeredBy,
        action: "USER_REGISTRATION",
        resource: "User",
        resourceId: user.id,
        metadata: {
          registeredUser: {
            email: user.email,
            role: user.role
          }
        }
      }
    });

    return user;
  }

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

  // Get all users (for Super Admin)
  static async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        isActive: true,
        wardId: true,
        zoneId: true,
        ward: {
          select: { wardNumber: true, name: true }
        },
        zone: {
          select: { name: true }
        },
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get zones and wards for dropdowns
  static async getZonesAndWards() {
    return await prisma.zone.findMany({
      select: {
        id: true,
        name: true,
        wards: {
          select: {
            id: true,
            wardNumber: true,
            name: true
          }
        }
      }
    });
  }
}