import { getDatabase } from "@/lib/db";
import { AppError, handleError } from "@/lib/errors";
import { isValidGraphId } from "@/utils/graphId";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { graphId: string } }
) {
  try {
    const { graphId } = params;
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

    await db.upsertConnection({
      profile_a_id: source,
      profile_b_id: target,
      graph_id: graphId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(
  request: Request,
  { params }: { params: { graphId: string } }
) {
  try {
    const { graphId } = params;

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
    return Response.json({ connections });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { graphId: string } }
) {
  try {
    const { graphId } = params;
    const { source, target } = await request.json();

    // Validate graph ID format
    if (!isValidGraphId(graphId)) {
      throw new AppError("Invalid graph ID format", 400);
    }

    if (!source || !target) {
      throw new AppError("Source and target are required", 400);
    }

    const db = getDatabase();

    // Check if graph exists
    const graph = await db.getGraph(graphId);
    if (!graph) {
      throw new AppError("Graph not found", 404);
    }

    await db.deleteConnection({
      profile_a_id: source,
      profile_b_id: target,
      graph_id: graphId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
