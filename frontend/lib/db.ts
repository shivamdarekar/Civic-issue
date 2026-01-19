import Dexie, { Table } from "dexie";

export interface OfflineIssue {
  id: string;
  data: any;
  synced: boolean;
}

class CivicDB extends Dexie {
  issues!: Table<OfflineIssue>;

  constructor() {
    super("civicDB");
    this.version(1).stores({
      issues: "id, synced",
    });
  }
}

export const civicDB = new CivicDB();
