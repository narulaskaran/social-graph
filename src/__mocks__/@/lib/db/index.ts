/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Database, Profile } from "@/lib/db/types";

const profiles = new Map<string, Profile>();
const connections = new Map<string, any>();

const mockDatabase: Database = {
  createGraph: async () => ({
    id: "test-graph",
    created_at: new Date(),
    updated_at: new Date(),
  }),
  getGraph: async () => null,
  deleteGraph: async () => {},

  upsertProfile: async (profile: Profile) => {
    profiles.set(profile.id, { ...profile });
  },

  upsertProfiles: async (profileList: Profile[]) => {
    profileList.forEach((profile) => {
      profiles.set(profile.id, { ...profile });
    });
  },

  getProfile: async (id: string) => {
    const profile = profiles.get(id);
    return profile || null;
  },

  getProfiles: async (graph_id: string) => {
    return Array.from(profiles.values()).filter((p) => p.graph_id === graph_id);
  },

  upsertConnection: async () => {},
  upsertConnections: async () => {},
  getConnections: async () => [],
  deleteConnection: async () => {},
  clearDatabase: async () => {
    profiles.clear();
    connections.clear();
  },
};

export const getDatabase = () => mockDatabase;
