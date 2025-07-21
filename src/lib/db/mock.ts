import type { Database, Profile, Connection, Graph } from "./types";

function generateId(): string {
  return Math.random().toString(36).substr(2, 12);
}

export class MockDatabase implements Database {
  private graphs: Graph[] = [];
  private profiles: Profile[] = [];
  private connections: Connection[] = [];

  async createGraph(): Promise<Graph> {
    const graph: Graph = {
      id: generateId(),
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.graphs.push(graph);
    return graph;
  }

  async getGraph(id: string): Promise<Graph | null> {
    return this.graphs.find((g) => g.id === id) || null;
  }

  async deleteGraph(id: string): Promise<void> {
    this.graphs = this.graphs.filter((g) => g.id !== id);
    this.profiles = this.profiles.filter((p) => p.graph_id !== id);
    this.connections = this.connections.filter((c) => c.graph_id !== id);
  }

  async upsertProfile(profile: Profile): Promise<void> {
    const index = this.profiles.findIndex(
      (p) =>
        p.first_name === profile.first_name &&
        p.last_name === profile.last_name &&
        p.graph_id === profile.graph_id
    );
    if (index >= 0) {
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

  async getProfile(id: string): Promise<Profile | null> {
    return this.profiles.find((p) => p.id === id) || null;
  }

  async getProfiles(graph_id: string): Promise<Profile[]> {
    return this.profiles.filter((p) => p.graph_id === graph_id);
  }

  async upsertConnection(connection: Connection): Promise<void> {
    const index = this.connections.findIndex(
      (c) =>
        ((c.profile_a_id === connection.profile_a_id &&
          c.profile_b_id === connection.profile_b_id) ||
          (c.profile_a_id === connection.profile_b_id &&
            c.profile_b_id === connection.profile_a_id)) &&
        c.graph_id === connection.graph_id
    );
    if (index >= 0) {
      this.connections[index] = connection;
    } else {
      this.connections.push(connection);
    }
  }

  async upsertConnections(connections: Connection[]): Promise<void> {
    for (const connection of connections) {
      await this.upsertConnection(connection);
    }
  }

  async getConnections(graph_id: string): Promise<Connection[]> {
    return this.connections.filter((c) => c.graph_id === graph_id);
  }

  async deleteConnection(connection: {
    profile_a_id: string;
    profile_b_id: string;
    graph_id: string;
  }): Promise<void> {
    this.connections = this.connections.filter(
      (c) =>
        !(
          ((c.profile_a_id === connection.profile_a_id &&
            c.profile_b_id === connection.profile_b_id) ||
            (c.profile_a_id === connection.profile_b_id &&
              c.profile_b_id === connection.profile_a_id)) &&
          c.graph_id === connection.graph_id
        )
    );
  }

  async clearDatabase(): Promise<void> {
    this.graphs = [];
    this.profiles = [];
    this.connections = [];
  }
}
