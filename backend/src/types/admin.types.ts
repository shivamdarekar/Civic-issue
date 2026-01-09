export interface DashboardPayload {
  totalIssues: number;
  open: number;
  inProgress: number;
  slaBreached: number;
  avgSlaTimeHours: number;        
  resolutionRatePercent: number;  
}

export interface ZoneOverview {
  zoneId: string;              
  name: string;
  totalIssues: number;         
  slaCompliance: number;       
  zoneOfficer: string | null;  
}

export interface ZoneDetail {
  zoneName: string;
  zoneOfficer: string | null;
  totalWards: number;
  totalIssues: number;
  slaCompliance: number; 
}

export interface WardOverview {
  wardId: string;
  wardNumber: number;
  name: string;
  open: number;
  inProgress: number;
  slaBreached: number;
  totalIssues: number;      
  engineer: string | null;
}

export interface WardEngineer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
}

export interface WardIssueItem {
  id: string;
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "VERIFIED" | "REOPENED" | "REJECTED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | null;
  categoryName: string | null;
  createdAt: string;     // ISO
  resolvedAt: string | null;   // ISO
  slaTargetAt: string | null;  // ISO
  priorityWeight: number;
  hasBeforeImage: boolean;
  hasAfterImage: boolean;
}

export interface WardDetailPayload {
  wardNumber: number;
  wardName: string;
  zoneName: string;

  // Engineers
  engineers: WardEngineer[];
  totalEngineers: number;

  // Issue summary
  totalIssues: number;
  open: number;
  inProgress: number;
  assigned: number;
  resolved: number;
  verified: number;
  reopened: number;
  rejected: number;
  slaBreached: number;
  slaCompliance: number; // 0–100; 100 when no issues

  // Priority distribution
  priorities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  // Aging (open/active issues)
  avgOpenDays: number;    // rounded to 2 decimals
  oldestOpenDays: number; // integer days

  // Issues list (top 50 by priority then recency)
  issues: WardIssueItem[];
}  

export type WardIssueStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "VERIFIED"
  | "REOPENED"
  | "REJECTED";

export type WardIssuePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface WardIssueFilters {
  status?: WardIssueStatus;
  priority?: WardIssuePriority;
  categoryId?: string; // UUID
}

export interface WardIssueListItem {
  id: string;
  ticketNumber: string | null;
  status: WardIssueStatus;
  priority: WardIssuePriority | null;
  category: string | null;
  assignee: string | null;
  slaBreached: boolean;
  updatedAt: string; // ISO string
}