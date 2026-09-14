import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const user = await requireAuthUser();
    const challenges = await prisma.savingsChallenge.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ challenges });
  } catch (error) {
    console.error("Fetch Challenges Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const { title, targetAmount, durationDays } = body;

    if (!title || !targetAmount || !durationDays) {
      return NextResponse.json(
        { error: "Title, target amount, and duration days are required." },
        { status: 400 }
      );
    }

    const challenge = await prisma.savingsChallenge.create({
      data: {
        userId: user.id,
        title,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        durationDays: parseInt(durationDays, 10),
        startDate: new Date(),
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ challenge });
  } catch (error) {
    console.error("Create Challenge Error:", error);
    return NextResponse.json({ error: "Failed to create savings challenge" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const { id, addAmount } = body;

    if (!id || addAmount === undefined) {
      return NextResponse.json({ error: "ID and addAmount are required" }, { status: 400 });
    }

    const existing = await prisma.savingsChallenge.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    const updatedAmount = Math.min(existing.targetAmount, existing.currentAmount + parseFloat(addAmount));
    const isCompleted = updatedAmount >= existing.targetAmount;

    const updated = await prisma.savingsChallenge.update({
      where: { id },
      data: {
        currentAmount: updatedAmount,
        status: isCompleted ? "COMPLETED" : "ACTIVE",
      },
    });

    if (isCompleted) {
      // Award Savings Champion badge
      await prisma.userBadge.upsert({
        where: {
          userId_badgeId: {
            userId: user.id,
            badgeId: "SAVINGS_CHAMPION",
          },
        },
        update: {},
        create: {
          userId: user.id,
          badgeId: "SAVINGS_CHAMPION",
          title: "Savings Champion",
          description: "Successfully completed a custom savings challenge!",
          icon: "Trophy",
        },
      });
    }

    return NextResponse.json({ challenge: updated });
  } catch (error) {
    console.error("Update Challenge Error:", error);
    return NextResponse.json({ error: "Failed to update challenge" }, { status: 500 });
  }
}
