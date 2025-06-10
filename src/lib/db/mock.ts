import type { Database, Profile, Connection } from "@/lib/db/types";

export class MockDatabase implements Database {
  private profiles: Profile[] = [];
  private connections: Connection[] = [];

  async upsertProfile(profile: Profile): Promise<void> {
    const index = this.profiles.findIndex(
      (p) => p.linkedin_username === profile.linkedin_username
    );
    if (index !== -1) {
      this.profiles[index] = profile;
    } else {
      this.profiles.push(profile);
    }
  }

  async upsertProfiles(profiles: Profile[]): Promise<void> {
    for (const profile of profiles) {
      await this.upsertProfile(profile);
    }
  }

  async getProfile(linkedin_username: string): Promise<Profile | null> {
    return (
      this.profiles.find((p) => p.linkedin_username === linkedin_username) ||
      null
    );
  }

  async getProfiles(): Promise<Profile[]> {
    return [...this.profiles];
  }

  async upsertConnection(connection: Connection): Promise<void> {
    const [a, b] = [connection.profile_a, connection.profile_b].sort();
    const existing = this.connections.find(
      (c) => c.profile_a === a && c.profile_b === b
    );
    if (!existing) {
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
      (c) => c.profile_a !== a || c.profile_b !== b
    );
  }

  async createAllPairwiseConnections(): Promise<void> {
    const usernames = this.profiles.map((p) => p.linkedin_username);
    for (let i = 0; i < usernames.length; i++) {
      for (let j = i + 1; j < usernames.length; j++) {
        await this.upsertConnection({
          profile_a: usernames[i],
          profile_b: usernames[j],
        });
      }
    }
  }

  async clearDatabase(): Promise<void> {
    this.profiles = [];
    this.connections = [];
  }
}
