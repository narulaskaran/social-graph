import { getDatabase } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { source, target } = await request.json();

    if (!source || !target) {
      return Response.json(
        { error: "Source and target are required" },
        { status: 400 }
      );
    }

    const db = getDatabase();
    await db.upsertConnection({
      profile_a_id: source,
      profile_b_id: target,
      graph_id: "default",
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error creating connection:", error);
    return Response.json(
      { error: "Failed to create connection" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = getDatabase();
    const connections = await db.getConnections("default");

    return Response.json({ connections });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return Response.json(
      { error: "Failed to fetch connections" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { source, target } = await request.json();

    if (!source || !target) {
      return Response.json(
        { error: "Source and target are required" },
        { status: 400 }
      );
    }

    const db = getDatabase();
    await db.deleteConnection(source, target, "default");

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting connection:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
