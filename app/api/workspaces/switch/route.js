import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    // Verify workspace exists or membership exists in DB
    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!ws) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      activeWorkspaceId: ws.id,
      message: `Switched active workspace session to "${ws.name}"!`,
    });
  } catch (error) {
    console.error("Switch Workspace Error:", error);
    return NextResponse.json({ error: "Failed to switch workspace" }, { status: 500 });
  }
}
