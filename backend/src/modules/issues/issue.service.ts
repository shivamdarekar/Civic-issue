import { Prisma, type Department, type IssueStatus, type Priority } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import type { CreateIssueInput,ListIssuesInput } from "../../types/issues.types";


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

  return rows?.[0]?.id ?? null;
}

async function pickAssigneeId(args: { wardId: string | null; department: Department | null }): Promise<string | null> {
  // Prefer: WARD_ENGINEER in ward with matching department and active
  if (!args.wardId) return null;

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

export class IssuesService {
  static async createIssue(input: CreateIssueInput) {
    return prisma.$transaction(async (tx) => {
      const category = await tx.issueCategory.findUnique({
        where: { id: input.categoryId },
        select: { id: true, slaHours: true, department: true },
      });
      if (!category) {
        throw Object.assign(new Error("Invalid categoryId"), { statusCode: 400 });
      }

      const wardId = await findWardIdByLatLng(input.latitude, input.longitude);

      const ticketNumber = await nextTicketNumber(tx);
      const now = new Date();
      const slaTargetAt = category.slaHours ? new Date(now.getTime() + category.slaHours * 60 * 60 * 1000) : null;

      const assigneeId = await pickAssigneeId({
        wardId,
        department: category.department ?? null,
      });

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

          wardId: wardId ?? undefined,

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
          assignee: { select: { id: true, fullName: true, role: true, department: true } },
        },
      });

      return issue;
    });
  }

  static async listIssues(input: ListIssuesInput) {
    const skip = (input.page - 1) * input.pageSize;

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

    const [items, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: input.pageSize,
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
          createdAt: true,
          updatedAt: true,
          category: { select: { id: true, name: true, slug: true, department: true } },
          ward: { select: { id: true, wardNumber: true, name: true, zone: { select: { id: true, name: true, code: true } } } },
          reporter: { select: { id: true, fullName: true, role: true } },
          assignee: { select: { id: true, fullName: true, role: true, department: true } },
          media: { select: { id: true, type: true, url: true, createdAt: true } },
        },
      }),
      prisma.issue.count({ where }),
    ]);

    return {
      items,
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.ceil(total / input.pageSize),
    };
  }

  static async getIssueById(issueId: string) {
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

    if (!issue) throw Object.assign(new Error("Issue not found"), { statusCode: 404 });
    return issue;
  }

   static async addAfterMediaIssue(args: {
    issueId: string;
    userId: string;
    userRole: string;
    media: Array<{ url: string; mimeType?: string; fileSize?: number }>;
    markResolved: boolean;
  }) {
    return prisma.$transaction(async (tx) => {
      const issue = await tx.issue.findFirst({
        where: { id: args.issueId, deletedAt: null },
        select: { id: true, status: true, assigneeId: true },
      });

      if (!issue) throw Object.assign(new Error("Issue not found"), { statusCode: 404 });

      // Field worker must be the assignee (admins/engineers can bypass if you want)
      const canBypass =
        args.userRole === "SUPER_ADMIN" || args.userRole === "WARD_ENGINEER" || args.userRole === "ZONE_OFFICER";

      if (!canBypass && issue.assigneeId !== args.userId) {
        throw Object.assign(new Error("Not allowed to update this issue"), { statusCode: 403 });
      }

      // If marking resolved, ensure it's in a workable state
      if (args.markResolved) {
        const allowed = issue.status === "ASSIGNED" || issue.status === "IN_PROGRESS";
        if (!allowed) {
          throw Object.assign(
            new Error(`Cannot resolve issue from status: ${issue.status}`),
            { statusCode: 400 }
          );
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

      return updated;
    });
  }
}