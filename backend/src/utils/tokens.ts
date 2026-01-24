import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { ApiError } from "./apiError";
import { randomUUID } from "crypto";

// Simple token generation with JTI
export const generateToken = (userId: string, role: string) => {
    const jti = randomUUID(); // Generate unique token ID
    return jwt.sign(
        { 
            id: userId,
            role: role,
            jti: jti
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );
};

// Generate token with user data
export const generateTokenWithUser = async (userId: string) => {
    try {
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
                }
            }
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const token = generateToken(user.id, user.role);

        return { 
            token, 
            user
        };

    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
};

// Verify token (utility function)
export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: string;
            role: string;
            jti: string;
        };
    } catch (error) {
        throw new ApiError(401, "Invalid token");
    }
};

// Decode token without verification (for expired token info)
export const decodeToken = (token: string) => {
    return jwt.decode(token) as { id: string; role: string; jti: string } | null;
};