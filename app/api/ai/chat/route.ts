import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

export async function GET(req: Request) {
  try {
    const user = await requireAuthUser();
    const { searchParams } = new URL(req.url);

    const conversationId = searchParams.get("conversationId");

    if (conversationId) {
      const messages = await prisma.aiMessage.findMany({
        where: {
          conversation: {
            id: conversationId,
            userId: user.id,
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return NextResponse.json({ messages });
    }

    // Get active conversation or create one
    let conversation = await prisma.aiConversation.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    if (!conversation) {
      conversation = await prisma.aiConversation.create({
        data: {
          userId: user.id,
          title: "Financial Q&A Consultation",
        },
      });
    }

    const messages = await prisma.aiMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ conversationId: conversation.id, messages });
  } catch (error) {
    console.error("Fetch AI Chat Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthUser();
    const { message, conversationId } = await req.json();

    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
    }

    // 1. Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const newConv = await prisma.aiConversation.create({
        data: {
          userId: user.id,
          title: message.substring(0, 35) + "...",
        },
      });
      convId = newConv.id;
    }

    // Save user message
    const userMsg = await prisma.aiMessage.create({
      data: {
        conversationId: convId,
        role: "user",
        content: message.trim(),
      },
    });

    // 2. Fetch User Financial Context for Data Grounding
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
    const catBreakdown: Record<string, number> = {};

    currentTransactions.forEach((tx) => {
      if (tx.type === "INCOME") currIncome += tx.amount;
      if (tx.type === "EXPENSE") {
        currExpenses += tx.amount;
        catBreakdown[tx.category.name] = (catBreakdown[tx.category.name] || 0) + tx.amount;
      }
    });

    let prevExpenses = 0;
    const prevCatBreakdown: Record<string, number> = {};
    prevTransactions.forEach((tx) => {
      if (tx.type === "EXPENSE") {
        prevExpenses += tx.amount;
        prevCatBreakdown[tx.category.name] = (prevCatBreakdown[tx.category.name] || 0) + tx.amount;
      }
    });

    const netSavings = currIncome - currExpenses;
    const savingsRate = currIncome > 0 ? Math.max(0, Math.round((netSavings / currIncome) * 100)) : 0;
    const totalRecurringOutflow = recurring.reduce((acc, r) => acc + (r.type === "EXPENSE" ? r.amount : 0), 0);

    // Budget utilization calculations
    const budgetAnalysis = budgets.map((b) => {
      const spent = catBreakdown[b.category.name] || 0;
      const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
      return {
        category: b.category.name,
        limit: b.amount,
        spent,
        remaining: b.amount - spent,
        percentage,
        isWarning: percentage >= 80 && percentage <= 100,
        isExceeded: percentage > 100,
      };
    });

    const exceededBudgets = budgetAnalysis.filter((b) => b.isExceeded);
    const warningBudgets = budgetAnalysis.filter((b) => b.isWarning);

    // MoM Category Changes
    const categoryChanges: Array<{ category: string; current: number; previous: number; diff: number; pctChange: number }> = [];
    const allCatNames = Array.from(new Set([...Object.keys(catBreakdown), ...Object.keys(prevCatBreakdown)]));

    allCatNames.forEach((cat) => {
      const curr = catBreakdown[cat] || 0;
      const prev = prevCatBreakdown[cat] || 0;
      const diff = curr - prev;
      const pctChange = prev > 0 ? Math.round((diff / prev) * 100) : curr > 0 ? 100 : 0;
      if (curr > 0 || prev > 0) {
        categoryChanges.push({ category: cat, current: curr, previous: prev, diff, pctChange });
      }
    });

    categoryChanges.sort((a, b) => b.diff - a.diff);
    const unusualIncreases = categoryChanges.filter((c) => c.diff > 0 && c.pctChange >= 20);

    const financialContextSummary = `
USER REAL FINANCIAL DATABASE RECORD SUMMARY (${user.name}):
- Currency Symbol: ${user.currency}
- Total Monthly Income: ${user.currency}${currIncome.toLocaleString()}
- Total Monthly Expenses: ${user.currency}${currExpenses.toLocaleString()}
- Net Savings: ${user.currency}${netSavings.toLocaleString()}
- Monthly Savings Rate: ${savingsRate}%
- Previous Month Expenses: ${user.currency}${prevExpenses.toLocaleString()} (MoM Expense Change: ${prevExpenses > 0 ? Math.round(((currExpenses - prevExpenses) / prevExpenses) * 100) : 0}%)
- Current Month Category Outflow: ${Object.entries(catBreakdown).map(([cat, amt]) => `${cat}: ${user.currency}${amt.toLocaleString()}`).join(", ")}
- Active Budgets: ${budgetAnalysis.map((b) => `${b.category} (Spent: ${user.currency}${b.spent.toLocaleString()} / Limit: ${user.currency}${b.limit.toLocaleString()}, ${b.percentage}% used)`).join("; ")}
- Exceeded Budgets: ${exceededBudgets.length > 0 ? exceededBudgets.map((b) => `${b.category} (+${user.currency}${Math.abs(b.remaining).toLocaleString()} over limit)`).join(", ") : "None"}
- Approaching Budget Limits (≥80%): ${warningBudgets.length > 0 ? warningBudgets.map((b) => `${b.category} (${b.percentage}% capacity)`).join(", ") : "None"}
- Unusual Category Increases (>20% MoM): ${unusualIncreases.length > 0 ? unusualIncreases.map((u) => `${u.category} (+${u.pctChange}%, +${user.currency}${u.diff.toLocaleString()})`).join(", ") : "None"}
- Recurring Monthly Subscriptions/Bills: Total Outflow ${user.currency}${totalRecurringOutflow.toLocaleString()} (${recurring.map((r) => `${r.description}: ${user.currency}${r.amount.toLocaleString()}`).join(", ")})
- Financial Goals Progress: ${goals.map((g) => {
  const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
  return `${g.title}: Saved ${user.currency}${g.currentAmount.toLocaleString()} / ${user.currency}${g.targetAmount.toLocaleString()} (${pct}% reached)`;
}).join("; ")}
`;

    // 3. AI Reply Generation (Gemini API or intelligent rule-based engine)
    let aiResponseText = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== "") {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `You are FinTrack AI — an expert, objective financial data analyst for ${user.name}.
Your job is to answer user queries using their actual recorded financial metrics provided below.

STRICT NUMERICAL DIRECTIVES & SAFETY:
1. Always use the exact numerical values provided in the DATABASE CONTEXT below. Never invent, estimate, or hallucinate financial numbers.
2. If asked about category spending, month-over-month changes, savings rate, budgets, or recurring bills, cite the exact calculated numbers.
3. CRITICAL SAFETY DISCLAIMER: You must NEVER present yourself as a certified financial planner or recommend stock/crypto trading execution. Provide educational analytical insights only.
4. Format responses cleanly with bold highlights, bullet points, and actionable takeaways.`;

        const responsePromise = ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `${systemPrompt}\n\nDATABASE CONTEXT:\n${financialContextSummary}\n\nUSER QUESTION: ${message}`,
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini AI API timeout")), 2500)
        );

        const response: any = await Promise.race([responsePromise, timeoutPromise]);
        aiResponseText = response.text || "";
      } catch (err) {
        console.warn("Gemini API call skipped or timed out, using grounded analytical responder:", err);
      }
    }

    // Grounded Analytical Fallback if Gemini key absent or errored
    if (!aiResponseText) {
      const queryLower = message.toLowerCase();

      if (queryLower.includes("savings rate") || queryLower.includes("how much am i saving") || queryLower.includes("savings")) {
        aiResponseText = `Based on your database records for this month:\n\n` +
          `- **Total Income**: ${user.currency}${currIncome.toLocaleString()}\n` +
          `- **Total Expenses**: ${user.currency}${currExpenses.toLocaleString()}\n` +
          `- **Net Savings**: **${user.currency}${netSavings.toLocaleString()}**\n` +
          `- **Savings Rate**: **${savingsRate}%**\n\n` +
          (savingsRate >= 20
            ? `🟢 **Great Job!** Your savings rate of ${savingsRate}% exceeds the recommended 20% benchmark.`
            : `💡 **Optimization Tip:** Aiming for a 20%+ savings rate (target net savings: ${user.currency}${Math.round(currIncome * 0.2).toLocaleString()}) will accelerate your long-term financial goals.`);

      } else if (queryLower.includes("budget") || queryLower.includes("limit") || queryLower.includes("capacity")) {
        if (budgetAnalysis.length === 0) {
          aiResponseText = `You currently have no active category budgets configured for this month. You can set monthly spending caps on the Budgets page to receive automatic utilization alerts!`;
        } else {
          aiResponseText = `Here is your current monthly budget status across configured categories:\n\n` +
            budgetAnalysis
              .map(
                (b) =>
                  `- **${b.category}**: ${user.currency}${b.spent.toLocaleString()} spent / ${user.currency}${b.limit.toLocaleString()} limit (**${b.percentage}% used**)${
                    b.isExceeded ? " 🚨 *EXCEEDED*" : b.isWarning ? " ⚠️ *NEAR LIMIT*" : " ✅ *ON TRACK*"
                  }`
              )
              .join("\n") +
            (exceededBudgets.length > 0
              ? `\n\n⚠️ **Action Item:** ${exceededBudgets.map((b) => b.category).join(", ")} exceeded configured limits this month.`
              : `\n\n✅ **Status:** All category budgets are currently within safe limits.`);
        }

      } else if (queryLower.includes("recurring") || queryLower.includes("subscription") || queryLower.includes("bills")) {
        if (recurring.length === 0) {
          aiResponseText = `You have no active recurring subscriptions or bills logged. You can add recurring items on the Recurring page to track upcoming bill due dates.`;
        } else {
          aiResponseText = `Here are your active recurring monthly bills & subscriptions:\n\n` +
            recurring.map((r) => `- **${r.description}**: ${user.currency}${r.amount.toLocaleString()} (${r.frequency.toLowerCase()})`).join("\n") +
            `\n\n- **Total Monthly Recurring Outflow**: **${user.currency}${totalRecurringOutflow.toLocaleString()}**`;
        }

      } else if (queryLower.includes("unusual") || queryLower.includes("spending increase") || queryLower.includes("why are my expenses")) {
        const diff = currExpenses - prevExpenses;
        const pct = prevExpenses > 0 ? Math.round((diff / prevExpenses) * 100) : 0;

        aiResponseText = `Your overall expenses this month are **${user.currency}${currExpenses.toLocaleString()}**, which is **${pct >= 0 ? "+" : ""}${pct}%** compared to last month (${user.currency}${prevExpenses.toLocaleString()}).\n\n` +
          (unusualIncreases.length > 0
            ? `**Top Outflow Increases (>20% MoM):**\n` +
              unusualIncreases
                .map((u) => `- **${u.category}**: increased by **+${user.currency}${u.diff.toLocaleString()}** (+${u.pctChange}% MoM: ${user.currency}${u.previous.toLocaleString()} ➔ ${user.currency}${u.current.toLocaleString()})`)
                .join("\n")
            : `✅ No category experienced an unusual >20% expense jump compared to last month.`);

      } else if (queryLower.includes("where am i spending") || queryLower.includes("most money") || queryLower.includes("category")) {
        const sortedCats = Object.entries(catBreakdown).sort((a, b) => b[1] - a[1]);
        aiResponseText = `Here is your spending breakdown by category for this month:\n\n` +
          sortedCats
            .map(
              ([cat, amt]) =>
                `- **${cat}**: **${user.currency}${amt.toLocaleString()}** (${currExpenses > 0 ? Math.round((amt / currExpenses) * 100) : 0}% of total outflow)`
            )
            .join("\n");

      } else {
        aiResponseText = `Here is an overview of your financial metrics:\n\n` +
          `- **Total Monthly Income**: ${user.currency}${currIncome.toLocaleString()}\n` +
          `- **Total Monthly Expenses**: ${user.currency}${currExpenses.toLocaleString()}\n` +
          `- **Net Savings**: ${user.currency}${netSavings.toLocaleString()} (${savingsRate}% savings rate)\n` +
          `- **Top Category Outflow**: ${Object.entries(catBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"} (${user.currency}${(Object.entries(catBreakdown).sort((a, b) => b[1] - a[1])[0]?.[1] || 0).toLocaleString()})\n` +
          `- **Active Goals**: ${goals.map((g) => `${g.title} (${g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0}%)`).join(", ") || "None"}\n\n` +
          `Feel free to ask about specific categories, budget limits, savings tips, or month-over-month comparisons!`;
      }
    }

    // Save AI message
    const aiMsg = await prisma.aiMessage.create({
      data: {
        conversationId: convId,
        role: "assistant",
        content: aiResponseText,
      },
    });

    // Update conversation timestamp
    await prisma.aiConversation.update({
      where: { id: convId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      conversationId: convId,
      userMessage: userMsg,
      aiMessage: aiMsg,
    });
  } catch (error) {
    console.error("AI Chat Post Error:", error);
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuthUser();
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (conversationId) {
      await prisma.aiConversation.deleteMany({
        where: { id: conversationId, userId: user.id },
      });
    } else {
      await prisma.aiConversation.deleteMany({
        where: { userId: user.id },
      });
    }

    return NextResponse.json({ message: "Chat history cleared successfully." });
  } catch (error) {
    console.error("Clear AI Chat Error:", error);
    return NextResponse.json({ error: "Failed to clear chat history" }, { status: 500 });
  }
}
