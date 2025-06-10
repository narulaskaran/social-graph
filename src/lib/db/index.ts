import { PrismaDatabase } from "./prisma";
import { SQLiteDatabase } from "./sqlite";
import type { Database } from "./types";

let dbInstance: Database | null = null;

export function getDatabase(): Database {
  if (!dbInstance) {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test"
    ) {
      console.log(
        `Using SQLiteDatabase in ${process.env.NODE_ENV} environment`
      );
      dbInstance = new SQLiteDatabase();
    } else {
      console.log(
        `Using PrismaDatabase in ${process.env.NODE_ENV} environment`
      );
      dbInstance = new PrismaDatabase();
    }
  }
  return dbInstance;
}

// For testing purposes - allows resetting the database instance
export function resetDatabaseInstance(): void {
  dbInstance = null;
}

// Export types for convenience
export type { Database, Profile, Connection } from "./types";
