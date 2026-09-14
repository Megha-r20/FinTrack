import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text, token } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text prompt is required" }, { status: 400 });
    }

    // Authenticate via session or demo user
    let user = null;
    const session = await getSessionUser();
    if (session) {
      user = await prisma.user.findUnique({ where: { id: session.userId } });
    }

    if (!user) {
      user = await prisma.user.findFirst();
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Natural Language & Regex Parsing
    const numbers = text.match(/\d+(\.\d+)?/g);
    const amount = numbers ? parseFloat(numbers[0]) : 100;

    const lower = text.toLowerCase();
    const type = (lower.includes("salary") || lower.includes("received") || lower.includes("refund") || lower.includes("got") || lower.includes("credited"))
      ? "INCOME"
      : "EXPENSE";

    let paymentMethod = "UPI";
    if (lower.includes("card")) paymentMethod = "Debit Card";
    if (lower.includes("cash")) paymentMethod = "Cash";

    let categoryName = "Snacks & Mess Outings";
    let description = "Bot Logged Item";

    if (lower.includes("swiggy") || lower.includes("zomato") || lower.includes("food") || lower.includes("lunch") || lower.includes("snack") || lower.includes("tea")) {
      categoryName = "Snacks & Mess Outings";
      description = lower.includes("swiggy") ? "Swiggy Order" : lower.includes("zomato") ? "Zomato Food" : "Snacks & Refreshments";
    } else if (lower.includes("uber") || lower.includes("ola") || lower.includes("auto") || lower.includes("cab") || lower.includes("bus")) {
      categoryName = "Transport";
      description = "Cab / Auto Travel";
    } else if (lower.includes("recharge") || lower.includes("mobile") || lower.includes("jio") || lower.includes("wifi")) {
      categoryName = "Mobile & Data Recharge";
      description = "Mobile Data Recharge";
    } else if (lower.includes("book") || lower.includes("study") || lower.includes("course")) {
      categoryName = "Education";
      description = "Books & Course Material";
    } else {
      categoryName = "Shopping";
      description = text.length > 30 ? text.slice(0, 30) + "..." : text;
    }

    // Find or fallback matching category
    let category = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name: { contains: categoryName },
      },
    });

    if (!category) {
      category = await prisma.category.findFirst({
        where: { userId: user.id, type },
      });
    }

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName,
          type,
          color: type === "INCOME" ? "#059669" : "#810100",
          icon: "Tag",
          userId: user.id,
        },
      });
    }

    // Create transaction in DB
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        type,
        categoryId: category.id,
        description,
        paymentMethod,
        date: new Date(),
        classification: "ESSENTIAL",
      },
      include: { category: true },
    });

    return NextResponse.json({
      success: true,
      message: `✅ Logged ${type === "INCOME" ? "Income" : "Expense"}: ₹${amount} for ${description}`,
      parsed: {
        id: transaction.id,
        amount,
        type,
        description,
        categoryName: category.name,
        paymentMethod,
        date: transaction.date,
      },
      botReply: `🎉 Transaction recorded! Logged ₹${amount} under ${category.name} via ${paymentMethod}.`,
    });
  } catch (error) {
    console.error("Bot Webhook Error:", error);
    return NextResponse.json({ error: "Failed to process bot message" }, { status: 500 });
  }
}
