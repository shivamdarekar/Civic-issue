import Dexie, { Table } from 'dexie';

export interface CivicIssue {
  id?: number;
  type: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
    address?: string;
  };
  ward?: string;
  photos: string[];
  timestamp: Date;
  reportedBy: string;
  status: 'draft' | 'pending_sync' | 'synced' | 'in_progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  aiSuggestion?: string;
  assignedTo?: string;
  resolvedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface Ward {
  id: number;
  name: string;
  boundaries: number[][];
  engineer: string;
  zone: string;
  population?: number;
  area?: number;
}

export interface Employee {
  id: string;
  name: string;
  role: 'FIELD_WORKER' | 'WARD_ENGINEER' | 'ZONE_OFFICER' | 'SUPER_ADMIN';
  ward?: string;
  zone?: string;
  phone: string;
  email?: string;
}

class CiviSenseDB extends Dexie {
  issues!: Table<CivicIssue>;
  wards!: Table<Ward>;
  employees!: Table<Employee>;

  constructor() {
    super('VMC_CiviSenseDB');
    this.version(2).stores({
      issues: '++id, type, timestamp, status, ward, reportedBy, priority',
      wards: '++id, name, zone, engineer',
      employees: 'id, role, ward, zone'
    });
  }
}

export const db = new CiviSenseDB();

export const offlineStorage = {
  async saveIssue(issue: Omit<CivicIssue, 'id'>): Promise<number> {
    return await db.issues.add({
      ...issue,
      timestamp: new Date()
    });
  },

  async getPendingIssues(): Promise<CivicIssue[]> {
    return await db.issues.where('status').equals('pending_sync').toArray();
  },

  async getDraftIssues(): Promise<CivicIssue[]> {
    return await db.issues.where('status').equals('draft').toArray();
  },

  async getIssuesByWard(ward: string): Promise<CivicIssue[]> {
    return await db.issues.where('ward').equals(ward).toArray();
  },

  async getIssuesByEmployee(employeeId: string): Promise<CivicIssue[]> {
    return await db.issues.where('reportedBy').equals(employeeId).toArray();
  },

  async updateIssueStatus(id: number, status: CivicIssue['status'], updatedBy?: string): Promise<void> {
    const updates: Partial<CivicIssue> = { status };
    if (status === 'resolved') {
      updates.resolvedAt = new Date();
      updates.verifiedBy = updatedBy;
    }
    await db.issues.update(id, updates);
  },

  async rejectIssue(id: number, reason: string, rejectedBy: string): Promise<void> {
    await db.issues.update(id, {
      status: 'rejected',
      rejectionReason: reason,
      verifiedBy: rejectedBy
    });
  },

  async deleteSyncedIssues(): Promise<void> {
    await db.issues.where('status').equals('synced').delete();
  },

  async getWardByLocation(lat: number, lng: number): Promise<Ward | null> {
    const wards = await db.wards.toArray();
    
    for (const ward of wards) {
      if (this.isPointInPolygon(lat, lng, ward.boundaries)) {
        return ward;
      }
    }
    
    // Fallback: find nearest ward
    let nearestWard = null;
    let minDistance = Infinity;
    
    for (const ward of wards) {
      const centerLat = ward.boundaries.reduce((sum, point) => sum + point[0], 0) / ward.boundaries.length;
      const centerLng = ward.boundaries.reduce((sum, point) => sum + point[1], 0) / ward.boundaries.length;
      const distance = Math.sqrt(Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2));
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestWard = ward;
      }
    }
    
    return nearestWard;
  },

  isPointInPolygon(lat: number, lng: number, polygon: number[][]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i][1] > lng) !== (polygon[j][1] > lng)) &&
          (lat < (polygon[j][0] - polygon[i][0]) * (lng - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0])) {
        inside = !inside;
      }
    }
    return inside;
  },

  async initializeWards(): Promise<void> {
    const wardCount = await db.wards.count();
    if (wardCount === 0) {
      const vadodaraWards: Ward[] = [
        {
          id: 1, name: "Ward 1 - Alkapuri", zone: "Zone A", engineer: "Eng. R.K. Patel",
          boundaries: [[22.3072, 73.1812], [22.3100, 73.1850], [22.3050, 73.1900], [22.3020, 73.1860]],
          population: 45000, area: 12.5
        },
        {
          id: 2, name: "Ward 2 - Fatehgunj", zone: "Zone A", engineer: "Eng. S.M. Shah",
          boundaries: [[22.3100, 73.1850], [22.3150, 73.1900], [22.3120, 73.1950], [22.3080, 73.1920]],
          population: 52000, area: 15.2
        },
        {
          id: 3, name: "Ward 3 - Sayajigunj", zone: "Zone B", engineer: "Eng. P.J. Desai",
          boundaries: [[22.3150, 73.1900], [22.3200, 73.1950], [22.3170, 73.2000], [22.3130, 73.1970]],
          population: 38000, area: 10.8
        },
        {
          id: 4, name: "Ward 4 - Karelibaug", zone: "Zone B", engineer: "Eng. M.K. Joshi",
          boundaries: [[22.2950, 73.1750], [22.3000, 73.1800], [22.2970, 73.1850], [22.2920, 73.1800]],
          population: 41000, area: 11.3
        },
        {
          id: 5, name: "Ward 5 - Manjalpur", zone: "Zone C", engineer: "Eng. A.B. Rao",
          boundaries: [[22.2800, 73.1600], [22.2850, 73.1650], [22.2820, 73.1700], [22.2770, 73.1650]],
          population: 35000, area: 9.7
        }
      ];
      
      await db.wards.bulkAdd(vadodaraWards);
    }
  },

  async initializeEmployees(): Promise<void> {
    const empCount = await db.employees.count();
    if (empCount === 0) {
      const employees: Employee[] = [
        { id: 'FW001', name: 'Rajesh Kumar', role: 'FIELD_WORKER', ward: 'Ward 1 - Alkapuri', zone: 'Zone A', phone: '9876543210' },
        { id: 'FW002', name: 'Priya Sharma', role: 'FIELD_WORKER', ward: 'Ward 2 - Fatehgunj', zone: 'Zone A', phone: '9876543211' },
        { id: 'WE001', name: 'R.K. Patel', role: 'WARD_ENGINEER', ward: 'Ward 1 - Alkapuri', zone: 'Zone A', phone: '9876543220' },
        { id: 'WE002', name: 'S.M. Shah', role: 'WARD_ENGINEER', ward: 'Ward 2 - Fatehgunj', zone: 'Zone A', phone: '9876543221' },
        { id: 'ZO001', name: 'Dr. A.K. Mehta', role: 'ZONE_OFFICER', zone: 'Zone A', phone: '9876543230' },
        { id: 'ADM001', name: 'Shri K.L. Verma', role: 'SUPER_ADMIN', phone: '9876543240' }
      ];
      
      await db.employees.bulkAdd(employees);
    }
  },

  async getEmployee(id: string): Promise<Employee | undefined> {
    return await db.employees.get(id);
  },

  async getStatistics() {
    const totalIssues = await db.issues.count();
    const pendingIssues = await db.issues.where('status').equals('pending_sync').count();
    const resolvedIssues = await db.issues.where('status').equals('resolved').count();
    const inProgressIssues = await db.issues.where('status').equals('in_progress').count();
    
    return {
      total: totalIssues,
      pending: pendingIssues,
      resolved: resolvedIssues,
      inProgress: inProgressIssues,
      resolutionRate: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0
    };
  }
};