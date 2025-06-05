import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { source, target } = await request.json();

    // Validate input
    if (!source || !target) {
      return Response.json(
        { error: "Source and target are required" },
        { status: 400 }
      );
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
    console.error("API /api/connections error:", err);
    return Response.json(
      { error: "Database error", details: String(err) },
      { status: 500 }
    );
  }
}
