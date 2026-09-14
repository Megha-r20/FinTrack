import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";

export async function POST(req) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const { code } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Demo workspace joined response
    const joinedWorkspace = {
      id: `ws_joined_${Date.now()}`,
      name: cleanCode.includes("FLAT") ? "Hostel Flat 302" : `Workspace (${cleanCode})`,
      code: cleanCode,
      role: "MEMBER",
      memberCount: 4,
      isDefault: false,
      members: [
        { id: user.id, name: user.name || "Megha R", email: user.email, role: "MEMBER" },
        { id: "mem_2", name: "Rahul S", email: "rahul@fintrack.com", role: "OWNER" },
      ],
    };

    return NextResponse.json({
      success: true,
      message: `Successfully joined workspace using code ${cleanCode}!`,
      workspace: joinedWorkspace,
    });
  } catch (error) {
    console.error("Join Workspace Error:", error);
    return NextResponse.json({ error: "Failed to join workspace" }, { status: 500 });
  }
}
