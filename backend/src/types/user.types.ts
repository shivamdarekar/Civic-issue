import type { Department, IssueStatus, Priority } from "@prisma/client";

export type DashboardIssueListItem = {
  id: string;
  ticketNumber: string | null;
  status: IssueStatus;
  priority: Priority | null;
  createdAt: Date;
};

export type FieldWorkerDashboardPayload = {
  totalIssuesCreated: number;
  issuesByStatus: Partial<Record<IssueStatus, number>>;
  recentIssues: DashboardIssueListItem[];
};

export type WardEngineerDashboardPayload = {
  wardId: string;
  department: Department;

  totalIssues: number;
  issuesByStatus: Partial<Record<IssueStatus, number>>;
  issuesByPriority: Partial<Record<Priority, number>>;

  sla: {
    withinSla: number;
    breachedSla: number;
  };

  /**
   * Average time (in hours) between assignedAt and resolvedAt for recent resolved issues.
   * Null when no resolved issues exist with both timestamps.
   */
  averageResolutionTimeHours: number | null;
};

export type AssignedIssuesDashboardPayload = {
  totalAssigned: number;
  issuesByStatus: Partial<Record<IssueStatus, number>>;
  issuesByPriority: Partial<Record<Priority, number>>;
  assignedIssues: DashboardIssueListItem[];
};
