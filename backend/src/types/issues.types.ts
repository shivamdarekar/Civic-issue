import { Prisma, type Department, type IssueStatus, type Priority } from "@prisma/client";

export type CreateIssueInput = {
  reporterId: string;
  categoryId: string;
  description?: string;
  priority?: Priority;
  metaData?: Prisma.InputJsonValue;
  aiTags?: string[];
  latitude: number;
  longitude: number;
  address?: string;
  eloc?: string;
  media?: Array<{ type: "BEFORE" | "AFTER"; url: string; mimeType?: string; fileSize?: number }>;
};

export type ListIssuesInput = {
  page: number;
  pageSize: number;
  status?: IssueStatus;
  priority?: Priority;
  wardId?: string;
  zoneId?: string;
  categoryId?: string;
  reporterId?: string;
  assigneeId?: string;
  department?: Department;
  q?: string;
};