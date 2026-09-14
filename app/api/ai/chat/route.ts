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
    const savingsRate = currIncome > 0 ? Math.round((netSavings / currIncome) * 100) : 0;

    const financialContextSummary = `
User Financial Summary (${user.name}):
- Currency: ${user.currency}
- Current Month Income: ${user.currency}${currIncome.toLocaleString()}
- Current Month Expenses: ${user.currency}${currExpenses.toLocaleString()}
- Net Monthly Savings: ${user.currency}${netSavings.toLocaleString()} (Savings Rate: ${savingsRate}%)
- Previous Month Total Expenses: ${user.currency}${prevExpenses.toLocaleString()}
- Current Month Category Outflow: ${Object.entries(catBreakdown)
      .map(([cat, amt]) => `${cat}: ${user.currency}${amt}`)
      .join(", ")}
- Active Budgets: ${budgets
      .map((b) => `${b.category.name}: Limit ${user.currency}${b.amount}, Spent ${user.currency}${catBreakdown[b.category.name] || 0}`)
      .join("; ")}
- Financial Goals: ${goals.map((g) => `${g.title}: Target ${user.currency}${g.targetAmount}, Saved ${user.currency}${g.currentAmount}`).join("; ")}
- Recurring Monthly Bills & Subscriptions: ${recurring.map((r) => `${r.description} (${user.currency}${r.amount})`).join("; ")}
`;

    // 3. AI Reply Generation (Gemini API or intelligent rule-based engine)
    let aiResponseText = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== "") {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `You are FinTrack AI — an expert, objective financial data analyst for ${user.name}.
Your job is to answer user queries using their actual recorded financial metrics.

RULES & SAFETY DIRECTIVES:
1. Always use the user's provided numerical data instead of inventing numbers.
2. Provide clear, empathetic, educational explanations and actionable tips to optimize spending or increase savings.
3. CRITICAL SAFETY: You must NEVER present yourself as a certified financial planner, promise investment returns, or recommend specific stock/crypto trading. Always clarify that your answers are educational data analyses.
4. Keep formatting clean with bullet points and bold highlights.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `${systemPrompt}\n\nDATABASE CONTEXT:\n${financialContextSummary}\n\nUSER QUESTION: ${message}`,
        });

        aiResponseText = response.text || "";
      } catch (err) {
        console.warn("Gemini API call error, using grounded analytical responder:", err);
      }
    }

    // Grounded Analytical Fallback if Gemini key absent or errored
    if (!aiResponseText) {
      const queryLower = message.toLowerCase();

      if (queryLower.includes("where am i spending") || queryLower.includes("most money") || queryLower.includes("highest")) {
        let topCat = "Food";
        let maxVal = 0;
        Object.entries(catBreakdown).forEach(([cat, val]) => {
          if (val > maxVal) {
            maxVal = val;
            topCat = cat;
          }
        });
        aiResponseText = `Based on your recorded transactions for this month, your highest spending category is **${topCat}** at **${user.currency}${maxVal.toLocaleString()}**.\n\nHere is your current outflow distribution:\n` +
          Object.entries(catBreakdown)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, val]) => `- **${cat}**: ${user.currency}${val.toLocaleString()} (${currExpenses > 0 ? Math.round((val / currExpenses) * 100) : 0}%)`)
            .join("\n");
      } else if (queryLower.includes("food")) {
        const foodSpent = catBreakdown["Food"] || 0;
        aiResponseText = `You have spent **${user.currency}${foodSpent.toLocaleString()}** on Food this month across recorded groceries and dining.`;
      } else if (queryLower.includes("higher than last month") || queryLower.includes("why are my expenses")) {
        const diff = currExpenses - prevExpenses;
        const pct = prevExpenses > 0 ? Math.round((diff / prevExpenses) * 100) : 0;

        let increaseDetails = [];
        for (const [cat, val] of Object.entries(catBreakdown)) {
          const prevVal = prevCatBreakdown[cat] || 0;
          if (val > prevVal) {
            increaseDetails.push(`- **${cat}**: increased by ${user.currency}${(val - prevVal).toLocaleString()} (${user.currency}${prevVal} ➔ ${user.currency}${val})`);
          }
        }

        aiResponseText = `Your total expenses this month are **${user.currency}${currExpenses.toLocaleString()}**, which is **${pct >= 0 ? "+" : ""}${pct}%** compared to last month (${user.currency}${prevExpenses.toLocaleString()}).\n\n**Primary Outflow Increases:**\n` +
          (increaseDetails.length > 0 ? increaseDetails.join("\n") : "- General balanced increases across multiple categories.");
      } else if (queryLower.includes("saving") || queryLower.includes("savings rate")) {
        aiResponseText = `You are currently saving **${user.currency}${netSavings.toLocaleString()}** per month, representing a **${savingsRate}% savings rate** of your total monthly income (${user.currency}${currIncome.toLocaleString()}).\n\n💡 *Tip: Financial experts generally recommend aiming for a 20%+ savings rate to build long-term wealth.*`;
      } else if (queryLower.includes("reduce") || queryLower.includes("cut") || queryLower.includes("unnecessary")) {
        aiResponseText = `Here are 3 tailored ways to reduce non-essential spending based on your records:\n\n1. **Review Subscriptions**: You currently spend **${user.currency}${(catBreakdown["Subscriptions"] || 0).toLocaleString()}** monthly on subscriptions. Audit active platforms and pause unused plans.\n2. **Optimize Food Outflow**: Food represents **${user.currency}${(catBreakdown["Food"] || 0).toLocaleString()}** of monthly expenses. Preparing meals at home 2 extra days a week can cut this by ~15%.\n3. **Set Category Limits**: Check your budget thresholds to prevent accidental overspending late in the month.`;
      } else {
        aiResponseText = `Here is a summary of your financial data for this month:\n\n- **Total Income**: ${user.currency}${currIncome.toLocaleString()}\n- **Total Expenses**: ${user.currency}${currExpenses.toLocaleString()}\n- **Net Savings**: ${user.currency}${netSavings.toLocaleString()} (${savingsRate}% rate)\n- **Active Goals**: ${goals.map((g) => g.title).join(", ")}\n\nFeel free to ask specific questions about your spending categories, budget status, or savings habits!`;
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
