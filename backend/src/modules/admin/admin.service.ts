import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import {DashboardPayload,ZoneOverview,ZoneDetail,WardOverview,WardDetailPayload,WardIssueListItem,WardIssueFilters} from "../../types/admin.types";

export class AdminService {
  // Fetch dashboard overview statistics 
  static async getDashboard() {
    const rows = await prisma.$queryRaw<DashboardPayload[]>`
      SELECT
        COALESCE(COUNT(*) FILTER (WHERE "deletedAt" IS NULL), 0) AS "totalIssues",
        COALESCE(COUNT(*) FILTER (WHERE "status" = 'OPEN' AND "deletedAt" IS NULL), 0) AS "open",
        COALESCE(COUNT(*) FILTER (WHERE "status" = 'IN_PROGRESS' AND "deletedAt" IS NULL), 0) AS "inProgress",
        COALESCE(COUNT(*) FILTER (
          WHERE "deletedAt" IS NULL
            AND "resolvedAt" IS NULL
            AND "slaTargetAt" < NOW()
        ), 0) AS "slaBreached",
        COALESCE(
          ROUND(
            AVG(
              CASE
                WHEN "slaTargetAt" IS NOT NULL
                THEN EXTRACT(EPOCH FROM ("slaTargetAt" - "createdAt")) / 3600
                ELSE NULL
              END
            )::numeric
          , 2)
        , 0) AS "avgSlaTimeHours",
        COALESCE(
          ROUND(
            100 * (COUNT(*) FILTER (WHERE "resolvedAt" IS NOT NULL AND "deletedAt" IS NULL))::numeric
            / NULLIF(COUNT(*) FILTER (WHERE "deletedAt" IS NULL), 0)
          , 2)
        , 0) AS "resolutionRatePercent"
      FROM "Issue";
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
                WHERE i."resolvedAt" IS NOT NULL
                  AND i."slaTargetAt" IS NOT NULL
                  AND i."resolvedAt" <= i."slaTargetAt"
              ))::numeric
            / NULLIF(COUNT(i.*), 0)
          )::int
        END AS "slaCompliance",
        (
          SELECT u."fullName"
          FROM "User" u
          WHERE u."zoneId" = z."id" AND u."role" = 'ZONE_OFFICER'
          ORDER BY u."id"
          LIMIT 1
        ) AS "zoneOfficer"
      FROM "Zone" z
      LEFT JOIN "Ward" w ON w."zoneId" = z."id"
      LEFT JOIN "Issue" i ON i."wardId" = w."id" AND i."deletedAt" IS NULL
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
          SELECT u."fullName"
          FROM "User" u
          WHERE u."zoneId" = z."id" AND u."role" = 'ZONE_OFFICER'
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
                WHERE i."resolvedAt" IS NOT NULL
                  AND i."slaTargetAt" IS NOT NULL
                  AND i."resolvedAt" <= i."slaTargetAt"
              ))::numeric
            / NULLIF(COUNT(i.*), 0)
          )::int
        END AS "slaCompliance"
      FROM "Zone" z
      LEFT JOIN "Ward" w ON w."zoneId" = z."id"
      LEFT JOIN "Issue" i ON i."wardId" = w."id" AND i."deletedAt" IS NULL
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

        -- Engineers as JSON array
        COALESCE(
          jsonb_agg(DISTINCT jsonb_build_object(
            'id', u."id",
            'fullName', u."full_name",
            'email', u."email",
            'phoneNumber', u."phone_number",
            'isActive', u."is_active"
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

        -- Aging for active issues (OPEN/ASSIGNED/IN_PROGRESS)
        COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - i."created_at")) / 86400)
          FILTER (WHERE i."status" IN ('OPEN','ASSIGNED','IN_PROGRESS') AND i."deleted_at" IS NULL)::numeric, 2), 0) AS "avgOpenDays",
        COALESCE(MAX(EXTRACT(EPOCH FROM (NOW() - i."created_at")) / 86400)
          FILTER (WHERE i."status" IN ('OPEN','ASSIGNED','IN_PROGRESS') AND i."deleted_at" IS NULL), 0) AS "oldestOpenDays",

        -- Top issues list (priority-weighted then recent), limit 50
        (
          SELECT COALESCE(jsonb_agg(x ORDER BY x."priorityWeight" DESC, x."createdAt" DESC), '[]'::jsonb)
          FROM (
            SELECT
              i2."id"                                              AS "id",
              i2."status"                                          AS "status",
              i2."priority"                                        AS "priority",
              ic."name"                                            AS "categoryName",
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
        a."full_name"                        AS "assignee",
        (i."resolved_at" IS NULL AND i."sla_target_at" IS NOT NULL AND i."sla_target_at" < NOW())
                                             AS "slaBreached",
        i."updated_at"                       AS "updatedAt"
      FROM "issues" i
      LEFT JOIN "issue_categories" ic ON ic."id" = i."category_id"
      LEFT JOIN "users" a ON a."id" = i."assigned_to_id"
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
      assignee: r.assignee ?? null,
      slaBreached: Boolean(r.slaBreached),
      updatedAt: new Date(r.updatedAt).toISOString(),
    }));
  }
}

