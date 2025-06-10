export interface Profile {
  linkedin_username: string;
  first_name: string;
  last_name: string;
}

export interface Connection {
  profile_a: string;
  profile_b: string;
}

export interface Database {
  // Profile operations
  upsertProfile(profile: Profile): Promise<void>;
  upsertProfiles(profiles: Profile[]): Promise<void>;
  getProfile(linkedin_username: string): Promise<Profile | null>;
  getProfiles(): Promise<Profile[]>;

  // Connection operations
  upsertConnection(connection: Connection): Promise<void>;
  upsertConnections(connections: Connection[]): Promise<void>;
  getConnections(): Promise<Connection[]>;
  deleteConnection(connection: Connection): Promise<void>;

  // Additional operations
  clearDatabase(): Promise<void>;
}
