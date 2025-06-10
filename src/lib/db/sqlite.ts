import type { Database, Profile, Connection } from "./types";
import SQLiteDB from "better-sqlite3";

export class SQLiteDatabase implements Database {
  private db: SQLiteDB.Database;

  constructor(dbPath: string = "prisma/dev.db") {
    this.db = new SQLiteDB(dbPath);
    this.setupDatabase();
  }

  private setupDatabase() {
    // Create tables if they don't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS Profile (
        linkedin_username TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS Connections (
        profile_a TEXT NOT NULL,
        profile_b TEXT NOT NULL,
        PRIMARY KEY (profile_a, profile_b),
        FOREIGN KEY (profile_a) REFERENCES Profile(linkedin_username),
        FOREIGN KEY (profile_b) REFERENCES Profile(linkedin_username)
      );
    `);
  }

  async upsertProfile(profile: Profile): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO Profile (linkedin_username, first_name, last_name)
      VALUES (?, ?, ?)
      ON CONFLICT(linkedin_username) DO UPDATE SET
        first_name = excluded.first_name,
        last_name = excluded.last_name
    `);
    stmt.run(profile.linkedin_username, profile.first_name, profile.last_name);
  }

  async upsertProfiles(profiles: Profile[]): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO Profile (linkedin_username, first_name, last_name)
      VALUES (?, ?, ?)
      ON CONFLICT(linkedin_username) DO UPDATE SET
        first_name = excluded.first_name,
        last_name = excluded.last_name
    `);

    const transaction = this.db.transaction((profiles: Profile[]) => {
      for (const profile of profiles) {
        stmt.run(
          profile.linkedin_username,
          profile.first_name,
          profile.last_name
        );
      }
    });

    transaction(profiles);
  }

  async getProfile(linkedin_username: string): Promise<Profile | null> {
    const stmt = this.db.prepare(`
      SELECT linkedin_username, first_name, last_name
      FROM Profile
      WHERE linkedin_username = ?
    `);
    return stmt.get(linkedin_username) as Profile | null;
  }

  async getProfiles(): Promise<Profile[]> {
    const stmt = this.db.prepare(`
      SELECT linkedin_username, first_name, last_name
      FROM Profile
    `);
    return stmt.all() as Profile[];
  }

  async upsertConnection(connection: Connection): Promise<void> {
    const [a, b] = [connection.profile_a, connection.profile_b].sort();
    const stmt = this.db.prepare(`
      INSERT INTO Connections (profile_a, profile_b)
      VALUES (?, ?)
      ON CONFLICT(profile_a, profile_b) DO NOTHING
    `);
    stmt.run(a, b);
  }

  async upsertConnections(connections: Connection[]): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO Connections (profile_a, profile_b)
      VALUES (?, ?)
      ON CONFLICT(profile_a, profile_b) DO NOTHING
    `);

    const transaction = this.db.transaction((connections: Connection[]) => {
      for (const connection of connections) {
        const [a, b] = [connection.profile_a, connection.profile_b].sort();
        stmt.run(a, b);
      }
    });

    transaction(connections);
  }

  async getConnections(): Promise<Connection[]> {
    const stmt = this.db.prepare(`
      SELECT profile_a, profile_b
      FROM Connections
    `);
    return stmt.all() as Connection[];
  }

  async deleteConnection(connection: Connection): Promise<void> {
    const [a, b] = [connection.profile_a, connection.profile_b].sort();
    const stmt = this.db.prepare(`
      DELETE FROM Connections
      WHERE profile_a = ? AND profile_b = ?
    `);
    stmt.run(a, b);
  }

  async clearDatabase(): Promise<void> {
    this.db.exec(`
      DELETE FROM Connections;
      DELETE FROM Profile;
    `);
  }
}
