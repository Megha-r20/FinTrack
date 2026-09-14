import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = await requireAuthUser();
    const { searchParams } = new URL(req.url);

    const period = searchParams.get("period") || "THIS_MONTH"; // THIS_WEEK | THIS_MONTH | LAST_MONTH | LAST_3_MONTHS | THIS_YEAR | CUSTOM
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();

    if (period === "THIS_WEEK") {
      const day = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 0, 0, 0, 0);
    } else if (period === "THIS_MONTH") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    } else if (period === "LAST_MONTH") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (period === "LAST_3_MONTHS") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1, 0, 0, 0, 0);
    } else if (period === "THIS_YEAR") {
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    } else if (period === "CUSTOM" && startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      // Default to THIS_MONTH
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    // 1. Fetch current period transactions
    const periodTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
      orderBy: { date: "asc" },
    });

    // Totals for current period
    let totalIncome = 0;
    let totalExpenses = 0;

    periodTransactions.forEach((tx) => {
      if (tx.type === "INCOME") totalIncome += tx.amount;
      if (tx.type === "EXPENSE") totalExpenses += tx.amount;
    });

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

    // 2. Category Spending Breakdown (Expenses)
    const categoryTotals: Record<string, { name: string; amount: number; color: string; icon: string }> = {};

    periodTransactions
      .filter((tx) => tx.type === "EXPENSE")
      .forEach((tx) => {
        const catName = tx.category.name;
        if (!categoryTotals[catName]) {
          categoryTotals[catName] = {
            name: catName,
            amount: 0,
            color: tx.category.color,
            icon: tx.category.icon,
          };
        }
        categoryTotals[catName].amount += tx.amount;
      });

    const categoryBreakdown = Object.values(categoryTotals)
      .map((c) => ({
        ...c,
        percentage: totalExpenses > 0 ? Math.round((c.amount / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // 3. Monthly Income vs Expense Trend (Last 6 Months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const sixMonthTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: sixMonthsAgo },
      },
      orderBy: { date: "asc" },
    });

    const monthlyMap: Record<string, { month: string; income: number; expenses: number; savings: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      monthlyMap[key] = { month: key, income: 0, expenses: 0, savings: 0 };
    }

    sixMonthTransactions.forEach((tx) => {
      const key = new Date(tx.date).toLocaleString("default", { month: "short", year: "2-digit" });
      if (monthlyMap[key]) {
        if (tx.type === "INCOME") monthlyMap[key].income += tx.amount;
        if (tx.type === "EXPENSE") monthlyMap[key].expenses += tx.amount;
        monthlyMap[key].savings = monthlyMap[key].income - monthlyMap[key].expenses;
      }
    });

    const monthlyTrend = Object.values(monthlyMap);

    // 4. Top 5 Largest Expenses
    const topExpenses = periodTransactions
      .filter((tx) => tx.type === "EXPENSE")
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((tx) => ({
        id: tx.id,
        description: tx.description,
        amount: tx.amount,
        date: tx.date,
        category: tx.category.name,
        categoryColor: tx.category.color,
      }));

    // 5. Month-over-Month (MoM) Comparison
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const prevMonthTx = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: prevMonthStart, lte: prevMonthEnd },
      },
    });

    let prevIncome = 0;
    let prevExpenses = 0;
    prevMonthTx.forEach((tx) => {
      if (tx.type === "INCOME") prevIncome += tx.amount;
      if (tx.type === "EXPENSE") prevExpenses += tx.amount;
    });

    const incomeMoM = prevIncome > 0 ? Math.round(((totalIncome - prevIncome) / prevIncome) * 100) : 0;
    const expenseMoM = prevExpenses > 0 ? Math.round(((totalExpenses - prevExpenses) / prevExpenses) * 100) : 0;

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate,
      },
      categoryBreakdown,
      monthlyTrend,
      topExpenses,
      momComparison: {
        prevIncome,
        prevExpenses,
        incomeMoM,
        expenseMoM,
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
