import { AppError, handleError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { source, target } = await request.json();

    // Validate input
    if (!source || !target) {
      throw new AppError("Source and target are required", 400);
    }

    // Create connection (undirected, so order doesn't matter)
    const connection = await prisma.connections.create({
      data: {
        profile_a: source,
        profile_b: target,
      },
    });

    return Response.json(connection);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(request: Request) {
  try {
    const { source, target } = await request.json();

    if (!source || !target) {
      return NextResponse.json(
        { error: "Source and target are required" },
        { status: 400 }
      );
    }

    // Delete both directions since connections are undirected
    await prisma.connections.deleteMany({
      where: {
        OR: [
          { profile_a: source, profile_b: target },
          { profile_a: target, profile_b: source },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting connection:", error);
    return NextResponse.json(
      { error: "Failed to delete connection" },
      { status: 500 }
    );
  }
}
