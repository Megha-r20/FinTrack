import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const { plannedAmount, itemTitle, categoryName } = body;

    if (!plannedAmount || parseFloat(plannedAmount) <= 0) {
      return NextResponse.json({ error: "Valid planned amount required" }, { status: 400 });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();

    const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);

    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const expenses = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: firstDay, lte: lastDay },
      },
      _sum: { amount: true },
    });

    const budgets = await prisma.budget.findMany({
      where: { userId: user.id, month: currentMonth, year: currentYear },
    });

    const totalSpentSoFar = expenses._sum.amount || 0;
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0) || 6000;

    const currentRemaining = Math.max(0, totalBudgeted - totalSpentSoFar);
    const currentSafeDailyLimit = Math.round(currentRemaining / daysRemaining);

    const amount = parseFloat(plannedAmount);
    const newRemaining = currentRemaining - amount;
    const newSafeDailyLimit = Math.max(0, Math.round(newRemaining / daysRemaining));

    let riskLevel = "SAFE";
    let advice = `If you spend ${user.currency}${amount} on ${itemTitle || "this purchase"}, your safe daily spend drops from ${user.currency}${currentSafeDailyLimit}/day to ${user.currency}${newSafeDailyLimit}/day for the remaining ${daysRemaining} days.`;

    if (newRemaining < 0) {
      riskLevel = "CRITICAL";
      advice = `Warning: Spending ${user.currency}${amount} will completely exhaust your monthly budget and put you ${user.currency}${Math.abs(newRemaining)} in deficit!`;
    } else if (newSafeDailyLimit < currentSafeDailyLimit * 0.5) {
      riskLevel = "SEVERE_IMPACT";
      advice = `Severe Impact: Spending ${user.currency}${amount} cuts your daily allowance by over 50% down to ${user.currency}${newSafeDailyLimit}/day. You will need to restrict discretionary snacks and outings.`;
    }

    return NextResponse.json({
      plannedAmount: amount,
      itemTitle: itemTitle || "Planned Purchase",
      currentRemaining,
      newRemaining,
      daysRemaining,
      currentSafeDailyLimit,
      newSafeDailyLimit,
      riskLevel,
      advice,
    });
  } catch (error) {
    console.error("Simulation Error:", error);
    return NextResponse.json({ error: "Failed to simulate purchase" }, { status: 500 });
  }
}
