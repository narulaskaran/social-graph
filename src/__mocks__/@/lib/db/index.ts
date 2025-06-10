/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Database, Profile, Connection } from "@/lib/db/types";

// Create in-memory database for testing
const profiles: Map<string, Profile> = new Map();
const connections: Connection[] = [];

// Define mock implementation
const mockDb: any = {
  // Profile operations
  upsertProfile: async (profile: Profile) => {
    profiles.set(profile.linkedin_username, { ...profile });
    return Promise.resolve();
  },

  upsertProfiles: async (newProfiles: Profile[]) => {
    for (const profile of newProfiles) {
      profiles.set(profile.linkedin_username, { ...profile });
    }
    return Promise.resolve();
  },

  getProfile: async (linkedin_username: string) => {
    const profile = profiles.get(linkedin_username);
    return Promise.resolve(profile ? { ...profile } : null);
  },

  getProfiles: async () => {
    return Promise.resolve(Array.from(profiles.values()));
  },

  // Connection operations
  upsertConnection: async (connection: Connection) => {
    const [a, b] = [connection.profile_a, connection.profile_b].sort();
    const existingConnection = connections.find(
      (c) => c.profile_a === a && c.profile_b === b
    );

    if (!existingConnection) {
      connections.push({ profile_a: a, profile_b: b });
    }
    return Promise.resolve();
  },

  upsertConnections: async (newConnections: Connection[]) => {
    for (const connection of newConnections) {
      const [a, b] = [connection.profile_a, connection.profile_b].sort();
      const existingConnection = connections.find(
        (c) => c.profile_a === a && c.profile_b === b
      );

      if (!existingConnection) {
        connections.push({ profile_a: a, profile_b: b });
      }
    }
    return Promise.resolve();
  },

  getConnections: async () => {
    return Promise.resolve([...connections]);
  },

  deleteConnection: async (connection: Connection) => {
    const [a, b] = [connection.profile_a, connection.profile_b].sort();
    const index = connections.findIndex(
      (c) => c.profile_a === a && c.profile_b === b
    );

    if (index !== -1) {
      connections.splice(index, 1);
    }
    return Promise.resolve();
  },

  clearDatabase: async () => {
    profiles.clear();
    connections.length = 0;
    return Promise.resolve();
  },
};

// Add Jest spies to all methods
for (const method of Object.keys(mockDb)) {
  jest.spyOn(mockDb, method);
}

export function getDatabase(): Database {
  return mockDb;
}

export function resetDatabaseInstance(): void {
  profiles.clear();
  connections.length = 0;

  // Clear all spies
  for (const method of Object.keys(mockDb)) {
    (mockDb[method] as jest.SpyInstance).mockClear();
  }
}

export type { Database, Profile, Connection };
