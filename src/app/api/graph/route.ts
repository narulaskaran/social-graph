import { getDatabase } from "@/lib/db";
import { handleError } from "@/lib/errors";

export async function GET() {
  try {
    const db = getDatabase();
    const profiles = await db.getProfiles();
    const connections = await db.getConnections();

    return Response.json({
      profiles,
      connections,
    });
  } catch (err) {
    return handleError(err);
  }
}
