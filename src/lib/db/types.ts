export interface Graph {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  graph_id: string;
}

export interface Connection {
  profile_a_id: string;
  profile_b_id: string;
  graph_id: string;
}

export interface Database {
  // Graph operations
  createGraph(): Promise<Graph>;
  getGraph(id: string): Promise<Graph | null>;
  deleteGraph(id: string): Promise<void>;

  // Profile operations
  upsertProfile(profile: Profile): Promise<void>;
  upsertProfiles(profiles: Profile[]): Promise<void>;
  getProfile(id: string): Promise<Profile | null>;
  getProfiles(graph_id?: string): Promise<Profile[]>;

  // Connection operations
  upsertConnection(connection: Connection): Promise<void>;
  upsertConnections(connections: Connection[]): Promise<void>;
  getConnections(graph_id?: string): Promise<Connection[]>;
  deleteConnection(
    profile_a_id: string,
    profile_b_id: string,
    graph_id: string
  ): Promise<void>;

  // Utility operations
  clearDatabase(): Promise<void>;
}
