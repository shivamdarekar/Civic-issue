import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { ApiError } from "../../utils/apiError";
import { hashPassword } from "../auth/auth.utils";
import { EmailService } from "../../services/email/emailService";
import {
  RegisterUserData,
  DashboardPayload,
  ZoneOverview,
  ZoneDetail,
  WardOverview,
  WardDetailPayload,
  WardIssueListItem,
  WardIssueFilters,
  UserUpdateData,
  UserStatistics,
  ReassignWorkResponse,
  UserFilterParams,
  FilteredUser,
  UserStatusChange
} from "../../types";

export class AdminService {
  // Admin registers other users
  static async registerUser(userData: RegisterUserData, registeredBy: string) {
    const { fullName, email, phoneNumber, password, role, wardId, zoneId, department } = userData;

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

    // Validate department for engineers only
    if (role === 'WARD_ENGINEER' && !department) {
      throw new ApiError(400, "Department is required for Ward Engineers");
    }

    // Ensure non-engineers don't have department assigned
    if (role !== 'WARD_ENGINEER' && department) {
      throw new ApiError(400, "Department can only be assigned to Ward Engineers");
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
            role: user.role,
            department: user.department
          }
        }
      }
    });

    // Send welcome email with credentials
    try {
      await EmailService.sendWelcomeEmail(
        user.email,
        user.fullName,
        user.role,
        password // Send original password (before hashing)
      );
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw - user is created, email failure shouldn't block
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


  // Update user details
  static async updateUser(userId: string, updateData: UserUpdateData, updatedBy: string): Promise<any> {
    const { fullName, email, phoneNumber, role, wardId, zoneId, department } = updateData;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    // Prevent super admin from updating themselves
    if (existingUser.role === 'SUPER_ADMIN') {
      throw new ApiError(403, "Cannot update Super Admin account");
    }

    // Check for email/phone conflicts (excluding current user)
    if (email || phoneNumber) {
      const conflictUser = await prisma.user.findFirst({
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
        }
      });

      if (conflictUser) {
        throw new ApiError(400, "Email or phone number already exists");
      }
    }

    // Validate ward/zone if provided
    if (wardId) {
      const ward = await prisma.ward.findUnique({
        where: { id: wardId },
        select: { id: true, zoneId: true }
      });
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

    // CRITICAL: Validate ward belongs to zone
    if (wardId && zoneId) {
      const ward = await prisma.ward.findUnique({
        where: { id: wardId },
        select: { zoneId: true }
      });

      if (!ward || ward.zoneId !== zoneId) {
        throw new ApiError(400, "Ward does not belong to selected zone");
      }
    }

    // Role-based validation (CRITICAL for data integrity)
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

    // Validate department for engineers
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

    // Update user
    const updatedUser = await prisma.user.update({
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
    });

    // Track significant assignment changes (for judges/auditors)
    const assignmentChanged =
      (role && role !== existingUser.role) ||
      (wardId !== undefined && wardId !== existingUser.wardId) ||
      (zoneId !== undefined && zoneId !== existingUser.zoneId) ||
      (department !== undefined && department !== existingUser.department);

    // Log the update
    await prisma.auditLog.create({
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
    });

    return updatedUser;
  }


  // Reassign user's work to another user
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


  // Deactivate user (soft delete)
  static async deactivateUser(userId: string, deactivatedBy: string): Promise<UserStatusChange> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.role === 'SUPER_ADMIN') {
      throw new ApiError(403, "Cannot deactivate Super Admin account");
    }

    if (!user.isActive) {
      throw new ApiError(400, "User is already deactivated");
    }

    // Check for active assignments
    const activeIssues = await prisma.issue.count({
      where: {
        assigneeId: userId,
        status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
        deletedAt: null
      }
    });

    if (activeIssues > 0) {
      throw new ApiError(400, `Cannot deactivate user with ${activeIssues} active issue(s). Please reassign them first.`);
    }

    // Deactivate user
    const deactivatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    // Log deactivation
    await prisma.auditLog.create({
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
          }
        }
      }
    });

    return deactivatedUser;
  }


  // Reactivate user
  static async reactivateUser(userId: string, reactivatedBy: string): Promise<UserStatusChange> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.role === 'SUPER_ADMIN') {
      throw new ApiError(403, "Cannot reactivate Super Admin account");
    }

    if (user.isActive) {
      throw new ApiError(400, "User is already active");
    }

    // Reactivate user
    const reactivatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    // Log reactivation
    await prisma.auditLog.create({
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
    });

    return reactivatedUser;
  }


  // Get user work statistics
  static async getUserStatistics(userId: string): Promise<UserStatistics> {
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


  // Get filtered users (for dropdowns in frontend)
  static async getUsersByFilter(filters: UserFilterParams): Promise<FilteredUser[]> {
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


  static async getAllUsers() {
    return await prisma.user.findMany({
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
      orderBy: { createdAt: 'desc' }
    });
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


  // Fetch dashboard overview statistics 
  static async getDashboard() {
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
            100 * (COUNT(*) FILTER (WHERE "resolved_at" IS NOT NULL AND "deleted_at" IS NULL))::numeric
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


  static async getZonesOverview() {
    const rows = await prisma.$queryRaw<ZoneOverview[]>`
      SELECT
        z."id" AS "zoneId",
        z."name" AS "name",
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
      slaCompliance: Number(r.slaCompliance ?? 100),
      zoneOfficer: r.zoneOfficer ?? null,
    }));
  }


  static async getZoneDetail(zoneId: string): Promise<ZoneDetail | null> {
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
      WHERE z."id" = ${zoneId}
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


  static async getZoneWards(zoneId: string): Promise<WardOverview[]> {
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
      WHERE w."zone_id" = ${zoneId}
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


  static async getWardDetail(wardId: string): Promise<WardDetailPayload | null> {
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
        COALESCE(COUNT(i."id"), 0) FILTER (WHERE i."deleted_at" IS NULL) AS "totalIssues",
        COALESCE(COUNT(i."id") FILTER (WHERE i."status" = 'OPEN'         AND i."deleted_at" IS NULL), 0) AS "open",
        COALESCE(COUNT(i."id") FILTER (WHERE i."status" = 'ASSIGNED'     AND i."deleted_at" IS NULL), 0) AS "assigned",
        COALESCE(COUNT(i."id") FILTER (WHERE i."status" = 'IN_PROGRESS'  AND i."deleted_at" IS NULL), 0) AS "inProgress",
        COALESCE(COUNT(i."id") FILTER (WHERE i."status" = 'RESOLVED'     AND i."deleted_at" IS NULL), 0) AS "resolved",
        COALESCE(COUNT(i."id") FILTER (WHERE i."status" = 'VERIFIED'     AND i."deleted_at" IS NULL), 0) AS "verified",
        COALESCE(COUNT(i."id") FILTER (WHERE i."status" = 'REOPENED'     AND i."deleted_at" IS NULL), 0) AS "reopened",
        COALESCE(COUNT(i."id") FILTER (WHERE i."status" = 'REJECTED'     AND i."deleted_at" IS NULL), 0) AS "rejected",
        COALESCE(COUNT(i."id") FILTER (
          WHERE i."resolved_at" IS NULL
            AND i."sla_target_at" < NOW()
            AND i."deleted_at" IS NULL
        ), 0) AS "slaBreached",

        CASE
          WHEN COALESCE(COUNT(i."id") FILTER (WHERE i."deleted_at" IS NULL), 0) = 0 THEN 100
          ELSE ROUND(
            100.0
            * (COUNT(i."id") FILTER (
                WHERE i."resolved_at" IS NOT NULL
                  AND i."sla_target_at" IS NOT NULL
                  AND i."resolved_at" <= i."sla_target_at"
                  AND i."deleted_at" IS NULL
              ))::numeric
            / NULLIF(COUNT(i."id") FILTER (WHERE i."deleted_at" IS NULL), 0)
          )::int
        END AS "slaCompliance",

        -- Priority distribution
        COALESCE(COUNT(i."id") FILTER (WHERE i."priority" = 'CRITICAL' AND i."deleted_at" IS NULL), 0) AS "critical",
        COALESCE(COUNT(i."id") FILTER (WHERE i."priority" = 'HIGH'     AND i."deleted_at" IS NULL), 0) AS "high",
        COALESCE(COUNT(i."id") FILTER (WHERE i."priority" = 'MEDIUM'   AND i."deleted_at" IS NULL), 0) AS "medium",
        COALESCE(COUNT(i."id") FILTER (WHERE i."priority" = 'LOW'      AND i."deleted_at" IS NULL), 0) AS "low",

        -- Aging for active issues
        COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - i."created_at")) / 86400)
          FILTER (WHERE i."status" IN ('OPEN','ASSIGNED','IN_PROGRESS') AND i."deleted_at" IS NULL)::numeric, 2), 0) AS "avgOpenDays",
        COALESCE(MAX(EXTRACT(EPOCH FROM (NOW() - i."created_at")) / 86400)
          FILTER (WHERE i."status" IN ('OPEN','ASSIGNED','IN_PROGRESS') AND i."deleted_at" IS NULL), 0) AS "oldestOpenDays",

        -- Top issues list (include category department)
        (
          SELECT COALESCE(jsonb_agg(x ORDER BY x."priorityWeight" DESC, x."createdAt" DESC), '[]'::jsonb)
          FROM (
            SELECT
              i2."id"                                              AS "id",
              i2."status"                                          AS "status",
              i2."priority"                                        AS "priority",
              ic."name"                                            AS "categoryName",
              ic."department"                                      AS "department",
              i2."created_at"                                      AS "createdAt",
              i2."resolved_at"                                     AS "resolvedAt",
              i2."sla_target_at"                                   AS "slaTargetAt",
              CASE i2."priority"
                WHEN 'CRITICAL' THEN 4
                WHEN 'HIGH'     THEN 3
                WHEN 'MEDIUM'   THEN 2
                WHEN 'LOW'      THEN 1
                ELSE 0
              END                                                  AS "priorityWeight",
              EXISTS (
                SELECT 1 FROM "issue_media" m
                WHERE m."issue_id" = i2."id" AND m."media_type" = 'BEFORE'
              )                                                    AS "hasBeforeImage",
              EXISTS (
                SELECT 1 FROM "issue_media" m
                WHERE m."issue_id" = i2."id" AND m."media_type" = 'AFTER'
              )                                                    AS "hasAfterImage"
            FROM "issues" i2
            LEFT JOIN "issue_categories" ic ON ic."id" = i2."category_id"
            WHERE i2."ward_id" = w."id" AND i2."deleted_at" IS NULL
            ORDER BY "priorityWeight" DESC, i2."created_at" DESC
            LIMIT 50
          ) AS x
        ) AS "issues"

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
    const issues = Array.isArray(r.issues) ? r.issues : [];

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

      issues: issues.map((it: any) => ({
        id: String(it.id),
        status: it.status,
        priority: it.priority ?? null,
        categoryName: it.categoryName ?? null,
        department: it.department ?? null,
        createdAt: it.createdAt,
        resolvedAt: it.resolvedAt ?? null,
        slaTargetAt: it.slaTargetAt ?? null,
        priorityWeight: Number(it.priorityWeight ?? 0),
        hasBeforeImage: Boolean(it.hasBeforeImage ?? false),
        hasAfterImage: Boolean(it.hasAfterImage ?? false),
      })),
    };
  }


  static async getWardIssues(
    wardId: string,
    filters: WardIssueFilters
  ): Promise<WardIssueListItem[]> {
    const { status, priority, categoryId } = filters ?? {};

    const rows = await prisma.$queryRaw<any[]>`
      SELECT
        i."id"                               AS "id",
        i."ticket_number"                    AS "ticketNumber",
        i."status"                           AS "status",
        i."priority"                         AS "priority",
        ic."name"                            AS "category",
        ic."department"                      AS "department",
        a."full_name"                        AS "assignee",
        (i."resolved_at" IS NULL AND i."sla_target_at" IS NOT NULL AND i."sla_target_at" < NOW())
                                             AS "slaBreached",
        i."updated_at"                       AS "updatedAt"
      FROM "issues" i
      LEFT JOIN "issue_categories" ic ON ic."id" = i."category_id"
      LEFT JOIN "users" a ON a."id" = i."assignee_id"
      WHERE i."ward_id" = ${wardId}::uuid
        AND i."deleted_at" IS NULL
        ${status ? Prisma.sql`AND i."status" = ${status}::"IssueStatus"` : Prisma.empty}
        ${priority ? Prisma.sql`AND i."priority" = ${priority}::"Priority"` : Prisma.empty}
        ${categoryId ? Prisma.sql`AND i."category_id" = ${categoryId}::uuid` : Prisma.empty}
      ORDER BY i."updated_at" DESC;
    `;

    return (rows ?? []).map((r) => ({
      id: String(r.id),
      ticketNumber: r.ticketNumber ?? null,
      status: r.status,
      priority: r.priority ?? null,
      category: r.category ?? null,
      department: r.department ?? null,
      assignee: r.assignee ?? null,
      slaBreached: Boolean(r.slaBreached),
      updatedAt: new Date(r.updatedAt).toISOString(),
    }));
  }
}