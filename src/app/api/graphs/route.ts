import { getDatabase } from "@/lib/db";
import { handleError } from "@/lib/errors";

export async function POST() {
  try {
    const db = getDatabase();
    const graph = await db.createGraph();

    return Response.json({
      graph,
      shareUrl: `/graph/${graph.id}`,
    });
  } catch (err) {
    return handleError(err);
  }
}
