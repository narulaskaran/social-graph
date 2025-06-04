import { NextRequest } from "next/server";
import { Client } from "pg";

export async function GET(request: NextRequest) {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  try {
    await client.connect();
    const profiles = await client.query(
      "SELECT linkedin_username, first_name, last_name FROM Profile"
    );
    const connections = await client.query(
      "SELECT profile_a, profile_b FROM Connections"
    );
    await client.end();
    return Response.json({
      profiles: profiles.rows,
      connections: connections.rows,
    });
  } catch (err) {
    await client.end();
    return Response.json(
      { error: "Database error", details: err },
      { status: 500 }
    );
  }
}
