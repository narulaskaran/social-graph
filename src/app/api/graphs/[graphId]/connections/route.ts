import { getDatabase } from "@/lib/db";
import { AppError, handleError } from "@/lib/errors";
import { isValidGraphId } from "@/utils/graphId";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ graphId: string }> }
) {
  try {
    const { graphId } = await params;
    const { source, target } = await request.json();

    // Validate graph ID format
    if (!isValidGraphId(graphId)) {
      throw new AppError("Invalid graph ID format", 400);
    }

    // Validate input
    if (!source || !target) {
      throw new AppError("Source and target are required", 400);
    }

    const db = getDatabase();

    // Check if graph exists
    const graph = await db.getGraph(graphId);
    if (!graph) {
      throw new AppError("Graph not found", 404);
    }

    // Create the connection
    await db.upsertConnection({
      profile_a_id: source,
      profile_b_id: target,
      graph_id: graphId,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleError(err);
  }
}

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

    const connections = await db.getConnections(graphId);
    return NextResponse.json(connections);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ graphId: string }> }
) {
  try {
    const { graphId } = await params;
    const { source, target } = await request.json();

    // Validate graph ID format
    if (!isValidGraphId(graphId)) {
      throw new AppError("Invalid graph ID format", 400);
    }

    // Validate input
    if (!source || !target) {
      throw new AppError("Source and target are required", 400);
    }

    const db = getDatabase();

    // Check if graph exists
    const graph = await db.getGraph(graphId);
    if (!graph) {
      throw new AppError("Graph not found", 404);
    }

    // Delete the connection
    await db.deleteConnection(source, target, graphId);

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
