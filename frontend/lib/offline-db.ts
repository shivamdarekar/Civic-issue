import Dexie, { Table } from 'dexie';

export interface OfflineIssue {
  id?: number;
  tempId: string;
  title?: string; // Optional - description is the main text
  description: string;
  categoryId: string; // UUID of the category
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  images: string[]; // base64 encoded images
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: Date;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastError?: string; // Store last error message for debugging
}

export class OfflineDatabase extends Dexie {
  issues!: Table<OfflineIssue>;

  constructor() {
    super('CivicIssuesOfflineDB');
    this.version(1).stores({
      issues: '++id, tempId, syncStatus, createdAt'
    });
  }
}

export const offlineDB = new OfflineDatabase();