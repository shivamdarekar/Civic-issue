import { Prisma, type Department, type IssueStatus, type Priority } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/apiError";
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
        where: { ...where, priority: { not: null } as any },
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

  static async getAssignedIssuesDashboard(userId: string, limit = 10): Promise<AssignedIssuesDashboardPayload> {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const where: Prisma.IssueWhereInput = {
      deletedAt: null,
      assigneeId: userId,
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
        where: { ...where, priority: { not: null } as any },
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
}
