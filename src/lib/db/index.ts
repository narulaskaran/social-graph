import { MockDatabase } from "./mock";
import { PrismaDatabase } from "./prisma";
import { SQLiteDatabase } from "./sqlite";
import type { Database } from "./types";

let dbInstance: Database | null = null;

export function getDatabase(): Database {
  if (!dbInstance) {
    if (process.env.NODE_ENV === "test") {
      console.log("Using MockDatabase in test environment");
      dbInstance = new MockDatabase();
    } else if (process.env.NODE_ENV === "development") {
      console.log("Using SQLiteDatabase in development environment");
      dbInstance = new SQLiteDatabase();
    } else {
      console.log("Using PrismaDatabase in production environment");
      dbInstance = new PrismaDatabase();
    }
  }
  return dbInstance;
}

// For testing purposes - allows resetting the database instance
export function resetDatabaseInstance(): void {
  if (dbInstance) {
    dbInstance.clearDatabase();
  }
}

// Export types for convenience
export type { Database, Profile, Connection } from "./types";
