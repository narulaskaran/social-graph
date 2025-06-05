import { AppError, handleError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

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
