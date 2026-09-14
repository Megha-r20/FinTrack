import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

export async function GET() {
  try {
    const user = await requireAuthUser();

    // 1. Gather User's Financial Metrics
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [currentTransactions, prevTransactions, budgets, goals, recurring] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: user.id, date: { gte: currentMonthStart } },
        include: { category: true },
      }),
      prisma.transaction.findMany({
        where: { userId: user.id, date: { gte: prevMonthStart, lte: prevMonthEnd } },
        include: { category: true },
      }),
      prisma.budget.findMany({
        where: { userId: user.id, month: now.getMonth() + 1, year: now.getFullYear() },
        include: { category: true },
      }),
      prisma.goal.findMany({ where: { userId: user.id } }),
      prisma.recurringTransaction.findMany({ where: { userId: user.id, isActive: true }, include: { category: true } }),
    ]);

    let currIncome = 0;
    let currExpenses = 0;
    const currCatMap: Record<string, number> = {};

    currentTransactions.forEach((tx) => {
      if (tx.type === "INCOME") currIncome += tx.amount;
      if (tx.type === "EXPENSE") {
        currExpenses += tx.amount;
        currCatMap[tx.category.name] = (currCatMap[tx.category.name] || 0) + tx.amount;
      }
    });

    let prevExpenses = 0;
    const prevCatMap: Record<string, number> = {};
    prevTransactions.forEach((tx) => {
      if (tx.type === "EXPENSE") {
        prevExpenses += tx.amount;
        prevCatMap[tx.category.name] = (prevCatMap[tx.category.name] || 0) + tx.amount;
      }
    });

    const netSavings = currIncome - currExpenses;
    const savingsRate = currIncome > 0 ? Math.max(0, Math.round((netSavings / currIncome) * 100)) : 0;
    const expenseMoM = prevExpenses > 0 ? Math.round(((currExpenses - prevExpenses) / prevExpenses) * 100) : 0;

    // Safe Daily Pacing for Hostel Students
    const totalBudgeted = budgets.reduce((acc, b) => acc + b.amount, 0);
    const totalSpentInBudgets = budgets.reduce((acc, b) => acc + (currCatMap[b.category.name] || 0), 0);

    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = Math.max(1, totalDaysInMonth - now.getDate() + 1);
    const totalRemainingBudget = Math.max(0, (totalBudgeted || 6000) - totalSpentInBudgets);
    const safeDailyAllowance = Math.round(totalRemainingBudget / daysRemaining);

    // Highest spending category
    let highestCat = "None";
    let highestCatAmount = 0;
    Object.entries(currCatMap).forEach(([cat, amt]) => {
      if (amt > highestCatAmount) {
        highestCatAmount = amt;
        highestCat = cat;
      }
    });

    // Budget alerts
    const budgetAlerts: string[] = [];
    budgets.forEach((b) => {
      const spent = currCatMap[b.category.name] || 0;
      const pct = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
      if (pct >= 80) {
        budgetAlerts.push(`${b.category.name} budget is at ${pct}% capacity (${user.currency}${spent.toLocaleString()} / ${user.currency}${b.amount.toLocaleString()})`);
      }
    });

    // Synthesize structured insights
    const insights: Array<{ title: string; text: string; category: string; type: "alert" | "positive" | "info" }> = [];

    // Safe Daily Spend Insight
    insights.push({
      title: `Daily Safe Limit: ${user.currency}${safeDailyAllowance}/day`,
      text: `You have ${user.currency}${totalRemainingBudget.toLocaleString()} left for the next ${daysRemaining} days. Cap non-mess expenses at ${user.currency}${safeDailyAllowance}/day to stay on track.`,
      category: "Hostel Pacing",
      type: safeDailyAllowance < 100 ? "alert" : "positive",
    });

    // Highest Category insight
    if (highestCatAmount > 0) {
      insights.push({
        title: `Top Outflow Category: ${highestCat}`,
        text: `You have spent ${user.currency}${highestCatAmount.toLocaleString()} on ${highestCat} this month, accounting for ${currExpenses > 0 ? Math.round((highestCatAmount / currExpenses) * 100) : 0}% of total expenses.`,
        category: "Category Outflow",
        type: "info",
      });
    }

    // MoM Trend insight
    if (expenseMoM > 0) {
      insights.push({
        title: "Unusual Spending Increase",
        text: `Your overall expenses increased by ${expenseMoM}% compared to last month (${user.currency}${currExpenses.toLocaleString()} vs ${user.currency}${prevExpenses.toLocaleString()}).`,
        category: "Spending Pattern",
        type: "alert",
      });
    } else {
      insights.push({
        title: "Disciplined Spending",
        text: `Your expenses decreased by ${Math.abs(expenseMoM)}% compared to last month. Great job managing outflow!`,
        category: "Spending Pattern",
        type: "positive",
      });
    }

    // Budget utilization insight
    if (budgetAlerts.length > 0) {
      insights.push({
        title: "Budget Warnings",
        text: budgetAlerts.join(". ") + ".",
        category: "Budget Tracking",
        type: "alert",
      });
    }

    // Try Gemini AI if API key is present
    let aiSummary = "";
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim() !== "") {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Analyze this hostel student user's monthly financial summary and provide 3 short, actionable, educational financial observation bullet points:
- Total Budgeted: ${user.currency}${totalBudgeted}
- Total Spent: ${user.currency}${currExpenses}
- Safe Daily Spend: ${user.currency}${safeDailyAllowance}/day (${daysRemaining} days left)
- Net Savings: ${user.currency}${netSavings} (Savings Rate: ${savingsRate}%)
- Month-over-Month Expense Change: ${expenseMoM}%
- Top Category: ${highestCat} (${user.currency}${highestCatAmount})
- Active Budget Warnings: ${budgetAlerts.join("; ") || "None"}

Remember: Provide educational analysis only. Focus on hostel student budgeting. Do NOT claim to be a licensed financial advisor or give stock investment advice.`;

        const responsePromise = ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini AI timeout")), 2500)
        );

        const response: any = await Promise.race([responsePromise, timeoutPromise]);
        aiSummary = response.text || "";
      } catch (err) {
        console.warn("Gemini API skipped or timed out:", err);
      }
    }

    return NextResponse.json({
      summary: {
        currIncome,
        currExpenses,
        netSavings,
        savingsRate,
        expenseMoM,
        highestCat,
        highestCatAmount,
        safeDailyAllowance,
        daysRemaining,
      },
      insights,
      aiSummary,
      disclaimer: "FinTrack AI Advisor provides educational analytical insights based on your transaction history. It does not provide professional financial or investment advice.",
    });
  } catch (error) {
    console.error("AI Advisor Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
