import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const user = await requireAuthUser();
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();

    const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);

    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Fetch month's expense transactions
    const expenses = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: firstDay, lte: lastDay },
      },
      _sum: { amount: true },
    });

    const income = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: "INCOME",
        date: { gte: firstDay, lte: lastDay },
      },
      _sum: { amount: true },
    });

    const budgets = await prisma.budget.findMany({
      where: { userId: user.id, month: currentMonth, year: currentYear },
      include: { category: true },
    });

    const totalSpentSoFar = expenses._sum.amount || 0;
    const totalIncomeSoFar = income._sum.amount || 0;
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);

    // Spending velocity (avg spend per day passed)
    const elapsedDays = Math.max(1, currentDay);
    const dailyVelocity = Math.round((totalSpentSoFar / elapsedDays) * 100) / 100;

    // Projected total expenses at end of month
    const projectedTotalExpenses = Math.round(totalSpentSoFar + dailyVelocity * (daysRemaining - 1));
    const projectedEndBalance = Math.round(totalIncomeSoFar - projectedTotalExpenses);
    const safeDailySpendLimit = Math.round((totalBudgeted - totalSpentSoFar) / daysRemaining);

    // Detect high risk categories
    const isOverrunRisk = totalBudgeted > 0 && projectedTotalExpenses > totalBudgeted;
    const overrunAmount = Math.max(0, projectedTotalExpenses - totalBudgeted);

    // Generate actionable advice based on velocity
    let forecastStatus = "ON_TRACK";
    let recommendation = "Your spending velocity is well aligned with your monthly ₹6,000 budget.";

    if (isOverrunRisk) {
      forecastStatus = "HIGH_RISK";
      recommendation = `At your current velocity of ${user.currency}${dailyVelocity}/day, you are projected to exceed your budget by ${user.currency}${overrunAmount}. Reduce discretionary spending to max ${user.currency}${Math.max(0, safeDailySpendLimit)}/day.`;
    } else if (dailyVelocity > safeDailySpendLimit * 1.2) {
      forecastStatus = "MODERATE_RISK";
      recommendation = `Daily spend velocity is slightly elevated (${user.currency}${dailyVelocity}/day vs recommended ${user.currency}${safeDailySpendLimit}/day). Watch out for snacks and weekend outings.`;
    }

    return NextResponse.json({
      currentDay,
      totalDaysInMonth,
      daysRemaining,
      totalSpentSoFar,
      totalIncomeSoFar,
      totalBudgeted,
      dailyVelocity,
      projectedTotalExpenses,
      projectedEndBalance,
      safeDailySpendLimit,
      isOverrunRisk,
      overrunAmount,
      forecastStatus,
      recommendation,
    });
  } catch (error) {
    console.error("AI Forecast Error:", error);
    return NextResponse.json({ error: "Failed to generate AI forecast" }, { status: 500 });
  }
}
