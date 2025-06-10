import type { Database, Profile, Connection } from "./types";
import { PrismaClient } from "@prisma/client";

// Use a singleton pattern for PrismaClient
let prismaInstance: PrismaClient | undefined;

const getPrisma = () => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
};

export class PrismaDatabase implements Database {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getPrisma();
  }

  async upsertProfile(profile: Profile): Promise<void> {
    await this.prisma.profile.upsert({
      where: { linkedin_username: profile.linkedin_username },
      update: { first_name: profile.first_name, last_name: profile.last_name },
      create: profile,
    });
  }

  async upsertProfiles(profiles: Profile[]): Promise<void> {
    await this.prisma.$transaction(
      profiles.map((profile) =>
        this.prisma.profile.upsert({
          where: { linkedin_username: profile.linkedin_username },
          update: {
            first_name: profile.first_name,
            last_name: profile.last_name,
          },
          create: profile,
        })
      )
    );
  }

  async getProfile(linkedin_username: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { linkedin_username },
    });
    return profile;
  }

  async getProfiles(): Promise<Profile[]> {
    return this.prisma.profile.findMany();
  }

  async upsertConnection(connection: Connection): Promise<void> {
    const [a, b] = [connection.profile_a, connection.profile_b].sort();
    await this.prisma.connections.upsert({
      where: { profile_a_profile_b: { profile_a: a, profile_b: b } },
      update: {},
      create: { profile_a: a, profile_b: b },
    });
  }

  async upsertConnections(connections: Connection[]): Promise<void> {
    await this.prisma.$transaction(
      connections.map((connection) => {
        const [a, b] = [connection.profile_a, connection.profile_b].sort();
        return this.prisma.connections.upsert({
          where: { profile_a_profile_b: { profile_a: a, profile_b: b } },
          update: {},
          create: { profile_a: a, profile_b: b },
        });
      })
    );
  }

  async getConnections(): Promise<Connection[]> {
    return this.prisma.connections.findMany();
  }

  async deleteConnection(connection: Connection): Promise<void> {
    const [a, b] = [connection.profile_a, connection.profile_b].sort();
    await this.prisma.connections.delete({
      where: { profile_a_profile_b: { profile_a: a, profile_b: b } },
    });
  }

  async clearDatabase(): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.connections.deleteMany(),
      this.prisma.profile.deleteMany(),
    ]);
  }
}
