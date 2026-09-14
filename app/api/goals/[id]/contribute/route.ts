import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuthUser();
    const { id: goalId } = await params;
    const { amount, note } = await req.json();

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: "Contribution amount must be greater than zero." }, { status: 400 });
    }

    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId: user.id },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found." }, { status: 404 });
    }

    const addedAmount = parseFloat(amount);
    const updatedCurrent = goal.currentAmount + addedAmount;
    const isCompleted = updatedCurrent >= goal.targetAmount;

    // Create contribution entry
    const contribution = await prisma.goalContribution.create({
      data: {
        goalId: goal.id,
        amount: addedAmount,
        note: note ? note.trim() : "Goal contribution",
      },
    });

    // Update goal record
    const updatedGoal = await prisma.goal.update({
      where: { id: goal.id, userId: user.id },
      data: {
        currentAmount: updatedCurrent,
        status: isCompleted ? "COMPLETED" : "IN_PROGRESS",
      },
    });

    if (isCompleted && goal.status !== "COMPLETED") {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Goal Achieved! 🎉",
          message: `Congratulations! You reached your goal "${goal.title}".`,
          type: "GOAL_ACHIEVED",
        },
      });
    }

    return NextResponse.json({ goal: updatedGoal, contribution });
  } catch (error) {
    console.error("Contribute Goal Error:", error);
    return NextResponse.json({ error: "Failed to add contribution" }, { status: 500 });
  }
}
