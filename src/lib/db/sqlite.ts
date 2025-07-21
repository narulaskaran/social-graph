import { createGraphId } from "../../utils/graphId";
import type { Database, Profile, Connection, Graph } from "./types";
import SQLiteDB from "better-sqlite3";

interface SQLiteRunResult {
  changes: number;
  lastInsertRowid: number;
}

interface SQLiteGraphResult {
  id: string;
  created_at: string;
  updated_at: string;
}

export class SQLiteDatabase implements Database {
  private db: SQLiteDB.Database;

  constructor(dbPath: string = "prisma/dev.db") {
    this.db = new SQLiteDB(dbPath);
    this.setupDatabase();
  }

  private setupDatabase() {
    // Create tables if they don't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS graphs (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        graph_id TEXT NOT NULL,
        UNIQUE (first_name, last_name, graph_id),
        FOREIGN KEY (graph_id) REFERENCES graphs(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS connections (
        profile_a_id TEXT NOT NULL,
        profile_b_id TEXT NOT NULL,
        graph_id TEXT NOT NULL,
        PRIMARY KEY (profile_a_id, profile_b_id, graph_id),
        FOREIGN KEY (profile_a_id) REFERENCES profiles(id),
        FOREIGN KEY (profile_b_id) REFERENCES profiles(id),
        FOREIGN KEY (graph_id) REFERENCES graphs(id) ON DELETE CASCADE
      );
    `);
  }

  async createGraph(): Promise<Graph> {
    const id = createGraphId();
    const now = new Date();
    const stmt = this.db.prepare(`
      INSERT INTO graphs (id, created_at, updated_at)
      VALUES (?, ?, ?)
    `);
    stmt.run(id, now.toISOString(), now.toISOString());

    return {
      id,
      created_at: now,
      updated_at: now,
    };
  }

  async getGraph(id: string): Promise<Graph | null> {
    const stmt = this.db.prepare(`
      SELECT id, created_at, updated_at
      FROM graphs
      WHERE id = ?
    `);
    const result = stmt.get(id) as SQLiteGraphResult | undefined;
    if (!result) return null;

    return {
      id: result.id,
      created_at: new Date(result.created_at),
      updated_at: new Date(result.updated_at),
    };
  }

  async deleteGraph(id: string): Promise<void> {
    const stmt = this.db.prepare(`
      DELETE FROM graphs WHERE id = ?
    `);
    stmt.run(id);
  }

  async upsertProfile(profile: Profile): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO profiles (id, first_name, last_name, graph_id)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(first_name, last_name, graph_id) DO UPDATE SET
        id = excluded.id
    `);

    const result = stmt.run(
      profile.id,
      profile.first_name,
      profile.last_name,
      profile.graph_id
    ) as SQLiteRunResult;

    if (result.changes === 0) {
      throw new Error("Failed to upsert profile");
    }
  }

  async upsertProfiles(profiles: Profile[]): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO profiles (id, first_name, last_name, graph_id)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        graph_id = excluded.graph_id
    `);

    const transaction = this.db.transaction((profiles: Profile[]) => {
      for (const profile of profiles) {
        stmt.run(
          profile.id,
          profile.first_name,
          profile.last_name,
          profile.graph_id
        );
      }
    });

    transaction(profiles);
  }

  async getProfile(id: string): Promise<Profile | null> {
    const stmt = this.db.prepare(
      "SELECT id, first_name, last_name, graph_id FROM profiles WHERE id = ?"
    );
    const profile = stmt.get(id) as Profile | undefined;
    return profile || null;
  }

  async getProfiles(graph_id?: string): Promise<Profile[]> {
    if (graph_id) {
      const stmt = this.db.prepare(`
        SELECT id, first_name, last_name, graph_id
        FROM profiles
        WHERE graph_id = ?
      `);
      return stmt.all(graph_id) as Profile[];
    }

    const stmt = this.db.prepare(`
      SELECT id, first_name, last_name, graph_id
      FROM profiles
    `);
    return stmt.all() as Profile[];
  }

  async upsertConnection(connection: Connection): Promise<void> {
    const [a, b] = [connection.profile_a_id, connection.profile_b_id].sort();
    const stmt = this.db.prepare(`
      INSERT INTO connections (profile_a_id, profile_b_id, graph_id)
      VALUES (?, ?, ?)
      ON CONFLICT(profile_a_id, profile_b_id, graph_id) DO NOTHING
    `);
    stmt.run(a, b, connection.graph_id);
  }

  async upsertConnections(connections: Connection[]): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO connections (profile_a_id, profile_b_id, graph_id)
      VALUES (?, ?, ?)
      ON CONFLICT(profile_a_id, profile_b_id, graph_id) DO NOTHING
    `);

    const transaction = this.db.transaction((connections: Connection[]) => {
      for (const connection of connections) {
        const [a, b] = [
          connection.profile_a_id,
          connection.profile_b_id,
        ].sort();
        stmt.run(a, b, connection.graph_id);
      }
    });

    transaction(connections);
  }

  async getConnections(graph_id?: string): Promise<Connection[]> {
    if (graph_id) {
      const stmt = this.db.prepare(`
        SELECT profile_a_id, profile_b_id, graph_id
        FROM connections
        WHERE graph_id = ?
      `);
      return stmt.all(graph_id) as Connection[];
    }

    const stmt = this.db.prepare(`
      SELECT profile_a_id, profile_b_id, graph_id
      FROM connections
    `);
    return stmt.all() as Connection[];
  }

  async deleteConnection(
    profile_a_id: string,
    profile_b_id: string,
    graph_id: string
  ): Promise<void> {
    const [a, b] = [profile_a_id, profile_b_id].sort();
    const stmt = this.db.prepare(`
      DELETE FROM connections
      WHERE ((profile_a_id = ? AND profile_b_id = ?) OR (profile_a_id = ? AND profile_b_id = ?))
      AND graph_id = ?
    `);
    stmt.run(a, b, b, a, graph_id);
  }

  async clearDatabase(): Promise<void> {
    this.db.exec(`
      DELETE FROM connections;
      DELETE FROM profiles;
      DELETE FROM graphs;
    `);
  }
}
