import { getDatabase } from "@/lib/db";
import { handleError } from "@/lib/errors";

export async function GET() {
  try {
    const db = getDatabase();
    const profiles = await db.getProfiles();
    return Response.json({ profiles });
  } catch (error) {
    return handleError(error);
  }
}
