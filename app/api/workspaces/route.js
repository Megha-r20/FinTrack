import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuthUser();

    // Fetch user workspace memberships from Prisma DB
    let memberships = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      include: {
        workspace: {
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Auto-create default Personal Workspace for user if none exists in DB
    if (memberships.length === 0) {
      const defaultWs = await prisma.workspace.create({
        data: {
          name: "Personal Workspace",
          code: `PERS-${Math.floor(100 + Math.random() * 900)}`,
          isDefault: true,
          members: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
        },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      memberships = [{ workspaceId: defaultWs.id, role: "OWNER", workspace: defaultWs }];
    }

    const formattedWorkspaces = memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      code: m.workspace.code,
      isDefault: m.workspace.isDefault,
      role: m.role,
      memberCount: m.workspace.members.length,
      members: m.workspace.members.map((mem) => ({
        id: mem.user.id,
        name: mem.user.name,
        email: mem.user.email,
        role: mem.role,
      })),
    }));

    return NextResponse.json({
      success: true,
      workspaces: formattedWorkspaces,
      activeWorkspaceId: formattedWorkspaces[0]?.id || "ws_personal",
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

    const newWs = await prisma.workspace.create({
      data: {
        name: name.trim(),
        code,
        isDefault: false,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    const formatted = {
      id: newWs.id,
      name: newWs.name,
      code: newWs.code,
      isDefault: newWs.isDefault,
      role: "OWNER",
      memberCount: newWs.members.length,
      members: newWs.members.map((mem) => ({
        id: mem.user.id,
        name: mem.user.name,
        email: mem.user.email,
        role: mem.role,
      })),
    };

    return NextResponse.json({
      success: true,
      message: `Workspace "${newWs.name}" created!`,
      workspace: formatted,
    });
  } catch (error) {
    console.error("Create Workspace Error:", error);
    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const { workspaceId, name } = body;

    if (!workspaceId || !name || !name.trim()) {
      return NextResponse.json({ error: "Workspace ID and new name are required" }, { status: 400 });
    }

    // Verify membership
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: user.id },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Workspace not found or permission denied" }, { status: 403 });
    }

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name: name.trim() },
    });

    return NextResponse.json({
      success: true,
      message: `Workspace renamed to "${updated.name}"!`,
      workspace: { id: updated.id, name: updated.name },
    });
  } catch (error) {
    console.error("Update Workspace Error:", error);
    return NextResponse.json({ error: "Failed to update workspace" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const user = await requireAuthUser();
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    const targetWs = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!targetWs) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    if (targetWs.isDefault) {
      return NextResponse.json({ error: "Personal Workspace cannot be deleted" }, { status: 400 });
    }

    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return NextResponse.json({
      success: true,
      message: `Workspace "${targetWs.name}" deleted successfully!`,
    });
  } catch (error) {
    console.error("Delete Workspace Error:", error);
    return NextResponse.json({ error: "Failed to delete workspace" }, { status: 500 });
  }
}
