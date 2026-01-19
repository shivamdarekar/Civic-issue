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
export type Department =
  | "ROAD"
  | "STORM_WATER_DRAINAGE"
  | "SEWAGE_DISPOSAL"
  | "WATER_WORKS"
  | "STREET_LIGHT"
  | "BRIDGE_CELL"
  | "SOLID_WASTE_MANAGEMENT"
  | "HEALTH"
  | "TOWN_PLANNING"
  | "PARKS_GARDENS"
  | "ENCROACHMENT"
  | "FIRE"
  | "ELECTRICAL";

export interface WardEngineer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  department: Department | null; 
}

export interface WardIssueItem {
  id: string;
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "VERIFIED" | "REOPENED" | "REJECTED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | null;
  categoryName: string | null;
  department: Department | null;  
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
  department: Department | null;
  assignee: string | null;
  slaBreached: boolean;
  updatedAt: string; // ISO string
}

// User Statistics Types
export interface UserStatistics {
  user: {
    id: string;
    fullName: string;
    role: string;
    isActive: boolean;
  };
  statistics: {
    totalAssigned: number;
    activeIssues: number;
    resolvedIssues: number;
    avgResolutionDays: number;
    resolutionRate: number; // 0-100
  };
}

// Reassignment Types
export interface ReassignWorkResponse {
  message: string;
  reassignedCount: number;
  fromUser: {
    id: string;
    fullName: string;
    role: string;
  };
  toUser: {
    id: string;
    fullName: string;
    role: string;
  };
  issues: Array<{
    ticketNumber: string;
    status: string;
    priority: string;
  }>;
}

// User Filter Types
export interface UserFilterParams {
  role?: string;
  wardId?: string;
  zoneId?: string;
  isActive?: boolean;
  department?: string;
}

export interface FilteredUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department: Department | null;
  isActive: boolean;
  wardId: string | null;
  zoneId: string | null;
  ward: {
    wardNumber: number;
    name: string;
  } | null;
  zone: {
    name: string;
  } | null;
}

// User Update Types
export interface UserUpdateData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: "SUPER_ADMIN" | "ZONE_OFFICER" | "WARD_ENGINEER" | "FIELD_WORKER" | "CITIZEN";
  wardId?: string | null;
  zoneId?: string | null;
  department?: Department | null;
}

export interface UpdatedUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  department: Department | null;
  wardId: string | null;
  zoneId: string | null;
  ward: {
    wardNumber: number;
    name: string;
  } | null;
  zone: {
    name: string;
  } | null;
}

// Deactivate/Reactivate User Types
export interface UserStatusChange {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}