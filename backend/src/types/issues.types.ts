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

// Update Issue Status
export type UpdateIssueStatusInput = {
  issueId: string;
  userId: string;
  newStatus: IssueStatus;
  comment?: string;
};

// Add Comment
export type AddCommentInput = {
  issueId: string;
  userId: string;
  comment: string;
};

// Reassign Issue
export type ReassignIssueInput = {
  issueId: string;
  reassignedBy: string;
  newAssigneeId: string;
  reason?: string;
};

// Verify Resolution
export type VerifyResolutionInput = {
  issueId: string;
  verifiedBy: string;
  approved: boolean;
  comment?: string;
};

// Add After Media
export type AddAfterMediaInput = {
  issueId: string;
  userId: string;
  userRole: string;
  media: Array<{ url: string; mimeType?: string; fileSize?: number }>;
  markResolved: boolean;
};