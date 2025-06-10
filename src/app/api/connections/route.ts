import { getDatabase } from "@/lib/db";
import { AppError, handleError } from "@/lib/errors";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { source, target } = await request.json();

    // Validate input
    if (!source || !target) {
      throw new AppError("Source and target are required", 400);
    }

    const db = getDatabase();
    await db.upsertConnection({ profile_a: source, profile_b: target });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET() {
  try {
    const db = getDatabase();
    const connections = await db.getConnections();
    return Response.json({ connections });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { source, target } = await request.json();

    if (!source || !target) {
      throw new AppError("Source and target are required", 400);
    }

    const db = getDatabase();
    await db.deleteConnection({ profile_a: source, profile_b: target });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
