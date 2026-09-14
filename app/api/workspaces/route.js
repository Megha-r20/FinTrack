import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import crypto from "crypto";

// Default demo workspaces state
const mockWorkspaces = [
  {
    id: "ws_personal",
    name: "Personal Workspace",
    code: "PERS-001",
    role: "OWNER",
    memberCount: 1,
    isDefault: true,
    members: [
      { id: "mem_1", name: "Megha R", email: "demo@fintrack.com", role: "OWNER" },
    ],
  },
  {
    id: "ws_hostel302",
    name: "Hostel Flat 302",
    code: "FLAT-302",
    role: "ADMIN",
    memberCount: 3,
    isDefault: false,
    members: [
      { id: "mem_1", name: "Megha R", email: "demo@fintrack.com", role: "ADMIN" },
      { id: "mem_2", name: "Rahul S", email: "rahul@fintrack.com", role: "OWNER" },
      { id: "mem_3", name: "Ananya M", email: "ananya@fintrack.com", role: "MEMBER" },
    ],
  },
];

export async function GET() {
  try {
    const user = await requireAuthUser();

    return NextResponse.json({
      success: true,
      workspaces: mockWorkspaces,
      activeWorkspaceId: "ws_personal",
    });
  } catch (error) {
    console.error("Fetch Workspaces Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
    }

    const codeSlug = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase();
    const randomCode = Math.floor(100 + Math.random() * 900);
    const code = `${codeSlug || "ROOM"}-${randomCode}`;

    const newWs = {
      id: `ws_${Date.now()}`,
      name: name.trim(),
      code,
      role: "OWNER",
      memberCount: 1,
      isDefault: false,
      members: [
        { id: user.id, name: user.name || "Megha R", email: user.email, role: "OWNER" },
      ],
    };

    mockWorkspaces.push(newWs);

    return NextResponse.json({
      success: true,
      message: `Workspace "${newWs.name}" created!`,
      workspace: newWs,
    });
  } catch (error) {
    console.error("Create Workspace Error:", error);
    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await requireAuthUser();
    const body = await req.json();
    const { workspaceId, name } = body;

    if (!workspaceId || !name || !name.trim()) {
      return NextResponse.json({ error: "Workspace ID and new name are required" }, { status: 400 });
    }

    const targetIndex = mockWorkspaces.findIndex((w) => w.id === workspaceId);
    if (targetIndex === -1) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    mockWorkspaces[targetIndex].name = name.trim();

    return NextResponse.json({
      success: true,
      message: `Workspace renamed to "${mockWorkspaces[targetIndex].name}"!`,
      workspace: mockWorkspaces[targetIndex],
    });
  } catch (error) {
    console.error("Update Workspace Error:", error);
    return NextResponse.json({ error: "Failed to update workspace" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await requireAuthUser();
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    const targetIndex = mockWorkspaces.findIndex((w) => w.id === workspaceId);
    if (targetIndex === -1) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const targetWs = mockWorkspaces[targetIndex];
    if (targetWs.isDefault || targetWs.id === "ws_personal") {
      return NextResponse.json({ error: "Personal Workspace cannot be deleted" }, { status: 400 });
    }

    mockWorkspaces.splice(targetIndex, 1);

    return NextResponse.json({
      success: true,
      message: `Workspace "${targetWs.name}" deleted successfully!`,
      fallbackWorkspaceId: "ws_personal",
    });
  } catch (error) {
    console.error("Delete Workspace Error:", error);
    return NextResponse.json({ error: "Failed to delete workspace" }, { status: 500 });
  }
}

