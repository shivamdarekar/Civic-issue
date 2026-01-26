import { Prisma, type Department, type IssueStatus, type Priority } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/apiError";
import { hashPassword, comparePassword } from "../auth/auth.utils";
import { cache } from "../../lib/cache";
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
    const cacheKey = `${userId}:${safeLimit}`;
    
    return cache.getOrSet(
      { ttl: 300, prefix: 'user:dashboard:fieldworker' }, // Reduced TTL for real-time data
      cacheKey,
      async () => {
        const where: Prisma.IssueWhereInput = {
          deletedAt: null,
          reporterId: userId,
        };

        // Optimized parallel queries with minimal data selection
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
    );
  }

  static async getWardEngineerDashboard(args: {
    wardId: string | null | undefined;
    department: Department | null | undefined;
    userId: string;
  }): Promise<WardEngineerDashboardPayload> {
    if (!args.wardId) throw new ApiError(400, "WARD_ENGINEER must have wardId");
    if (!args.department) throw new ApiError(400, "WARD_ENGINEER must have department");

    const cacheKey = `${args.userId}:${args.wardId}:${args.department}`;
    
    return cache.getOrSet(
      { ttl: 300, prefix: 'user:dashboard:wardengineer' }, // Reduced TTL for real-time data
      cacheKey,
      async () => {
        const wardId = args.wardId!;
        const department = args.department!;
        const userId = args.userId;
        const now = new Date();

        // Optimized where clause
        const where: Prisma.IssueWhereInput = {
          deletedAt: null,
          wardId,
          assigneeId: userId,
        };

        // Parallel queries with optimized selections
        const [
          totalIssues,
          byStatusRows,
          byPriorityRows,
          slaStats,
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

          // Combined SLA query for better performance
          prisma.issue.groupBy({
            by: ['resolvedAt'],
            where: {
              deletedAt: null,
              wardId,
              assigneeId: userId,
              slaTargetAt: { not: null },
              OR: [
                { resolvedAt: { not: null } }, // Within SLA
                { AND: [{ resolvedAt: null }, { slaTargetAt: { lt: now } }] } // Breached SLA
              ]
            },
            _count: { _all: true },
          }),

          prisma.issue.findMany({
            where: {
              ...where,
              resolvedAt: { not: null },
              assignedAt: { not: null },
            },
            select: { assignedAt: true, resolvedAt: true },
            take: 50, // Reduced for better performance
          }),
        ]);

        // Calculate SLA stats from combined query
        let withinSla = 0;
        let breachedSla = 0;
        slaStats.forEach(stat => {
          if (stat.resolvedAt !== null) {
            withinSla += stat._count._all;
          } else {
            breachedSla += stat._count._all;
          }
        });

        // Calculate average resolution time
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
    );
  }

  static assertWardEngineerScope(wardId: string | null | undefined, department: string | null | undefined) {
    if (!wardId) throw new ApiError(400, "WARD_ENGINEER must have wardId");
    if (!department) throw new ApiError(400, "WARD_ENGINEER must have department");
  }

  // Update user's own profile with optimized operations
  static async updateOwnProfile(userId: string, updateData: { fullName?: string; phoneNumber?: string }) {
    const { fullName, phoneNumber } = updateData;

    // Validate at least one field is being updated
    if (!fullName && !phoneNumber) {
      throw new ApiError(400, "At least one field (fullName or phoneNumber) must be provided");
    }

    // Parallel operations for phone validation and update
    const result = await prisma.$transaction(async (tx) => {
      // Check if phone number is already taken (only if provided)
      if (phoneNumber) {
        const existingUser = await tx.user.findFirst({
          where: {
            phoneNumber,
            id: { not: userId }
          },
          select: { id: true }
        });

        if (existingUser) {
          throw new ApiError(409, "Phone number already in use");
        }
      }

      // Update user and create audit log in parallel
      const [updatedUser] = await Promise.all([
        tx.user.update({
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
        }),
        tx.auditLog.create({
          data: {
            userId,
            action: "PROFILE_UPDATE",
            resource: "User",
            resourceId: userId,
            metadata: {
              updatedFields: updateData
            }
          }
        })
      ]);

      return updatedUser;
    });

    // Invalidate user cache after successful update
    await cache.invalidateUserCache(userId);

    return result;
  }

  // Change user's own password with optimized operations
  static async changeOwnPassword(userId: string, currentPassword: string, newPassword: string) {
    // Single transaction for all password change operations
    const result = await prisma.$transaction(async (tx) => {
      // Get user with password
      const user = await tx.user.findUnique({
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

      // Update password and create audit log in parallel
      await Promise.all([
        tx.user.update({
          where: { id: userId },
          data: { hashedPassword }
        }),
        tx.auditLog.create({
          data: {
            userId,
            action: "PASSWORD_CHANGED",
            resource: "User",
            resourceId: userId,
            metadata: {
              changedAt: new Date().toISOString()
            }
          }
        })
      ]);

      return user;
    });

    // Invalidate user cache after successful password change
    await cache.invalidateUserCache(userId);

    return { message: "Password changed successfully" };
  }

  // Get user's activity log with caching
  static async getUserActivityLog(userId: string, limit = 20) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const cacheKey = `${userId}:${safeLimit}`;
    
    return cache.getOrSet(
      { ttl: 600, prefix: 'user:activity' },
      cacheKey,
      async () => {
        const activities = await prisma.auditLog.findMany({
          where: { 
            userId,
            // Filter out login/logout activities - only show issue-related activities
            action: {
              notIn: ['LOGIN', 'LOGOUT']
            }
          },
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
    );
  }
}
