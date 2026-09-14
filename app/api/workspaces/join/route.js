import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const { code } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Find workspace by code in Prisma DB
    let targetWs = await prisma.workspace.findUnique({
      where: { code: cleanCode },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    // If workspace code doesn't exist yet, create household workspace dynamically with code
    if (!targetWs) {
      targetWs = await prisma.workspace.create({
        data: {
          name: `Shared Workspace (${cleanCode})`,
          code: cleanCode,
          isDefault: false,
          members: {
            create: {
              userId: user.id,
              role: "MEMBER",
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
    } else {
      // Check if user is already a member
      const existingMember = targetWs.members.find((m) => m.userId === user.id);
      if (!existingMember) {
        await prisma.workspaceMember.create({
          data: {
            workspaceId: targetWs.id,
            userId: user.id,
            role: "MEMBER",
          },
        });
      }
    }

    // Re-fetch formatted workspace
    const updatedWs = await prisma.workspace.findUnique({
      where: { id: targetWs.id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    const formatted = {
      id: updatedWs.id,
      name: updatedWs.name,
      code: updatedWs.code,
      isDefault: updatedWs.isDefault,
      role: "MEMBER",
      memberCount: updatedWs.members.length,
      members: updatedWs.members.map((mem) => ({
        id: mem.user.id,
        name: mem.user.name,
        email: mem.user.email,
        role: mem.role,
      })),
    };

    return NextResponse.json({
      success: true,
      message: `Joined workspace "${updatedWs.name}"!`,
      workspace: formatted,
    });
  } catch (error) {
    console.error("Join Workspace Error:", error);
    return NextResponse.json({ error: "Failed to join workspace" }, { status: 500 });
  }
}
