import { handleError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const profiles = await prisma.profile.findMany({
      select: {
        linkedin_username: true,
        first_name: true,
        last_name: true,
      },
    });
    const connections = await prisma.connections.findMany({
      select: {
        profile_a: true,
        profile_b: true,
      },
    });
    return Response.json({
      profiles,
      connections,
    });
  } catch (err) {
    return handleError(err);
  }
}
