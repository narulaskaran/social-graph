import type { Database, Profile, Connection } from "./types";

export class MockDatabase implements Database {
  private profiles: Map<string, Profile> = new Map();
  private connections: Connection[] = [];

  async upsertProfile(profile: Profile): Promise<void> {
    this.profiles.set(profile.linkedin_username, { ...profile });
  }

  async upsertProfiles(profiles: Profile[]): Promise<void> {
    for (const profile of profiles) {
      await this.upsertProfile(profile);
    }
  }

  async getProfile(linkedin_username: string): Promise<Profile | null> {
    const profile = this.profiles.get(linkedin_username);
    return profile ? { ...profile } : null;
  }

  async getProfiles(): Promise<Profile[]> {
    return Array.from(this.profiles.values()).map((profile) => ({
      ...profile,
    }));
  }

  async upsertConnection(connection: Connection): Promise<void> {
    const [a, b] = [connection.profile_a, connection.profile_b].sort();
    const existingConnection = this.connections.find(
      (c) =>
        (c.profile_a === a && c.profile_b === b) ||
        (c.profile_a === b && c.profile_b === a)
    );

    if (!existingConnection) {
      this.connections.push({ profile_a: a, profile_b: b });
    }
  }

  async upsertConnections(connections: Connection[]): Promise<void> {
    for (const connection of connections) {
      await this.upsertConnection(connection);
    }
  }

  async getConnections(): Promise<Connection[]> {
    return [...this.connections];
  }

  async deleteConnection(connection: Connection): Promise<void> {
    const [a, b] = [connection.profile_a, connection.profile_b].sort();
    this.connections = this.connections.filter(
      (c) => !(c.profile_a === a && c.profile_b === b)
    );
  }

  async clearDatabase(): Promise<void> {
    this.profiles.clear();
    this.connections = [];
  }
}
