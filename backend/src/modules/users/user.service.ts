import { Prisma, type Department, type IssueStatus, type Priority } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/apiError";
import { hashPassword, comparePassword } from "../auth/auth.utils";
import type {
  AssignedIssuesDashboardPayload,
  DashboardIssueListItem,
  FieldWorkerDashboardPayload,
  WardEngineerDashboardPayload,
} from "../../types/user.types";

function groupByToCountMap<K extends string>(
  rows: Array<{ key: K; count: number }>
): Partial<Record<K, number>> {
  return rows.reduce<Partial<Record<K, number>>>((acc, r) => {
    acc[r.key] = r.count;
    return acc;
  }, {});
}

export class UserDashboardService {
    
  static async getFieldWorkerDashboard(userId: string, limit = 10): Promise<FieldWorkerDashboardPayload> {
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const where: Prisma.IssueWhereInput = {
      deletedAt: null,
      reporterId: userId,
    };

    const [totalIssuesCreated, byStatusRows, recentIssues] = await Promise.all([
      prisma.issue.count({ where }),
      prisma.issue.groupBy({
        by: ["status"],
        where,
        _count: { _all: true },
      }),
      prisma.issue.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: safeLimit,
        select: {
          id: true,
          ticketNumber: true,
          status: true,
          priority: true,
          createdAt: true,
        },
      }),
    ]);

    const issuesByStatus = groupByToCountMap<IssueStatus>(
      byStatusRows.map((r) => ({ key: r.status, count: r._count._all }))
    );

    return {
      totalIssuesCreated,
      issuesByStatus,
      recentIssues: recentIssues as DashboardIssueListItem[],
    };
  }

  static async getWardEngineerDashboard(args: {
    wardId: string | null | undefined;
    department: Department | null | undefined;
  }): Promise<WardEngineerDashboardPayload> {
    if (!args.wardId) throw new ApiError(400, "WARD_ENGINEER must have wardId");
    if (!args.department) throw new ApiError(400, "WARD_ENGINEER must have department");

    const wardId = args.wardId;
    const department = args.department;
    const now = new Date();

    const where: Prisma.IssueWhereInput = {
      deletedAt: null,
      wardId,
      category: { department },
    };

    const [
      totalIssues,
      byStatusRows,
      byPriorityRows,
      withinSla,
      breachedSla,
      recentResolvedForAvg,
    ] = await Promise.all([
      prisma.issue.count({ where }),

      prisma.issue.groupBy({
        by: ["status"],
        where,
        _count: { _all: true },
      }),

      prisma.issue.groupBy({
        by: ["priority"],
        where,
        _count: { _all: true },
      }),

      prisma.issue.count({
        where: {
          deletedAt: null,
          wardId,
          category: { department },
          resolvedAt: { not: null },
          slaTargetAt: { not: null },
        },
      }),

      prisma.issue.count({
        where: {
          deletedAt: null,
          wardId,
          category: { department },
          slaTargetAt: { not: null, lt: now },
          resolvedAt: null,
        },
      }),

      prisma.issue.findMany({
        where: {
          ...where,
          resolvedAt: { not: null },
          assignedAt: { not: null },
        },
        select: { assignedAt: true, resolvedAt: true },
        take: 100,
      }),
    ]);

    let avgResolutionTimeHours: number | null = null;
    if (recentResolvedForAvg.length > 0) {
      const totalMs = recentResolvedForAvg.reduce((sum, item) => {
        if (!item.assignedAt || !item.resolvedAt) return sum;
        return sum + (item.resolvedAt.getTime() - item.assignedAt.getTime());
      }, 0);
      avgResolutionTimeHours = totalMs / recentResolvedForAvg.length / (1000 * 60 * 60);
    }

    const issuesByStatus = groupByToCountMap<IssueStatus>(
      byStatusRows.map((r) => ({ key: r.status, count: r._count._all }))
    );

    const issuesByPriority = groupByToCountMap<Priority>(
      byPriorityRows.map((r) => ({ key: r.priority!, count: (r._count as any)._all }))
    );

    return {
      wardId,
      department,
      totalIssues,
      issuesByStatus,
      issuesByPriority,
      sla: {
        withinSla,
        breachedSla,
      },
      averageResolutionTimeHours: avgResolutionTimeHours,
    };
  }

  static async getAssignedIssuesDashboard(userId: string, userDepartment: Department | null, limit = 10): Promise<AssignedIssuesDashboardPayload> {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const where: Prisma.IssueWhereInput = {
      deletedAt: null,
      assigneeId: userId,
      ...(userDepartment && { category: { department: userDepartment } })
    };

    const [totalAssigned, byStatusRows, byPriorityRows, items] = await Promise.all([
      prisma.issue.count({ where }),

      // Group counts by IssueStatus (fast aggregation on DB)
      prisma.issue.groupBy({
        by: ["status"],
        where,
        _count: { _all: true },
      }),

      // Group counts by Priority (exclude null priorities)
      prisma.issue.groupBy({
        by: ["priority"],
        where,
        _count: { _all: true },
      }),

        prisma.issue.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take: safeLimit,
        select: {
          id: true,
          ticketNumber: true,
          status: true,
          priority: true,
          createdAt: true,
          category: {
            select: {
              name: true,
              department: true
            }
          },
          ward: {
            select: {
              wardNumber: true,
              name: true
            }
          },
          assignee: {
            select: {
              fullName: true
            }
          }
        },
      }),
    ]);
   return {
      totalAssigned,
      issuesByStatus: groupByToCountMap<IssueStatus>(
        byStatusRows.map((r) => ({ key: r.status, count: r._count._all }))
      ),
      issuesByPriority: groupByToCountMap<Priority>(
        byPriorityRows
          .filter((r) => r.priority !== null)
          .map((r) => ({ key: r.priority as Priority, count: r._count._all }))
      ),
      assignedIssues: items as DashboardIssueListItem[],
    };
  }

  static assertWardEngineerScope(wardId: string | null | undefined, department: string | null | undefined) {
    if (!wardId) throw new ApiError(400, "WARD_ENGINEER must have wardId");
    if (!department) throw new ApiError(400, "WARD_ENGINEER must have department");
  }

  // Update user's own profile (name, phone)
  static async updateOwnProfile(userId: string, updateData: { fullName?: string; phoneNumber?: string }) {
    const { fullName, phoneNumber } = updateData;

    // Validate at least one field is being updated
    if (!fullName && !phoneNumber) {
      throw new ApiError(400, "At least one field (fullName or phoneNumber) must be provided");
    }

    // Check if phone number is already taken
    if (phoneNumber) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phoneNumber,
          id: { not: userId }
        }
      });

      if (existingUser) {
        throw new ApiError(409, "Phone number already in use");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        ...(phoneNumber && { phoneNumber })
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        department: true,
        updatedAt: true
      }
    });

    // Log profile update
    await prisma.auditLog.create({
      data: {
        userId,
        action: "PROFILE_UPDATE",
        resource: "User",
        resourceId: userId,
        metadata: {
          updatedFields: updateData
        }
      }
    });

    return updatedUser;
  }

  // Change user's own password
  static async changeOwnPassword(userId: string, currentPassword: string, newPassword: string) {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, hashedPassword: true, email: true }
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.hashedPassword);
    if (!isValid) {
      throw new ApiError(401, "Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { hashedPassword }
    });

    // Log password change
    await prisma.auditLog.create({
      data: {
        userId,
        action: "PASSWORD_CHANGED",
        resource: "User",
        resourceId: userId,
        metadata: {
          changedAt: new Date().toISOString()
        }
      }
    });

    return { message: "Password changed successfully" };
  }

  // Get user's activity log
  static async getUserActivityLog(userId: string, limit = 20) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    const activities = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: safeLimit,
      select: {
        id: true,
        action: true,
        resource: true,
        resourceId: true,
        metadata: true,
        createdAt: true
      }
    });

    return {
      userId,
      activities,
      count: activities.length
    };
  }
}
