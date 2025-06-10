import type { Database, Profile, Connection } from "./types";

/**
 * A mock database implementation for tests that uses in-memory storage
 * and supports jest spying.
 */
export class TestDatabase implements Database {
  private profiles: Map<string, Profile> = new Map();
  private connections: Connection[] = [];

  // Create spies for all methods
  public readonly upsertProfile = jest.fn((profile: Profile) => {
    this.profiles.set(profile.linkedin_username, { ...profile });
    return Promise.resolve();
  });

  public readonly upsertProfiles = jest.fn((profiles: Profile[]) => {
    for (const profile of profiles) {
      this.profiles.set(profile.linkedin_username, { ...profile });
    }
    return Promise.resolve();
  });

  public readonly getProfile = jest.fn((linkedin_username: string) => {
    const profile = this.profiles.get(linkedin_username);
    return Promise.resolve(profile ? { ...profile } : null);
  });

  public readonly getProfiles = jest.fn(() => {
    return Promise.resolve(
      Array.from(this.profiles.values()).map((profile) => ({ ...profile }))
    );
  });

  public readonly upsertConnection = jest.fn((connection: Connection) => {
    const [a, b] = [connection.profile_a, connection.profile_b].sort();
    const existingConnection = this.connections.find(
      (c) =>
        (c.profile_a === a && c.profile_b === b) ||
        (c.profile_a === b && c.profile_b === a)
    );

    if (!existingConnection) {
      this.connections.push({ profile_a: a, profile_b: b });
    }
    return Promise.resolve();
  });

  public readonly upsertConnections = jest.fn((connections: Connection[]) => {
    for (const connection of connections) {
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
    return Promise.resolve();
  });

  public readonly getConnections = jest.fn(() => {
    return Promise.resolve([...this.connections]);
  });

  public readonly deleteConnection = jest.fn((connection: Connection) => {
    const [a, b] = [connection.profile_a, connection.profile_b].sort();
    this.connections = this.connections.filter(
      (c) => !(c.profile_a === a && c.profile_b === b)
    );
    return Promise.resolve();
  });

  public readonly clearDatabase = jest.fn(() => {
    this.profiles.clear();
    this.connections = [];
    return Promise.resolve();
  });

  /**
   * Reset all spy tracking, but keep data intact
   */
  public resetMocks() {
    Object.values(this).forEach((value) => {
      if (typeof value === "function" && "mockClear" in value) {
        value.mockClear();
      }
    });
  }

  /**
   * Reset all data and spy tracking
   */
  public reset() {
    this.profiles.clear();
    this.connections = [];
    this.resetMocks();
  }
}
