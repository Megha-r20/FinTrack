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

    const totalBudgeted = budgets.reduce((acc, b) => acc + b.amount, 0);
    const totalSpentInBudgets = budgets.reduce((acc, b) => acc + (catBreakdown[b.category.name] || 0), 0);

    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);
    const weeksRemaining = Math.max(1, Math.ceil(daysRemaining / 7));
    const totalRemainingBudget = Math.max(0, (totalBudgeted || 6000) - totalSpentInBudgets);

    const safeDailyAllowance = Math.round(totalRemainingBudget / daysRemaining);
    const safeWeeklyAllowance = Math.round(totalRemainingBudget / weeksRemaining);

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
- Student Persona: Hostel Resident Student (Target monthly allowance < ₹6,000; Accommodation & mess food covered)
- Currency Symbol: ${user.currency}
- Total Monthly Budget Configured: ${user.currency}${totalBudgeted.toLocaleString()}
- Total Spent in Budgets: ${user.currency}${totalSpentInBudgets.toLocaleString()}
- Remaining Budget Balance: ${user.currency}${totalRemainingBudget.toLocaleString()}
- Days Left in Month: ${daysRemaining} days (Weeks left: ${weeksRemaining} weeks)
- Safe Daily Spend Allowance: ${user.currency}${safeDailyAllowance.toLocaleString()} / day
- Safe Weekly Spend Allowance: ${user.currency}${safeWeeklyAllowance.toLocaleString()} / week
- Total Monthly Income / Pocket Money: ${user.currency}${currIncome.toLocaleString()}
- Total Monthly Expenses: ${user.currency}${currExpenses.toLocaleString()}
- Net Savings: ${user.currency}${netSavings.toLocaleString()} (Savings Rate: ${savingsRate}%)
- Current Month Category Outflow: ${Object.entries(catBreakdown).map(([cat, amt]) => `${cat}: ${user.currency}${amt.toLocaleString()}`).join(", ")}
- Active Budgets: ${budgetAnalysis.map((b) => `${b.category} (Spent: ${user.currency}${b.spent.toLocaleString()} / Limit: ${user.currency}${b.limit.toLocaleString()}, ${b.percentage}% used)`).join("; ")}
- Exceeded Budgets: ${exceededBudgets.length > 0 ? exceededBudgets.map((b) => `${b.category} (+${user.currency}${Math.abs(b.remaining).toLocaleString()} over limit)`).join(", ") : "None"}
- Approaching Budget Limits (≥80%): ${warningBudgets.length > 0 ? warningBudgets.map((b) => `${b.category} (${b.percentage}% capacity)`).join(", ") : "None"}
- Unusual Category Increases (>20% MoM): ${unusualIncreases.length > 0 ? unusualIncreases.map((u) => `${u.category} (+${u.pctChange}%, +${user.currency}${u.diff.toLocaleString()})`).join(", ") : "None"}
`;

    // 3. AI Reply Generation
    let aiResponseText = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== "") {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `You are FinTrack AI Advisor — an expert financial advisor specializing in hostel student budgeting (< ₹6,000/mo allowance) for ${user.name}.
Your job is to answer user queries using their actual database numbers and pacing math.

STRICT NUMERICAL DIRECTIVES & STUDENT ADVICE GUIDELINES:
1. Always use the exact numerical values provided in the DATABASE CONTEXT below. Never invent, estimate, or hallucinate financial numbers.
2. Understand that the user is a hostel resident student whose main mess meals & room rent are already covered. Focus advice on discretionary categories: Snacks/Food outside mess, Transport/Auto, Mobile Recharge, Personal Care, Entertainment, Books & Stationary, Emergency Fund, and Savings.
3. When asked about daily or weekly spend, cite exact values: Safe Daily Spend = ${user.currency}${safeDailyAllowance}/day and Safe Weekly Spend = ${user.currency}${safeWeeklyAllowance}/week for the remaining ${daysRemaining} days.
4. If overspending occurs in non-essential areas (e.g. eating out, gaming, impulse shopping), warn gently and suggest reallocating surplus to essential needs (personal care, books, emergency fund) without sacrificing health.
5. Educational advice only — never suggest trading or stocks.`;

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

      if (
        queryLower.includes("daily") ||
        queryLower.includes("safely spend") ||
        queryLower.includes("per day") ||
        queryLower.includes("how much can i spend") ||
        queryLower.includes("pacing")
      ) {
        aiResponseText = `Here is your **Safe Spending Pacing** for the rest of this month:\n\n` +
          `- **Total Budget Allocation**: ${user.currency}${totalBudgeted.toLocaleString()}\n` +
          `- **Total Spent So Far**: ${user.currency}${totalSpentInBudgets.toLocaleString()}\n` +
          `- **Remaining Budget**: **${user.currency}${totalRemainingBudget.toLocaleString()}**\n` +
          `- **Days Remaining in Month**: **${daysRemaining} days**\n\n` +
          `💡 **Safe Daily Spend Limit**: **${user.currency}${safeDailyAllowance} / day**\n` +
          `📅 **Safe Weekly Spend Cap**: **${user.currency}${safeWeeklyAllowance} / week**\n\n` +
          `*Tip for hostel life:* Since mess food is covered, keep non-mess snacks, chai, and auto rides under ${user.currency}${safeDailyAllowance}/day so you have reserve cash at month-end!`;

      } else if (queryLower.includes("snack") || queryLower.includes("mess") || queryLower.includes("food outside") || queryLower.includes("eating out")) {
        const snackSpent = catBreakdown["Snacks & Mess Outings"] || catBreakdown["Food"] || 0;
        const snackBudget = budgets.find((b) => b.category.name.includes("Snack") || b.category.name === "Food")?.amount || 1500;

        aiResponseText = `Here is your **Snacks & Mess Outings Analysis**:\n\n` +
          `- **Spent on Snacks / Eating Out**: ${user.currency}${snackSpent.toLocaleString()}\n` +
          `- **Monthly Snack Allocation**: ${user.currency}${snackBudget.toLocaleString()}\n` +
          `- **Status**: ${snackSpent > snackBudget ? "🚨 Exceeded limit!" : snackSpent >= snackBudget * 0.8 ? "⚠️ Near maximum capacity" : "✅ Within safe budget"}\n\n` +
          (snackSpent > snackBudget
            ? `⚠️ **Hostel Advisor Warning:** You have spent ${user.currency}${snackSpent.toLocaleString()} on food outside the mess. Rely more on mess meals for the next ${daysRemaining} days to protect your emergency and book savings!`
            : `👍 You are pacing well on snacks. Try keeping daily tea/snack expenses under ${user.currency}${Math.round((snackBudget - snackSpent) / Math.max(1, daysRemaining))}/day.`);

      } else if (queryLower.includes("savings rate") || queryLower.includes("how much am i saving") || queryLower.includes("savings")) {
        aiResponseText = `Based on your hostel budget records for this month:\n\n` +
          `- **Total Income / Allowance**: ${user.currency}${currIncome.toLocaleString()}\n` +
          `- **Total Expenses**: ${user.currency}${currExpenses.toLocaleString()}\n` +
          `- **Net Pocket Savings**: **${user.currency}${netSavings.toLocaleString()}**\n` +
          `- **Savings Rate**: **${savingsRate}%**\n\n` +
          (savingsRate >= 15
            ? `🟢 **Awesome Job!** Saving ${savingsRate}% (${user.currency}${netSavings.toLocaleString()}) on a student budget is outstanding discipline.`
            : `💡 **Student Saver Tip:** Aiming to save even ₹500–₹1,000/mo creates a strong safety net for semester breaks and surprise expenses.`);

      } else if (queryLower.includes("budget") || queryLower.includes("limit") || queryLower.includes("capacity") || queryLower.includes("6000")) {
        if (budgetAnalysis.length === 0) {
          aiResponseText = `You currently have no active category budgets configured. On the **Budgets** page, click **Load ₹6,000 Hostel Template** to instantly apply optimal limits for snacks, transport, mobile recharge, toiletries, books, emergency, and savings!`;
        } else {
          aiResponseText = `Here is your **Hostel Category Budget Status**:\n\n` +
            budgetAnalysis
              .map(
                (b) =>
                  `- **${b.category}**: ${user.currency}${b.spent.toLocaleString()} / ${user.currency}${b.limit.toLocaleString()} (**${b.percentage}% used**)${
                    b.isExceeded ? " 🚨 *EXCEEDED*" : b.isWarning ? " ⚠️ *NEAR LIMIT*" : " ✅ *ON TRACK*"
                  }`
              )
              .join("\n") +
            `\n\n💡 **Remaining Safe Allowance**: **${user.currency}${safeDailyAllowance}/day** across the remaining ${daysRemaining} days.`;
        }

      } else if (queryLower.includes("reallocate") || queryLower.includes("cut down") || queryLower.includes("adjust")) {
        aiResponseText = `Here is a recommended **Hostel Budget Reallocation Plan**:\n\n` +
          `1. **Protect Essential Needs**: Keep allocations intact for *Personal Care & Toiletries* (${user.currency}${budgetAnalysis.find(b=>b.category.includes("Personal"))?.limit || 500}), *Books & Education* (${user.currency}${budgetAnalysis.find(b=>b.category.includes("Education"))?.limit || 500}), and *Mobile Recharge* (${user.currency}300).\n` +
          `2. **Trim Discretionary Outflows**: If over budget, temporarily cap *Snacks & Mess Outings* and *Entertainment & Outings*.\n` +
          `3. **Safe Daily Cap**: Limit daily out-of-pocket cash to **${user.currency}${safeDailyAllowance}/day** to preserve your ${user.currency}${totalRemainingBudget.toLocaleString()} balance.`;

      } else {
        aiResponseText = `Here is an overview of your **Hostel Student Financial Metrics** (${user.name}):\n\n` +
          `- **Configured Monthly Budget**: ${user.currency}${totalBudgeted.toLocaleString()}\n` +
          `- **Total Spent**: ${user.currency}${totalSpentInBudgets.toLocaleString()}\n` +
          `- **Remaining Balance**: ${user.currency}${totalRemainingBudget.toLocaleString()}\n` +
          `- **Safe Daily Allowance**: **${user.currency}${safeDailyAllowance} / day** (${daysRemaining} days left)\n` +
          `- **Net Pocket Savings**: ${user.currency}${netSavings.toLocaleString()} (${savingsRate}% savings rate)\n\n` +
          `Ask me anything like *"How much can I safely spend per day?"*, *"Am I spending too much on snacks?"*, or *"How can I reallocate my remaining budget?"*`;
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
