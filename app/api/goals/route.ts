import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuthUser();

    const goals = await prisma.goal.findMany({
      where: { userId: user.id },
      include: {
        contributions: {
          orderBy: { date: "desc" },
        },
      },
      orderBy: { deadline: "asc" },
    });

    const enrichedGoals = goals.map((goal) => {
      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
      const percentage = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
      const isCompleted = goal.currentAmount >= goal.targetAmount || goal.status === "COMPLETED";

      return {
        ...goal,
        remainingAmount: remaining,
        percentageCompleted: percentage,
        status: isCompleted ? "COMPLETED" : "IN_PROGRESS",
      };
    });

    return NextResponse.json({ goals: enrichedGoals });
  } catch (error) {
    console.error("Fetch Goals Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthUser();
    const { title, targetAmount, currentAmount = 0, deadline, category = "Savings" } = await req.json();

    if (!title || !targetAmount || !deadline) {
      return NextResponse.json({ error: "Title, target amount, and deadline are required." }, { status: 400 });
    }

    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        title: title.trim(),
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount),
        deadline: new Date(deadline),
        category,
        status: parseFloat(currentAmount) >= parseFloat(targetAmount) ? "COMPLETED" : "IN_PROGRESS",
      },
    });

    if (parseFloat(currentAmount) > 0) {
      await prisma.goalContribution.create({
        data: {
          goalId: goal.id,
          amount: parseFloat(currentAmount),
          note: "Initial contribution",
        },
      });
    }

    return NextResponse.json({ goal });
  } catch (error) {
    console.error("Create Goal Error:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
