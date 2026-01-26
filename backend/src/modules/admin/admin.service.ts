import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { ApiError } from "../../utils/apiError";
import { hashPassword } from "../auth/auth.utils";
import { EmailService } from "../../services/email/emailService";
import { cache } from "../../lib/cache";
import {
  RegisterUserData,
  DashboardPayload,
  ZoneOverview,
  ZoneDetail,
  WardOverview,
  WardDetailPayload,
  UserUpdateData,
  UserStatistics,
  ReassignWorkResponse,
  UserFilterParams,
  FilteredUser,
  UserStatusChange,
  PaginatedUsersResponse
} from "../../types";

export class AdminService {
  // Admin registers other users with optimized operations
  static async registerUser(userData: RegisterUserData, registeredBy: string) {
    const { fullName, email, phoneNumber, password, role, wardId, zoneId, department } = userData;

    // Single transaction for all validation and creation
    const user = await prisma.$transaction(async (tx) => {
      // Parallel validation checks
      const [existingUser, ward, zone] = await Promise.all([
        tx.user.findFirst({
          where: {
            OR: [{ email }, { phoneNumber }]
          },
          select: { id: true }
        }),
        wardId ? tx.ward.findUnique({ 
          where: { id: wardId },
          select: { id: true, zoneId: true }
        }) : Promise.resolve(null),
        zoneId ? tx.zone.findUnique({ 
          where: { id: zoneId },
          select: { id: true }
        }) : Promise.resolve(null)
      ]);

      if (existingUser) {
        throw new ApiError(400, "User with this email or phone already exists");
      }

      if (wardId && !ward) {
        throw new ApiError(400, "Invalid ward ID");
      }

      if (zoneId && !zone) {
        throw new ApiError(400, "Invalid zone ID");
      }

      // Validate department for engineers only
      if (role === 'WARD_ENGINEER' && !department) {
        throw new ApiError(400, "Department is required for Ward Engineers");
      }

      if (role !== 'WARD_ENGINEER' && department) {
        throw new ApiError(400, "Department can only be assigned to Ward Engineers");
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user first
      const newUser = await tx.user.create({
        data: {
          fullName,
          email,
          phoneNumber,
          hashedPassword,
          role,
          wardId: wardId || null,
          zoneId: zoneId || null,
          department: department || null
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          role: true,
          department: true,
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

      // Create audit log with actual user ID
      await tx.auditLog.create({
        data: {
          userId: registeredBy,
          action: "USER_REGISTRATION",
          resource: "User",
          resourceId: newUser.id,
          metadata: {
            registeredUser: {
              email,
              role,
              department
            }
          }
        }
      });

      return newUser;
    });

    // Parallel cache invalidation and email sending
    const [, emailResult] = await Promise.allSettled([
      Promise.all([
        cache.invalidateAdminCache(),
        wardId ? cache.invalidateRelatedCache('ward', wardId) : Promise.resolve(),
        zoneId ? cache.invalidateRelatedCache('zone', zoneId) : Promise.resolve(),
      ]),
      EmailService.sendWelcomeEmail(
        user.email,
        user.fullName,
        user.role,
        password
      )
    ]);

    // Log email result but don't fail the request
    if (emailResult.status === 'rejected') {
      console.error('Failed to send welcome email:', emailResult.reason);
    }

    return user;
  }


  // Get user by ID for editing
  static async getUserById(userId: string) {
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
          select: { wardNumber: true, name: true }
        },
        zone: {
          select: { name: true }
        },
        createdAt: true
      }
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }


  // Update user details with optimized operations
  static async updateUser(userId: string, updateData: UserUpdateData, updatedBy: string): Promise<any> {
    const { fullName, email, phoneNumber, role, wardId, zoneId, department } = updateData;

    // Single transaction for all operations
    const result = await prisma.$transaction(async (tx) => {
      // Get existing user
      const existingUser = await tx.user.findUnique({ 
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          wardId: true,
          zoneId: true,
          department: true
        }
      });
      
      if (!existingUser) {
        throw new ApiError(404, "User not found");
      }

      if (existingUser.role === 'SUPER_ADMIN') {
        throw new ApiError(403, "Cannot update Super Admin account");
      }

      // Parallel validation checks
      const validationPromises = [];
      
      // Check for email/phone conflicts
      if (email || phoneNumber) {
        validationPromises.push(
          tx.user.findFirst({
            where: {
              AND: [
                { id: { not: userId } },
                {
                  OR: [
                    email ? { email } : {},
                    phoneNumber ? { phoneNumber } : {}
                  ]
                }
              ]
            },
            select: { id: true }
          })
        );
      } else {
        validationPromises.push(Promise.resolve(null));
      }

      // Validate ward if provided
      if (wardId) {
        validationPromises.push(
          tx.ward.findUnique({
            where: { id: wardId },
            select: { id: true, zoneId: true }
          })
        );
      } else {
        validationPromises.push(Promise.resolve(null));
      }

      // Validate zone if provided
      if (zoneId) {
        validationPromises.push(
          tx.zone.findUnique({ 
            where: { id: zoneId },
            select: { id: true }
          })
        );
      } else {
        validationPromises.push(Promise.resolve(null));
      }

      const [conflictUser, ward, zone] = await Promise.all(validationPromises);

      if (conflictUser) {
        throw new ApiError(400, "Email or phone number already exists");
      }

      if (wardId && !ward) {
        throw new ApiError(400, "Invalid ward ID");
      }

      if (zoneId && !zone) {
        throw new ApiError(400, "Invalid zone ID");
      }

      // Validate ward belongs to zone
      if (wardId && zoneId && ward && 'zoneId' in ward && ward.zoneId !== zoneId) {
        throw new ApiError(400, "Ward does not belong to selected zone");
      }

      // Role-based validation
      const finalRole = role || existingUser.role;
      const finalWardId = wardId !== undefined ? wardId : existingUser.wardId;
      const finalZoneId = zoneId !== undefined ? zoneId : existingUser.zoneId;
      const finalDepartment = department !== undefined ? department : existingUser.department;

      if (finalRole === 'ZONE_OFFICER') {
        if (!finalZoneId) {
          throw new ApiError(400, "Zone Officer must have a zone");
        }
        if (finalWardId) {
          throw new ApiError(400, "Zone Officer cannot be assigned to a ward");
        }
      }

      if (finalRole === 'WARD_ENGINEER' || finalRole === 'FIELD_WORKER') {
        if (!finalZoneId || !finalWardId) {
          throw new ApiError(400, "Ward-based roles must have both zone and ward");
        }
      }

      if (finalRole === 'WARD_ENGINEER' && !finalDepartment) {
        throw new ApiError(400, "Department is required for Ward Engineers");
      }

      if (finalRole !== 'WARD_ENGINEER' && finalDepartment) {
        throw new ApiError(400, "Department can only be assigned to Ward Engineers");
      }

      const data: any = {
        ...(fullName && { fullName }),
        ...(email && { email }),
        ...(phoneNumber && { phoneNumber }),
        ...(role && { role }),
        ...(department !== undefined && { department: department === null ? null : department }),
        ...(zoneId !== undefined && {
          zone: zoneId === null ? { disconnect: true } : { connect: { id: zoneId } },
        }),
        ...(wardId !== undefined && {
          ward: wardId === null ? { disconnect: true } : { connect: { id: wardId } },
        }),
      };

      // Track assignment changes
      const assignmentChanged =
        (role && role !== existingUser.role) ||
        (wardId !== undefined && wardId !== existingUser.wardId) ||
        (zoneId !== undefined && zoneId !== existingUser.zoneId) ||
        (department !== undefined && department !== existingUser.department);

      // Update user and create audit log in parallel
      const [updatedUser] = await Promise.all([
        tx.user.update({
          where: { id: userId },
          data,
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
            department: true,
            wardId: true,
            zoneId: true,
            ward: {
              select: { wardNumber: true, name: true }
            },
            zone: {
              select: { name: true }
            }
          }
        }),
        tx.auditLog.create({
          data: {
            userId: updatedBy,
            action: assignmentChanged ? "USER_ASSIGNMENT_CHANGED" : "USER_UPDATE",
            resource: "User",
            resourceId: userId,
            metadata: {
              updatedFields: updateData as any,
              previousData: {
                fullName: existingUser.fullName,
                email: existingUser.email,
                role: existingUser.role,
                wardId: existingUser.wardId,
                zoneId: existingUser.zoneId,
                department: existingUser.department
              },
              assignmentHistory: assignmentChanged ? {
                changedAt: new Date().toISOString(),
                changedBy: updatedBy,
                changes: {
                  role: role !== existingUser.role ? { from: existingUser.role, to: role } : null,
                  ward: wardId !== existingUser.wardId ? { from: existingUser.wardId, to: wardId } : null,
                  zone: zoneId !== existingUser.zoneId ? { from: existingUser.zoneId, to: zoneId } : null,
                  department: department !== existingUser.department ? { from: existingUser.department, to: department } : null
                }
              } : null
            } as any
          }
        })
      ]);

      return { updatedUser, existingUser, finalWardId, finalZoneId };
    });

    // Parallel cache invalidation after successful transaction
    await Promise.all([
      cache.invalidateUserCache(userId),
      cache.invalidateAdminCache(),
      result.existingUser.wardId ? cache.invalidateRelatedCache('ward', result.existingUser.wardId) : Promise.resolve(),
      result.existingUser.zoneId ? cache.invalidateRelatedCache('zone', result.existingUser.zoneId) : Promise.resolve(),
      result.finalWardId && result.finalWardId !== result.existingUser.wardId ? cache.invalidateRelatedCache('ward', result.finalWardId) : Promise.resolve(),
      result.finalZoneId && result.finalZoneId !== result.existingUser.zoneId ? cache.invalidateRelatedCache('zone', result.finalZoneId) : Promise.resolve(),
    ]);

    return result.updatedUser;
  }


  // Reassign user's work to another user with cache invalidation
  static async reassignUserWork(fromUserId: string, toUserId: string, reassignedBy: string): Promise<ReassignWorkResponse> {
    // Validate both users exist
    const [fromUser, toUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: fromUserId },
        select: {
          id: true,
          fullName: true,
          role: true,
          wardId: true,
          zoneId: true,
          department: true,
          isActive: true
        }
      }),
      prisma.user.findUnique({
        where: { id: toUserId },
        select: {
          id: true,
          fullName: true,
          role: true,
          wardId: true,
          zoneId: true,
          department: true,
          isActive: true
        }
      })
    ]);

    if (!fromUser) {
      throw new ApiError(404, "Source user not found");
    }
    if (!toUser) {
      throw new ApiError(404, "Target user not found");
    }

    if (!toUser.isActive) {
      throw new ApiError(400, "Cannot reassign to inactive user");
    }

    // Ensure roles are compatible
    if (fromUser.role !== toUser.role) {
      throw new ApiError(400, `Cannot reassign work between different roles (${fromUser.role} → ${toUser.role})`);
    }

    // Validate ward/zone compatibility
    if (fromUser.role === 'WARD_ENGINEER' || fromUser.role === 'FIELD_WORKER') {
      if (fromUser.wardId !== toUser.wardId) {
        throw new ApiError(400, "Both users must be assigned to the same ward");
      }
    }

    if (fromUser.role === 'ZONE_OFFICER') {
      if (fromUser.zoneId !== toUser.zoneId) {
        throw new ApiError(400, "Both users must be assigned to the same zone");
      }
    }

    // Get list of issues to reassign
    const activeIssues = await prisma.issue.findMany({
      where: {
        assigneeId: fromUserId,
        status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
        deletedAt: null
      },
      select: {
        id: true,
        ticketNumber: true,
        status: true,
        priority: true
      }
    });

    if (activeIssues.length === 0) {
      throw new ApiError(400, "No active issues to reassign");
    }

    // Use transaction to reassign issues and create history entries
    await prisma.$transaction(async (tx) => {
      // Update all active issues
      await tx.issue.updateMany({
        where: {
          assigneeId: fromUserId,
          status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
          deletedAt: null
        },
        data: {
          assigneeId: toUserId,
          updatedAt: new Date()
        }
      });

      // Create history entries for each reassigned issue
      await tx.issueHistory.createMany({
        data: activeIssues.map(issue => ({
          issueId: issue.id,
          changedBy: reassignedBy,
          changeType: 'ASSIGNMENT',
          oldValue: { assigneeId: fromUserId, assigneeName: fromUser.fullName },
          newValue: { assigneeId: toUserId, assigneeName: toUser.fullName }
        }))
      });

      // Create reassignment audit log
      await tx.auditLog.create({
        data: {
          userId: reassignedBy,
          action: "WORK_REASSIGNMENT",
          resource: "User",
          resourceId: fromUserId,
          metadata: {
            fromUser: {
              id: fromUser.id,
              fullName: fromUser.fullName,
              role: fromUser.role,
              wardId: fromUser.wardId,
              zoneId: fromUser.zoneId
            },
            toUser: {
              id: toUser.id,
              fullName: toUser.fullName,
              role: toUser.role,
              wardId: toUser.wardId,
              zoneId: toUser.zoneId
            },
            reassignedIssues: activeIssues.length,
            issueTickets: activeIssues.map(i => i.ticketNumber)
          }
        }
      });
    });

    // Invalidate related caches
    await Promise.all([
      cache.invalidateUserCache(fromUserId),
      cache.invalidateUserCache(toUserId),
      cache.invalidateAdminCache(),
      cache.invalidateIssueCache(),
      fromUser.wardId ? cache.invalidateRelatedCache('ward', fromUser.wardId) : Promise.resolve(),
      fromUser.zoneId ? cache.invalidateRelatedCache('zone', fromUser.zoneId) : Promise.resolve(),
    ]);

    return {
      message: `Successfully reassigned ${activeIssues.length} active issue(s) from ${fromUser.fullName} to ${toUser.fullName}`,
      reassignedCount: activeIssues.length,
      fromUser: {
        id: fromUser.id,
        fullName: fromUser.fullName,
        role: fromUser.role
      },
      toUser: {
        id: toUser.id,
        fullName: toUser.fullName,
        role: toUser.role
      },
      issues: activeIssues.map(i => ({
        ticketNumber: i.ticketNumber,
        status: i.status,
        priority: i.priority
      }))
    };
  }


  // Deactivate user with optimized operations
  static async deactivateUser(userId: string, deactivatedBy: string, reassignToUserId?: string): Promise<UserStatusChange> {
    // Single transaction for all operations
    const result = await prisma.$transaction(async (tx) => {
      const [user, activeIssues] = await Promise.all([
        tx.user.findUnique({ 
          where: { id: userId },
          include: { ward: true, zone: true }
        }),
        tx.issue.findMany({
          where: {
            assigneeId: userId,
            status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] },
            deletedAt: null
          },
          select: { id: true, ticketNumber: true, status: true }
        })
      ]);
      
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      if (user.role === 'SUPER_ADMIN') {
        throw new ApiError(403, "Cannot deactivate Super Admin account");
      }

      if (!user.isActive) {
        throw new ApiError(400, "User is already deactivated");
      }

      // If there are active issues and no reassignment user provided, throw error
      if (activeIssues.length > 0 && !reassignToUserId) {
        throw new ApiError(400, `Cannot deactivate user with ${activeIssues.length} active issue(s). Please reassign them first.`);
      }

      let reassignToUser = null;
      if (activeIssues.length > 0 && reassignToUserId) {
        reassignToUser = await tx.user.findUnique({
          where: { id: reassignToUserId },
          select: { id: true, fullName: true, role: true, isActive: true }
        });

        if (!reassignToUser || !reassignToUser.isActive) {
          throw new ApiError(400, "Invalid reassignment target user");
        }

        // Reassign issues and create audit logs in parallel
        await Promise.all([
          tx.issue.updateMany({
            where: {
              assigneeId: userId,
              status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] },
              deletedAt: null
            },
            data: {
              assigneeId: reassignToUserId,
              assignedAt: new Date()
            }
          }),
          tx.auditLog.create({
            data: {
              userId: deactivatedBy,
              action: "ISSUE_REASSIGNMENT",
              resource: "Issue",
              resourceId: userId,
              metadata: {
                fromUser: { fullName: user.fullName, role: user.role },
                toUser: { fullName: reassignToUser.fullName, role: reassignToUser.role },
                issueCount: activeIssues.length,
                reason: "User deactivation"
              }
            }
          })
        ]);
      }

      // Deactivate user and create audit log in parallel
      const [deactivatedUser] = await Promise.all([
        tx.user.update({
          where: { id: userId },
          data: { isActive: false },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true
          }
        }),
        tx.auditLog.create({
          data: {
            userId: deactivatedBy,
            action: "USER_DEACTIVATION",
            resource: "User",
            resourceId: userId,
            metadata: {
              deactivatedUser: {
                fullName: user.fullName,
                email: user.email,
                role: user.role
              },
              reassignedIssues: activeIssues.length,
              reassignedTo: reassignToUserId ? reassignToUserId : null
            }
          }
        })
      ]);

      return { deactivatedUser, user, reassignToUserId, activeIssues };
    });

    // Parallel cache invalidation after successful transaction
    await Promise.all([
      cache.invalidateUserCache(userId),
      cache.invalidateAdminCache(),
      cache.invalidateIssueCache(),
      result.reassignToUserId ? cache.invalidateUserCache(result.reassignToUserId) : Promise.resolve(),
      result.user.wardId ? cache.invalidateRelatedCache('ward', result.user.wardId) : Promise.resolve(),
      result.user.zoneId ? cache.invalidateRelatedCache('zone', result.user.zoneId) : Promise.resolve(),
    ]);

    return result.deactivatedUser;
  }


  // Reactivate user with optimized operations
  static async reactivateUser(userId: string, reactivatedBy: string): Promise<UserStatusChange> {
    // Single transaction for validation and reactivation
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ 
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          isActive: true,
          wardId: true,
          zoneId: true
        }
      });
      
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      if (user.role === 'SUPER_ADMIN') {
        throw new ApiError(403, "Cannot reactivate Super Admin account");
      }

      if (user.isActive) {
        throw new ApiError(400, "User is already active");
      }

      // Reactivate user and create audit log in parallel
      const [reactivatedUser] = await Promise.all([
        tx.user.update({
          where: { id: userId },
          data: { isActive: true },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true
          }
        }),
        tx.auditLog.create({
          data: {
            userId: reactivatedBy,
            action: "USER_REACTIVATION",
            resource: "User",
            resourceId: userId,
            metadata: {
              reactivatedUser: {
                fullName: user.fullName,
                email: user.email,
                role: user.role
              }
            }
          }
        })
      ]);

      return { reactivatedUser, user };
    });

    // Parallel cache invalidation after successful transaction
    await Promise.all([
      cache.invalidateUserCache(userId),
      cache.invalidateAdminCache(),
      result.user.wardId ? cache.invalidateRelatedCache('ward', result.user.wardId) : Promise.resolve(),
      result.user.zoneId ? cache.invalidateRelatedCache('zone', result.user.zoneId) : Promise.resolve(),
    ]);

    return result.reactivatedUser;
  }


  // Get user work statistics with user-specific caching
  static async getUserStatistics(userId: string): Promise<UserStatistics> {
    return cache.getOrSet(
      { ttl: 900, prefix: 'admin:user:stats' },
      userId,
      async () => {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, fullName: true, role: true, isActive: true }
        });

        if (!user) {
          throw new ApiError(404, "User not found");
        }

        // Get issue statistics
        const [totalAssigned, activeIssues, resolvedIssues, avgResolutionDays] = await Promise.all([
          // Total ever assigned
          prisma.issue.count({
            where: { assigneeId: userId, deletedAt: null }
          }),
          // Currently active
          prisma.issue.count({
            where: {
              assigneeId: userId,
              status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
              deletedAt: null
            }
          }),
          // Resolved issues
          prisma.issue.count({
            where: {
              assigneeId: userId,
              status: { in: ['RESOLVED', 'VERIFIED'] },
              deletedAt: null
            }
          }),
          // Average resolution time (direct raw query - no unused aggregate)
          (async () => {
            const result = await prisma.$queryRaw<{ avg_days: number }[]>`
              SELECT 
                COALESCE(AVG(EXTRACT(EPOCH FROM ("resolved_at" - "assigned_at")) / 86400), 0)::numeric(10,2) as avg_days
              FROM "issues"
              WHERE "assignee_id" = ${userId}::uuid
                AND "resolved_at" IS NOT NULL
                AND "assigned_at" IS NOT NULL
                AND "deleted_at" IS NULL
            `;
            return Number(result[0]?.avg_days || 0);
          })()
        ]);

        return {
          user: {
            id: user.id,
            fullName: user.fullName,
            role: user.role,
            isActive: user.isActive
          },
          statistics: {
            totalAssigned,
            activeIssues,
            resolvedIssues,
            avgResolutionDays,
            resolutionRate: totalAssigned > 0 ? Math.round((resolvedIssues / totalAssigned) * 100) : 0
          }
        };
      }
    );
  }

  // Get filtered users with user-specific caching
  static async getUsersByFilter(filters: UserFilterParams): Promise<FilteredUser[]> {
    const cacheKey = `${JSON.stringify(filters)}:${filters.wardId || filters.zoneId || 'global'}`;
    
    return cache.getOrSet(
      { ttl: 1200, prefix: 'admin:users:filter' },
      cacheKey,
      async () => {
        const whereClause: any = {};

        if (filters.role) whereClause.role = filters.role;
        if (filters.wardId) whereClause.wardId = filters.wardId;
        if (filters.zoneId) whereClause.zoneId = filters.zoneId;
        if (filters.isActive !== undefined) whereClause.isActive = filters.isActive;
        if (filters.department) whereClause.department = filters.department;

        const users = await prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            department: true,
            isActive: true,
            wardId: true,
            zoneId: true,
            ward: {
              select: { wardNumber: true, name: true }
            },
            zone: {
              select: { name: true }
            }
          },
          orderBy: { fullName: 'asc' }
        });

        return users;
      }
    );
  }

  static async getAllUsers(
    page: number = 1, 
    limit: number = 18, 
    filters: { status?: string; role?: string } = {}
  ): Promise<PaginatedUsersResponse> {
    const cacheKey = `${JSON.stringify({ page, limit, filters })}:admin`;
    
    return cache.getOrSet(
      { ttl: 600, prefix: 'admin:users:all' },
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;
        
        // Build where clause based on filters
        const whereClause: any = {};
        
        if (filters.status && filters.status !== 'All') {
          whereClause.isActive = filters.status === 'Active';
        }
        
        if (filters.role && filters.role !== 'All') {
          whereClause.role = filters.role;
        }
        
        const [users, totalCount] = await Promise.all([
          prisma.user.findMany({
            where: whereClause,
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
                select: { wardNumber: true, name: true }
              },
              zone: {
                select: { name: true }
              },
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
          }),
          prisma.user.count({ where: whereClause })
        ]);

        return {
          users,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalUsers: totalCount,
            hasNextPage: page < Math.ceil(totalCount / limit),
            hasPreviousPage: page > 1,
            limit
          }
        };
      }
    );
  }


  // Get available roles
  static async getAvailableRoles() {
    const roles = await prisma.user.findMany({
      select: { role: true },
      distinct: ['role'],
      orderBy: { role: 'asc' }
    });
    
    return roles.map(r => r.role);
  }


  // Get available departments for Ward Engineers
  static async getDepartments() {
    return [
      { value: 'ROAD', label: 'Road Department' },
      { value: 'STORM_WATER_DRAINAGE', label: 'Storm Water Drainage' },
      { value: 'SEWAGE_DISPOSAL', label: 'Sewage Disposal' },
      { value: 'WATER_WORKS', label: 'Water Works' },
      { value: 'STREET_LIGHT', label: 'Street Light' },
      { value: 'BRIDGE_CELL', label: 'Bridge Cell' },
      { value: 'SOLID_WASTE_MANAGEMENT', label: 'Solid Waste Management' },
      { value: 'HEALTH', label: 'Health Department' },
      { value: 'TOWN_PLANNING', label: 'Town Planning' },
      { value: 'PARKS_GARDENS', label: 'Parks & Gardens' },
      { value: 'ENCROACHMENT', label: 'Encroachment' },
      { value: 'FIRE', label: 'Fire Department' },
      { value: 'ELECTRICAL', label: 'Electrical Department' }
    ];
  }


  // Fetch dashboard overview statistics with optimized caching
  static async getDashboard() {
    return cache.getOrSet(
      { ttl: 300, prefix: 'admin:dashboard' }, // Reduced TTL for real-time data
      'overview',
      async () => {
        const rows = await prisma.$queryRaw<DashboardPayload[]>`
          SELECT
            COALESCE(COUNT(*) FILTER (WHERE "deleted_at" IS NULL), 0) AS "totalIssues",
            COALESCE(COUNT(*) FILTER (WHERE "status" = 'OPEN' AND "deleted_at" IS NULL), 0) AS "open",
            COALESCE(COUNT(*) FILTER (WHERE "status" = 'IN_PROGRESS' AND "deleted_at" IS NULL), 0) AS "inProgress",
            COALESCE(COUNT(*) FILTER (
              WHERE "deleted_at" IS NULL
                AND "resolved_at" IS NULL
                AND "sla_target_at" < NOW()
            ), 0) AS "slaBreached",
            COALESCE(
              ROUND(
                AVG(
                  CASE
                    WHEN "sla_target_at" IS NOT NULL
                    THEN EXTRACT(EPOCH FROM ("sla_target_at" - "created_at")) / 3600
                    ELSE NULL
                  END
                )::numeric
              , 2)
            , 0) AS "avgSlaTimeHours",
            COALESCE(
              ROUND(
                100 * (COUNT(*) FILTER (WHERE "status" IN ('RESOLVED', 'VERIFIED') AND "deleted_at" IS NULL))::numeric
                / NULLIF(COUNT(*) FILTER (WHERE "deleted_at" IS NULL), 0)
              , 2)
            , 0) AS "resolutionRatePercent"
          FROM "issues";
        `;

        const r = rows[0] ?? {
          totalIssues: 0,
          open: 0,
          inProgress: 0,
          slaBreached: 0,
          avgSlaTimeHours: 0,
          resolutionRatePercent: 0,
        };

        return {
          totalIssues: r.totalIssues ?? 0,
          open: r.open ?? 0,
          inProgress: r.inProgress ?? 0,
          slaBreached: r.slaBreached ?? 0,
          avgSlaTimeHours: r.avgSlaTimeHours ?? 0,
          resolutionRatePercent: r.resolutionRatePercent ?? 0,
        };
      }
    );
  }

  static async getZonesOverview() {
    return cache.getOrSet(
      { ttl: 1200, prefix: 'admin:zones' },
      'overview',
      async () => {
        const rows = await prisma.$queryRaw<ZoneOverview[]>`
          SELECT
            z."id" AS "zoneId",
            z."name" AS "name",
            COALESCE(COUNT(i.*), 0) AS "totalIssues",
            COALESCE(COUNT(i.*) FILTER (WHERE i."status" = 'OPEN'), 0) AS "openIssues",
            CASE
              WHEN COALESCE(COUNT(i.*), 0) = 0 THEN 100
              ELSE ROUND(
                100.0
                * (COUNT(*) FILTER (
                    WHERE i."status" IN ('RESOLVED', 'VERIFIED')
                      AND i."sla_target_at" IS NOT NULL
                      AND i."resolved_at" IS NOT NULL
                      AND i."resolved_at" <= i."sla_target_at"
                  ))::numeric
                / NULLIF(COUNT(i.*), 0)
              )::int
            END AS "slaCompliance",
            (
              SELECT u."full_name"
              FROM "users" u
              WHERE u."zone_id" = z."id" AND u."role" = 'ZONE_OFFICER'
              ORDER BY u."id"
              LIMIT 1
            ) AS "zoneOfficer"
          FROM "zones" z
          LEFT JOIN "wards" w ON w."zone_id" = z."id"
          LEFT JOIN "issues" i ON i."ward_id" = w."id" AND i."deleted_at" IS NULL
          GROUP BY z."id", z."name"
          ORDER BY z."name" ASC;
        `;

        // Ensure strict types and null-safety
        return (rows ?? []).map(r => ({
          zoneId: String(r.zoneId),
          name: r.name ?? "",
          totalIssues: Number(r.totalIssues ?? 0),
          openIssues: Number(r.openIssues ?? 0),
          slaCompliance: Number(r.slaCompliance ?? 100),
          zoneOfficer: r.zoneOfficer ?? null,
        }));
      }
    );
  }

  static async getZoneDetail(zoneId: string): Promise<ZoneDetail | null> {
    return cache.getOrSet(
      { ttl: 1200, prefix: 'admin:zone:detail' },
      zoneId,
      async () => {
        const rows = await prisma.$queryRaw<ZoneDetail[]>`
          SELECT
            z."name" AS "zoneName",
            (
              SELECT u."full_name"
              FROM "users" u
              WHERE u."zone_id" = z."id" AND u."role" = 'ZONE_OFFICER'
              ORDER BY u."id"
              LIMIT 1
            ) AS "zoneOfficer",
            COALESCE(COUNT(DISTINCT w."id"), 0) AS "totalWards",
            COALESCE(COUNT(i.*), 0) AS "totalIssues",
            CASE
              WHEN COALESCE(COUNT(i.*), 0) = 0 THEN 100
              ELSE ROUND(
                100.0
                * (COUNT(*) FILTER (
                    WHERE i."resolved_at" IS NOT NULL
                      AND i."sla_target_at" IS NOT NULL
                      AND i."resolved_at" <= i."sla_target_at"
                  ))::numeric
                / NULLIF(COUNT(i.*), 0)
              )::int
            END AS "slaCompliance"
          FROM "zones" z
          LEFT JOIN "wards" w ON w."zone_id" = z."id"
          LEFT JOIN "issues" i ON i."ward_id" = w."id" AND i."deleted_at" IS NULL
          WHERE z."id" = ${zoneId}::uuid
          GROUP BY z."id", z."name";
        `;

        if (!rows || rows.length === 0) return null;

        const r = rows[0];
        return {
          zoneName: r.zoneName ?? "",
          zoneOfficer: r.zoneOfficer ?? null,
          totalWards: Number(r.totalWards ?? 0),
          totalIssues: Number(r.totalIssues ?? 0),
          slaCompliance: Number(r.slaCompliance ?? 100),
        };
      }
    );
  }


  static async getZoneWards(zoneId: string): Promise<WardOverview[]> {
    return cache.getOrSet(
      { ttl: 1200, prefix: 'admin:zone:wards' },
      zoneId,
      async () => {
        const rows = await prisma.$queryRaw<WardOverview[]>`
          SELECT
            w."id"                         AS "wardId",
            w."ward_number"                AS "wardNumber",
            w."name"                       AS "name",
            COALESCE(COUNT(i."id") FILTER (WHERE i."status" = 'OPEN'), 0)          AS "open",
            COALESCE(COUNT(i."id") FILTER (WHERE i."status" = 'IN_PROGRESS'), 0)   AS "inProgress",
            COALESCE(COUNT(i."id") FILTER (
              WHERE i."resolved_at" IS NULL
                AND i."sla_target_at" < NOW()
            ), 0) AS "slaBreached",
            COALESCE(COUNT(i."id"), 0)    AS "totalIssues",
            (
              SELECT u."full_name"
              FROM "users" u
              WHERE u."ward_id" = w."id" AND u."role" = 'WARD_ENGINEER'
              ORDER BY u."id"
              LIMIT 1
            ) AS "engineer"
          FROM "wards" w
          LEFT JOIN "issues" i
            ON i."ward_id" = w."id"
           AND i."deleted_at" IS NULL
          WHERE w."zone_id" = ${zoneId}::uuid
          GROUP BY w."id", w."ward_number", w."name"
          ORDER BY w."ward_number" ASC;
        `;

        return (rows ?? []).map(r => ({
          wardId: String(r.wardId),
          wardNumber: Number(r.wardNumber ?? 0),
          name: r.name ?? "",
          open: Number(r.open ?? 0),
          inProgress: Number(r.inProgress ?? 0),
          slaBreached: Number(r.slaBreached ?? 0),
          totalIssues: Number(r.totalIssues ?? 0),
          engineer: r.engineer ?? null,
        }));
      }
    );
  }

  static async getWardDetail(wardId: string): Promise<WardDetailPayload | null> {
    return cache.getOrSet(
      { ttl: 1200, prefix: 'admin:ward:detail' },
      wardId,
      async () => {
        const rows = await prisma.$queryRaw<any[]>`
          SELECT
            w."ward_number" AS "wardNumber",
            w."name"        AS "wardName",
            z."name"        AS "zoneName",

            -- Engineers (include department from users table)
            COALESCE(
              jsonb_agg(DISTINCT jsonb_build_object(
                'id', u."id",
                'fullName', u."full_name",
                'email', u."email",
                'phoneNumber', u."phone_number",
                'isActive', u."is_active",
                'department', u."department"
              )) FILTER (WHERE u."id" IS NOT NULL),
              '[]'::jsonb
            ) AS "engineers",

            -- Core issue stats
            COALESCE(COUNT(DISTINCT i."id"), 0) AS "totalIssues",
            COALESCE(COUNT(DISTINCT i."id") FILTER (WHERE i."status" = 'OPEN'), 0) AS "open",
            COALESCE(COUNT(DISTINCT i."id") FILTER (WHERE i."status" = 'ASSIGNED'), 0) AS "assigned",
            COALESCE(COUNT(DISTINCT i."id") FILTER (WHERE i."status" = 'IN_PROGRESS'), 0) AS "inProgress",
            COALESCE(COUNT(DISTINCT i."id") FILTER (WHERE i."status" = 'RESOLVED'), 0) AS "resolved",
            COALESCE(COUNT(DISTINCT i."id") FILTER (WHERE i."status" = 'VERIFIED'), 0) AS "verified",
            COALESCE(COUNT(DISTINCT i."id") FILTER (WHERE i."status" = 'REOPENED'), 0) AS "reopened",
            COALESCE(COUNT(DISTINCT i."id") FILTER (WHERE i."status" = 'REJECTED'), 0) AS "rejected",
            COALESCE(COUNT(DISTINCT i."id") FILTER (
              WHERE i."resolved_at" IS NULL
                AND i."sla_target_at" < NOW()
            ), 0) AS "slaBreached",

            CASE
              WHEN COALESCE(COUNT(DISTINCT i."id"), 0) = 0 THEN 100
              ELSE ROUND(
                100.0
                * (COUNT(DISTINCT i."id") FILTER (
                    WHERE i."resolved_at" IS NOT NULL
                      AND i."sla_target_at" IS NOT NULL
                      AND i."resolved_at" <= i."sla_target_at"
                  ))::numeric
                / NULLIF(COUNT(DISTINCT i."id"), 0)
              )::int
            END AS "slaCompliance",

            -- Priority distribution
            COALESCE(COUNT(DISTINCT i."id") FILTER (WHERE i."priority" = 'CRITICAL'), 0) AS "critical",
            COALESCE(COUNT(DISTINCT i."id") FILTER (WHERE i."priority" = 'HIGH'), 0) AS "high",
            COALESCE(COUNT(DISTINCT i."id") FILTER (WHERE i."priority" = 'MEDIUM'), 0) AS "medium",
            COALESCE(COUNT(DISTINCT i."id") FILTER (WHERE i."priority" = 'LOW'), 0) AS "low",

            -- Aging for active issues
            COALESCE(
              ROUND(
                (AVG(DISTINCT EXTRACT(EPOCH FROM (NOW() - i."created_at")) / 86400)
                  FILTER (WHERE i."status" IN ('OPEN','ASSIGNED','IN_PROGRESS'))
                )::numeric,
                2
              ),
              0
            ) AS "avgOpenDays",
            COALESCE(
              MAX(EXTRACT(EPOCH FROM (NOW() - i."created_at")) / 86400)
                FILTER (WHERE i."status" IN ('OPEN','ASSIGNED','IN_PROGRESS')),
              0
            ) AS "oldestOpenDays",

            -- Top issues list (remove this section to optimize response)
            '[]'::jsonb AS "issues"

          FROM "wards" w
          JOIN "zones" z ON z."id" = w."zone_id"
          LEFT JOIN "users" u
            ON u."ward_id" = w."id"
           AND u."role" = 'WARD_ENGINEER'
          LEFT JOIN "issues" i
            ON i."ward_id" = w."id"
           AND i."deleted_at" IS NULL
          WHERE w."id" = ${wardId}
          GROUP BY w."id", w."ward_number", w."name", z."name";
        `;

        if (!rows || rows.length === 0) return null;

        const r = rows[0];
        const engineers = Array.isArray(r.engineers) ? r.engineers : [];
        const issues = []; // Always empty since we fetch issues separately

        return {
          wardNumber: Number(r.wardNumber ?? 0),
          wardName: r.wardName ?? "",
          zoneName: r.zoneName ?? "",
          engineers: engineers.map((e: any) => ({
            id: String(e.id),
            fullName: e.fullName ?? "",
            email: e.email ?? "",
            phoneNumber: e.phoneNumber ?? "",
            isActive: Boolean(e.isActive ?? false),
            department: e.department ?? null,
          })),
          totalEngineers: engineers.length,

          totalIssues: Number(r.totalIssues ?? 0),
          open: Number(r.open ?? 0),
          inProgress: Number(r.inProgress ?? 0),
          assigned: Number(r.assigned ?? 0),
          resolved: Number(r.resolved ?? 0),
          verified: Number(r.verified ?? 0),
          reopened: Number(r.reopened ?? 0),
          rejected: Number(r.rejected ?? 0),
          slaBreached: Number(r.slaBreached ?? 0),
          slaCompliance: Number(r.slaCompliance ?? 100),

          priorities: {
            critical: Number(r.critical ?? 0),
            high: Number(r.high ?? 0),
            medium: Number(r.medium ?? 0),
            low: Number(r.low ?? 0),
          },

          avgOpenDays: Number(r.avgOpenDays ?? 0),
          oldestOpenDays: Math.round(Number(r.oldestOpenDays ?? 0)),

          issues: [], // Always empty array since we fetch issues separately
        };
      }
    );
  }
}