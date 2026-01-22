import type { Department, IssueStatus, Priority } from "@prisma/client";

export type DashboardIssueListItem = {
  id: string;
  ticketNumber: string | null;
  status: IssueStatus;
  priority: Priority | null;
  createdAt: Date;
  category?: {
    name: string;
    department: Department;
  };
  ward?: {
    wardNumber: number;
    name: string;
  };
  assignee?: {
    fullName: string;
  };
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

// Profile Management Types
export type UpdateProfileInput = {
  fullName?: string;
  phoneNumber?: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type ProfileUpdateResponse = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  department: Department | null;
  updatedAt: Date;
};

export type PasswordChangeResponse = {
  message: string;
};

// Activity Log Types
export type ActivityLogItem = {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  metadata: any;
  createdAt: Date;
};

export type ActivityLogResponse = {
  userId: string;
  activities: ActivityLogItem[];
  count: number;
};
