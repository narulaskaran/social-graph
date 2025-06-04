import { extractLinkedInUsername } from "../../../utils/extractLinkedInUsername";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DATABASE_URL!);

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

  try {
    // Upsert self
    await sql`INSERT INTO Profile (linkedin_username, first_name, last_name)
      VALUES (${selfUsername}, ${self.first_name}, ${self.last_name})
      ON CONFLICT (linkedin_username) DO NOTHING`;
    // Upsert connections
    for (const c of connectionUsernames) {
      await sql`INSERT INTO Profile (linkedin_username, first_name, last_name)
        VALUES (${c.linkedin_username}, ${c.first_name}, ${c.last_name})
        ON CONFLICT (linkedin_username) DO NOTHING`;
      // Insert undirected connection
      const [a, b] = [selfUsername, c.linkedin_username].sort();
      if (a !== b) {
        await sql`INSERT INTO Connections (profile_a, profile_b)
          VALUES (${a}, ${b})
          ON CONFLICT (profile_a, profile_b) DO NOTHING`;
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
