import { createGraphId } from "../../utils/graphId";
import type { Database, Profile, Connection, Graph } from "./types";
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

  async createGraph(): Promise<Graph> {
    const graph = await this.prisma.graph.create({
      data: {
        id: createGraphId(),
      },
    });
    return graph;
  }

  async getGraph(id: string): Promise<Graph | null> {
    return this.prisma.graph.findUnique({
      where: { id },
    });
  }

  async deleteGraph(id: string): Promise<void> {
    await this.prisma.graph.delete({
      where: { id },
    });
  }

  async upsertProfile(profile: Profile): Promise<void> {
    await this.prisma.profile.upsert({
      where: { id: profile.id },
      update: {
        first_name: profile.first_name,
        last_name: profile.last_name,
        graph_id: profile.graph_id,
      },
      create: profile,
    });
  }

  async upsertProfiles(profiles: Profile[]): Promise<void> {
    await this.prisma.$transaction(
      profiles.map((profile) =>
        this.prisma.profile.upsert({
          where: { id: profile.id },
          update: {
            first_name: profile.first_name,
            last_name: profile.last_name,
            graph_id: profile.graph_id,
          },
          create: profile,
        })
      )
    );
  }

  async getProfile(id: string, graph_id: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({
      where: { id },
    });
  }

  async getProfiles(graph_id?: string): Promise<Profile[]> {
    if (graph_id) {
      return this.prisma.profile.findMany({
        where: { graph_id },
      });
    }
    return this.prisma.profile.findMany();
  }

  async upsertConnection(connection: Connection): Promise<void> {
    const [a, b] = [connection.profile_a_id, connection.profile_b_id].sort();
    await this.prisma.connections.upsert({
      where: {
        profile_a_id_profile_b_id_graph_id: {
          profile_a_id: a,
          profile_b_id: b,
          graph_id: connection.graph_id,
        },
      },
      update: {},
      create: {
        profile_a_id: a,
        profile_b_id: b,
        graph_id: connection.graph_id,
      },
    });
  }

  async upsertConnections(connections: Connection[]): Promise<void> {
    await this.prisma.$transaction(
      connections.map((connection) => {
        const [a, b] = [
          connection.profile_a_id,
          connection.profile_b_id,
        ].sort();
        return this.prisma.connections.upsert({
          where: {
            profile_a_id_profile_b_id_graph_id: {
              profile_a_id: a,
              profile_b_id: b,
              graph_id: connection.graph_id,
            },
          },
          update: {},
          create: {
            profile_a_id: a,
            profile_b_id: b,
            graph_id: connection.graph_id,
          },
        });
      })
    );
  }

  async getConnections(graph_id?: string): Promise<Connection[]> {
    if (graph_id) {
      return this.prisma.connections.findMany({
        where: { graph_id },
      });
    }
    return this.prisma.connections.findMany();
  }

  async deleteConnection(connection: Connection): Promise<void> {
    const [a, b] = [connection.profile_a_id, connection.profile_b_id].sort();
    await this.prisma.connections.delete({
      where: {
        profile_a_id_profile_b_id_graph_id: {
          profile_a_id: a,
          profile_b_id: b,
          graph_id: connection.graph_id,
        },
      },
    });
  }

  async clearDatabase(): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.connections.deleteMany(),
      this.prisma.profile.deleteMany(),
      this.prisma.graph.deleteMany(),
    ]);
  }
}
