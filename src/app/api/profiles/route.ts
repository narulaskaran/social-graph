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
    return Response.json(profiles);
  } catch (err) {
    console.error("API /api/profiles error:", err);
    return Response.json(
      { error: "Database error", details: String(err) },
      { status: 500 }
    );
  }
}
