import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";

export async function POST(req) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      activeWorkspaceId: workspaceId,
      message: "Switched active workspace session!",
    });
  } catch (error) {
    console.error("Switch Workspace Error:", error);
    return NextResponse.json({ error: "Failed to switch workspace" }, { status: 500 });
  }
}
