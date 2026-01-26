import { Prisma, type Department, type IssueStatus, type Priority } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/apiError";
import { calculateSlaTarget } from "../../utils/sla";
import type { 
  CreateIssueInput, 
  ListIssuesInput, 
  UpdateIssueStatusInput, 
  AddCommentInput, 
  ReassignIssueInput, 
  VerifyResolutionInput, 
  AddAfterMediaInput 
} from "../../types";
import { EmailService } from "../../services/email/emailService";
import { IssueUploadService } from "./issue.upload.service";
import { cache } from "../../lib/cache";

const SYSTEM_COUNTER_KEY = (year: number) => `ticket_counter_${year}`;

async function nextTicketNumber(tx: Prisma.TransactionClient) {
  const year = new Date().getFullYear();
  const key = SYSTEM_COUNTER_KEY(year);

  const current = await tx.systemConfig.findUnique({ where: { key } });

  const lastNumber =
    typeof current?.value === "object" && current?.value && "last" in (current.value as any)
      ? Number((current.value as any).last)
      : 0;

  const next = lastNumber + 1;

  await tx.systemConfig.upsert({
    where: { key },
    create: { key, value: { last: next } as any },
    update: { value: { last: next } as any },
  });

  const padded = String(next).padStart(6, "0");
  return `VMC-${year}-${padded}`;
}

async function findWardIdByLatLng(latitude: number, longitude: number): Promise<string | null> {
  try {
    // Create more specific cache key with rounded coordinates for better cache hits
    const roundedLat = Math.round(latitude * 10000) / 10000; // 4 decimal places
    const roundedLng = Math.round(longitude * 10000) / 10000;
    const cacheKey = `${roundedLat}:${roundedLng}`;
    
    // Check cache first with spatial cache config
    const cached = await cache.cacheSpatialQuery(cacheKey, async () => {
      // Uses wards.boundary geometry(Polygon, 4326)
      // Point: ST_SetSRID(ST_MakePoint(lon, lat), 4326)
      const rows = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT w.id
        FROM wards w
        WHERE w.boundary IS NOT NULL
          AND ST_Contains(
            w.boundary,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
          )
        LIMIT 1;
      `;

      return rows && rows.length > 0 ? rows[0].id : null;
    });
    
    if (cached) {
      console.log(`✅ Issue location mapped to ward: ${cached}`);
    } else {
      console.warn(`⚠️  No ward found for coordinates: ${latitude}, ${longitude}`);
    }
    
    return cached;
  } catch (error) {
    console.error('❌ Error finding ward by coordinates:', error);
    return null;
  }
}

async function pickAssigneeId(args: { wardId: string | null; department: Department | null }): Promise<string | null> {
  // Prefer: WARD_ENGINEER in ward with matching department and active
  if (!args.wardId) return null;

  // Ward-specific cache key to prevent cross-ward assignment errors
  const cacheKey = `ward:${args.wardId}:dept:${args.department || 'any'}`;
  
  return cache.getOrSet(
    { ttl: 300, prefix: 'assignee:lookup' }, // Reduced TTL for real-time availability
    cacheKey,
    async () => {
      const primary = await prisma.user.findFirst({
        where: {
          isActive: true,
          role: "WARD_ENGINEER",
          wardId: args.wardId,
          ...(args.department ? { department: args.department } : {}),
        },
        select: { id: true },
        orderBy: { createdAt: "asc" },
      });

      if (primary?.id) return primary.id;

      // fallback: any WARD_ENGINEER in ward
      const fallback = await prisma.user.findFirst({
        where: { isActive: true, role: "WARD_ENGINEER", wardId: args.wardId },
        select: { id: true },
        orderBy: { createdAt: "asc" },
      });

      return fallback?.id ?? null;
    }
  );
}

export class IssuesService {
  // Get all active issue categories with caching
  static async getCategories() {
    return cache.getOrSet(
      { ttl: 1800, prefix: 'categories' },
      'active',
      async () => {
        return prisma.issueCategory.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            department: true,
            slaHours: true,
            formSchema: true,
            isActive: true
          },
          where: {
            isActive: true
          },
          orderBy: {
            name: 'asc'
          }
        });
      }
    );
  }

  // Get issue statistics with ward-specific caching
  static async getIssueStats(filters?: { wardId?: string; zoneId?: string; assigneeId?: string; reporterId?: string }) {
    // Create ward-specific cache key to prevent cross-contamination
    const wardContext = filters?.wardId || filters?.zoneId || 'global';
    const userContext = filters?.assigneeId || filters?.reporterId || 'all';
    const cacheKey = `ward:${wardContext}:user:${userContext}:${JSON.stringify(filters || {})}`;
    
    return cache.getOrSet(
      { ttl: 300, prefix: 'issue:stats' }, // Reduced TTL for real-time stats
      cacheKey,
      async () => {
        const where: Prisma.IssueWhereInput = {
          deletedAt: null,
          ...(filters?.wardId ? { wardId: filters.wardId } : {}),
          ...(filters?.zoneId ? { ward: { zoneId: filters.zoneId } } : {}),
          ...(filters?.assigneeId ? { assigneeId: filters.assigneeId } : {}),
          ...(filters?.reporterId ? { reporterId: filters.reporterId } : {}),
        };

        const [totalIssues, statusCounts, priorityCounts] = await Promise.all([
          prisma.issue.count({ where }),
          prisma.issue.groupBy({
            by: ['status'],
            where,
            _count: { status: true }
          }),
          prisma.issue.groupBy({
            by: ['priority'],
            where,
            _count: { priority: true }
          })
        ]);

        // Convert arrays to objects
        const issuesByStatus: Record<string, number> = {};
        statusCounts.forEach(item => {
          issuesByStatus[item.status] = item._count.status;
        });

        const issuesByPriority: Record<string, number> = {};
        priorityCounts.forEach(item => {
          issuesByPriority[item.priority] = item._count.priority;
        });

        return {
          totalIssues,
          issuesByStatus,
          issuesByPriority
        };
      }
    );
  }

  static async createIssue(input: CreateIssueInput) {
    const issue = await prisma.$transaction(async (tx) => {
      // Parallel fetch of category and ward detection
      const [category, wardId] = await Promise.all([
        tx.issueCategory.findUnique({
          where: { id: input.categoryId },
          select: { id: true, slaHours: true, department: true },
        }),
        findWardIdByLatLng(input.latitude, input.longitude)
      ]);
      
      if (!category) {
        throw new ApiError(400, "Invalid categoryId");
      }
      
      // Throw error if location is not within any VMC ward
      if (!wardId) {
        throw new ApiError(400, "Location is outside VMC jurisdiction. Please report issues only within VMC ward boundaries.");
      }

      const [ticketNumber, assigneeId] = await Promise.all([
        nextTicketNumber(tx),
        pickAssigneeId({
          wardId,
          department: category.department ?? null,
        })
      ]);
      
      const now = new Date();
      const slaTargetAt = category.slaHours ? calculateSlaTarget(now, category.slaHours) : null;

      const issue = await tx.issue.create({
        data: {
          ticketNumber,
          status: assigneeId ? "ASSIGNED" : "OPEN",
          priority: input.priority ?? "MEDIUM",

          categoryId: category.id,
          description: input.description,
          metaData: (input.metaData as any) ?? undefined,
          aiTags: input.aiTags ?? [],

          address: input.address,
          latitude: input.latitude,
          longitude: input.longitude,
          eloc: input.eloc,

          wardId: wardId,

          reporterId: input.reporterId,
          assigneeId: assigneeId ?? undefined,
          assignedAt: assigneeId ? now : undefined,

          slaTargetAt: slaTargetAt ?? undefined,

          media: input.media?.length
            ? {
                create: input.media.map((m) => ({
                  type: m.type,
                  url: m.url,
                  mimeType: m.mimeType,
                  fileSize: m.fileSize,
                })),
              }
            : undefined,

          history: {
            create: [
              {
                changedBy: input.reporterId,
                changeType: "CREATE",
                oldValue: undefined,
                newValue: { status: assigneeId ? "ASSIGNED" : "OPEN", wardId, assigneeId } as any,
              },
            ],
          },
        },
        include: {
          category: { select: { id: true, name: true, slug: true, department: true, slaHours: true } },
          media: true,
          ward: { select: { id: true, wardNumber: true, name: true, zone: { select: { id: true, name: true, code: true } } } },
          reporter: { select: { id: true, fullName: true, role: true } },
          assignee: { select: { id: true, fullName: true, email: true, role: true, department: true } },
        },
      });

      return issue;
    });

    // Ward-specific cache invalidation to prevent cross-contamination
    const [, emailResult] = await Promise.allSettled([
      // Precise cache invalidation
      Promise.all([
        cache.invalidateIssueCache(),
        cache.invalidateAdminCache(),
        // Ward-specific cache invalidation
        issue.wardId ? cache.invalidateWardCache(issue.wardId) : Promise.resolve(),
        // User-specific cache invalidation
        input.reporterId ? cache.invalidateUserCache(input.reporterId) : Promise.resolve(),
        issue.assigneeId ? cache.invalidateUserCache(issue.assigneeId) : Promise.resolve(),
      ]),
      // Email notification (non-blocking)
      issue.assigneeId && issue.assignee ? 
        EmailService.sendIssueAssignmentEmail(
          issue.assignee.email,
          issue.assignee.fullName,
          issue.ticketNumber,
          issue.category.name,
          input.address || `${input.latitude}, ${input.longitude}`,
          issue.priority
        ) : Promise.resolve()
    ]);

    // Log email result but don't fail the request
    if (emailResult.status === 'fulfilled' && issue.assigneeId) {
      console.log(`✅ Assignment email sent to ${issue.assignee?.email} for ticket ${issue.ticketNumber}`);
    } else if (emailResult.status === 'rejected') {
      console.error('❌ Failed to send assignment email:', emailResult.reason);
    }

    return issue;
  }


  static async listIssues(input: ListIssuesInput) {
    const skip = (input.page - 1) * input.pageSize;
    const take = input.pageSize;
    
    // Create ward-specific cache key to prevent cross-contamination
    const wardContext = input.wardId || input.zoneId || 'global';
    const userContext = input.assigneeId || input.reporterId || 'all';
    const cacheKey = `ward:${wardContext}:user:${userContext}:page:${input.page}:size:${input.pageSize}:${JSON.stringify(input)}`;
    
    return cache.getOrSet(
      { ttl: 180, prefix: 'issues:list' }, // Reduced TTL for frequent updates
      cacheKey,
      async () => {
        const where: Prisma.IssueWhereInput = {
          deletedAt: null,
          ...(input.status ? { status: input.status } : {}),
          ...(input.priority ? { priority: input.priority } : {}),
          ...(input.wardId ? { wardId: input.wardId } : {}),
          ...(input.categoryId ? { categoryId: input.categoryId } : {}),
          ...(input.reporterId ? { reporterId: input.reporterId } : {}),
          ...(input.assigneeId ? { assigneeId: input.assigneeId } : {}),
          ...(input.q ? { ticketNumber: { contains: input.q, mode: "insensitive" } } : {}),
          ...(input.zoneId
            ? {
                ward: { zoneId: input.zoneId },
              }
            : {}),
          ...(input.department
            ? {
                category: { department: input.department },
              }
            : {}),
        };

        const [rawItems, total] = await Promise.all([
          prisma.issue.findMany({
            where,
            orderBy: { updatedAt: "desc" },
            skip,
            take,
            select: {
              id: true,
              ticketNumber: true,
              status: true,
              priority: true,
              description: true,
              latitude: true,
              longitude: true,
              address: true,
              eloc: true,
              slaTargetAt: true,
              resolvedAt: true,
              createdAt: true,
              updatedAt: true,
              category: { select: { id: true, name: true, slug: true, department: true } },
              ward: { select: { id: true, wardNumber: true, name: true, zone: { select: { id: true, name: true, code: true } } } },
              reporter: { select: { id: true, fullName: true, role: true } },
              assignee: { select: { id: true, fullName: true, email: true, phoneNumber: true, role: true, department: true } },
              media: { select: { id: true, type: true, url: true, createdAt: true } },
            },
          }),
          prisma.issue.count({ where }),
        ]);

        // Add SLA breach indicator
        const items = rawItems.map(issue => ({
          ...issue,
          slaBreached: issue.slaTargetAt && !issue.resolvedAt
            ? new Date() > new Date(issue.slaTargetAt)
            : false
        }));

        return {
          items,
          page: input.page,
          pageSize: input.pageSize,
          total,
          totalPages: Math.ceil(total / input.pageSize),
        };
      }
    );
  }

  static async getIssueById(issueId: string) {
    return cache.getOrSet(
      { ttl: 600, prefix: 'issue:detail' }, // Reduced TTL for real-time updates
      issueId,
      async () => {
        const issue = await prisma.issue.findFirst({
          where: { id: issueId, deletedAt: null },
          include: {
            category: true,
            ward: { include: { zone: true } },
            reporter: { select: { id: true, fullName: true, role: true, phoneNumber: true } },
            assignee: { select: { id: true, fullName: true, role: true, department: true, phoneNumber: true } },
            media: true,
            comments: {
              orderBy: { createdAt: "asc" },
              include: { user: { select: { id: true, fullName: true, role: true } } },
            },
            history: { orderBy: { createdAt: "desc" } },
          },
        });

        if (!issue) throw new ApiError(404, "Issue not found");
        return issue;
      }
    );
  }


  // Add after media with cache invalidation
  static async addAfterMediaIssue(args: AddAfterMediaInput) {
    const result = await prisma.$transaction(async (tx) => {
      const issue = await tx.issue.findFirst({
        where: { id: args.issueId, deletedAt: null },
        select: { id: true, status: true, assigneeId: true, reporterId: true, wardId: true },
      });

      if (!issue) throw new ApiError(404, "Issue not found");

      // Allow access if user is:
      // 1. The reporter (field worker who created the issue)
      // 2. The assignee (ward engineer working on it)
      // 3. Admin/officer roles (can bypass)
      const canBypass =
        args.userRole === "SUPER_ADMIN" || args.userRole === "WARD_ENGINEER" || args.userRole === "ZONE_OFFICER";
      
      const isReporter = issue.reporterId === args.userId;
      const isAssignee = issue.assigneeId === args.userId;

      if (!canBypass && !isReporter && !isAssignee) {
        throw new ApiError(403, "Not allowed to update this issue");
      }

      // If marking resolved, ensure it's in a workable state
      if (args.markResolved) {
        const allowed = issue.status === "ASSIGNED" || issue.status === "IN_PROGRESS";
        if (!allowed) {
          throw new ApiError(400, `Cannot resolve issue from status: ${issue.status}`);
        }
      }

      const now = new Date();

      const updated = await tx.issue.update({
        where: { id: args.issueId },
        data: {
          ...(args.markResolved
            ? {
                status: "RESOLVED",
                resolvedAt: now,
              }
            : {}),

          media: {
            create: args.media.map((m) => ({
              type: "AFTER",
              url: m.url,
              mimeType: m.mimeType,
              fileSize: m.fileSize,
            })),
          },

          history: {
            create: [
              {
                changedBy: args.userId,
                changeType: "AFTER_MEDIA_UPLOAD",
                oldValue: undefined,
                newValue: { count: args.media.length, markResolved: args.markResolved } as Prisma.InputJsonValue,
              },
              ...(args.markResolved
                ? [
                    {
                      changedBy: args.userId,
                      changeType: "STATUS_CHANGE",
                      oldValue: { status: issue.status } as Prisma.InputJsonValue,
                      newValue: { status: "RESOLVED" } as Prisma.InputJsonValue,
                    },
                  ]
                : []),
            ],
          },
        },
        include: {
          category: { select: { id: true, name: true, slug: true, department: true } },
          ward: { select: { id: true, wardNumber: true, name: true, zone: { select: { id: true, name: true, code: true } } } },
          reporter: { select: { id: true, fullName: true, role: true } },
          assignee: { select: { id: true, fullName: true, role: true, department: true } },
          media: true,
        },
      });

      return { updated, issue };
    });

    // Invalidate related caches
    await Promise.all([
      cache.invalidateIssueCache(args.issueId),
      cache.invalidateAdminCache(),
      result.issue.assigneeId ? cache.invalidateUserCache(result.issue.assigneeId) : Promise.resolve(),
      result.issue.reporterId ? cache.invalidateUserCache(result.issue.reporterId) : Promise.resolve(),
      result.issue.wardId ? cache.invalidateRelatedCache('ward', result.issue.wardId) : Promise.resolve(),
    ]);

    return result.updated;
  }


  // Update issue status with cache invalidation
  static async updateIssueStatus(args: UpdateIssueStatusInput) {
    const result = await prisma.$transaction(async (tx) => {
      const issue = await tx.issue.findFirst({
        where: { id: args.issueId, deletedAt: null },
        select: { 
          id: true, 
          status: true, 
          assigneeId: true,
          reporterId: true,
          wardId: true,
          media: {
            select: { type: true }
          }
        }
      });

      if (!issue) throw new ApiError(404, "Issue not found");

      // Validate status transition workflow
      const validTransitions: Record<IssueStatus, IssueStatus[]> = {
        OPEN: ["ASSIGNED", "REJECTED"],
        ASSIGNED: ["IN_PROGRESS", "OPEN"],
        IN_PROGRESS: ["RESOLVED", "ASSIGNED"],
        RESOLVED: ["VERIFIED", "REOPENED"], // Handled by verify endpoint
        VERIFIED: [], // Final state
        REOPENED: ["ASSIGNED", "IN_PROGRESS"],
        REJECTED: ["OPEN"]
      };

      const allowedStatuses = validTransitions[issue.status] || [];
      if (!allowedStatuses.includes(args.newStatus)) {
        throw new ApiError(
          400, 
          `Cannot transition from ${issue.status} to ${args.newStatus}. Allowed: ${allowedStatuses.join(", ")}`
        );
      }

      const now = new Date();
      const updates: any = { status: args.newStatus };

      // Set timestamps based on status
      if (args.newStatus === "IN_PROGRESS" && issue.status !== "IN_PROGRESS") {
        updates.assignedAt = now;
      }
      if (args.newStatus === "RESOLVED") {
        updates.resolvedAt = now;
      }
      if (args.newStatus === "VERIFIED") {
        updates.verifiedAt = now;
      }
      // Clear resolvedAt when reopening
      if (args.newStatus === "REOPENED") {
        updates.resolvedAt = null;
        updates.verifiedAt = null;
      }

      const updated = await tx.issue.update({
        where: { id: args.issueId },
        data: {
          ...updates,
          history: {
            create: {
              changedBy: args.userId,
              changeType: "STATUS_CHANGE",
              oldValue: { status: issue.status } as any,
              newValue: { status: args.newStatus, comment: args.comment } as any
            }
          },
          ...(args.comment ? {
            comments: {
              create: {
                userId: args.userId,
                text: args.comment
              }
            }
          } : {})
        },
        include: {
          category: true,
          ward: { include: { zone: true } },
          assignee: { select: { id: true, fullName: true, role: true } }
        }
      });

      return { updated, issue };
    });

    // Invalidate related caches
    await Promise.all([
      cache.invalidateIssueCache(args.issueId),
      cache.invalidateAdminCache(),
      result.issue.assigneeId ? cache.invalidateUserCache(result.issue.assigneeId) : Promise.resolve(),
      result.issue.reporterId ? cache.invalidateUserCache(result.issue.reporterId) : Promise.resolve(),
      result.issue.wardId ? cache.invalidateRelatedCache('ward', result.issue.wardId) : Promise.resolve(),
    ]);

    return result.updated;
  }


  // Add comment to issue with cache invalidation
  static async addComment(args: AddCommentInput) {
    const issue = await prisma.issue.findFirst({
      where: { id: args.issueId, deletedAt: null },
      select: { id: true, assigneeId: true, reporterId: true, wardId: true }
    });

    if (!issue) throw new ApiError(404, "Issue not found");

    const comment = await prisma.comment.create({
      data: {
        issueId: args.issueId,
        userId: args.userId,
        text: args.comment
      },
      include: {
        user: { select: { id: true, fullName: true, role: true } }
      }
    });

    // Invalidate issue detail cache
    await cache.invalidateIssueCache(args.issueId);

    return comment;
  }

  // Reassign issue to different engineer with cache invalidation
  static async reassignIssue(args: ReassignIssueInput) {
    const result = await prisma.$transaction(async (tx) => {
      const [issue, newAssignee] = await Promise.all([
        tx.issue.findFirst({
          where: { id: args.issueId, deletedAt: null },
          include: { 
            assignee: { select: { id: true, fullName: true } },
            category: { select: { name: true } }
          }
        }),
        tx.user.findUnique({
          where: { id: args.newAssigneeId },
          select: { id: true, fullName: true, email: true, role: true, wardId: true, isActive: true }
        })
      ]);

      if (!issue) throw new ApiError(404, "Issue not found");
      if (!newAssignee) throw new ApiError(404, "Assignee not found");
      if (!newAssignee.isActive) throw new ApiError(400, "Cannot assign to inactive user");

      // Validate assignee is in same ward
      if (issue.wardId && newAssignee.wardId !== issue.wardId) {
        throw new ApiError(400, "Assignee must be in the same ward");
      }

      const updated = await tx.issue.update({
        where: { id: args.issueId },
        data: {
          assigneeId: args.newAssigneeId,
          status: "ASSIGNED",
          assignedAt: new Date(),
          history: {
            create: {
              changedBy: args.reassignedBy,
              changeType: "ASSIGNMENT",
              oldValue: { assigneeId: issue.assigneeId, assigneeName: issue.assignee?.fullName } as any,
              newValue: { assigneeId: args.newAssigneeId, assigneeName: newAssignee.fullName, reason: args.reason } as any
            }
          }
        },
        include: {
          category: true,
          ward: { include: { zone: true } },
          assignee: { select: { id: true, fullName: true, email: true, role: true } }
        }
      });

      return { updated, issue, newAssignee };
    });

    // Invalidate related caches
    await Promise.all([
      cache.invalidateIssueCache(args.issueId),
      cache.invalidateAdminCache(),
      result.issue.assigneeId ? cache.invalidateUserCache(result.issue.assigneeId) : Promise.resolve(),
      cache.invalidateUserCache(args.newAssigneeId),
      result.issue.wardId ? cache.invalidateRelatedCache('ward', result.issue.wardId) : Promise.resolve(),
    ]);

    // Send email notification to new assignee
    try {
      await EmailService.sendIssueAssignmentEmail(
        result.newAssignee.email,
        result.newAssignee.fullName,
        result.issue.ticketNumber,
        result.issue.category.name,
        result.issue.address || `${result.issue.latitude}, ${result.issue.longitude}`,
        result.issue.priority
      );
      console.log(`✅ Reassignment email sent to ${result.newAssignee.email} for ticket ${result.issue.ticketNumber}`);
    } catch (emailError) {
      console.error('❌ Failed to send reassignment email:', emailError);
    }

    return result.updated;
  }

  // Verify or reject resolved issue with cache invalidation
  static async verifyResolution(args: VerifyResolutionInput) {
    const result = await prisma.$transaction(async (tx) => {
      const issue = await tx.issue.findFirst({
        where: { id: args.issueId, deletedAt: null },
        select: { 
          id: true, 
          status: true,
          assigneeId: true,
          reporterId: true,
          wardId: true,
          media: {
            select: { type: true }
          }
        }
      });

      if (!issue) throw new ApiError(404, "Issue not found");
      if (issue.status !== "RESOLVED") {
        throw new ApiError(400, "Only resolved issues can be verified");
      }

      // Check if after images are uploaded
      const hasAfterImages = issue.media.some(m => m.type === 'AFTER');
      if (!hasAfterImages) {
        throw new ApiError(400, "Cannot verify issue without after images");
      }

      const newStatus = args.approved ? "VERIFIED" : "REOPENED";
      const now = new Date();

      const updated = await tx.issue.update({
        where: { id: args.issueId },
        data: {
          status: newStatus,
          ...(args.approved ? { verifiedAt: now } : { resolvedAt: null }),
          history: {
            create: {
              changedBy: args.verifiedBy,
              changeType: args.approved ? "VERIFICATION" : "REJECTION",
              oldValue: { status: "RESOLVED" } as any,
              newValue: { status: newStatus, comment: args.comment, approved: args.approved } as any
            }
          },
          ...(args.comment ? {
            comments: {
              create: {
                userId: args.verifiedBy,
                text: args.comment
              }
            }
          } : {})
        },
        include: {
          category: true,
          ward: { include: { zone: true } },
          assignee: { select: { id: true, fullName: true, role: true } }
        }
      });

      return { updated, issue };
    });

    // Invalidate related caches
    await Promise.all([
      cache.invalidateIssueCache(args.issueId),
      cache.invalidateAdminCache(),
      result.issue.assigneeId ? cache.invalidateUserCache(result.issue.assigneeId) : Promise.resolve(),
      result.issue.reporterId ? cache.invalidateUserCache(result.issue.reporterId) : Promise.resolve(),
      result.issue.wardId ? cache.invalidateRelatedCache('ward', result.issue.wardId) : Promise.resolve(),
    ]);

    return result.updated;
  }

  // Reopen verified issue with cache invalidation
  static async reopenIssue(args: { issueId: string; reopenedBy: string; comment?: string }) {
    const result = await prisma.$transaction(async (tx) => {
      const issue = await tx.issue.findFirst({
        where: { id: args.issueId, deletedAt: null },
        include: {
          media: {
            select: { id: true, type: true, url: true }
          }
        }
      });

      if (!issue) throw new ApiError(404, "Issue not found");
      if (issue.status !== "VERIFIED") {
        throw new ApiError(400, "Only verified issues can be reopened");
      }

      // Get after images for deletion
      const afterImages = issue.media.filter(m => m.type === 'AFTER');
      const afterImageIds = afterImages.map(m => m.id);
      
      // Delete after images from database
      if (afterImageIds.length > 0) {
        await tx.issueMedia.deleteMany({
          where: { id: { in: afterImageIds } }
        });
      }

      const updated = await tx.issue.update({
        where: { id: args.issueId },
        data: {
          status: "ASSIGNED",
          resolvedAt: null,
          verifiedAt: null,
          history: {
            create: {
              changedBy: args.reopenedBy,
              changeType: "REOPEN",
              oldValue: { status: "VERIFIED" } as any,
              newValue: { status: "ASSIGNED", comment: args.comment, afterImagesDeleted: afterImageIds.length } as any
            }
          },
          ...(args.comment ? {
            comments: {
              create: {
                userId: args.reopenedBy,
                text: args.comment
              }
            }
          } : {})
        },
        include: {
          category: true,
          ward: { include: { zone: true } },
          assignee: { select: { id: true, fullName: true, role: true } },
          media: true
        }
      });

      return { updated, deletedImages: afterImages, issue };
    });

    // Invalidate related caches
    await Promise.all([
      cache.invalidateIssueCache(args.issueId),
      cache.invalidateAdminCache(),
      result.issue.assigneeId ? cache.invalidateUserCache(result.issue.assigneeId) : Promise.resolve(),
      result.issue.reporterId ? cache.invalidateUserCache(result.issue.reporterId) : Promise.resolve(),
      result.issue.wardId ? cache.invalidateRelatedCache('ward', result.issue.wardId) : Promise.resolve(),
    ]);

    return { updated: result.updated, deletedImages: result.deletedImages };
  }
}