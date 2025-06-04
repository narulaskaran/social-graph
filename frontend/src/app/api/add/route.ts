import { extractLinkedInUsername } from "../../../utils/extractLinkedInUsername";
import { Client } from "pg";

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
    .map((c: any) => ({
      ...c,
      linkedin_username: extractLinkedInUsername(c.linkedin_url),
    }))
    .filter((c: any) => c.linkedin_username);

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  try {
    await client.connect();
    // Upsert self
    await client.query(
      `INSERT INTO Profile (linkedin_username, first_name, last_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (linkedin_username) DO NOTHING`,
      [selfUsername, self.first_name, self.last_name]
    );
    // Upsert connections
    for (const c of connectionUsernames) {
      await client.query(
        `INSERT INTO Profile (linkedin_username, first_name, last_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (linkedin_username) DO NOTHING`,
        [c.linkedin_username, c.first_name, c.last_name]
      );
      // Insert undirected connection
      const [a, b] = [selfUsername, c.linkedin_username].sort();
      if (a !== b) {
        await client.query(
          `INSERT INTO Connections (profile_a, profile_b)
           VALUES ($1, $2)
           ON CONFLICT (profile_a, profile_b) DO NOTHING`,
          [a, b]
        );
      }
    }
    await client.end();
    return Response.json({ success: true });
  } catch (err) {
    await client.end();
    return Response.json(
      { error: "Database error", details: err },
      { status: 500 }
    );
  }
}
