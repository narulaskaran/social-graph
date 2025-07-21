import { getDatabase } from "@/lib/db";
import { handleError, AppError } from "@/lib/errors";
import { isValidGraphId } from "@/utils/graphId";

function generateId(): string {
  return Math.random().toString(36).substr(2, 10);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ graphId: string }> }
) {
  try {
    const { graphId } = await params;
    const body = await request.json();
    const { self, connections, connectEveryone } = body;

    // Validate graph ID format
    if (!isValidGraphId(graphId)) {
      throw new AppError("Invalid graph ID format", 400);
    }

    if (!self || !self.first_name || !self.last_name) {
      return Response.json(
        { error: "Missing self profile fields" },
        { status: 400 }
      );
    }
    if (!Array.isArray(connections)) {
      return Response.json(
        { error: "Connections must be an array" },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Check if graph exists
    const graph = await db.getGraph(graphId);
    if (!graph) {
      throw new AppError("Graph not found", 404);
    }

    // Helper to get or create a profile and return its id
    async function getOrCreateProfileId(
      first_name: string,
      last_name: string
    ): Promise<string> {
      const existing = (await db.getProfiles(graphId)).find(
        (p) => p.first_name === first_name && p.last_name === last_name
      );
      if (existing) return existing.id;
      const id = generateId();
      await db.upsertProfile({ id, first_name, last_name, graph_id: graphId });
      return id;
    }

    // Collect all unique people
    const allPeople = [self, ...connections];
    const profileIdMap: Record<string, string> = {};
    for (const person of allPeople) {
      const key = `${person.first_name}|||${person.last_name}`;
      if (!profileIdMap[key]) {
        profileIdMap[key] = await getOrCreateProfileId(
          person.first_name,
          person.last_name
        );
      }
    }

    // Prepare connections based on connectEveryone flag
    const connectionPairs: {
      profile_a_id: string;
      profile_b_id: string;
      graph_id: string;
    }[] = [];
    const selfKey = `${self.first_name}|||${self.last_name}`;
    const connectionKeys = connections.map(
      (c) => `${c.first_name}|||${c.last_name}`
    );

    if (connectEveryone) {
      // Create connections between all pairs
      const allKeys = [selfKey, ...connectionKeys];
      for (let i = 0; i < allKeys.length; i++) {
        for (let j = i + 1; j < allKeys.length; j++) {
          const [a, b] = [
            profileIdMap[allKeys[i]],
            profileIdMap[allKeys[j]],
          ].sort();
          if (a !== b) {
            connectionPairs.push({
              profile_a_id: a,
              profile_b_id: b,
              graph_id: graphId,
            });
          }
        }
      }
    } else {
      // Only connect self to each connection
      for (const key of connectionKeys) {
        const [a, b] = [profileIdMap[selfKey], profileIdMap[key]].sort();
        if (a !== b) {
          connectionPairs.push({
            profile_a_id: a,
            profile_b_id: b,
            graph_id: graphId,
          });
        }
      }
    }

    // Upsert all connections in a single batch operation
    await db.upsertConnections(connectionPairs);

    return Response.json({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
