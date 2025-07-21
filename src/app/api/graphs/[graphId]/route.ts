import { getDatabase } from "@/lib/db";
import { handleError, AppError } from "@/lib/errors";
import { isValidGraphId } from "@/utils/graphId";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ graphId: string }> }
) {
  try {
    const { graphId } = await params;

    // Validate graph ID format
    if (!isValidGraphId(graphId)) {
      throw new AppError("Invalid graph ID format", 400);
    }

    const db = getDatabase();

    // Check if graph exists
    const graph = await db.getGraph(graphId);
    if (!graph) {
      throw new AppError("Graph not found", 404);
    }

    // Get profiles and connections for this graph
    const profiles = await db.getProfiles(graphId);
    const connections = await db.getConnections(graphId);

    return Response.json({
      graph,
      profiles,
      connections,
    });
  } catch (err) {
    return handleError(err);
  }
}
