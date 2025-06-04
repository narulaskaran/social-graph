import { extractLinkedInUsername } from "../../../utils/extractLinkedInUsername";
import { upsertProfile, upsertConnection } from "./helpers";

interface ConnectionInput {
  linkedin_url: string;
  first_name: string;
  last_name: string;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { self, connections } = body;
  // self: { linkedin_url, first_name, last_name }
  // connections: [{ linkedin_url, first_name, last_name }, ...]
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

  try {
    // Upsert self
    await upsertProfile(
      selfUsername as string,
      self.first_name,
      self.last_name
    );
    // Upsert connections
    for (const c of connectionUsernames) {
      await upsertProfile(c.linkedin_username, c.first_name, c.last_name);
      // Insert undirected connection
      const [a, b] = [selfUsername as string, c.linkedin_username].sort();
      if (a !== b) {
        await upsertConnection(a, b);
      }
    }
    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { error: "Database error", details: String(err) },
      { status: 500 }
    );
  }
}
