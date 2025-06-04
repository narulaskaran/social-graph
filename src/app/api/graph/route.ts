import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const profiles =
      await sql`SELECT linkedin_username, first_name, last_name FROM Profile`;
    const connections = await sql`SELECT profile_a, profile_b FROM Connections`;
    return Response.json({
      profiles,
      connections,
    });
  } catch (err) {
    console.error("API /api/graph error:", err);
    return Response.json(
      { error: "Database error", details: String(err) },
      { status: 500 }
    );
  }
}
