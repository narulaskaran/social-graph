import type { Database, Profile, Connection, Graph } from "./types";

export class TestingDatabase implements Database {
  private profiles = new Map<string, Profile>();
  private connections = new Map<string, Connection>();
  private graphs = new Map<string, Graph>();

  public readonly createGraph = jest.fn();
  public readonly getGraph = jest.fn();
  public readonly deleteGraph = jest.fn();

  public readonly upsertProfile = jest.fn((profile: Profile) => {
    this.profiles.set(profile.id, { ...profile });
    return Promise.resolve();
  });

  public readonly upsertProfiles = jest.fn((profiles: Profile[]) => {
    profiles.forEach((profile) => {
      this.profiles.set(profile.id, { ...profile });
    });
    return Promise.resolve();
  });

  public readonly getProfile = jest.fn((id: string) => {
    const profile = this.profiles.get(id);
    return Promise.resolve(profile || null);
  });

  public readonly getProfiles = jest.fn((graph_id: string) => {
    const profiles = Array.from(this.profiles.values()).filter(
      (p) => p.graph_id === graph_id
    );
    return Promise.resolve(profiles);
  });

  public readonly upsertConnection = jest.fn();
  public readonly upsertConnections = jest.fn();
  public readonly getConnections = jest.fn();
  public readonly deleteConnection = jest.fn();
  public readonly clearDatabase = jest.fn();
}
