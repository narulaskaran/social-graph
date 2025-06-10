import { extractLinkedInUsername } from "../../../utils/extractLinkedInUsername";
import { getDatabase } from "@/lib/db";
import { handleError } from "@/lib/errors";

interface ConnectionInput {
  linkedin_url: string;
  first_name: string;
  last_name: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { self, connections, connectEveryone } = body;

    if (!self || !self.linkedin_url || !self.first_name || !self.last_name) {
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

    const selfUsername = extractLinkedInUsername(self.linkedin_url);
    if (!selfUsername) {
      return Response.json(
        { error: "Invalid self LinkedIn URL" },
        { status: 400 }
      );
    }

    const connectionUsernames = connections
      .map((c: ConnectionInput) => ({
        ...c,
        linkedin_username: extractLinkedInUsername(c.linkedin_url),
      }))
      .filter((c) => c.linkedin_username) as (ConnectionInput & {
      linkedin_username: string;
    })[];

    const db = getDatabase();

    // Prepare all profiles for bulk upsert
    const allProfiles = [
      {
        linkedin_username: selfUsername,
        first_name: self.first_name,
        last_name: self.last_name,
      },
      ...connectionUsernames.map((c) => ({
        linkedin_username: c.linkedin_username,
        first_name: c.first_name,
        last_name: c.last_name,
      })),
    ];

    // Upsert all profiles in a single batch operation
    await db.upsertProfiles(allProfiles);

    // Prepare connections based on connectEveryone flag
    const connectionPairs: { profile_a: string; profile_b: string }[] = [];

    if (connectEveryone) {
      // Create connections between all pairs using the new method
      const allUsernames = [
        selfUsername,
        ...connectionUsernames.map((c) => c.linkedin_username),
      ];
      await db.createAllPairwiseConnections(allUsernames);
    } else {
      // Only connect self to each connection
      for (const c of connectionUsernames) {
        const [a, b] = [selfUsername, c.linkedin_username].sort();
        if (a !== b) {
          connectionPairs.push({ profile_a: a, profile_b: b });
        }
      }
      // Upsert all connections in a single batch operation
      await db.upsertConnections(connectionPairs);
    }

    return Response.json({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
